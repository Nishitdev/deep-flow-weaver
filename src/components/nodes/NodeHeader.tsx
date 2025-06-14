
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * NodeHeader Component
 * 
 * A reusable header component for all workflow nodes.
 * Features:
 * - Enhanced visual design with better gradients and shadows
 * - Improved color schemes for different node types
 * - Better typography and spacing
 * - Responsive design considerations
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
 * Enhanced styling based on node type with better visual hierarchy
 */
const getNodeStyles = (type: string): string => {
  const styles = {
    trigger: 'bg-gradient-to-br from-violet-500/15 to-purple-600/15 border-violet-400/40 shadow-lg shadow-violet-500/20',
    input: 'bg-gradient-to-br from-blue-500/15 to-cyan-600/15 border-blue-400/40 shadow-lg shadow-blue-500/20',
    output: 'bg-gradient-to-br from-green-500/15 to-emerald-600/15 border-green-400/40 shadow-lg shadow-green-500/20',
    numberInput: 'bg-gradient-to-br from-amber-500/15 to-orange-600/15 border-amber-400/40 shadow-lg shadow-amber-500/20',
    imageInput: 'bg-gradient-to-br from-indigo-500/15 to-blue-600/15 border-indigo-400/40 shadow-lg shadow-indigo-500/20',
    toggleInput: 'bg-gradient-to-br from-purple-500/15 to-pink-600/15 border-purple-400/40 shadow-lg shadow-purple-500/20',
    sliderInput: 'bg-gradient-to-br from-cyan-500/15 to-teal-600/15 border-cyan-400/40 shadow-lg shadow-cyan-500/20',
    fluxSchnell: 'bg-gradient-to-br from-rose-500/15 to-pink-600/15 border-rose-400/40 shadow-lg shadow-rose-500/20',
    imageOutput: 'bg-gradient-to-br from-emerald-500/15 to-green-600/15 border-emerald-400/40 shadow-lg shadow-emerald-500/20',
  };
  
  return styles[type as keyof typeof styles] || 'bg-gradient-to-br from-gray-500/15 to-slate-600/15 border-gray-400/40 shadow-lg shadow-gray-500/20';
};

/**
 * Enhanced icon colors with better contrast
 */
const getIconColor = (type: string): string => {
  const colors = {
    trigger: 'text-violet-600 dark:text-violet-400',
    input: 'text-blue-600 dark:text-blue-400',
    output: 'text-green-600 dark:text-green-400',
    numberInput: 'text-amber-600 dark:text-amber-400',
    imageInput: 'text-indigo-600 dark:text-indigo-400',
    toggleInput: 'text-purple-600 dark:text-purple-400',
    sliderInput: 'text-cyan-600 dark:text-cyan-400',
    fluxSchnell: 'text-rose-600 dark:text-rose-400',
    imageOutput: 'text-emerald-600 dark:text-emerald-400',
  };
  
  return colors[type as keyof typeof colors] || 'text-gray-600 dark:text-gray-400';
};

export const NodeHeader: React.FC<NodeHeaderProps> = ({ 
  icon: Icon, 
  label, 
  description, 
  nodeType, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-9 h-9 text-sm',
    md: 'w-11 h-11 text-base',
    lg: 'w-13 h-13 text-lg'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex items-center gap-4 pb-4 border-b border-border/60">
      <div className={cn(
        "flex-shrink-0 rounded-xl flex items-center justify-center border-2 backdrop-blur-sm transition-all duration-200 hover:scale-105",
        getNodeStyles(nodeType),
        sizeClasses[size]
      )}>
        <Icon className={cn(iconSizes[size], getIconColor(nodeType))} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={cn(
          "font-semibold text-foreground truncate leading-tight",
          size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
        )}>
          {label}
        </h3>
        <p className={cn(
          "text-muted-foreground truncate leading-relaxed",
          size === 'sm' ? 'text-xs' : 'text-sm'
        )}>
          {description}
        </p>
      </div>
    </div>
  );
};
