const fs = require('fs');

let content = fs.readFileSync('client/src/pages/CalendarView.tsx', 'utf8');

// Add Sheet and Dialog imports
const importsToAdd = `
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
`;

content = content.replace('import { ptBR } from "date-fns/locale";', `import { ptBR } from "date-fns/locale";${importsToAdd}`);

// Add state for selected event and modal open states
const stateToAdd = `
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEventSheetOpen, setIsEventSheetOpen] = useState(false);
  
  const [isCreateMeetingOpen, setIsCreateMeetingOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isLinkLeadOpen, setIsLinkLeadOpen] = useState(false);

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setIsEventSheetOpen(true);
  };
`;

content = content.replace('const [view, setView] = useState<\'month\'|\'week\'|\'day\'>(\'week\');', `const [view, setView] = useState<'month'|'week'|'day'>('week');${stateToAdd}`);

// Add DropdownMenu item click handlers
content = content.replace(
  '<DropdownMenuItem className="cursor-pointer">Agendar Reunião</DropdownMenuItem>',
  '<DropdownMenuItem className="cursor-pointer" onClick={() => setIsCreateMeetingOpen(true)}>Agendar Reunião</DropdownMenuItem>'
);
content = content.replace(
  '<DropdownMenuItem className="cursor-pointer">Nova Tarefa</DropdownMenuItem>',
  '<DropdownMenuItem className="cursor-pointer" onClick={() => setIsCreateTaskOpen(true)}>Nova Tarefa</DropdownMenuItem>'
);
content = content.replace(
  '<DropdownMenuItem className="cursor-pointer">Vincular a Lead CRM</DropdownMenuItem>',
  '<DropdownMenuItem className="cursor-pointer" onClick={() => setIsLinkLeadOpen(true)}>Vincular a Lead CRM</DropdownMenuItem>'
);

// Add onClick to events
content = content.replace(
  'className={`absolute left-0 right-3 rounded-md px-2 py-1 mx-1 ${style} text-white shadow-sm cursor-pointer hover:shadow-md transition-all text-xs overflow-hidden border border-white/20`}',
  'className={`absolute left-0 right-3 rounded-md px-2 py-1 mx-1 ${style} text-white shadow-sm cursor-pointer hover:shadow-md transition-all text-xs overflow-hidden border border-white/20`}\n                              onClick={() => handleEventClick(event)}'
);

// Add Modals and Sheet to the end of the return statement
const modalsToAdd = `
      {/* Event Details Sheet */}
      <Sheet open={isEventSheetOpen} onOpenChange={setIsEventSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selectedEvent?.title}</SheetTitle>
            <SheetDescription>
              {selectedEvent?.type === 'task' ? 'Tarefa' : selectedEvent?.type === 'crm' ? 'Ação de CRM' : 'Reunião'}
            </SheetDescription>
          </SheetHeader>
          <div className="py-6 space-y-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">Horário</span>
              <span>{selectedEvent?.hour}:00 - {selectedEvent?.hour + selectedEvent?.duration}:00</span>
            </div>
            {selectedEvent?.description && (
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted-foreground">Descrição</span>
                <p className="text-sm">{selectedEvent.description}</p>
              </div>
            )}
            {selectedEvent?.leadName && (
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted-foreground">Lead Vinculado</span>
                <p className="text-sm">{selectedEvent.leadName}</p>
              </div>
            )}
            <div className="pt-4 flex gap-2">
              <Button className="w-full">Editar</Button>
              <Button variant="outline" className="w-full">Excluir</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Create Meeting Dialog */}
      <Dialog open={isCreateMeetingOpen} onOpenChange={setIsCreateMeetingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar Nova Reunião</DialogTitle>
            <DialogDescription>Preencha os detalhes para agendar uma reunião no calendário.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título da Reunião</label>
              <Input placeholder="Ex: Call de Alinhamento" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Data</label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Horário</label>
                <Input type="time" />
              </div>
            </div>
            <Button className="w-full" onClick={() => setIsCreateMeetingOpen(false)}>Salvar Reunião</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Task Dialog */}
      <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Tarefa</DialogTitle>
            <DialogDescription>Adicione uma tarefa à sua matriz de prioridades.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição da Tarefa</label>
              <Input placeholder="O que precisa ser feito?" />
            </div>
            <Button className="w-full" onClick={() => setIsCreateTaskOpen(false)}>Criar Tarefa</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Link Lead Dialog */}
      <Dialog open={isLinkLeadOpen} onOpenChange={setIsLinkLeadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vincular a Lead CRM</DialogTitle>
            <DialogDescription>Associe um evento de calendário a uma negociação existente.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar Lead</label>
              <Input placeholder="Digite o nome da empresa ou contato..." />
            </div>
            <Button className="w-full" onClick={() => setIsLinkLeadOpen(false)}>Vincular Lead</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
`;

content = content.replace(/    <\/div>\n  \);\n}\s*$/, modalsToAdd + '\n}\n');

fs.writeFileSync('client/src/pages/CalendarView.tsx', content);
console.log('Calendar enhanced');
