const fs = require('fs');
let code = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

// 1. Add "BANT" / Sales Qualification to the `newLead` state.
// We'll use formResponses as a way to store this or add specific fields in the AppContext.
// The `Lead` type currently has `formResponses: Record<string, string>`. We can use this.
// `BANT` = Budget (Caixa), Authority (Tomador de Decisão), Need (Necessidade), Timeline (Urgência)

// Update newLead state
const newLeadStateOld = `const [newLead, setNewLead] = useState<Partial<Lead>>({
    name: "", company: "", email: "", phone: "", stage: stages[0]?.id || "", owner: "Quinzinho", notes: ""
  });`;

const newLeadStateNew = `const [newLead, setNewLead] = useState<Partial<Lead>>({
    name: "", company: "", email: "", phone: "", stage: stages[0]?.id || "", owner: "Quinzinho", notes: "",
    formResponses: {
      "Caixa (Budget)": "",
      "Decisor (Authority)": "",
      "Necessidade (Need)": "",
      "Urgência (Timeline)": ""
    }
  });`;
code = code.replace(newLeadStateOld, newLeadStateNew);

// Update score calculation logic
const calcScoreOld = `const calculateScore = (lead: Partial<Lead>) => {
    let score = 10; // Base score
    if (lead.email && lead.email.includes('@')) score += 20;
    if (lead.phone && lead.phone.length > 5) score += 20;
    if (lead.company && lead.company.length > 2) score += 20;
    if (lead.notes && lead.notes.length > 10) score += 15;
    if (lead.stage && lead.stage !== stages[0]?.id) score += 15; // advanced stage bonus
    return Math.min(score, 99); // Max around 99 for new leads
  };`;

const calcScoreNew = `const calculateScore = (lead: Partial<Lead>) => {
    let score = 10; // Base score
    // BANT specific scoring
    if (lead.formResponses) {
      if (lead.formResponses["Caixa (Budget)"] === "Alto" || lead.formResponses["Caixa (Budget)"] === "Suficiente") score += 25;
      else if (lead.formResponses["Caixa (Budget)"] === "Baixo") score += 5;
      
      if (lead.formResponses["Decisor (Authority)"] === "Sim") score += 25;
      else if (lead.formResponses["Decisor (Authority)"] === "Não, mas tem acesso") score += 10;
      
      if (lead.formResponses["Necessidade (Need)"] === "Alta") score += 25;
      else if (lead.formResponses["Necessidade (Need)"] === "Média") score += 15;
      
      if (lead.formResponses["Urgência (Timeline)"] === "Imediata") score += 15;
      else if (lead.formResponses["Urgência (Timeline)"] === "1-3 Meses") score += 10;
    }
    
    // Fallback basic info scoring if BANT is missing but other data is filled
    if (lead.email && lead.email.includes('@')) score += 5;
    if (lead.phone && lead.phone.length > 5) score += 5;
    if (lead.notes && lead.notes.length > 10) score += 5;
    
    return Math.min(score, 99); // Max 99
  };`;
code = code.replace(calcScoreOld, calcScoreNew);

// Create the BANT fields in the Add Lead form
const addLeadFormAnchor = `            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Responsável</label>`;

