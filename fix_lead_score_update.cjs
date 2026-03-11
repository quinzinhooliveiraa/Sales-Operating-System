const fs = require('fs');
let code = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

// The user also probably means that when editing/updating the lead in the future it should update the score.
// Let's add a button in the selected lead view "Atualizar Score" or let's make it recalculate on load.
// Actually, dynamically computing the score in the render for selectedLead might be cool, but since score is part of Lead, let's keep it static but generated correctly on creation for now, and if they add notes, update the score.

const updateLeadNotesOld = `<textarea 
                  id="selected-lead-notes"
                  className="w-full min-h-[100px] p-3 text-sm rounded-md border bg-background text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Adicione notas sobre o lead..."
                  defaultValue={selectedLead.notes}
                />
                <Button size="sm" className="w-full">Salvar Nota</Button>`;

const updateLeadNotesNew = `<textarea 
                  id="selected-lead-notes"
                  className="w-full min-h-[100px] p-3 text-sm rounded-md border bg-background text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Adicione notas sobre o lead..."
                  defaultValue={selectedLead.notes}
                />
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    const el = document.getElementById('selected-lead-notes') as HTMLTextAreaElement;
                    if (el && selectedLead) {
                      const updatedLead = { ...selectedLead, notes: el.value };
                      updatedLead.score = calculateScore(updatedLead);
                      
                      setLeads(leads.map(l => l.id === selectedLead.id ? updatedLead : l));
                      setSelectedLead(updatedLead);
                    }
                  }}
                >
                  Salvar Nota e Atualizar Score
                </Button>`;

code = code.replace(updateLeadNotesOld, updateLeadNotesNew);
fs.writeFileSync('client/src/pages/CRMView.tsx', code);
