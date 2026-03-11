const fs = require('fs');

let dash = fs.readFileSync('client/src/pages/Dashboard.tsx', 'utf8');

// Replace static metrics with dynamic ones based on context
const getMetricsOld = `const getMetrics = () => {
    switch (timeFilter) {
      case 'day': return { leads: 4, meetings: 2, conversion: "18%", trend: "up" };
      case 'month': return { leads: 124, meetings: 45, conversion: "26%", trend: "up" };
      case 'week':
      default: return { leads: 24, meetings: 8, conversion: "22%", trend: "down" };
    }
  };

  const metrics = getMetrics();`;

const getMetricsNew = `const getMetrics = () => {
    const today = new Date().toISOString().split('T')[0];
    const newLeadsCount = leads.filter(l => l.stage === 'new').length;
    const allLeadsCount = leads.length;
    
    // Dynamic calculation
    return { 
      leads: timeFilter === 'day' ? newLeadsCount : allLeadsCount, 
      meetings: events.filter(e => e.type === 'meeting').length, 
      conversion: leads.filter(l => l.stage === 'won').length > 0 ? Math.round((leads.filter(l => l.stage === 'won').length / Math.max(allLeadsCount, 1)) * 100) + "%" : "0%", 
      trend: "up" 
    };
  };

  const metrics = getMetrics();`;

dash = dash.replace(getMetricsOld, getMetricsNew);

// Replace static pending tasks count
dash = dash.replace(
  `<div className="text-2xl font-semibold text-destructive">12</div>`,
  `<div className="text-2xl font-semibold text-destructive">{tasks.filter(t => t.status === 'pending').length}</div>`
);

// Replace static overdue touches
dash = dash.replace(
  `<p className="text-xs text-destructive/80 font-medium mt-1">{overdueTouches} follow-ups atrasados</p>`,
  `<p className="text-xs text-destructive/80 font-medium mt-1">{overdueTouches} follow-ups atrasados</p>`
); // Already there.

// Replace static "Tarefas de Hoje" list
const tasksListOld = `[
                { time: "Atrasado", title: "Ligar para Acme Corp (Touch 2)", type: "call", priority: "high", contact: "Sarah M." },
                { time: "10:00", title: "Enviar email de follow-up: TechFlow (Touch 3)", type: "email", priority: "medium", contact: "Mike T." },
                { time: "14:00", title: "Mensagem no LinkedIn para Global Ind.", type: "message", priority: "low", contact: "Alex W." },
                { time: "16:00", title: "Revisar proposta Inovação S.A.", type: "task", priority: "high", contact: "Lisa R." },
              ].map((item, i)`;

const tasksListNew = `tasks.filter(t => t.status === 'pending').slice(0, 5).map(t => {
                const lead = leads.find(l => l.id === t.linkedLeadId);
                return {
                  id: t.id,
                  time: t.dueDate < today ? "Atrasado" : "Hoje",
                  title: t.title,
                  type: t.title.toLowerCase().includes('ligar') ? 'call' : t.title.toLowerCase().includes('email') ? 'email' : 'task',
                  priority: t.priority === 'do-now' ? 'high' : 'medium',
                  contact: lead ? lead.name : "N/A"
                };
              }).map((item, i)`;
dash = dash.replace(tasksListOld, tasksListNew);

// Replace static "Próximas Reuniões" list
const meetingsListOld = `[
              { day: "Hoje", time: "11:30", title: "Call de Descoberta", contact: "Sarah M.", company: "Acme Corp" },
              { day: "Amanhã", time: "14:00", title: "Demo de Produto", contact: "Mike T.", company: "TechFlow" },
              { day: "Qui, 15", time: "10:00", title: "Revisão de Contrato", contact: "Lisa R.", company: "Inovação S.A." },
            ].map((item, i)`;

const meetingsListNew = `events.filter(e => e.type === 'meeting' && e.date >= today).sort((a,b) => a.date.localeCompare(b.date)).slice(0, 4).map(e => {
              const lead = leads.find(l => l.id === e.linkedLeadId);
              const eventDate = new Date(e.date);
              const isToday = e.date === today;
              
              return {
                day: isToday ? "Hoje" : eventDate.getDate().toString().padStart(2, '0') + '/' + (eventDate.getMonth() + 1).toString().padStart(2, '0'),
                time: \`\${e.hour}:00\`,
                title: e.title,
                contact: lead ? lead.name : "Lead",
                company: lead ? lead.company : "N/A"
              };
            }).map((item, i)`;
dash = dash.replace(meetingsListOld, meetingsListNew);

fs.writeFileSync('client/src/pages/Dashboard.tsx', dash);
console.log("Dashboard made fully dynamic");

