
export interface NodeConfig {
  inputText?: string;
  outputText?: string;
  inputValue?: number;
  min?: number;
  max?: number;
  imageUrl?: string;
  imageFile?: File | null;
  uploadType?: 'url' | 'file';
  toggleValue?: boolean;
  sliderValue?: number;
  code?: string;
  language?: string;
  prompt?: string;
  generatedImageUrl?: string;
  displayImageUrl?: string;
  [key: string]: any;
}

export interface WorkflowNodeData extends Record<string, unknown> {
  type: string;
  label: string;
  description: string;
  icon: string;
  config: NodeConfig;
}
