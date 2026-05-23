/**
 * Persistência leve em SQLite — usado para sobreviver restart do servidor
 * e suportar múltiplas submissões/runs simultâneas com URL única.
 *
 * - `submissions`: 1 linha por submissão do usuário (form simplificado + JSON
 *   completo expandido + status do run).
 * - `events`: append-only do stream SSE. Late-joiners do SSE leem do DB.
 *
 * O DB vive em `agents-platform/data/runs.sqlite` (gitignored). Schema
 * criado on-boot via `initDb()`.
 */
import Database from 'better-sqlite3';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, existsSync } from 'node:fs';
import type { EventoPipeline, SubmissaoAurora } from './tipos.js';

export type RunStatus = 'queued' | 'running' | 'done' | 'failed' | 'canceled';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_DB_PATH = resolve(HERE, '..', '..', 'data', 'runs.sqlite');

let db: Database.Database | null = null;

function getDbPath(): string {
  const fromEnv = process.env.DATABASE_PATH;
  if (fromEnv && fromEnv.trim().length > 0) {
    return resolve(fromEnv);
  }
  return DEFAULT_DB_PATH;
}

function ensureDir(path: string): void {
  const dir = dirname(path);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

/** Inicializa o DB e cria as tabelas se não existirem. Chamar no boot do server. */
export function initDb(): Database.Database {
  if (db) return db;
  const path = getDbPath();
  ensureDir(path);
  db = new Database(path);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL UNIQUE,
      email TEXT,
      nome_solucao TEXT,
      vertical TEXT,
      form_simplificado TEXT NOT NULL,
      submissao_completa TEXT NOT NULL,
      hipotese_raiz TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'queued',
      created_at INTEGER NOT NULL,
      started_at INTEGER,
      finished_at INTEGER,
      erro TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
    CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);

    CREATE TABLE IF NOT EXISTS events (
      run_id TEXT NOT NULL,
      seq INTEGER NOT NULL,
      payload TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      PRIMARY KEY (run_id, seq)
    );
    CREATE INDEX IF NOT EXISTS idx_events_run_id ON events(run_id, seq);
  `);
  return db;
}

function getDb(): Database.Database {
  if (!db) throw new Error('DB não inicializado — chame initDb() no boot.');
  return db;
}

// ───────────────────────────── Submissions ─────────────────────────────

export interface SubmissionRow {
  id: string;
  run_id: string;
  email: string | null;
  nome_solucao: string | null;
  vertical: string | null;
  form_simplificado: Record<string, unknown>;
  submissao_completa: SubmissaoAurora;
  hipotese_raiz: string;
  status: RunStatus;
  created_at: number;
  started_at: number | null;
  finished_at: number | null;
  erro: string | null;
}

interface RawSubmissionRow {
  id: string;
  run_id: string;
  email: string | null;
  nome_solucao: string | null;
  vertical: string | null;
  form_simplificado: string;
  submissao_completa: string;
  hipotese_raiz: string;
  status: RunStatus;
  created_at: number;
  started_at: number | null;
  finished_at: number | null;
  erro: string | null;
}

function parseRow(r: RawSubmissionRow): SubmissionRow {
  return {
    ...r,
    form_simplificado: JSON.parse(r.form_simplificado),
    submissao_completa: JSON.parse(r.submissao_completa) as SubmissaoAurora,
  };
}

export interface CreateSubmissionParams {
  id: string;
  run_id: string;
  email: string | null;
  nome_solucao: string | null;
  vertical: string | null;
  form_simplificado: Record<string, unknown>;
  submissao_completa: SubmissaoAurora;
  hipotese_raiz: string;
}

export function createSubmission(params: CreateSubmissionParams): SubmissionRow {
  const stmt = getDb().prepare(`
    INSERT INTO submissions
      (id, run_id, email, nome_solucao, vertical,
       form_simplificado, submissao_completa, hipotese_raiz,
       status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'queued', ?)
  `);
  const now = Date.now();
  stmt.run(
    params.id,
    params.run_id,
    params.email,
    params.nome_solucao,
    params.vertical,
    JSON.stringify(params.form_simplificado),
    JSON.stringify(params.submissao_completa),
    params.hipotese_raiz,
    now,
  );
  return {
    ...params,
    status: 'queued',
    created_at: now,
    started_at: null,
    finished_at: null,
    erro: null,
  };
}

export function updateSubmissionStatus(
  runId: string,
  status: RunStatus,
  erro?: string | null,
): void {
  const now = Date.now();
  if (status === 'running') {
    getDb()
      .prepare(`UPDATE submissions SET status = ?, started_at = ? WHERE run_id = ?`)
      .run(status, now, runId);
  } else if (status === 'done' || status === 'failed' || status === 'canceled') {
    getDb()
      .prepare(
        `UPDATE submissions SET status = ?, finished_at = ?, erro = ? WHERE run_id = ?`,
      )
      .run(status, now, erro ?? null, runId);
  } else {
    getDb().prepare(`UPDATE submissions SET status = ? WHERE run_id = ?`).run(status, runId);
  }
}

export function getSubmission(idOrRunId: string): SubmissionRow | null {
  const row = getDb()
    .prepare(
      `SELECT * FROM submissions WHERE id = ? OR run_id = ? LIMIT 1`,
    )
    .get(idOrRunId, idOrRunId) as RawSubmissionRow | undefined;
  return row ? parseRow(row) : null;
}

export function listSubmissions(limit = 50): SubmissionRow[] {
  const rows = getDb()
    .prepare(`SELECT * FROM submissions ORDER BY created_at DESC LIMIT ?`)
    .all(limit) as RawSubmissionRow[];
  return rows.map(parseRow);
}

export function countQueuedAhead(runId: string): number {
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) AS n FROM submissions
       WHERE status = 'queued' AND created_at < (
         SELECT created_at FROM submissions WHERE run_id = ?
       )`,
    )
    .get(runId) as { n: number };
  return row.n;
}

