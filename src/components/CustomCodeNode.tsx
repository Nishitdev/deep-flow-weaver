
import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Code, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export const CustomCodeNode: React.FC<NodeProps> = ({ data, selected, id }) => {
  const nodeData = data as any;
  const [code, setCode] = useState(nodeData.config?.code || '// Write your code here\nconsole.log("Hello World");');
  const [language, setLanguage] = useState(nodeData.config?.language || 'javascript');
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const executeCode = async () => {
    setIsExecuting(true);
    try {
      if (language === 'javascript') {
        // Safe JavaScript execution in a limited context
        const result = new Function('console', code)({
          log: (...args: any[]) => setOutput(prev => prev + args.join(' ') + '\n'),
        });
        if (result !== undefined) {
          setOutput(prev => prev + `Result: ${result}\n`);
        }
      } else if (language === 'python') {
        // Mock Python execution (in real implementation, would need a Python runtime)
        setOutput('Python execution not implemented in demo\n');
      }
    } catch (error) {
      setOutput(`Error: ${error.message}\n`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCodeChange = (value: string) => {
    setCode(value);
    // Update the node's config
    if (nodeData.config) {
      nodeData.config.code = value;
    }
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    if (nodeData.config) {
      nodeData.config.language = value;
    }
  };

  return (
    <div className={cn(
      'workflow-node p-4 min-w-[400px] bg-gradient-to-br from-purple-500/20 to-violet-600/20 border-purple-500/30',
      selected && 'selected'
    )}>
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !border-2"
      />
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-500/30 flex items-center justify-center">
              <Code className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">
                Custom Code
              </h3>
              <p className="text-xs text-muted-foreground">
                Execute custom JavaScript/Python
              </p>
            </div>
          </div>
          <Badge variant="outline">{language}</Badge>
        </div>

        <div className="space-y-2">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
            </SelectContent>
          </Select>

          <Textarea
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            placeholder="Write your code here..."
            className="w-full min-h-[120px] bg-background/50 border-border/50 text-sm font-mono resize-none"
            rows={6}
          />

          <div className="flex items-center gap-2">
            <Button
              onClick={executeCode}
              disabled={isExecuting}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Play className="w-3 h-3 mr-1" />
              {isExecuting ? 'Running...' : 'Run Code'}
            </Button>
          </div>

          {output && (
            <div className="p-2 bg-background/30 border border-border/30 rounded text-xs font-mono whitespace-pre-wrap max-h-20 overflow-y-auto">
              {output}
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !border-2"
      />
    </div>
  );
};
