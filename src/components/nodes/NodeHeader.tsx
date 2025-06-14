
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * NodeHeader Component
 * 
 * A reusable header component for all workflow nodes.
 * Provides consistent styling and layout for node titles and icons.
 * 
 * @param icon - Lucide icon component to display
 * @param label - Primary label text
 * @param description - Secondary description text
 * @param nodeType - Type of node for styling purposes
 * @param size - Size variant for the header
 */
interface NodeHeaderProps {
  icon: LucideIcon;
  label: string;
  description: string;
  nodeType: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Get appropriate styling based on node type
 */
const getNodeStyles = (type: string): string => {
  const styles = {
    trigger: 'bg-gradient-to-br from-violet-500/10 to-purple-600/10 border-violet-500/30 shadow-lg shadow-violet-500/10',
    input: 'bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/30 shadow-lg shadow-blue-500/10',
    output: 'bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/30 shadow-lg shadow-green-500/10',
    numberInput: 'bg-gradient-to-br from-amber-500/10 to-orange-600/10 border-amber-500/30 shadow-lg shadow-amber-500/10',
    imageInput: 'bg-gradient-to-br from-indigo-500/10 to-blue-600/10 border-indigo-500/30 shadow-lg shadow-indigo-500/10',
    toggleInput: 'bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-500/30 shadow-lg shadow-purple-500/10',
    sliderInput: 'bg-gradient-to-br from-cyan-500/10 to-teal-600/10 border-cyan-500/30 shadow-lg shadow-cyan-500/10',
    fluxSchnell: 'bg-gradient-to-br from-rose-500/10 to-pink-600/10 border-rose-500/30 shadow-lg shadow-rose-500/10',
    imageOutput: 'bg-gradient-to-br from-emerald-500/10 to-green-600/10 border-emerald-500/30 shadow-lg shadow-emerald-500/10',
  };
  
  return styles[type as keyof typeof styles] || 'bg-gradient-to-br from-gray-500/10 to-slate-600/10 border-gray-500/30 shadow-lg shadow-gray-500/10';
};

/**
 * Get icon color based on node type
 */
const getIconColor = (type: string): string => {
  const colors = {
    trigger: 'text-violet-500',
    input: 'text-blue-500',
    output: 'text-green-500',
    numberInput: 'text-amber-500',
    imageInput: 'text-indigo-500',
    toggleInput: 'text-purple-500',
    sliderInput: 'text-cyan-500',
    fluxSchnell: 'text-rose-500',
    imageOutput: 'text-emerald-500',
  };
  
  return colors[type as keyof typeof colors] || 'text-gray-500';
};

export const NodeHeader: React.FC<NodeHeaderProps> = ({ 
  icon: Icon, 
  label, 
  description, 
  nodeType, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex items-center gap-3 pb-3 border-b border-border/50">
      <div className={cn(
        "flex-shrink-0 rounded-xl flex items-center justify-center border-2",
        getNodeStyles(nodeType),
        sizeClasses[size]
      )}>
        <Icon className={cn(iconSizes[size], getIconColor(nodeType))} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={cn(
          "font-semibold text-foreground truncate",
          size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
        )}>
          {label}
        </h3>
        <p className={cn(
          "text-muted-foreground truncate",
          size === 'sm' ? 'text-xs' : 'text-sm'
        )}>
          {description}
        </p>
      </div>
    </div>
  );
};
