export type Port = {
  type: 'boolean' | 'string' | 'number';
  default?: any;
}

export type NodeConfig = {
  ports?: {
    input?: Record<string, Port>;
    output?: Record<string, Port>;
  }
  state?: Record<string, Port>;
  processor: (inputs: Record<string, any>, outputs: Record<string, Port>) => Record<string, any> | Promise<Record<string, any>>
}

export const processNode = (n: NodeConfig, inputs: Record<string, any>) =>
    n.processor(inputs, n?.ports?.output || {})
