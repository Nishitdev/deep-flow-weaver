
export interface NodeConfig {
  inputText?: string;
  outputText?: string;
  [key: string]: any;
}

export interface WorkflowNodeData extends Record<string, unknown> {
  type: string;
  label: string;
  description: string;
  icon: string;
  config: NodeConfig;
}
