/**
 * Árvore de hipóteses com React Flow.
 *
 * Layout: estático, calculado a partir da estrutura parent_id. Cada
 * nível ocupa uma faixa vertical; siblings se espalham horizontalmente
 * com offset proporcional.
 *
 * fitView agressivo sempre que o número de nós muda — mantém todo
 * mundo em tela.
 */
import { useEffect, useMemo, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  type Edge,
  type Node,
  type ReactFlowInstance,
  type NodeMouseHandler,
} from 'reactflow';
import { NodeCard, type NodeCardData } from './NodeCard';
import { useStore } from '../lib/store';
import type { No } from '../lib/tipos';

const NODE_TYPES = { card: NodeCard };

const NODE_WIDTH = 288;
const HORIZONTAL_GAP = 96;
const VERTICAL_GAP = 280;

interface LayoutResult {
  nodes: Node<NodeCardData>[];
  edges: Edge[];
}

function calcularLayout(nos: Record<string, No>, ordem: string[], selecionadoId: string | null): LayoutResult {
  const todos = ordem.map((id) => nos[id]).filter(Boolean);
  if (todos.length === 0) return { nodes: [], edges: [] };

  const porParent = new Map<string | null, No[]>();
  for (const n of todos) {
    const arr = porParent.get(n.parent_id) ?? [];
    arr.push(n);
    porParent.set(n.parent_id, arr);
  }

  // Atribui x recursivamente. Primeiro post-order pra saber largura de cada subárvore.
  const larguraSubarvore = new Map<string, number>();
  function calcLargura(noId: string): number {
    const filhos = porParent.get(noId) ?? [];
    if (filhos.length === 0) {
      larguraSubarvore.set(noId, 1);
      return 1;
    }
    const soma = filhos.reduce((acc, f) => acc + calcLargura(f.id), 0);
    larguraSubarvore.set(noId, Math.max(soma, 1));
    return Math.max(soma, 1);
  }

  const raizes = porParent.get(null) ?? [];
  for (const r of raizes) calcLargura(r.id);

  const posicoes = new Map<string, { x: number; y: number }>();
  let cursorRaiz = 0;
  function posicionar(noId: string, baseX: number, depth: number) {
    const filhos = porParent.get(noId) ?? [];
    const minhaLargura = larguraSubarvore.get(noId) ?? 1;
    const minhaX = baseX + (minhaLargura * (NODE_WIDTH + HORIZONTAL_GAP)) / 2 - NODE_WIDTH / 2;
    posicoes.set(noId, { x: minhaX, y: depth * VERTICAL_GAP });

    let acumulado = baseX;
    for (const f of filhos) {
      const largF = larguraSubarvore.get(f.id) ?? 1;
      posicionar(f.id, acumulado, depth + 1);
      acumulado += largF * (NODE_WIDTH + HORIZONTAL_GAP);
    }
  }
  for (const r of raizes) {
    posicionar(r.id, cursorRaiz, 0);
    cursorRaiz += (larguraSubarvore.get(r.id) ?? 1) * (NODE_WIDTH + HORIZONTAL_GAP);
  }

  const nodes: Node<NodeCardData>[] = todos.map((n) => ({
    id: n.id,
    type: 'card',
    position: posicoes.get(n.id) ?? { x: 0, y: 0 },
    data: { no: n, selecionado: n.id === selecionadoId },
    draggable: false,
  }));

  const edges: Edge[] = todos
    .filter((n) => n.parent_id)
    .map((n) => ({
      id: `${n.parent_id}-${n.id}`,
      source: n.parent_id!,
      target: n.id,
      animated: n.estado === 'gerando' || n.estado === 'validando' || n.estado === 'deployada',
    }));

  return { nodes, edges };
}

export function Tree() {
  const nos = useStore((s) => s.nos);
  const ordem = useStore((s) => s.ordemCriacao);
  const selecionadoId = useStore((s) => s.selecionadoId);
  const selecionar = useStore((s) => s.selecionar);

  const { nodes, edges } = useMemo(
    () => calcularLayout(nos, ordem, selecionadoId),
    [nos, ordem, selecionadoId],
  );

  const rfRef = useRef<ReactFlowInstance | null>(null);
  // Sempre que novos nós entrarem, faz fit
  useEffect(() => {
    if (rfRef.current && nodes.length > 0) {
      // pequeno delay pra esperar render
      const id = setTimeout(() => {
        rfRef.current?.fitView({ padding: 0.18, duration: 400 });
      }, 80);
      return () => clearTimeout(id);
    }
  }, [nodes.length]);

  const onNodeClick: NodeMouseHandler = (_e, n) => {
    selecionar(n.id);
  };

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        onInit={(inst) => (rfRef.current = inst)}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.25}
        maxZoom={1.5}
        defaultEdgeOptions={{ type: 'smoothstep' }}
      >
        <Background gap={32} size={1.2} color="#2a2a40" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
