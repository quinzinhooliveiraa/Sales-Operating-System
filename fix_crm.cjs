const fs = require('fs');
let content = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

// Replace "Gerenciar Etapas" with "Gerenciar Pipeline"
content = content.replace(
  /<Button variant="outline" className="h-8 text-xs gap-1.5">[\s\S]*?<Settings2 className="w-3.5 h-3.5" \/>[\s\S]*?Gerenciar Etapas[\s\S]*?<\/Button>/,
  `<Button variant="outline" className="h-8 text-xs gap-1.5">
            <Settings2 className="w-3.5 h-3.5" />
            Gerenciar Pipeline
          </Button>`
);

// We need to update where lead.contact is used to lead.company in the card
content = content.replace(
  /<AvatarFallback>\{lead\.contact\.substring\(0,2\)\.toUpperCase\(\)\}<\/AvatarFallback>/g,
  '<AvatarFallback>{lead.company?.substring(0,2)?.toUpperCase() || "L"}</AvatarFallback>'
);
content = content.replace(
  /<span className="text-xs text-muted-foreground">\{lead\.contact\}<\/span>/g,
  '<span className="text-xs text-muted-foreground">{lead.company}</span>'
);

// Update lead details in Sheet
content = content.replace(
  /<p className="text-muted-foreground text-sm flex items-center gap-2">[\s\S]*?<Avatar className="w-5 h-5 text-\[9px\] border"><AvatarFallback>\{selectedLead\.contact\.substring\(0,2\)\}<\/AvatarFallback><\/Avatar>[\s\S]*?\{selectedLead\.contact\} • \{selectedLead\.value\}[\s\S]*?<\/p>/,
  `<div className="text-muted-foreground text-sm space-y-1 mt-2">
                  <p className="flex items-center gap-2"><Mail className="w-4 h-4"/> {selectedLead.email}</p>
                  <p className="flex items-center gap-2"><Phone className="w-4 h-4"/> {selectedLead.phone}</p>
                  <p className="flex items-center gap-2"><Target className="w-4 h-4"/> Valor: {selectedLead.value}</p>
                  <p className="flex items-center gap-2"><User className="w-4 h-4"/> Responsável: {selectedLead.owner}</p>
                </div>`
);

// Add History section to Sheet
content = content.replace(
  /\{Object\.keys\(selectedLead\.formResponses\)\.length > 0 && \(/,
  `<div className="space-y-3 border-t pt-4">
                <h3 className="font-semibold flex items-center gap-2 text-sm"><Activity className="w-4 h-4"/> Histórico de Atividades</h3>
                <div className="space-y-3 border-l-2 border-border/50 ml-2 pl-4 py-1">
                  {selectedLead.history && selectedLead.history.length > 0 ? selectedLead.history.map((act: any) => (
                    <div key={act.id} className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background"></div>
                      <p className="text-sm font-medium">{act.description}</p>
                      <p className="text-xs text-muted-foreground">{new Date(act.date).toLocaleDateString()}</p>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground">Sem atividades recentes.</p>
                  )}
                </div>
              </div>

              {Object.keys(selectedLead.formResponses).length > 0 && (`
);

// Update Add Lead button to open modal
content = content.replace(
  /<Button className="gap-1.5 h-8 text-xs bg-primary text-primary-foreground">/,
  `<Button className="gap-1.5 h-8 text-xs bg-primary text-primary-foreground" onClick={() => setIsAddLeadOpen(true)}>`
);

// Add missing states and modals
const modalsToAdd = `
      {/* Add Lead Modal */}
      <Dialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Lead</DialogTitle>
            <DialogDescription>Preencha as informações do novo lead manualmente.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Nome</label>
                <Input placeholder="Ex: João Silva" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Empresa</label>
                <Input placeholder="Ex: Acme Corp" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Email</label>
                <Input type="email" placeholder="joao@acme.com" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Telefone</label>
                <Input placeholder="+55 11 99999-9999" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Etapa do Pipeline</label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors">
                  {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Responsável</label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors">
                  <option>Quinzinho</option>
                  <option>João</option>
                  <option>Maria</option>
                </select>
              </div>
            </div>
            <Button className="w-full mt-4" onClick={() => setIsAddLeadOpen(false)}>Criar Lead</Button>
          </div>
        </DialogContent>
      </Dialog>
`;

content = content.replace(
  /const \[editingStage, setEditingStage\] = useState<Stage \| null>\(null\);/,
  `const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);`
);

content = content.replace('import { Plus, MoreHorizontal, Clock, DollarSign, Calendar, Target, Activity, MessageSquare, Phone, Mail, Settings2, Trash2 } from "lucide-react";', 'import { Plus, MoreHorizontal, Clock, DollarSign, Calendar, Target, Activity, MessageSquare, Phone, Mail, Settings2, Trash2, User } from "lucide-react";');

content = content.replace(/    <\/div>\n  \);\n}\s*$/, modalsToAdd + '\n    </div>\n  );\n}\n');

// Also update the cadence config to show touches correctly
content = content.replace(
  /<Input type="number" defaultValue=\{action\.intervalDays\} className="w-16 h-7 text-xs px-2" \/>\n                                  <span className="text-xs text-muted-foreground">dias<\/span>/g,
  `<Input type="number" defaultValue={action.intervalHours} className="w-16 h-7 text-xs px-2" />
                                  <span className="text-xs text-muted-foreground">horas</span>`
);

// Add scenario type configuration
content = content.replace(
  /<div className="space-y-2">\n                          <label className="text-sm font-medium">Nome da Etapa<\/label>\n                          <Input defaultValue=\{stage\.name\} className="h-9" \/>\n                        <\/div>/,
  `<div className="space-y-2">
                          <label className="text-sm font-medium">Nome da Etapa</label>
                          <Input defaultValue={stage.name} className="h-9" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Tipo de Cenário (Cadência)</label>
                          <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" defaultValue={stage.scenarioType || ''}>
                            <option value="">Sem cenário específico</option>
                            <option value="Cold call funnel">Cold call funnel</option>
                            <option value="Meeting follow-up funnel">Meeting follow-up funnel</option>
                          </select>
                        </div>`
);

fs.writeFileSync('client/src/pages/CRMView.tsx', content);
console.log('CRM updated');
