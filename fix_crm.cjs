const fs = require('fs');
let content = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

// The main issue is the user wants the select/inputs to actually reflect the personalized options for touches
// and the Add Lead should match the design of Lead Detailed panel (Sheet on the right)

// Since I already changed Add Lead to a Sheet in the previous call, the user is likely reacting to the earlier state.
// BUT let me improve the layout of Add Lead and Manage Pipeline further to ensure it looks perfectly polished based on the current feedback.
// Wait, I should make sure "Adicionar Lead" sheet has the same exact styling as the detail view.
// And "Gerenciar Pipeline" should be full page, which I already did.
// Let's refine the "Gerenciar Pipeline" touches editing to allow true customization of intervals as requested: "não tá dando pra personalizar quantos touch eu vou fazer... colocar cinco touch e editar por exemplo, se eu colocar cinco touch, eu também tenho que definir quanto tempo..."

const newTouchesSection = `
                        <div className="w-full">
                          {stage.cadence.length === 0 ? (
                            <div className="bg-secondary/20 border border-dashed rounded-lg p-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                              <p>Nenhum touch configurado para esta etapa.</p>
                              <Button variant="outline" size="sm" className="mt-2" onClick={() => handleAddTouch(stage.id)}>
                                Adicionar Primeiro Touch
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {stage.cadence.map((action, i) => (
                                <div key={i} className="flex flex-wrap sm:flex-nowrap items-center gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
                                  <div className="flex flex-col items-center justify-center bg-secondary/30 w-12 h-12 rounded-lg border border-border/50 shrink-0">
                                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Touch</span>
                                    <span className="text-lg font-bold leading-none">{i+1}</span>
                                  </div>
                                  
                                  <div className="flex-1 min-w-[200px] grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                      <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Ação</label>
                                      <select 
                                        className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary" 
                                        value={action.type}
                                        onChange={(e) => handleUpdateTouch(stage.id, i, 'type', e.target.value)}
                                      >
                                        <option value="call" className="bg-background text-foreground">Ligação (Call)</option>
                                        <option value="email" className="bg-background text-foreground">Email</option>
                                        <option value="message" className="bg-background text-foreground">Mensagem (WhatsApp/LinkedIn)</option>
                                      </select>
                                    </div>
                                    
                                    <div className="space-y-1.5">
                                      <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Intervalo (Espera)</label>
                                      <div className="flex items-center gap-2">
                                        <Input 
                                          type="number" 
                                          value={action.intervalHours} 
                                          onChange={(e) => handleUpdateTouch(stage.id, i, 'intervalHours', e.target.value)}
                                          className="h-10 w-full bg-background text-foreground shadow-sm" 
                                          min="0"
                                        />
                                        <span className="text-sm text-muted-foreground shrink-0 w-10">horas</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 mt-5 sm:mt-0"
                                    onClick={() => handleRemoveTouch(stage.id, i)}
                                    title="Remover Touch"
                                  >
                                    <Trash2 className="w-5 h-5"/>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>`;

content = content.replace(/<div className="w-full">\s*\{stage\.cadence\.length === 0 \? \([\s\S]*?\}\s*<\/div>/, newTouchesSection);

fs.writeFileSync('client/src/pages/CRMView.tsx', content);
console.log('CRM styles polished and touch customizer improved');
