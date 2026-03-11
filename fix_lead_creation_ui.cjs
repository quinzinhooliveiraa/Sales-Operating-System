const fs = require('fs');
let content = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

// Also fix one small bug in lead drag and drop propagation
const modalButton = `<Button className="w-full h-10 text-base" onClick={handleAddLead}>`;
// The actual file has: <Button className="w-full h-10 text-base" onClick={handleAddLead}>

// The problem might be the form select not correctly having values.
const selectStageOld = `{stages.map(s => <option key={s.id} value={s.id} className="bg-background text-foreground">{s.name}</option>)}`;
const selectStageNew = `{stages.map(s => <option key={s.id} value={s.id} className="bg-background text-foreground">{s.name}</option>)}`;

// Another thing: when creating a lead, I used Math.max to generate the ID.
// `id: leads.length > 0 ? Math.max(...leads.map(l => l.id)) + 1 : 1,`
// If leads is empty, it uses 1. That's fine.

// Look for the "Criar Lead" button to verify what's happening.
const criarLeadOld = `<Button className="w-full h-10 text-base" onClick={handleAddLead}>
                Criar Lead
              </Button>`;
const criarLeadNew = `<Button 
                className="w-full h-10 text-base" 
                onClick={(e) => {
                  e.preventDefault();
                  handleAddLead();
                }}
              >
                Criar Lead
              </Button>`;
content = content.replace(criarLeadOld, criarLeadNew);

fs.writeFileSync('client/src/pages/CRMView.tsx', content);
