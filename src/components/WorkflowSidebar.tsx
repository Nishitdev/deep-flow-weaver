import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Play, 
  FileInput,
  FileOutput,
  CheckCircle2,
  Hash,
  Image,
  ToggleLeft,
  Sliders,
  Upload
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onAddNode: (nodeData: any) => void;
}

const iconMap = {
  play: Play,
  fileInput: FileInput,
  fileOutput: FileOutput,
  checkCircle: CheckCircle2,
  hash: Hash,
  image: Image,
  toggleLeft: ToggleLeft,
  sliders: Sliders,
  upload: Upload,
};

const nodeTemplates = [
  {
    type: 'trigger',
    label: 'Trigger',
    description: 'Starts the workflow manually',
    icon: 'play',
    config: {}
  },
  {
    type: 'input',
    label: 'Text Input',
    description: 'Accepts text input',
    icon: 'fileInput',
    config: {
      inputText: 'Hello World'
    }
  },
  {
    type: 'numberInput',
    label: 'Number Input',
    description: 'Accepts numeric input',
    icon: 'hash',
    config: {
      inputValue: 0,
      min: 0,
      max: 100
    }
  },
  {
    type: 'imageInput',
    label: 'Image Input',
    description: 'Accepts image uploads or URLs',
    icon: 'image',
    config: {
      imageUrl: '',
      uploadType: 'url'
    }
  },
  {
    type: 'toggleInput',
    label: 'Toggle Input',
    description: 'A boolean toggle switch',
    icon: 'toggleLeft',
    config: {
      toggleValue: false
    }
  },
  {
    type: 'sliderInput',
    label: 'Slider Input',
    description: 'A slider to select a value',
    icon: 'sliders',
    config: {
      sliderValue: 50,
      min: 0,
      max: 100
    }
  },
  {
    type: 'output',
    label: 'Output',
    description: 'Displays output text',
    icon: 'fileOutput',
    config: {
      outputText: 'Output will appear here...'
    }
  },
  {
    type: 'sdxl',
    label: 'SDXL Image Generator',
    description: 'Generates images using Flux Schnell',
    icon: 'image',
    config: {
      prompt: 'A futuristic cityscape'
    }
  },
  {
    type: 'imageOutput',
    label: 'Image Output',
    description: 'Display images from other nodes',
    icon: 'image',
    config: {
      imageUrl: '',
      uploadType: 'url'
    }
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, onAddNode }) => {
  const handleAddNode = (nodeData: any) => {
    onAddNode(nodeData);
  };

  const handleDragStart = (event: React.DragEvent, nodeType: string, nodeData: any) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className={`absolute top-0 left-0 h-full w-80 bg-card border-r border-border shadow-xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} z-50`}>
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Workflow Nodes</h2>
        <Button variant="ghost" size="sm" onClick={onToggle}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Drag and drop these nodes onto the canvas to start building your workflow.
          </p>

          <Separator />

          <Accordion type="single" collapsible>
            {nodeTemplates.map((template) => (
              <AccordionItem value={template.type} key={template.type}>
                <AccordionTrigger className="data-[state=open]:text-foreground">{template.label}</AccordionTrigger>
                <AccordionContent>
                  <div 
                    className="bg-secondary rounded-md p-3 mt-2 cursor-grab hover:bg-secondary/80 transition-colors duration-200"
                    onDragStart={(event) => handleDragStart(event, template.type, {
                      type: template.type,
                      label: template.label,
                      description: template.description,
                      icon: template.icon,
                      config: template.config,
                    })}
                    draggable
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        {template.icon && iconMap[template.icon as keyof typeof iconMap] ? (
                          <>{React.createElement(iconMap[template.icon as keyof typeof iconMap], { className: "w-4 h-4 text-primary" })}</>
                        ) : (
                          <Play className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-foreground truncate">
                          {template.label}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </ScrollArea>
    </aside>
  );
};