// ─────────────────────────────── Events ────────────────────────────────

export function appendEvent(runId: string, evento: EventoPipeline): number {
  const next = getDb()
    .prepare(`SELECT COALESCE(MAX(seq), 0) + 1 AS next FROM events WHERE run_id = ?`)
    .get(runId) as { next: number };
  getDb()
    .prepare(
      `INSERT INTO events (run_id, seq, payload, created_at) VALUES (?, ?, ?, ?)`,
    )
    .run(runId, next.next, JSON.stringify(evento), Date.now());
  return next.next;
}

export function listEvents(runId: string, sinceSeq = 0): EventoPipeline[] {
  const rows = getDb()
    .prepare(
      `SELECT payload FROM events WHERE run_id = ? AND seq > ? ORDER BY seq ASC`,
    )
    .all(runId, sinceSeq) as { payload: string }[];
  return rows.map((r) => JSON.parse(r.payload) as EventoPipeline);
}

// ─────────────────────────────── Cleanup ───────────────────────────────

/** Marca runs presas em `queued`/`running` há mais de Xms como `failed` no boot. */
export function recoverStaleRuns(staleMs = 10 * 60 * 1000): number {
  const cutoff = Date.now() - staleMs;
  const result = getDb()
    .prepare(
      `UPDATE submissions
       SET status = 'failed', finished_at = ?, erro = 'Recuperado no boot (stale)'
       WHERE status IN ('queued', 'running') AND created_at < ?`,
    )
    .run(Date.now(), cutoff);
  return result.changes ?? 0;
}

/** Apaga events de runs finalizadas há mais de Xms (preserva submissions). */
export function gcOldEvents(olderThanMs = 24 * 60 * 60 * 1000): number {
  const cutoff = Date.now() - olderThanMs;
  const result = getDb()
    .prepare(
      `DELETE FROM events
       WHERE run_id IN (
         SELECT run_id FROM submissions
         WHERE finished_at IS NOT NULL AND finished_at < ?
       )`,
    )
    .run(cutoff);
  return result.changes ?? 0;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
