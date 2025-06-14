
export interface NodeConfig {
  apiKey?: string;
  model?: string;
  prompt?: string;
  webhookUrl?: string;
  schedule?: string;
  condition?: string;
  to?: string;
  subject?: string;
  [key: string]: any;
}

export interface WorkflowNodeData extends Record<string, unknown> {
  type: string;
  label: string;
  description: string;
  icon: string;
  config: NodeConfig;
}
