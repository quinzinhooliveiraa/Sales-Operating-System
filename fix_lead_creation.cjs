const fs = require('fs');
let content = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

// The user says newly created leads are not going to any stage.
// Let's check the handleAddLead function in CRMView.tsx

// It might be because the stage id used isn't matching properly or there's a bug in the initial state of the dropdown.
// Let's look at the implementation:

const addLeadFunc = `  const handleAddLead = () => {
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
  };`;

// That looks generally okay. But wait, what if the default `newLead.stage` in the dropdown is out of sync or undefined?
// Also, when opening the modal, maybe `newLead.stage` should be forcibly set to `stages[0].id` to be safe if it's currently empty.
// And `value={newLead.stage || stages[0]?.id}` in the select to ensure it selects the first one visually.

// Let's modify the opening of the Add Lead modal to reset the state cleanly.
const setIsAddLeadOpenOld = `onClick={() => setIsAddLeadOpen(true)}`;
const setIsAddLeadOpenNew = `onClick={() => {
            setNewLead({ name: "", company: "", email: "", phone: "", stage: stages[0]?.id || "", owner: "Quinzinho", notes: "" });
            setIsAddLeadOpen(true);
          }}`;
content = content.replace(setIsAddLeadOpenOld, setIsAddLeadOpenNew);

// Let's also check the select for stage in the Add Lead form
const stageSelectOld = `<select className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-primary" value={newLead.stage} onChange={e => setNewLead({...newLead, stage: e.target.value})}>
                {stages.map(s => <option key={s.id} value={s.id} className="bg-background text-foreground">{s.name}</option>)}
              </select>`;
const stageSelectNew = `<select className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-primary" value={newLead.stage || stages[0]?.id || ""} onChange={e => setNewLead({...newLead, stage: e.target.value})}>
                {stages.map(s => <option key={s.id} value={s.id} className="bg-background text-foreground">{s.name}</option>)}
              </select>`;
content = content.replace(stageSelectOld, stageSelectNew);

// Make sure the stage is actually recorded
// In `handleAddLead` let's ensure it grabs the right one
const addLeadNew = `  const handleAddLead = () => {
    if (!newLead.name) return;
    
    const finalStage = newLead.stage || stages[0]?.id || "";
    
    const lead: Lead = {
      id: leads.length > 0 ? Math.max(...leads.map(l => l.id)) + 1 : 1,
      name: newLead.name || "",
      company: newLead.company || "",
      email: newLead.email || "",
      phone: newLead.phone || "",
      stage: finalStage,
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
  };`;
content = content.replace(addLeadFunc, addLeadNew);

fs.writeFileSync('client/src/pages/CRMView.tsx', content);
