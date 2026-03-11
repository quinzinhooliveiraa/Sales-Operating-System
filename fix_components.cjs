const fs = require('fs');

// The issue might be that React isn't re-rendering properly or some imports/context are breaking. Let's make absolutely sure Dashboard, Tasks, and Calendar are properly using the context.

// DASHBOARD
let dash = fs.readFileSync('client/src/pages/Dashboard.tsx', 'utf8');
if (!dash.includes('useAppContext')) {
  console.log("Dashboard doesn't have useAppContext!");
} else {
    // Check if the old hardcoded INITIAL_LEADS is still interfering
    dash = dash.replace(/const INITIAL_LEADS/g, '// const INITIAL_LEADS');
    fs.writeFileSync('client/src/pages/Dashboard.tsx', dash);
}

// CRM
let crm = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');
if (!crm.includes('updateLeadStage(draggedLeadId, stageId)')) {
    console.log("CRM doesn't have drag and drop updated!");
} else {
    // Need to ensure when we add a lead via "Criar Lead", it uses addLead
    if (crm.includes('setLeads([...leads, leadToSave]);')) {
        crm = crm.replace('setLeads([...leads, leadToSave]);', 'addLead(leadToSave);');
        fs.writeFileSync('client/src/pages/CRMView.tsx', crm);
        console.log("Fixed CRM addLead");
    }
}

// TASKS
let tasks = fs.readFileSync('client/src/pages/TasksView.tsx', 'utf8');
// Fix filtering: The matrix filtering was using static variables instead of the state
if (tasks.includes('const TASKS = [')) {
    console.log("Tasks is still using static array!");
} else {
    console.log("Tasks has dynamic array.");
}

