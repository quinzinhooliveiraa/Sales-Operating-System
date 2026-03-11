const fs = require('fs');
let content = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

// 1. Add handleAddLead logic
const addLeadState = `  const [draggedLeadId, setDraggedLeadId] = useState<number | null>(null);`;
const newLeadState = `  const [draggedLeadId, setDraggedLeadId] = useState<number | null>(null);
  
  // New lead form state
  const [newLead, setNewLead] = useState<Partial<Lead>>({
    name: "", company: "", email: "", phone: "", stage: stages[0]?.id || "", owner: "Quinzinho", notes: ""
  });`;
  
content = content.replace(addLeadState, newLeadState);

const addLeadFunc = `  const handleUpdateStage = (stageId: string, field: keyof Stage, value: any) => {`;
const newAddLeadFunc = `  const handleAddLead = () => {
    if (!newLead.name) return;
    
    const lead: Lead = {
      id: Math.max(0, ...leads.map(l => l.id)) + 1,
      name: newLead.name || "",
      company: newLead.company || "",
      email: newLead.email || "",
      phone: newLead.phone || "",
      stage: newLead.stage || stages[0]?.id || "",
      owner: newLead.owner || "Quinzinho",
      value: "R$ 0",
      tags: [],
      score: 50,
      formResponses: {},
      notes: newLead.notes || "",
      history: [{ id: Math.random().toString(), type: 'stage_change', description: 'Lead adicionado', date: new Date().toISOString() }]
    };
    
    setLeads([...leads, lead]);
    setIsAddLeadOpen(false);
    setNewLead({ name: "", company: "", email: "", phone: "", stage: stages[0]?.id || "", owner: "Quinzinho", notes: "" });
  };

  const handleUpdateStage = (stageId: string, field: keyof Stage, value: any) => {`;
  
content = content.replace(addLeadFunc, newAddLeadFunc);

// 2. Update Add Lead Sheet bindings
const oldSheetForm = `<div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nome</label>
              <Input placeholder="Ex: João Silva" className="h-10 bg-background text-foreground" />
            </div>`;
const newSheetForm = `<div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nome</label>
              <Input placeholder="Ex: João Silva" className="h-10 bg-background text-foreground" value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} />
            </div>`;
content = content.replace(oldSheetForm, newSheetForm);

content = content.replace(
  /<Input placeholder="Ex: Acme Corp" className="h-10 bg-background text-foreground" \/>/,
  `<Input placeholder="Ex: Acme Corp" className="h-10 bg-background text-foreground" value={newLead.company} onChange={e => setNewLead({...newLead, company: e.target.value})} />`
);
content = content.replace(
  /<Input type="email" placeholder="joao@acme\.com" className="h-10 bg-background text-foreground" \/>/,
  `<Input type="email" placeholder="joao@acme.com" className="h-10 bg-background text-foreground" value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})} />`
);
content = content.replace(
  /<Input placeholder="\+55 11 99999-9999" className="h-10 bg-background text-foreground" \/>/,
  `<Input placeholder="+55 11 99999-9999" className="h-10 bg-background text-foreground" value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})} />`
);

content = content.replace(
  /<select className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-primary">\s*\{stages\.map\(s => <option key=\{s\.id\} value=\{s\.id\} className="bg-background text-foreground">\{s\.name\}<\/option>\)\}\s*<\/select>/,
  `<select className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-primary" value={newLead.stage} onChange={e => setNewLead({...newLead, stage: e.target.value})}>
                {stages.map(s => <option key={s.id} value={s.id} className="bg-background text-foreground">{s.name}</option>)}
              </select>`
);

content = content.replace(
  /<select className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-primary">\s*<option className="bg-background text-foreground">Quinzinho<\/option>\s*<option className="bg-background text-foreground">João<\/option>\s*<option className="bg-background text-foreground">Maria<\/option>\s*<\/select>/,
  `<select className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-primary" value={newLead.owner} onChange={e => setNewLead({...newLead, owner: e.target.value})}>
                <option value="Quinzinho" className="bg-background text-foreground">Quinzinho</option>
                <option value="João" className="bg-background text-foreground">João</option>
                <option value="Maria" className="bg-background text-foreground">Maria</option>
              </select>`
);

