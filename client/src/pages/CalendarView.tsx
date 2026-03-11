import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Search, Plus, Menu, Settings, HelpCircle, User, Grid, Globe } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay, startOfMonth, endOfMonth, getDaysInMonth, addMonths, subMonths, addHours } from "date-fns";
import { ptBR } from "date-fns/locale";
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


export default function CalendarView() {
  const { events } = useAppContext();
  const [view, setView] = useState<'month'|'week'|'day'>('week');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEventSheetOpen, setIsEventSheetOpen] = useState(false);
  
  const [isCreateMeetingOpen, setIsCreateMeetingOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isLinkLeadOpen, setIsLinkLeadOpen] = useState(false);

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setIsEventSheetOpen(true);
  };

  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Timezones mock
  const [timezones, setTimezones] = useState([
    { label: 'GMT-3', offset: -3 },
    // { label: 'EST', offset: -5 }
  ]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const nextDate = () => {
    if (view === 'day') setCurrentDate(addDays(currentDate, 1));
    else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addMonths(currentDate, 1));
  };

  const prevDate = () => {
    if (view === 'day') setCurrentDate(addDays(currentDate, -1));
    else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subMonths(currentDate, 1));
  };

  const goToday = () => setCurrentDate(new Date());

  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Generate days based on view
  let daysToRender = [];
  if (view === 'day') {
    daysToRender = [currentDate];
  } else if (view === 'week') {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 }); // Sunday
    daysToRender = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  } else {
    // Month view handled differently
  }

  const formatHeader = () => {
    if (view === 'day') return format(currentDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
    if (view === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = addDays(start, 6);
      if (start.getMonth() === end.getMonth()) {
        return format(start, "MMMM yyyy", { locale: ptBR });
      }
      return `${format(start, "MMM", { locale: ptBR })} - ${format(end, "MMM yyyy", { locale: ptBR })}`;
    }
    return format(currentDate, "MMMM yyyy", { locale: ptBR });
  };

  const currentHourPosition = (currentTime.getHours() + currentTime.getMinutes() / 60) * 60;

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-background text-foreground font-sans">
      {/* Top Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-foreground hover:bg-secondary/50 rounded-full">
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white font-bold text-lg">
              {format(new Date(), "d")}
            </div>
            <span className="text-xl font-medium hidden sm:inline-block text-foreground">Agenda</span>
          </div>
          
          <div className="flex items-center gap-4 ml-6">
            <Button variant="outline" onClick={goToday} className="h-9 px-4 hidden sm:flex border-border/50 text-foreground font-medium hover:bg-secondary/50 rounded-md bg-transparent">Hoje</Button>
            <div className="flex items-center gap-1">
              <Button variant="ghost" onClick={prevDate} size="icon" className="h-9 w-9 text-foreground hover:bg-secondary/50 rounded-full"><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="ghost" onClick={nextDate} size="icon" className="h-9 w-9 text-foreground hover:bg-secondary/50 rounded-full"><ChevronRight className="w-4 h-4" /></Button>
            </div>
            <h2 className="text-[22px] font-normal text-foreground min-w-[140px] ml-2 capitalize">{formatHeader()}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1 mr-2">
            <Button variant="ghost" size="icon" className="h-10 w-10 text-foreground hover:bg-secondary/50 rounded-full"><Search className="w-5 h-5" /></Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-foreground hover:bg-secondary/50 rounded-full"><HelpCircle className="w-5 h-5" /></Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-foreground hover:bg-secondary/50 rounded-full"><Settings className="w-5 h-5" /></Button>
          </div>
          
          <div className="flex items-center bg-transparent rounded-md border border-border/50 p-0.5 mr-2 hover:bg-secondary/50 transition-colors">
            <select 
              className="h-8 bg-transparent border-none text-sm font-medium text-foreground focus:ring-0 cursor-pointer outline-none px-2 pr-6 capitalize"
              value={view}
              onChange={(e) => setView(e.target.value as any)}
            >
              <option value="day" className="bg-background text-foreground">Dia</option>
              <option value="week" className="bg-background text-foreground">Semana</option>
              <option value="month" className="bg-background text-foreground">Mês</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-10 w-10 hidden sm:flex text-foreground hover:bg-secondary/50 rounded-full"><Grid className="w-5 h-5" /></Button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-medium cursor-pointer">
              Q
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar */}
        <div className="w-[256px] flex flex-col hidden lg:flex shrink-0 bg-background border-r border-border/50">
          <div className="p-3 pl-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="h-[48px] rounded-full px-4 pr-6 flex items-center gap-3 bg-background text-foreground hover:bg-secondary/50 hover:shadow-md transition-all border border-border/50 shadow-sm ml-2">
                  <svg width="36" height="36" viewBox="0 0 36 36"><path fill="#34A853" d="M16 16v14h4V20z"></path><path fill="#4285F4" d="M30 16H20l-4 4h14z"></path><path fill="#FBBC05" d="M6 16v4h10l4-4z"></path><path fill="#EA4335" d="M20 16V6h-4v14z"></path><path fill="none" d="M0 0h36v36H0z"></path></svg>
                  <span className="font-medium text-sm">Criar</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem className="cursor-pointer" onClick={() => setIsCreateMeetingOpen(true)}>Agendar Reunião</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => setIsCreateTaskOpen(true)}>Nova Tarefa</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => setIsLinkLeadOpen(true)}>Vincular a Lead CRM</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mini Calendar Mock */}
          <div className="px-6 pb-4 pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground capitalize">{format(currentDate, "MMMM yyyy", { locale: ptBR })}</span>
              <div className="flex">
                <Button variant="ghost" onClick={() => setCurrentDate(subMonths(currentDate, 1))} size="icon" className="h-7 w-7 text-foreground hover:bg-secondary/50 rounded-full"><ChevronLeft className="w-4 h-4" /></Button>
                <Button variant="ghost" onClick={() => setCurrentDate(addMonths(currentDate, 1))} size="icon" className="h-7 w-7 text-foreground hover:bg-secondary/50 rounded-full"><ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium mb-1 text-muted-foreground">
              <div>D</div><div>S</div><div>T</div><div>Q</div><div>Q</div><div>S</div><div>S</div>
            </div>
            <div className="grid grid-cols-7 gap-y-1 text-center text-[10px] text-foreground">
              {(() => {
                const startM = startOfMonth(currentDate);
                const daysInMonth = getDaysInMonth(currentDate);
                const startDay = startM.getDay();
                const totalCells = Math.ceil((daysInMonth + startDay) / 7) * 7;
                
                return Array.from({ length: totalCells }, (_, i) => {
                  const dayNum = i - startDay + 1;
                  const isCurrentMonth = dayNum > 0 && dayNum <= daysInMonth;
                  const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
                  const isToday = isSameDay(d, new Date());
                  const isSelected = isSameDay(d, currentDate);

                  return (
                    <div 
                      key={i} 
                      onClick={() => { if(isCurrentMonth) setCurrentDate(d) }}
                      className={`p-1 flex items-center justify-center rounded-full ${!isCurrentMonth ? 'text-muted-foreground/40' : 'hover:bg-secondary/50 cursor-pointer'} ${isToday ? 'bg-primary text-white font-medium hover:bg-primary/90' : ''} ${isSelected && !isToday ? 'bg-primary/20 text-primary font-bold' : ''} w-6 h-6 mx-auto`}
                    >
                      {isCurrentMonth ? dayNum : new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum).getDate()}
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="space-y-4">
              <div className="relative mb-4 mt-2 px-2">
                <User className="absolute left-4 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Encontrar com..." className="h-9 pl-9 text-sm bg-secondary/30 border-none rounded-md text-foreground placeholder:text-muted-foreground" />
              </div>

              <div className="space-y-3">
                {/* Account 1 */}
                <div>
                  <h4 className="text-[13px] font-medium text-foreground mb-1 flex items-center justify-between group cursor-pointer hover:bg-secondary/50 p-1.5 -mx-1.5 rounded-md transition-colors">
                    quinzinhooliveira@gmail.com
                    <ChevronLeft className="w-4 h-4 -rotate-90 text-muted-foreground" />
                  </h4>
                  <div className="space-y-0.5 ml-1">
                    <label className="flex items-center gap-3 text-[13px] cursor-pointer group py-1">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded-sm border-border/50 text-pink-500 focus:ring-pink-500" style={{ accentColor: '#ec4899' }} />
                      <span className="truncate text-foreground">Reuniões</span>
                    </label>
                    <label className="flex items-center gap-3 text-[13px] cursor-pointer group py-1">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded-sm border-border/50 text-emerald-500 focus:ring-emerald-500" style={{ accentColor: '#10b981' }} />
                      <span className="truncate text-foreground">Tarefas CRM</span>
                    </label>
                    <label className="flex items-center gap-3 text-[13px] cursor-pointer group py-1">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded-sm border-border/50 text-blue-500 focus:ring-blue-500" style={{ accentColor: '#3b82f6' }} />
                      <span className="truncate text-foreground">Follow-ups</span>
                    </label>
                  </div>
                </div>

                {/* Account 2 */}
                <div className="pt-2 border-t border-border/50">
                  <h4 className="text-[13px] font-medium text-foreground mb-1 flex items-center justify-between group cursor-pointer hover:bg-secondary/50 p-1.5 -mx-1.5 rounded-md transition-colors mt-2">
                    Outros calendários
                    <ChevronLeft className="w-4 h-4 -rotate-90 text-muted-foreground" />
                  </h4>
                  <div className="space-y-0.5 ml-1">
                    <label className="flex items-center gap-3 text-[13px] cursor-pointer group py-1 opacity-80">
                      <input type="checkbox" className="w-4 h-4 rounded-sm border-border/50 text-yellow-500 focus:ring-yellow-500" style={{ accentColor: '#eab308' }} />
                      <span className="truncate text-foreground">Equipe Comercial</span>
                    </label>
                    <label className="flex items-center gap-3 text-[13px] cursor-pointer group py-1 opacity-80">
                      <input type="checkbox" className="w-4 h-4 rounded-sm border-border/50 text-orange-500 focus:ring-orange-500" style={{ accentColor: '#f97316' }} />
                      <span className="truncate text-foreground">Feriados no Brasil</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background relative min-w-0">
          
          {view === 'month' ? (
            <div className="flex-1 flex flex-col p-4 overflow-y-auto">
               <div className="grid grid-cols-7 border-t border-l border-border/50 flex-1">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                    <div key={d} className="border-r border-b border-border/50 p-2 text-sm font-medium text-muted-foreground text-center">
                      {d}
                    </div>
                  ))}
                  {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="border-r border-b border-border/50 min-h-[100px] p-1">
                      <div className="text-right text-xs text-muted-foreground p-1">{i + 1 <= 31 ? i + 1 : ''}</div>
                    </div>
                  ))}
               </div>
            </div>
          ) : (
            <>
              {/* Days Header */}
              <div className="flex shrink-0 pt-4 pb-2 z-10 bg-background border-b border-border/50">
                <div className="w-16 shrink-0 flex flex-col justify-end pb-2">
                  <div className="flex flex-col text-[10px] text-muted-foreground font-medium gap-1 items-end pr-2 cursor-pointer hover:text-foreground">
                    <div className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      <span>{timezones[0].label}</span>
                    </div>
                  </div>
                </div>
                {daysToRender.map((day, i) => {
                  const isToday = isSameDay(day, new Date());
                  return (
                  <div key={i} className="flex-1 text-center border-l border-border/50 min-w-[100px] flex flex-col items-center justify-center pt-2">
                    <span className={`text-[11px] font-medium uppercase mb-1 ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                      {format(day, 'E', { locale: ptBR })}
                    </span>
                    <div className={`text-2xl w-12 h-12 flex items-center justify-center rounded-full hover:bg-secondary/50 cursor-pointer transition-colors ${isToday ? 'bg-primary text-white hover:bg-primary/90' : 'text-foreground'}`}>
                      {format(day, 'd')}
                    </div>
                  </div>
                )})}
              </div>

              {/* Grid Body */}
              <div className="flex-1 overflow-y-auto relative bg-background" id="calendar-scroll-area">
                <div className="flex min-w-full relative h-[1440px]"> {/* 24h * 60px */}
                  {/* Time Column */}
                  <div className="w-16 shrink-0 bg-background sticky left-0 z-20 border-r border-border/50">
                    <div className="h-6 border-b border-border/50 text-[10px] text-muted-foreground text-right pr-2 flex items-center justify-end">
                      Dia todo
                    </div>
                    {hours.map(hour => (
                      <div key={hour} className="h-[60px] text-[10px] text-muted-foreground text-right pr-2 relative -top-2.5 font-medium">
                        {hour === 0 ? '' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour-12} PM`}
                      </div>
                    ))}
                  </div>
                  
                  {/* All day row grid */}
                  <div className="absolute top-0 left-16 right-0 flex h-6 border-b border-border/50 bg-background z-10">
                    {daysToRender.map((day, i) => (
                      <div key={`allday-${i}`} className="flex-1 border-l border-border/50 min-w-[100px]"></div>
                    ))}
                  </div>

                  {/* Main Grid Columns */}
                  <div className="absolute top-6 left-16 right-0 flex bottom-0">
                    {daysToRender.map((day, dayIndex) => {
                      const isToday = isSameDay(day, new Date());
                      
                      return (
                      <div key={`grid-${dayIndex}`} className="flex-1 border-l border-border/50 relative min-w-[100px]">
                        {hours.map(hour => (
                          <div key={hour} className="h-[60px] border-b border-border/50 hover:bg-secondary/50 cursor-pointer transition-colors relative group">
                            {/* Half hour line (visible on hover) */}
                            <div className="absolute top-1/2 left-0 right-0 h-px border-t border-border/50 opacity-0 group-hover:opacity-100" />
                          </div>
                        ))}
                        
                        {/* Mock Events Overlay */}
                        {events.map((event, i) => {
                          // Simple mapping to days for mockup purposes
                          if (view === 'day') {
                             if (i % 3 !== 0) return null; // Show some events on day view
                          } else {
                             if (i % 7 !== dayIndex) return null;
                          }

                          let eventColor = 'bg-blue-500';
                          if (event.type === 'task') eventColor = 'bg-emerald-500';
                          if (event.type === 'crm') eventColor = 'bg-purple-500';
                          
                          const style = event.style || eventColor;

                          return (
                            <div 
                              key={event.id}
                              className={`absolute left-0 right-3 rounded-md px-2 py-1 mx-1 ${style} text-white shadow-sm cursor-pointer hover:shadow-md transition-all text-xs overflow-hidden border border-white/20`}
                              onClick={() => handleEventClick(event)}
                              style={{ 
                                top: `${(event.hour) * 60}px`,
                                height: `${(event.duration) * 60 - 2}px`,
                                zIndex: 10
                              }}
                            >
                              <div className="font-medium truncate leading-tight text-white flex items-center gap-1">
                                {event.type === 'task' && <div className="w-1.5 h-1.5 rounded-full bg-white/80" />}
                                {event.type === 'crm' && <div className="w-1.5 h-1.5 rounded-sm bg-white/80" />}
                                {event.title}
                              </div>
                              <div className="text-[10px] mt-0.5 text-white/90 leading-tight">
                                {event.hour}:00 - {event.hour + event.duration}:00
                              </div>
                            </div>
                          )
                        })}

                        {/* Current Time Indicator */}
                        {isToday && (
                          <div className="absolute left-0 right-0 flex items-center z-10" style={{ top: `${currentHourPosition}px` }}>
                            <div className="w-3 h-3 rounded-full bg-red-500 -ml-[6px]"></div>
                            <div className="h-[2px] bg-red-500 flex-1 shadow-sm"></div>
                          </div>
                        )}
                      </div>
                    )})}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

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

}
