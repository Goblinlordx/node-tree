import { NodeConfig } from "./node"

export type GraphNode = {
  id: number;
  config: NodeConfig;
  state: Record<string, any>;
  output: Record<string, any>;
}

export type GraphEdge = [left: string, right: string]

export type GraphType = {
}

export class Graph {
  private id: number

  private nodes: GraphNode[] = []
  private edges: Record<string, string> = {}

  constructor({ nodes, edges }: { nodes?: GraphNode[], edges?: Record<string, string> }) {
    this.nodes = nodes || this.nodes
    this.edges = edges || this.edges
    const largest = nodes.map((n) => n.id).reduce((a, n) => a > n ? a : n) || 0
    this.id = largest + 1
  }

  addNode(config: NodeConfig) {
    const id = this.id
    this.id++
    
  }
}