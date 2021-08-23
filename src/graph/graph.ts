import { NodeConfig, processNode } from "./node"

export type GraphNode = {
  id: number;
  config: NodeConfig;
  state: Record<string, any>;
  output: Record<string, any>;
}

export type GraphEdge = [from: string, to: string]

export type GraphType = {
}

export class Graph {
  private id: number

  private nodes: GraphNode[] = []
  private adjacencyList: Record<string, string> = {}

  constructor({ nodes, edges }: { nodes?: GraphNode[], edges?: GraphEdge[] }) {
    this.nodes = nodes || this.nodes
    // this.edges = edges || this.edges
    const validIds = new Set()
    const invalidId = nodes.some(({id}) => {
      if (typeof id !== 'string' || validIds.has(id)) return false
      validIds.add(id)
    })

    if (invalidId) throw new Error('invalid id detected')

    const largest = nodes.map((n) => n.id).reduce((a, n) => a > n ? a : n) || 0
    this.id = largest + 1
  }

  async addNode(config: NodeConfig) {
    const id = this.id
    this.id++
    const node = {id, config, state: {}, output: {}}
    const output = await processNode(node.config, {})
    node.output = output

    return node
  }

}