const bantFields = `            <div className="pt-4 border-t space-y-4">
              <h4 className="font-semibold text-sm flex items-center gap-2"><Target className="w-4 h-4 text-primary"/> Qualificação (BANT)</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Caixa (Budget)</label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    value={newLead.formResponses?.["Caixa (Budget)"] || ""}
                    onChange={e => setNewLead({...newLead, formResponses: {...(newLead.formResponses || {}), "Caixa (Budget)": e.target.value}})}
                  >
                    <option value="">Não avaliado</option>
                    <option value="Alto">Alto (Folgado)</option>
                    <option value="Suficiente">Suficiente</option>
                    <option value="Baixo">Baixo (Apertado)</option>
                    <option value="Sem budget">Sem budget</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Decisor (Authority)</label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    value={newLead.formResponses?.["Decisor (Authority)"] || ""}
                    onChange={e => setNewLead({...newLead, formResponses: {...(newLead.formResponses || {}), "Decisor (Authority)": e.target.value}})}
                  >
                    <option value="">Não avaliado</option>
                    <option value="Sim">Sim (Final)</option>
                    <option value="Não, mas tem acesso">Não, mas tem acesso</option>
                    <option value="Não">Não (Influenciador)</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Necessidade (Need)</label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    value={newLead.formResponses?.["Necessidade (Need)"] || ""}
                    onChange={e => setNewLead({...newLead, formResponses: {...(newLead.formResponses || {}), "Necessidade (Need)": e.target.value}})}
                  >
                    <option value="">Não avaliado</option>
                    <option value="Alta">Alta (Dor latente)</option>
                    <option value="Média">Média (Buscando)</option>
                    <option value="Baixa">Baixa (Apenas curioso)</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Urgência (Timeline)</label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    value={newLead.formResponses?.["Urgência (Timeline)"] || ""}
                    onChange={e => setNewLead({...newLead, formResponses: {...(newLead.formResponses || {}), "Urgência (Timeline)": e.target.value}})}
                  >
                    <option value="">Não avaliado</option>
                    <option value="Imediata">Imediata</option>
                    <option value="1-3 Meses">1-3 Meses</option>
                    <option value="3-6 Meses">3-6 Meses</option>
                    <option value="Longo Prazo">Longo Prazo</option>
                  </select>
                </div>
              </div>
            </div>
`;
code = code.replace(addLeadFormAnchor, bantFields + "\n" + addLeadFormAnchor);

// Also need to add updating BANT in the Lead Detail Panel
// Find the "Respostas do Formulário" or "Anotações" block and insert an editable BANT section.
const detailFormOld = `              {Object.keys(selectedLead.formResponses).length > 0 && (
                <div className="space-y-3 border-t pt-4">
                  <h3 className="font-semibold flex items-center gap-2 text-sm"><MessageSquare className="w-4 h-4"/> Respostas do Formulário</h3>
                  <div className="bg-secondary/30 rounded-lg p-3 space-y-3 border">
                    {Object.entries(selectedLead.formResponses).map(([q, a]) => (
                      <div key={q}>
                        <p className="text-xs text-muted-foreground">{q}</p>
                        <p className="text-sm font-medium mt-0.5">{a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}`;

