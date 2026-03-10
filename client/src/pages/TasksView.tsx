import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckSquare, Calendar, Filter, Clock, MoreVertical, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TasksView() {
  const [filter, setFilter] = useState('all');

  const tasks = [
    { id: 1, title: "Follow up email to Acme Corp", due: "Today", type: "Automated Cadence", status: "pending", priority: "high" },
    { id: 2, title: "Prepare demo environment for TechFlow", due: "Tomorrow", type: "Manual", status: "pending", priority: "medium" },
    { id: 3, title: "Send contract to Global Ind.", due: "Today", type: "Automated Cadence", status: "completed", priority: "high" },
    { id: 4, title: "Update CRM records for Q1", due: "Next Week", type: "Manual", status: "pending", priority: "low" },
    { id: 5, title: "Check in with Startup Inc (Day 3)", due: "Tomorrow", type: "Automated Cadence", status: "pending", priority: "medium" },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks & Action Items</h1>
          <p className="text-muted-foreground mt-1">Manual tasks and automated CRM cadences.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between glass p-2 rounded-lg border">
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <Button variant={filter === 'all' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('all')}>
            All Tasks
          </Button>
          <Button variant={filter === 'today' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('today')}>
            Today
          </Button>
          <Button variant={filter === 'automated' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('automated')}>
            Automated Cadences
          </Button>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Input placeholder="Search tasks..." className="h-9 bg-background" />
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0"><Filter className="w-4 h-4" /></Button>
        </div>
      </div>

      <Card className="glass overflow-hidden border-border/50">
        <div className="divide-y divide-border/50">
          {tasks.map(task => (
            <div key={task.id} className={`p-4 flex items-center gap-4 transition-colors hover:bg-muted/30 group ${task.status === 'completed' ? 'opacity-60' : ''}`}>
              <button className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${task.status === 'completed' ? 'bg-primary border-primary text-primary-foreground' : 'hover:border-primary'}`}>
                {task.status === 'completed' && <CheckSquare className="w-3 h-3" />}
              </button>
              
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${task.due === 'Today' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-muted text-muted-foreground'}`}>
                    <Clock className="w-3 h-3" /> {task.due}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    {task.type === 'Automated Cadence' ? <Calendar className="w-3 h-3" /> : <CheckSquare className="w-3 h-3" />}
                    {task.type}
                  </span>
                  {task.priority === 'high' && (
                    <span className="text-[10px] uppercase font-bold tracking-wider text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">High Priority</span>
                  )}
                </div>
              </div>
              
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}