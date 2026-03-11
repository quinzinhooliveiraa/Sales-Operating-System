const fs = require('fs');
let code = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

// The user wants the lead score to be dynamic based on info in the CRM (presumably fields filled out).
// A simple algorithm: base 10 + 20 for phone + 20 for email + 10 for company + 10 for notes + 30 for meeting/tags

// Currently in handleAddLead, score is hardcoded to 50.
// We can add a function calculateScore(lead)
const calculateScoreOld = `  const handleAddLead = () => {`;

const calculateScoreNew = `  const calculateScore = (lead: Partial<Lead>) => {
    let score = 10; // Base score
    if (lead.email && lead.email.includes('@')) score += 20;
    if (lead.phone && lead.phone.length > 5) score += 20;
    if (lead.company && lead.company.length > 2) score += 20;
    if (lead.notes && lead.notes.length > 10) score += 15;
    if (lead.stage && lead.stage !== stages[0]?.id) score += 15; // advanced stage bonus
    return Math.min(score, 99); // Max around 99 for new leads
  };

  const handleAddLead = () => {`;

code = code.replace(calculateScoreOld, calculateScoreNew);

// Replace hardcoded score: 50 in handleAddLead with calculated score
const addLeadScoreOld = `      score: 50,`;
const addLeadScoreNew = `      score: calculateScore(newLead),`;

code = code.replace(addLeadScoreOld, addLeadScoreNew);

fs.writeFileSync('client/src/pages/CRMView.tsx', code);
