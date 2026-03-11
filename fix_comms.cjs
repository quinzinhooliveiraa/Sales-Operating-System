const fs = require('fs');

let crm = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

// I will make sure handleAddLead is creating the real lead correctly
if (crm.includes('const leadToSave = { ...newLead, id: Math.floor(Math.random() * 10000), score };')) {
    crm = crm.replace(
        'const leadToSave = { ...newLead, id: Math.floor(Math.random() * 10000), score };',
        'const leadToSave = { ...newLead, id: Math.floor(Math.random() * 10000), score } as Lead;'
    );
    fs.writeFileSync('client/src/pages/CRMView.tsx', crm);
    console.log('CRM addLead types verified');
}

// In CRMView, make sure it's using the formatCurrency properly in ALL places.
if (crm.includes('{lead.value}')) {
    crm = crm.replace(
        /<div className="text-xs font-semibold">{lead\.value}<\/div>/g,
        '<div className="text-xs font-semibold">{typeof lead.value === "string" && lead.value.includes("R$") ? formatCurrency(lead.value) : formatCurrency(lead.value)}</div>'
    );
    fs.writeFileSync('client/src/pages/CRMView.tsx', crm);
}

// Ensure the menu items translations are updated when language changes.
// I'll add a little helper dictionary to Layout.tsx
let layout = fs.readFileSync('client/src/components/layout/Layout.tsx', 'utf8');

if (!layout.includes('const getTranslations = (lang: string) => {')) {
    const navItemsOld = `const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agendamento", label: "Agendamentos", icon: Clock },
  { href: "/crm", label: "Pipeline CRM", icon: Users },
  { href: "/tarefas", label: "Tarefas", icon: CheckSquare },
  { href: "/calendario", label: "Calendário", icon: CalendarDays },
];`;

    const navItemsNew = `const getTranslations = (lang: string) => {
  switch(lang) {
    case 'en-US': return { dashboard: "Dashboard", scheduling: "Scheduling", crm: "CRM Pipeline", tasks: "Tasks", calendar: "Calendar", settings: "Settings" };
    case 'es-ES': return { dashboard: "Panel", scheduling: "Citas", crm: "Pipeline CRM", tasks: "Tareas", calendar: "Calendario", settings: "Ajustes" };
    default: return { dashboard: "Dashboard", scheduling: "Agendamentos", crm: "Pipeline CRM", tasks: "Tarefas", calendar: "Calendário", settings: "Configurações" };
  }
};`;

    layout = layout.replace(navItemsOld, navItemsNew);

    const sidebarOld = `export function Sidebar({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
  const [location] = useLocation();`;

    const sidebarNew = `export function Sidebar({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
  const [location] = useLocation();
  const { settings } = useAppContext();
  const t = getTranslations(settings?.language || 'pt-BR');
  
  const navItems = [
    { href: "/", label: t.dashboard, icon: LayoutDashboard },
    { href: "/agendamento", label: t.scheduling, icon: Clock },
    { href: "/crm", label: t.crm, icon: Users },
    { href: "/tarefas", label: t.tasks, icon: CheckSquare },
    { href: "/calendario", label: t.calendar, icon: CalendarDays },
  ];`;

    layout = layout.replace(sidebarOld, sidebarNew);
    
    // Also update settings label
    layout = layout.replace(
        `<span>Configurações</span>`,
        `<span>{t.settings}</span>`
    );

    fs.writeFileSync('client/src/components/layout/Layout.tsx', layout);
    console.log('Sidebar internationalization applied');
}
