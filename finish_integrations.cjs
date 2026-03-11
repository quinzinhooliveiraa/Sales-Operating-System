const fs = require('fs');

// Check CalendarView forms
let calendar = fs.readFileSync('client/src/pages/CalendarView.tsx', 'utf8');

// The user is asking if the cadences are the most important part.
// I already implemented cadence auto-generation in AppContext.tsx:
// 1. When a lead is created (`addLead`), it checks the stage's cadence and generates tasks (and events for calls).
// 2. When a lead's stage is updated (`updateLeadStage`), it checks the new stage's cadence and generates tasks.

// To make this fully functional, I'll update CalendarView to use the real addEvent
calendar = calendar.replace(
    `const { events, leads } = useAppContext();`,
    `const { events, leads, addEvent, addTask } = useAppContext();`
);

// If there's an add event handler, I should wire it, but let's check if it exists
if (!calendar.includes('handleCreateEvent')) {
    calendar = calendar.replace(
        `const [isCreateMeetingOpen, setIsCreateMeetingOpen] = useState(false);`,
        `const [isCreateMeetingOpen, setIsCreateMeetingOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEventHour, setNewEventHour] = useState('10');
  
  const handleCreateMeeting = (e: any) => {
    e.preventDefault();
    if (newEventTitle) {
      addEvent({
        title: newEventTitle,
        date: newEventDate,
        hour: parseInt(newEventHour),
        duration: 1,
        type: 'meeting',
        style: "border-primary bg-primary/10 text-foreground"
      });
      setIsCreateMeetingOpen(false);
      setNewEventTitle('');
    }
  };`
    );
    // Wire the "Salvar" button if it exists
    calendar = calendar.replace(
        `<Button className="w-full">Salvar Reunião</Button>`,
        `<Button onClick={handleCreateMeeting} className="w-full">Salvar Reunião</Button>`
    );
    
    fs.writeFileSync('client/src/pages/CalendarView.tsx', calendar);
    console.log('CalendarView form wired');
}

// In CRMView.tsx, let's make sure the forms are completely wired
let crm = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');
if (!crm.includes('Cadência Automática')) {
   // Just ensuring cadences are visible in the CRM UI if needed. We don't strictly need to add it, but it helps
}

