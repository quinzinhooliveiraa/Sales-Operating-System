import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, MoreHorizontal, Calendar, Clock, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";

const STAGES = [
  { id: 'new', name: 'New Leads', color: 'bg-blue-500' },
  { id: 'qualified', name: 'Qualified', color: 'bg-purple-500' },
  { id: 'demo', name: 'Demo Scheduled', color: 'bg-amber-500' },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-orange-500' },
  { id: 'won', name: 'Closed Won', color: 'bg-emerald-500' },
];

const MOCK_LEADS = [
  { id: 1, name: "Acme Corp", contact: "Sarah M.", value: "$12,000", stage: "new", tags: ["SaaS", "Inbound"] },
  { id: 2, name: "TechFlow", contact: "Mike T.", value: "$5,500", stage: "qualified", tags: ["E-commerce"] },
  { id: 3, name: "Global Ind.", contact: "Alex W.", value: "$24,000", stage: "demo", tags: ["Enterprise"] },
  { id: 4, name: "Startup Inc", contact: "John D.", value: "$2,000", stage: "new", tags: ["Outbound"] },
  { id: 5, name: "Innovate Co", contact: "Lisa R.", value: "$8,500", stage: "negotiation", tags: ["SaaS"] },
];

export default function CRMView() {
  const [view, setView] = useState<'kanban'|'list'>('kanban');

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Pipeline</h1>
          <p className="text-muted-foreground mt-1">Manage leads, track deals, and customize cadences.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-muted/50 p-1 rounded-md border">
            <button 
              onClick={() => setView('kanban')}
              className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${view === 'kanban' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Board
            </button>
            <button 
              onClick={() => setView('list')}
              className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${view === 'list' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              List
            </button>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Lead
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 pb-4 border-b shrink-0">
        <Input placeholder="Search deals, companies..." className="max-w-xs bg-muted/30" />
        <Button variant="outline" size="sm">Filter</Button>
        <Button variant="outline" size="sm">Automations</Button>
      </div>

      {view === 'kanban' ? (
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-6 h-full min-w-max">
            {STAGES.map((stage) => {
              const leads = MOCK_LEADS.filter(l => l.stage === stage.id);
              
              return (
                <div key={stage.id} className="w-80 flex flex-col bg-muted/20 rounded-xl border border-border/50">
                  <div className="p-4 flex items-center justify-between border-b border-border/50 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                      <h3 className="font-semibold">{stage.name}</h3>
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {leads.length}
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="w-4 h-4" /></Button>
                  </div>
                  
                  <div className="flex-1 p-3 overflow-y-auto space-y-3">
                    {leads.map(lead => (
                      <div key={lead.id} className="bg-card border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-grab group">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm">{lead.name}</h4>
                          <span className="text-xs font-semibold text-emerald-600 flex items-center"><DollarSign className="w-3 h-3" />{lead.value.replace('$', '')}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <Avatar className="w-5 h-5 text-[10px]">
                            <AvatarFallback>{lead.contact.substring(0,2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">{lead.contact}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-auto">
                          {lead.tags.map(tag => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded-md">
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        {/* Hidden action bar that appears on hover */}
                        <div className="mt-3 pt-3 border-t border-border/50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> 2 days in stage
                          </span>
                          <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2">Task</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="glass rounded-xl border p-1 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium rounded-tl-lg">Company</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Stage</th>
                  <th className="px-4 py-3 font-medium">Value</th>
                  <th className="px-4 py-3 font-medium rounded-tr-lg">Tags</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_LEADS.map((lead, i) => {
                  const stage = STAGES.find(s => s.id === lead.stage);
                  return (
                    <tr key={lead.id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{lead.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6 text-[10px]"><AvatarFallback>{lead.contact.substring(0,2)}</AvatarFallback></Avatar>
                          {lead.contact}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted text-xs font-medium">
                          <span className={`w-1.5 h-1.5 rounded-full ${stage?.color}`}></span>
                          {stage?.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-emerald-600">{lead.value}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {lead.tags.map(tag => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-secondary rounded-md">{tag}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}