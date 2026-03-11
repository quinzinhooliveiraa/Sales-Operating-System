const fs = require('fs');
let content = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

// 1. Import ChevronDown / ChevronRight
content = content.replace(
  /import \{ Plus, MoreHorizontal, Clock, DollarSign, Calendar, Target, Activity, MessageSquare, Phone, Mail, Settings2, Trash2, User, X, Mic, MicOff, Loader2 \} from "lucide-react";/,
  `import { Plus, MoreHorizontal, Clock, DollarSign, Calendar, Target, Activity, MessageSquare, Phone, Mail, Settings2, Trash2, User, X, Mic, MicOff, Loader2, ChevronDown, ChevronRight } from "lucide-react";`
);

// 2. Add state for collapsed stages
const stateHookPos = `  const [draggedStageId, setDraggedStageId] = useState<string | null>(null);`;
const stateHookNew = `  const [draggedStageId, setDraggedStageId] = useState<string | null>(null);
  const [collapsedStages, setCollapsedStages] = useState<Record<string, boolean>>({});
  
  const toggleStageCollapse = (stageId: string) => {
    setCollapsedStages(prev => ({ ...prev, [stageId]: !prev[stageId] }));
  };`;
content = content.replace(stateHookPos, stateHookNew);

// 3. Update the stage card rendering to include toggle button and conditional rendering
const stageCardOld = `                  <div 
                    key={stage.id} 
                    className={\`border rounded-xl p-5 sm:p-6 bg-card shadow-sm space-y-5 \${draggedStageId === stage.id ? 'opacity-50 border-primary' : ''}\`}
                    draggable
                    onDragStart={(e) => handleStageDragStart(e, stage.id)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (draggedStageId) {
                        handleStageDragOver(e);
                      } else {
                        handleDragOver(e);
                      }
                    }}
                    onDrop={(e) => {
                      if (draggedStageId) {
                        handleStageDrop(e, stage.id);
                      } else {
                        handleDrop(e, stage.id);
                      }
                    }}
                    onDragEnd={handleStageDragEnd}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex flex-col text-muted-foreground/50 cursor-move shrink-0 hover:text-foreground transition-colors">
                          <MoreHorizontal className="w-5 h-5 -mb-2" />
                          <MoreHorizontal className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-muted-foreground text-lg w-6 shrink-0">{index + 1}.</span>
                        <Input 
                          value={stage.name} 
                          onChange={(e) => handleUpdateStage(stage.id, 'name', e.target.value)}
                          onDragStart={(e) => e.stopPropagation()}
                          className="h-11 text-base font-semibold w-full sm:max-w-[350px] bg-background text-foreground" 
                        />
                      </div>
                      <Button variant="ghost" className="text-destructive hover:bg-destructive/10 gap-2 shrink-0 self-end sm:self-auto" onClick={() => handleRemoveStage(stage.id)}><Trash2 className="w-4 h-4"/> Remover Etapa</Button>
                    </div>
                    
                    <div className="sm:pl-14 space-y-6">`;

const stageCardNew = `                  <div 
                    key={stage.id} 
                    className={\`border rounded-xl p-5 sm:p-6 bg-card shadow-sm transition-all \${draggedStageId === stage.id ? 'opacity-50 border-primary' : ''} \${!collapsedStages[stage.id] ? 'space-y-5' : ''}\`}
                    draggable
                    onDragStart={(e) => handleStageDragStart(e, stage.id)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (draggedStageId) {
                        handleStageDragOver(e);
                      } else {
                        handleDragOver(e);
                      }
                    }}
                    onDrop={(e) => {
                      if (draggedStageId) {
                        handleStageDrop(e, stage.id);
                      } else {
                        handleDrop(e, stage.id);
                      }
                    }}
                    onDragEnd={handleStageDragEnd}
                  >
                    <div className={\`flex flex-col sm:flex-row sm:items-center justify-between gap-4 \${!collapsedStages[stage.id] ? 'pb-4 border-b border-border/50' : ''}\`}>
                      <div className="flex items-center gap-2 sm:gap-4 flex-1">
                        <div className="flex flex-col text-muted-foreground/50 cursor-move shrink-0 hover:text-foreground transition-colors mr-1">
                          <MoreHorizontal className="w-5 h-5 -mb-2" />
                          <MoreHorizontal className="w-5 h-5" />
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-8 h-8 shrink-0 text-muted-foreground" 
                          onClick={() => toggleStageCollapse(stage.id)}
                        >
                          {collapsedStages[stage.id] ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </Button>
                        <span className="font-bold text-muted-foreground text-lg w-6 shrink-0 text-center">{index + 1}.</span>
                        <Input 
                          value={stage.name} 
                          onChange={(e) => handleUpdateStage(stage.id, 'name', e.target.value)}
                          onDragStart={(e) => e.stopPropagation()}
                          className="h-11 text-base font-semibold w-full sm:max-w-[350px] bg-background text-foreground" 
                        />
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {collapsedStages[stage.id] && (
                          <span className="text-xs text-muted-foreground mr-2">{stage.cadence.length} touches</span>
                        )}
                        <Button variant="ghost" className="text-destructive hover:bg-destructive/10 gap-2 shrink-0" onClick={() => handleRemoveStage(stage.id)}><Trash2 className="w-4 h-4"/> Remover</Button>
                      </div>
                    </div>
                    
                    {!collapsedStages[stage.id] && (
                    <div className="sm:pl-16 space-y-6">`;

content = content.replace(stageCardOld, stageCardNew);

// We need to close the conditional div properly.
// The inner content ends right before the closing </div> of the card.
// Let's find the end of that section:
const endCardOld = `                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>`;

const endCardNew = `                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    )}
                  </div>
                ))}
              </div>`;

content = content.replace(endCardOld, endCardNew);

fs.writeFileSync('client/src/pages/CRMView.tsx', content);
