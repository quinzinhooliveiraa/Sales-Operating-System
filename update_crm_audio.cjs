const fs = require('fs');
let content = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

// 1. Add Mic icon
content = content.replace(
  /import \{ Plus, MoreHorizontal, Clock, DollarSign, Calendar, Target, Activity, MessageSquare, Phone, Mail, Settings2, Trash2, User, X \} from "lucide-react";/,
  `import { Plus, MoreHorizontal, Clock, DollarSign, Calendar, Target, Activity, MessageSquare, Phone, Mail, Settings2, Trash2, User, X, Mic, MicOff, Loader2 } from "lucide-react";`
);

// 2. Add state for recording
const stateHookPos = `  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);`;
const stateHookNew = `  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  
  const [isRecordingNewLead, setIsRecordingNewLead] = useState(false);
  const [isRecordingSelectedLead, setIsRecordingSelectedLead] = useState(false);

  const startVoiceRecognition = (onResult: (text: string) => void, onEnd: () => void) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Seu navegador não suporta gravação de voz.");
      onEnd();
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      onResult(text);
    };
    recognition.onerror = () => onEnd();
    recognition.onend = () => onEnd();
    recognition.start();
  };`;

content = content.replace(stateHookPos, stateHookNew);

// 3. Update the newLead notes textarea
const newLeadNotesOld = `<label className="text-sm font-medium text-foreground">Anotações Iniciais</label>
              <textarea 
                className="w-full min-h-[100px] p-3 text-sm rounded-md border bg-background text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Detalhes sobre a prospecção..."
                value={newLead.notes} onChange={e => setNewLead({...newLead, notes: e.target.value})}
              />`;

const newLeadNotesNew = `<div className="flex justify-between items-center">
                <label className="text-sm font-medium text-foreground">Anotações Iniciais</label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className={\`h-8 px-2 text-xs \${isRecordingNewLead ? 'text-destructive hover:text-destructive animate-pulse' : 'text-muted-foreground'}\`}
                  onClick={() => {
                    if (isRecordingNewLead) return;
                    setIsRecordingNewLead(true);
                    startVoiceRecognition(
                      (text) => {
                        setNewLead(prev => ({ ...prev, notes: prev.notes ? prev.notes + " " + text : text }));
                        setIsRecordingNewLead(false);
                      },
                      () => setIsRecordingNewLead(false)
                    );
                  }}
                >
                  {isRecordingNewLead ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin"/> Ouvindo...</> : <><Mic className="w-3.5 h-3.5 mr-1.5"/> Gravar Áudio</>}
                </Button>
              </div>
              <textarea 
                className="w-full min-h-[100px] p-3 text-sm rounded-md border bg-background text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Detalhes sobre a prospecção..."
                value={newLead.notes} onChange={e => setNewLead({...newLead, notes: e.target.value})}
              />`;

content = content.replace(newLeadNotesOld, newLeadNotesNew);

// 4. Update selectedLead notes textarea
const selectedLeadNotesOld = `<h3 className="font-semibold flex items-center gap-2 text-sm"><Activity className="w-4 h-4"/> Anotações</h3>
                <textarea 
                  className="w-full min-h-[100px] p-3 text-sm rounded-md border bg-background text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Adicione notas sobre o lead..."
                  defaultValue={selectedLead.notes}
                />`;

const selectedLeadNotesNew = `<div className="flex justify-between items-center">
                  <h3 className="font-semibold flex items-center gap-2 text-sm"><Activity className="w-4 h-4"/> Anotações</h3>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className={\`h-8 px-2 text-xs \${isRecordingSelectedLead ? 'text-destructive hover:text-destructive animate-pulse' : 'text-muted-foreground'}\`}
                    onClick={() => {
                      if (isRecordingSelectedLead) return;
                      setIsRecordingSelectedLead(true);
                      startVoiceRecognition(
                        (text) => {
                          const el = document.getElementById('selected-lead-notes') as HTMLTextAreaElement;
                          if (el) {
                            el.value = el.value ? el.value + " " + text : text;
                          }
                          setIsRecordingSelectedLead(false);
                        },
                        () => setIsRecordingSelectedLead(false)
                      );
                    }}
                  >
                    {isRecordingSelectedLead ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin"/> Ouvindo...</> : <><Mic className="w-3.5 h-3.5 mr-1.5"/> Gravar Áudio</>}
                  </Button>
                </div>
                <textarea 
                  id="selected-lead-notes"
                  className="w-full min-h-[100px] p-3 text-sm rounded-md border bg-background text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Adicione notas sobre o lead..."
                  defaultValue={selectedLead.notes}
                />`;

content = content.replace(selectedLeadNotesOld, selectedLeadNotesNew);

fs.writeFileSync('client/src/pages/CRMView.tsx', content);
console.log('Voice integration added');
