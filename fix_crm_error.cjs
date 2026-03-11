const fs = require('fs');
let content = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

const regex = /<div className="space-y-6">\s*\{stages\.map\(\(stage, index\) => \([\s\S]*?\}\s*<\/div>\s*\)\}\s*<\/div>\s*\)\}\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\}\)\}\s*<\/div>/;

// There is a duplication around line 480:
/*
   478→                ))}
   479→              </div>
   480→                          )}
   481→                        </div>
   482→                          )}
   483→                        </div>
   484→                      </div>
   485→                    </div>
   486→                  </div>
   487→                ))}
   488→              </div>
*/

// Let's do a more robust string replacement to clean up the duplicated closing tags

const correctSection = `<div className="space-y-6">
                {stages.map((stage, index) => (
                  <div key={stage.id} className="border rounded-xl p-5 sm:p-6 bg-card shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex flex-col text-muted-foreground/50 cursor-move shrink-0">
                          <MoreHorizontal className="w-5 h-5 -mb-2" />
                          <MoreHorizontal className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-muted-foreground text-lg w-6 shrink-0">{index + 1}.</span>
                        <Input 
                          value={stage.name} 
                          onChange={(e) => handleUpdateStage(stage.id, 'name', e.target.value)}
                          className="h-11 text-base font-semibold w-full sm:max-w-[350px] bg-background text-foreground" 
                        />
                      </div>
                      <Button variant="ghost" className="text-destructive hover:bg-destructive/10 gap-2 shrink-0 self-end sm:self-auto">
                        <Trash2 className="w-4 h-4"/> Remover Etapa
                      </Button>
                    </div>
                    
                    <div className="sm:pl-14 space-y-6">
                      <div className="w-full sm:w-[400px] space-y-2">
                        <label className="text-sm font-medium text-foreground">Tipo de Cenário</label>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" 
                          value={stage.scenarioType || ''}
                          onChange={(e) => handleUpdateStage(stage.id, 'scenarioType', e.target.value)}
                        >
                          <option value="" className="bg-background text-foreground">Nenhum cenário</option>
                          <option value="Cold call funnel" className="bg-background text-foreground">Cold call funnel</option>
                          <option value="Meeting follow-up funnel" className="bg-background text-foreground">Meeting follow-up funnel</option>
                        </select>
                      </div>
                      
                      <div className="space-y-3 pt-2">
                        <div className="flex flex-wrap justify-between items-center w-full gap-3">
                          <h4 className="text-sm font-medium text-foreground">Cadência (Touches)</h4>
                          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => handleAddTouch(stage.id)}>
                             <Plus className="w-3.5 h-3.5" /> Adicionar Touch
                          </Button>
                        </div>
                        
                        <div className="w-full">
                          {stage.cadence.length === 0 ? (
                            <div className="bg-secondary/20 border border-dashed border-border/50 rounded-lg p-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                              <p>Nenhum touch configurado para esta etapa.</p>
                              <Button variant="outline" size="sm" className="mt-2" onClick={() => handleAddTouch(stage.id)}>
                                Adicionar Primeiro Touch
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {stage.cadence.map((action, i) => (
                                <div key={i} className="flex flex-wrap sm:flex-nowrap items-center gap-4 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
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
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>`;

// Replace from '              <div className="space-y-6">' 
// up to exactly before '            </div>\n          </div>\n          <div className="p-4 sm:p-6 border-t bg-card'
const replaceStart = '<div className="space-y-6">';
const replaceEnd = '</div>\n            </div>\n          </div>\n          <div className="p-4 sm:p-6 border-t bg-card';
const startIndex = content.indexOf(replaceStart);
const endIndex = content.indexOf(replaceEnd);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + correctSection + '\n            ' + content.substring(endIndex);
  fs.writeFileSync('client/src/pages/CRMView.tsx', content);
  console.log('Fixed syntax by replacing exact section');
} else {
  console.log('Indices not found:', startIndex, endIndex);
}

