
/**
 * Workflow Type Definitions
 * 
 * This file contains all TypeScript interfaces and types used throughout
 * the workflow builder application.
 */

/**
 * Node Configuration Interface
 * 
 * Defines the configuration options available for different node types.
 * Each node type may use different subset of these properties.
 */
export interface NodeConfig {
  // Text input configuration
  inputText?: string;
  outputText?: string;
  
  // Numeric input configuration
  inputValue?: number;
  min?: number;
  max?: number;
  
  // Image input configuration
  imageUrl?: string;
  imageFile?: File | null;
  uploadType?: 'url' | 'file';
  displayImageUrl?: string;
  
  // Boolean input configuration
  toggleValue?: boolean;
  
  // Slider input configuration
  sliderValue?: number;
  step?: number;
  
  // Code node configuration
  code?: string;
  language?: string;
  
  // AI generation configuration
  prompt?: string;
  generatedImageUrl?: string;
  
  // Allow for additional custom properties
  [key: string]: any;
}

/**
 * Workflow Node Data Interface
 * 
 * Defines the structure of data stored within each workflow node.
 * This interface extends the base Record type to allow for flexibility
 * while ensuring required properties are present.
 */
export interface WorkflowNodeData extends Record<string, unknown> {
  /** The type of node (e.g., 'input', 'output', 'trigger') */
  type: string;
  
  /** Display label for the node */
  label: string;
  
  /** Description text shown in the node */
  description: string;
  
  /** Icon identifier for the node */
  icon: string;
  
  /** Configuration object containing node-specific settings */
  config: NodeConfig;
  
  /** Optional callback for node deletion */
  onDelete?: (nodeId: string) => void;
  
  /** Optional callback for configuration updates */
  onConfigUpdate?: (config: NodeConfig) => void;
}

/**
 * Execution Log Entry Interface
 * 
 * Defines the structure of log entries created during workflow execution.
 */
export interface ExecutionLogEntry {
  /** Unique identifier for the log entry */
  id: string;
  
  /** Timestamp when the log entry was created */
  timestamp: string;
  
  /** Log message content */
  message: string;
  
  /** Log level/type */
  type: 'info' | 'error' | 'warning' | 'success';
  
  /** Optional node ID associated with this log */
  nodeId?: string;
  
  /** Optional node name for display purposes */
  nodeName?: string;
}

/**
 * Node Template Interface
 * 
 * Defines the structure of node templates used in the sidebar.
 */
export interface NodeTemplate {
  /** Node type identifier */
  type: string;
  
  /** Display label */
  label: string;
  
  /** Description text */
  description: string;
  
  /** Icon identifier */
  icon: string;
  
  /** Default configuration */
  config: Partial<NodeConfig>;
}

/**
 * Workflow Execution Result Interface
 * 
 * Defines the structure of results returned from node execution.
 */
export interface ExecutionResult {
  /** The type of result data */
  type: 'text' | 'number' | 'image' | 'boolean' | 'object';
  
  /** The actual result data */
  data: any;
  
  /** Optional error message if execution failed */
  error?: string;
  
  /** Execution timestamp */
  timestamp: number;
}
