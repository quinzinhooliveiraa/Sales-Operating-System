const fs = require('fs');

let layout = fs.readFileSync('client/src/components/layout/Layout.tsx', 'utf8');

if (!layout.includes("const lang = settings?.language || 'pt-BR';")) {
  layout = layout.replace(
      "const t = getTranslations(settings?.language || 'pt-BR');",
      "const lang = settings?.language || 'pt-BR';\n  const t = getTranslations(lang);"
  );
  fs.writeFileSync('client/src/components/layout/Layout.tsx', layout);
}

let dashboard = fs.readFileSync('client/src/pages/Dashboard.tsx', 'utf8');
if (!dashboard.includes('getTranslations')) {
    const dashTrans = `const getTranslations = (lang: string) => {
  switch(lang) {
    case 'en-US': return { greeting: "Good morning", pipeline: "Pipeline Overview", overdue: "overdue follow-ups", meetings: "Upcoming Meetings", newLeads: "New Leads", tasks: "Pending Tasks" };
    case 'es-ES': return { greeting: "Buenos días", pipeline: "Resumen del Pipeline", overdue: "seguimientos atrasados", meetings: "Próximas Reuniones", newLeads: "Nuevos Leads", tasks: "Tareas Pendientes" };
    default: return { greeting: "Bom dia", pipeline: "Visão Geral do Pipeline", overdue: "follow-ups atrasados", meetings: "Próximas Reuniões", newLeads: "Novos Leads", tasks: "Tarefas Pendentes" };
  }
};`;

    dashboard = dashboard.replace(
        "export default function Dashboard() {",
        `${dashTrans}\n\nexport default function Dashboard() {`
    );
    
    dashboard = dashboard.replace(
        "const { leads, tasks, events } = useAppContext();",
        "const { leads, tasks, events, settings } = useAppContext();\n  const t = getTranslations(settings?.language || 'pt-BR');"
    );
    
    dashboard = dashboard.replace(
        `<h1 className="text-3xl font-bold tracking-tight">Bom dia, Quinzinho! 👋</h1>`,
        `<h1 className="text-3xl font-bold tracking-tight">{t.greeting}, Quinzinho! 👋</h1>`
    );
    
    fs.writeFileSync('client/src/pages/Dashboard.tsx', dashboard);
}

