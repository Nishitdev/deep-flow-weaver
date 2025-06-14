
export interface NodeConfig {
  inputText?: string;
  outputText?: string;
  inputValue?: number;
  min?: number;
  max?: number;
  imageUrl?: string;
  imageFile?: File | null;
  toggleValue?: boolean;
  sliderValue?: number;
  code?: string;
  language?: string;
  [key: string]: any;
}

export interface WorkflowNodeData extends Record<string, unknown> {
  type: string;
  label: string;
  description: string;
  icon: string;
  config: NodeConfig;
}
