const fs = require('fs');

let content = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

// Fix the syntax error by rewriting the specific faulty segment
// First let's check where the issue is. It's likely near the manage pipeline modal.

const correctManagePipeline = `
      {/* Manage Pipeline Modal */}
      <Dialog open={isManagePipelineOpen} onOpenChange={setIsManagePipelineOpen}>
        <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Gerenciar Pipeline</DialogTitle>
            <DialogDescription>Crie, reordene ou edite as etapas e suas cadências.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 py-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Etapas do Funil</h3>
              <Button size="sm" className="gap-1 h-8"><Plus className="w-3.5 h-3.5"/> Nova Etapa</Button>
            </div>
            
            <div className="space-y-3">
              {stages.map((stage, index) => (
                <div key={stage.id} className="border rounded-lg p-4 bg-card shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col text-muted-foreground cursor-move">
                        <MoreHorizontal className="w-4 h-4 -mb-1.5" />
                        <MoreHorizontal className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-muted-foreground w-4">{index + 1}.</span>
                      <Input defaultValue={stage.name} className="h-8 w-[200px] font-medium" />
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4"/></Button>
                  </div>
                  
                  <div className="pl-12 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">Tipo de Cenário</label>
                        <select className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs" defaultValue={stage.scenarioType || ''}>
                          <option value="">Nenhum cenário</option>
                          <option value="Cold call funnel">Cold call funnel</option>
                          <option value="Meeting follow-up funnel">Meeting follow-up funnel</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">Tentativas (Touches)</label>
                        <select className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs" defaultValue={stage.cadence.length}>
                          <option value="0">Sem cadência</option>
                          <option value="3">3 touches</option>
                          <option value="5">5 touches</option>
                          <option value="7">7 touches</option>
                          <option value="10">10 touches</option>
                          <option value="12">12 touches</option>
                          <option value="15">15 touches</option>
                          <option value="custom">Personalizado</option>
                        </select>
                      </div>
                    </div>
                    
                    {stage.cadence.length > 0 && (
                      <div className="bg-secondary/30 p-3 rounded-md space-y-2 border">
                        <h4 className="text-xs font-medium mb-2">Intervalo entre tentativas</h4>
                        {stage.cadence.map((action, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-xs w-14 font-medium text-muted-foreground">Touch {i+1}</span>
                            <select className="flex h-7 w-28 rounded border border-input bg-background px-2 text-xs" defaultValue={action.type}>
                              <option value="call">Ligação</option>
                              <option value="email">Email</option>
                              <option value="message">Mensagem</option>
                            </select>
                            <span className="text-xs text-muted-foreground">após</span>
                            <select className="flex h-7 w-24 rounded border border-input bg-background px-2 text-xs" defaultValue={action.intervalHours}>
                              <option value="12">12 horas</option>
                              <option value="24">24 horas</option>
                              <option value="36">36 horas</option>
                              <option value="48">48 horas</option>
                              <option value={action.intervalHours}>Personalizado ({action.intervalHours}h)</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="mt-4 pt-4 border-t shrink-0">
            <Button variant="outline" onClick={() => setIsManagePipelineOpen(false)}>Cancelar</Button>
            <Button onClick={() => setIsManagePipelineOpen(false)}>Salvar Pipeline</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>`;

// Just inject right after the Add Lead Modal instead of relying on regex replacements that might have failed

const addLeadModalIndex = content.indexOf('{/* Manage Pipeline Modal */}');
if (addLeadModalIndex !== -1) {
  content = content.substring(0, addLeadModalIndex) + correctManagePipeline + `

      {/* Create Task Modal for Lead */}
      <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nova Tarefa</DialogTitle>
            <DialogDescription>Adicione uma tarefa vinculada a {selectedLead?.name || 'este lead'}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título da Tarefa</label>
              <Input placeholder="O que precisa ser feito?" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Prioridade</label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                <option value="do-now">Fazer Agora (Urgente/Importante)</option>
                <option value="schedule">Agendar (Importante/Não Urgente)</option>
                <option value="delegate">Delegar (Urgente/Não Importante)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Data de Vencimento</label>
              <Input type="date" />
            </div>
            <Button className="w-full mt-2" onClick={() => setIsCreateTaskOpen(false)}>Criar Tarefa</Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
`;
}

fs.writeFileSync('client/src/pages/CRMView.tsx', content);
console.log('Fixed syntax error');