content = content.replace(
  /<textarea \s*className="w-full min-h-\[100px\] p-3 text-sm rounded-md border bg-background text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"\s*placeholder="Detalhes sobre a prospecção\.\.\."\s*\/>/,
  `<textarea 
                className="w-full min-h-[100px] p-3 text-sm rounded-md border bg-background text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Detalhes sobre a prospecção..."
                value={newLead.notes} onChange={e => setNewLead({...newLead, notes: e.target.value})}
              />`
);

content = content.replace(
  /<Button className="w-full h-10 text-base" onClick=\{() => setIsAddLeadOpen\(false\)\}>\s*Criar Lead\s*<\/Button>/,
  `<Button className="w-full h-10 text-base" onClick={handleAddLead}>\s*Criar Lead\s*<\/Button>`
);

// 3. Add Stage creation logic
const addStageFunc = `  const handleAddTouch = (stageId: string) => {`;
const newAddStageFunc = `  const handleAddStage = () => {
    const newStageId = 'stage_' + Math.random().toString(36).substr(2, 9);
    setStages([...stages, { id: newStageId, name: 'Nova Etapa', cadence: [] }]);
  };

  const handleAddTouch = (stageId: string) => {`;
content = content.replace(addStageFunc, newAddStageFunc);

content = content.replace(
  /<Button className="gap-2 bg-primary text-primary-foreground">\s*<Plus className="w-4 h-4"\/> Nova Etapa\s*<\/Button>/,
  `<Button className="gap-2 bg-primary text-primary-foreground" onClick={handleAddStage}>\s*<Plus className="w-4 h-4"\/> Nova Etapa\s*<\/Button>`
);

const removeStageFunc = `  const handleUpdateStage = (stageId: string, field: keyof Stage, value: any) => {`;
const newRemoveStageFunc = `  const handleRemoveStage = (stageId: string) => {
    setStages(stages.filter(s => s.id !== stageId));
  };

  const handleUpdateStage = (stageId: string, field: keyof Stage, value: any) => {`;
content = content.replace(removeStageFunc, newRemoveStageFunc);

content = content.replace(
  /<Button variant="ghost" className="text-destructive hover:bg-destructive\/10 gap-2 shrink-0 self-end sm:self-auto">\s*<Trash2 className="w-4 h-4"\/> Remover Etapa\s*<\/Button>/g,
  `<Button variant="ghost" className="text-destructive hover:bg-destructive/10 gap-2 shrink-0 self-end sm:self-auto" onClick={() => handleRemoveStage(stage.id)}>\s*<Trash2 className="w-4 h-4"\/> Remover Etapa\s*<\/Button>`
);

// 4. Multi-touch addition
const addTouchBtn = `<Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => handleAddTouch(stage.id)}>
                             <Plus className="w-3.5 h-3.5" /> Adicionar Touch
                          </Button>`;
const newAddTouchBtn = `<div className="flex items-center gap-2">
                            <select 
                              className="h-8 rounded-md border border-input bg-background text-xs px-2 focus:outline-none"
                              onChange={(e) => {
                                const count = parseInt(e.target.value);
                                if (count > 0) {
                                  let currentTouches = [...stage.cadence];
                                  for(let i=0; i<count; i++) {
                                    currentTouches.push({ type: 'email', intervalHours: 24 });
                                  }
                                  setStages(stages.map(s => s.id === stage.id ? { ...s, cadence: currentTouches } : s));
                                }
                                e.target.value = "";
                              }}
                            >
                              <option value="">Adicionar múltiplos...</option>
                              <option value="3">Adicionar 3 touches</option>
                              <option value="5">Adicionar 5 touches</option>
                              <option value="7">Adicionar 7 touches</option>
                              <option value="10">Adicionar 10 touches</option>
                            </select>
                            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => handleAddTouch(stage.id)}>
                               <Plus className="w-3.5 h-3.5" /> 1 Touch
                            </Button>
                          </div>`;
content = content.replace(addTouchBtn, newAddTouchBtn);

// Also need to allow adding stage from outside
content = content.replace(
  /<Button variant="ghost" className="h-full w-full border-2 border-dashed border-border hover:border-primary\/50 bg-secondary\/10 hover:bg-secondary\/30 rounded-xl">/,
  `<Button variant="ghost" className="h-full w-full border-2 border-dashed border-border hover:border-primary/50 bg-secondary/10 hover:bg-secondary/30 rounded-xl" onClick={handleAddStage}>`
);

fs.writeFileSync('client/src/pages/CRMView.tsx', content);
console.log('Finished updating CRM capabilities');
