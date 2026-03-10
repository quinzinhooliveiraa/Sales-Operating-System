import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, MoreHorizontal, Clock, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";

const STAGES = [
  { id: 'new', name: 'Novos Leads' },
  { id: 'qualified', name: 'Qualificados' },
  { id: 'demo', name: 'Demo Agendada' },
  { id: 'negotiation', name: 'Negociação' },
  { id: 'won', name: 'Fechado/Ganho' },
];

const MOCK_LEADS = [
  { id: 1, name: "Acme Corp", contact: "Sarah M.", value: "R$ 12.000", stage: "new", tags: ["SaaS", "Inbound"] },
  { id: 2, name: "TechFlow", contact: "Mike T.", value: "R$ 5.500", stage: "qualified", tags: ["E-commerce"] },
  { id: 3, name: "Global Ind.", contact: "Alex W.", value: "R$ 24.000", stage: "demo", tags: ["Enterprise"] },
  { id: 4, name: "Startup Inc", contact: "John D.", value: "R$ 2.000", stage: "new", tags: ["Outbound"] },
  { id: 5, name: "Inovação S.A.", contact: "Lisa R.", value: "R$ 8.500", stage: "negotiation", tags: ["SaaS"] },
];

export default function CRMView() {
  const [view, setView] = useState<'kanban'|'list'>('kanban');

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pipeline de Vendas</h1>
          <p className="text-muted-foreground mt-1 text-sm">Gerencie leads, acompanhe negócios e personalize cadências.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-secondary p-1 rounded-md">
            <button 
              onClick={() => setView('kanban')}
              className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${view === 'kanban' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Quadro
            </button>
            <button 
              onClick={() => setView('list')}
              className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${view === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Lista
            </button>
          </div>
          <Button className="gap-1.5 h-8 text-xs">
            <Plus className="w-3.5 h-3.5" />
            Adicionar Lead
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 pb-4 shrink-0">
        <Input placeholder="Buscar negócios, empresas..." className="max-w-xs h-8 text-xs bg-secondary/30" />
        <Button variant="outline" size="sm" className="h-8 text-xs">Filtro</Button>
        <Button variant="outline" size="sm" className="h-8 text-xs">Automações</Button>
      </div>

      {view === 'kanban' ? (
        <div className="flex-1 overflow-x-auto pb-2">
          <div className="flex gap-4 h-full min-w-max">
            {STAGES.map((stage) => {
              const leads = MOCK_LEADS.filter(l => l.stage === stage.id);
              
              return (
                <div key={stage.id} className="w-72 flex flex-col bg-secondary/30 rounded-lg border border-border/50">
                  <div className="p-3 flex items-center justify-between border-b border-border/50 shrink-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm">{stage.name}</h3>
                      <span className="text-[10px] font-medium text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                        {leads.length}
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground"><MoreHorizontal className="w-3 h-3" /></Button>
                  </div>
                  
                  <div className="flex-1 p-2 overflow-y-auto space-y-2">
                    {leads.map(lead => (
                      <div key={lead.id} className="bg-card border p-3 rounded-md shadow-sm hover:border-primary/30 transition-colors cursor-grab group">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-xs">{lead.name}</h4>
                          <span className="text-[10px] font-medium text-muted-foreground flex items-center">{lead.value}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <Avatar className="w-4 h-4 text-[8px]">
                            <AvatarFallback>{lead.contact.substring(0,2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="text-[10px] text-muted-foreground">{lead.contact}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-auto">
                          {lead.tags.map(tag => (
                            <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="mt-2 pt-2 border-t border-border/50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> 2 dias na etapa
                          </span>
                          <Button variant="ghost" size="sm" className="h-5 text-[9px] px-1.5">Tarefa</Button>
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
        <div className="glass rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-medium rounded-tl-lg border-b">Empresa</th>
                  <th className="px-4 py-2.5 font-medium border-b">Contato</th>
                  <th className="px-4 py-2.5 font-medium border-b">Etapa</th>
                  <th className="px-4 py-2.5 font-medium border-b">Valor</th>
                  <th className="px-4 py-2.5 font-medium rounded-tr-lg border-b">Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {MOCK_LEADS.map((lead, i) => {
                  const stage = STAGES.find(s => s.id === lead.stage);
                  return (
                    <tr key={lead.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-2.5 font-medium">{lead.name}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-5 h-5 text-[9px]"><AvatarFallback>{lead.contact.substring(0,2)}</AvatarFallback></Avatar>
                          {lead.contact}
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-secondary text-[10px] font-medium">
                          {stage?.name}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-medium text-muted-foreground">{lead.value}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex gap-1">
                          {lead.tags.map(tag => (
                            <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-secondary rounded">{tag}</span>
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