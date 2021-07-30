import { NodeConfig } from "./node"

export type GraphNode = {
  id: number;
  config: NodeConfig;
  state: Record<string, any>;
  output: Record<string, any>;
}

export type GraphPortId = string & { __nodeId: string, __portId: string }

export type GraphEdge = [left: GraphPortId, right: GraphPortId]

export const toGraphPortId = (nodeId: number, portId: string) => [nodeId, portId].join(':') as GraphPortId
export const fromGraphPortId = (id: GraphPortId | string) => {
  const split = id.split(':')
  return [parseInt(split[0]), split[1]] as [number, string]
}

export const toEMap = (edges: Record<GraphPortId, GraphPortId[]>) => {
  const eMapSets: Record<string, Set<number>> = {}
  Object.keys(edges).forEach((k) => {
    const [lnId] = fromGraphPortId(k)
    if (!eMapSets[lnId]) eMapSets[lnId] = new Set()
    const to = edges[k]?.map(fromGraphPortId).map(([rnId]) => rnId)
    to.forEach(k => eMapSets[lnId].add(parseInt(k)))
  })
  const eMap: Record<string, number[]> = {}
  Object.keys(eMapSets).forEach(k => {
    eMap[k] = Array.from(eMapSets[k])
  })
  return eMap
}

export class Graph {
  private id: number

  private nMap: Record<string, GraphNode> = {}
  private eMap: Record<string, number[]> = {}
  private nodes: GraphNode[] = []
  private edges: Record<GraphPortId, GraphPortId[]> = {}

  constructor({ nodes, edges }: { nodes?: GraphNode[], edges?: Record<string, string> }) {
    this.nodes = nodes || this.nodes
    this.edges = edges || this.edges
    const largest = nodes.map((n) => n.id).reduce((a, n) => a > n ? a : n) || 0
    this.id = largest + 1
  }

  addNode(config: NodeConfig) {
    const id = this.id
    this.id++

    const state = Object.entries(config.state || {}).reduce((a, [k, v]) => {
      a[k] = v.default
      return a
    }, {})

    const output = config.processor({}, state, config?.ports?.output || {})

    const node = {
      id,
      config,
      state,
      output
    }

    this.nodes.push(node)
    this.nMap = { ...this.nMap, [id]: node }
  }

  addConnection(lnId: number, lpId: string, rnId: number, rpId: string) {
    const left = toGraphPortId(lnId, lpId)
    const right = toGraphPortId(rnId, rpId)

    const valid = Boolean(this.nMap[lnId]?.config?.ports?.output?.[lpId] &&
      this.nMap[rnId]?.config?.ports?.input?.[rpId]) &&
      this.edges[left].every(e => e !== right)

    if (!valid) throw new Error('invalid edge')

    const edges = {
      ...this.edges,
      [left]: [...(this.edges[left] || []), right]
    }
    const eMap = toEMap(edges)
    // validate
    this.edges = edges
    this.eMap = eMap
  }

  removeConnection(lnId: number, lpId: string, rnId: number, rpId: string) {
    const left = toGraphPortId(lnId, lpId)
    const right = toGraphPortId(rnId, rpId)

    const valid = this.edges[left].some(e => e === right)
    if (!valid) throw new Error(`edge doesn't exist`)
    if (this.edges[left].length === 1) {
      this.edges = Object.fromEntries(Object.entries(this.edges).filter(([k, v]) => k !== left))
    }
    const edges = {
      ...this.edges,
      [left]: this.edges[left].filter(k => k !== right)
    }
    const eMap = toEMap(edges)
    // validate
    this.edges = edges
    this.eMap = eMap
  }
}