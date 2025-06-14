
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';

interface PerformanceMetricsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowId?: string;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  open,
  onOpenChange,
  workflowId,
}) => {
  // Mock performance data
  const performanceData = {
    totalExecutions: 127,
    successRate: 94.5,
    avgExecutionTime: 2.3,
    failureRate: 5.5,
    executionTrend: [
      { date: '2024-01-01', executions: 12, avgTime: 2.1 },
      { date: '2024-01-02', executions: 19, avgTime: 2.3 },
      { date: '2024-01-03', executions: 15, avgTime: 2.0 },
      { date: '2024-01-04', executions: 22, avgTime: 2.5 },
      { date: '2024-01-05', executions: 18, avgTime: 2.2 },
      { date: '2024-01-06', executions: 25, avgTime: 2.4 },
      { date: '2024-01-07', executions: 16, avgTime: 2.1 },
    ],
    nodePerformance: [
      { name: 'Text Input', avgTime: 0.5, executions: 127 },
      { name: 'Process Data', avgTime: 1.2, executions: 120 },
      { name: 'API Call', avgTime: 2.8, executions: 98 },
      { name: 'Send Email', avgTime: 1.5, executions: 85 },
      { name: 'Output', avgTime: 0.3, executions: 120 },
    ],
    statusDistribution: [
      { name: 'Success', value: 120, color: '#10b981' },
      { name: 'Failed', value: 7, color: '#ef4444' },
    ],
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance Metrics
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Executions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceData.totalExecutions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {performanceData.successRate}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Avg Execution Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performanceData.avgExecutionTime}s
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  Failure Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {performanceData.failureRate}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-6">
            {/* Execution Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Execution Trend (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData.executionTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="executions" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Success/Failure Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Execution Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={performanceData.statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {performanceData.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Node Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Node Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData.nodePerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avgTime" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