const detailFormNew = `              <div className="space-y-3 border-t pt-4">
                <h3 className="font-semibold flex items-center gap-2 text-sm"><Target className="w-4 h-4"/> Qualificação Vendas (BANT)</h3>
                <div className="bg-secondary/10 rounded-lg p-3 grid grid-cols-2 gap-3 border">
                  <div>
                    <label className="text-[10px] text-muted-foreground font-semibold uppercase">Caixa (Budget)</label>
                    <select 
                      className="mt-1 h-8 w-full rounded border border-border bg-background px-2 text-xs"
                      value={selectedLead.formResponses?.["Caixa (Budget)"] || ""}
                      onChange={(e) => {
                        const updated = {
                          ...selectedLead, 
                          formResponses: { ...selectedLead.formResponses, "Caixa (Budget)": e.target.value }
                        };
                        updated.score = calculateScore(updated);
                        setSelectedLead(updated);
                        setLeads(leads.map(l => l.id === selectedLead.id ? updated : l));
                      }}
                    >
                      <option value="">Não avaliado</option>
                      <option value="Alto">Alto</option>
                      <option value="Suficiente">Suficiente</option>
                      <option value="Baixo">Baixo</option>
                      <option value="Sem budget">Sem budget</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground font-semibold uppercase">Decisor (Authority)</label>
                    <select 
                      className="mt-1 h-8 w-full rounded border border-border bg-background px-2 text-xs"
                      value={selectedLead.formResponses?.["Decisor (Authority)"] || ""}
                      onChange={(e) => {
                        const updated = {
                          ...selectedLead, 
                          formResponses: { ...selectedLead.formResponses, "Decisor (Authority)": e.target.value }
                        };
                        updated.score = calculateScore(updated);
                        setSelectedLead(updated);
                        setLeads(leads.map(l => l.id === selectedLead.id ? updated : l));
                      }}
                    >
                      <option value="">Não avaliado</option>
                      <option value="Sim">Sim</option>
                      <option value="Não, mas tem acesso">Tem acesso</option>
                      <option value="Não">Não</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground font-semibold uppercase">Necessidade (Need)</label>
                    <select 
                      className="mt-1 h-8 w-full rounded border border-border bg-background px-2 text-xs"
                      value={selectedLead.formResponses?.["Necessidade (Need)"] || ""}
                      onChange={(e) => {
                        const updated = {
                          ...selectedLead, 
                          formResponses: { ...selectedLead.formResponses, "Necessidade (Need)": e.target.value }
                        };
                        updated.score = calculateScore(updated);
                        setSelectedLead(updated);
                        setLeads(leads.map(l => l.id === selectedLead.id ? updated : l));
                      }}
                    >
                      <option value="">Não avaliado</option>
                      <option value="Alta">Alta</option>
                      <option value="Média">Média</option>
                      <option value="Baixa">Baixa</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground font-semibold uppercase">Urgência (Timeline)</label>
                    <select 
                      className="mt-1 h-8 w-full rounded border border-border bg-background px-2 text-xs"
                      value={selectedLead.formResponses?.["Urgência (Timeline)"] || ""}
                      onChange={(e) => {
                        const updated = {
                          ...selectedLead, 
                          formResponses: { ...selectedLead.formResponses, "Urgência (Timeline)": e.target.value }
                        };
                        updated.score = calculateScore(updated);
                        setSelectedLead(updated);
                        setLeads(leads.map(l => l.id === selectedLead.id ? updated : l));
                      }}
                    >
                      <option value="">Não avaliado</option>
                      <option value="Imediata">Imediata</option>
                      <option value="1-3 Meses">1-3 Meses</option>
                      <option value="3-6 Meses">3-6 Meses</option>
                      <option value="Longo Prazo">Longo Prazo</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {Object.keys(selectedLead.formResponses || {}).filter(k => !k.includes("Budget") && !k.includes("Authority") && !k.includes("Need") && !k.includes("Timeline")).length > 0 && (
                <div className="space-y-3 border-t pt-4">
                  <h3 className="font-semibold flex items-center gap-2 text-sm"><MessageSquare className="w-4 h-4"/> Outras Respostas</h3>
                  <div className="bg-secondary/30 rounded-lg p-3 space-y-3 border">
                    {Object.entries(selectedLead.formResponses).filter(([k]) => !k.includes("Budget") && !k.includes("Authority") && !k.includes("Need") && !k.includes("Timeline")).map(([q, a]) => (
                      <div key={q}>
                        <p className="text-xs text-muted-foreground">{q}</p>
                        <p className="text-sm font-medium mt-0.5">{a as string}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}`;

code = code.replace(detailFormOld, detailFormNew);

// Make sure `formResponses` gets set on handleAddLead using the BANT states
const addLeadCreateOld = `      formResponses: {},`;
const addLeadCreateNew = `      formResponses: newLead.formResponses || {},`;
code = code.replace(addLeadCreateOld, addLeadCreateNew);

// Also need to reset BANT when opening "Add Lead" modal
const resetLeadOld = `setNewLead({ name: "", company: "", email: "", phone: "", stage: stages[0]?.id || "", owner: "Quinzinho", notes: "" });`;
const resetLeadNew = `setNewLead({ 
              name: "", company: "", email: "", phone: "", stage: stages[0]?.id || "", owner: "Quinzinho", notes: "",
              formResponses: { "Caixa (Budget)": "", "Decisor (Authority)": "", "Necessidade (Need)": "", "Urgência (Timeline)": "" }
            });`;
// This occurs in two places:
code = code.replaceAll(resetLeadOld, resetLeadNew);

fs.writeFileSync('client/src/pages/CRMView.tsx', code);
