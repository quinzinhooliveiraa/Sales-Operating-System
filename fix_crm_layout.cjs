const fs = require('fs');

let content = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

// 1. Replace Add Lead Dialog with Sheet
const addLeadOld = `{/* Add Lead Modal */}
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
                <Input placeholder="Ex: João Silva" className="h-9" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Empresa</label>
                <Input placeholder="Ex: Acme Corp" className="h-9" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Email</label>
                <Input type="email" placeholder="joao@acme.com" className="h-9" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Telefone</label>
                <Input placeholder="+55 11 99999-9999" className="h-9" />
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
      </Dialog>`;

const addLeadNew = `{/* Add Lead Sheet */}
      <Sheet open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-card border-l">
          <SheetHeader className="mb-6 mt-6">
            <SheetTitle className="text-2xl font-bold">Adicionar Lead</SheetTitle>
            <SheetDescription>Preencha as informações do novo lead para iniciar no funil.</SheetDescription>
          </SheetHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input placeholder="Ex: João Silva" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Empresa</label>
              <Input placeholder="Ex: Acme Corp" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="joao@acme.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Telefone</label>
              <Input placeholder="+55 11 99999-9999" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Etapa do Pipeline</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors">
                {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Responsável</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors">
                <option>Quinzinho</option>
                <option>João</option>
                <option>Maria</option>
              </select>
            </div>
            <div className="pt-6 border-t mt-4">
              <Button className="w-full" onClick={() => setIsAddLeadOpen(false)}>Criar Lead</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>`;

content = content.replace(addLeadOld, addLeadNew);

// 2. Replace Manage Pipeline Modal
const managePipelineOldRegex = /\{\/\* Manage Pipeline Modal \*\/\}[\s\S]*?(?=\{\/\* Create Task Modal for Lead \*\/\}|$)/;

const managePipelineNew = `{/* Manage Pipeline Modal */}
      <Dialog open={isManagePipelineOpen} onOpenChange={setIsManagePipelineOpen}>
        <DialogContent className="max-w-[95vw] w-[900px] h-[90vh] flex flex-col p-0 overflow-hidden bg-background">
          <div className="p-6 border-b shrink-0 bg-card">
            <DialogTitle className="text-2xl font-bold">Gerenciar Pipeline</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1 text-base">Configure as etapas do seu funil de vendas e as cadências automáticas (touches).</DialogDescription>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 bg-secondary/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-medium text-lg text-foreground">Etapas do Funil</h3>
              <Button className="gap-2 bg-primary text-primary-foreground"><Plus className="w-4 h-4"/> Nova Etapa</Button>
            </div>
            
            <div className="space-y-5">
              {stages.map((stage, index) => (
                <div key={stage.id} className="border rounded-xl p-5 bg-card shadow-sm space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col text-muted-foreground/50 cursor-move">
                        <MoreHorizontal className="w-5 h-5 -mb-2" />
                        <MoreHorizontal className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-muted-foreground text-lg w-6">{index + 1}.</span>
                      <Input defaultValue={stage.name} className="h-10 text-base font-semibold w-[300px]" />
                    </div>
                    <Button variant="ghost" className="text-destructive hover:bg-destructive/10 gap-2"><Trash2 className="w-4 h-4"/> Remover Etapa</Button>
                  </div>
                  
                  <div className="pl-14 space-y-5">
                    <div className="w-[350px] space-y-2">
                      <label className="text-sm font-medium text-foreground">Tipo de Cenário</label>
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" defaultValue={stage.scenarioType || ''}>
                        <option value="">Nenhum cenário</option>
                        <option value="Cold call funnel">Cold call funnel</option>
                        <option value="Meeting follow-up funnel">Meeting follow-up funnel</option>
                      </select>
                    </div>
                    
                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center w-full max-w-2xl">
                        <h4 className="text-sm font-medium">Cadência (Touches)</h4>
                        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                           <Plus className="w-3.5 h-3.5" /> Adicionar Touch
                        </Button>
                      </div>
                      
                      <div className="max-w-2xl">
                        {stage.cadence.length === 0 ? (
                          <div className="bg-secondary/20 border border-dashed rounded-lg p-6 text-center text-sm text-muted-foreground">
                            Nenhum touch configurado para esta etapa. Adicione touches para criar tarefas automaticamente.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {stage.cadence.map((action, i) => (
                              <div key={i} className="flex items-center gap-3 bg-secondary/10 p-3 rounded-lg border border-border/50 shadow-sm">
                                <span className="text-sm font-medium bg-background px-2.5 py-1.5 rounded border min-w-[75px] text-center shadow-sm">Touch {i+1}</span>
                                <select className="flex h-9 w-[140px] rounded-md border border-input bg-background px-3 text-sm shadow-sm" defaultValue={action.type}>
                                  <option value="call">Ligação</option>
                                  <option value="email">Email</option>
                                  <option value="message">Mensagem (WhatsApp)</option>
                                </select>
                                <span className="text-sm text-muted-foreground px-2">intervalo de</span>
                                <div className="flex items-center gap-2">
                                  <Input type="number" defaultValue={action.intervalHours} className="h-9 w-[80px] bg-background shadow-sm" />
                                  <span className="text-sm text-muted-foreground">horas</span>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4"/></Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-5 border-t bg-card flex justify-end gap-3 shrink-0">
            <Button variant="outline" onClick={() => setIsManagePipelineOpen(false)}>Cancelar</Button>
            <Button onClick={() => setIsManagePipelineOpen(false)} className="bg-primary text-primary-foreground">Salvar Pipeline</Button>
          </div>
        </DialogContent>
      </Dialog>

      `;

content = content.replace(managePipelineOldRegex, managePipelineNew);

// 3. Fix the transparent background issues if any.
// the `bg-transparent` inputs were hard to see in light/dark mixed modes.
// Replaced `bg-transparent` with `bg-background` in forms above.

fs.writeFileSync('client/src/pages/CRMView.tsx', content);
console.log('Successfully updated CRM layout');
