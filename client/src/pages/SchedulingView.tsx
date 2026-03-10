import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Settings2, Copy, ChevronDown, Monitor, CalendarDays, ExternalLink, Search, Filter, HelpCircle, X, HelpCircleIcon, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SchedulingView() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCreationType, setSelectedCreationType] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isEmbedOpen, setIsEmbedOpen] = useState(false);
  const [embedType, setEmbedType] = useState<'inline' | 'popup-widget' | 'popup-text'>('inline');
  const [activeTab, setActiveTab] = useState('event-types');

  const creationOptions = [
    { id: 'one-on-one', title: "Um-a-um", subtitle: "1 anfitrião → 1 convidado", desc: "Ideal para conversas, entrevistas 1:1, etc." },
    { id: 'group', title: "Grupo", subtitle: "1 anfitrião → Vários convidados", desc: "Webinars, aulas online, etc." },
    { id: 'round-robin', title: "Round robin", subtitle: "Anfitriões rotativos → 1 convidado", desc: "Distribui as reuniões entre a equipe" },
    { id: 'collective', title: "Coletivo", subtitle: "Múltiplos anfitriões → 1 convidado", desc: "Entrevistas em painel, calls de vendas, etc." }
  ];

  const events = [
    { title: "Clinic Scaling | Free Audit", duration: "30 min", type: "Google Meet", mode: "Collective", color: "bg-purple-500", active: true },
    { title: "Vi Online Flow | Free Audit", duration: "45 min", type: "Google Meet", mode: "Collective", color: "bg-purple-500", active: true },
    { title: "Territory Evaluation Call", duration: "30 min", type: "Google Meet", mode: "Collective", color: "bg-purple-500", active: true },
    { title: "Aiventy | Free Audit", duration: "30 min", type: "Google Meet", mode: "Collective", color: "bg-purple-500", active: true },
    { title: "X7 Scale for Dumpster Companies | Free Audit", duration: "30 min", type: "Google Meet", mode: "Collective", color: "bg-purple-500", active: true },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          Agendamentos <HelpCircle className="w-4 h-4 text-muted-foreground" />
        </h1>
        
        <DropdownMenu open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DropdownMenuTrigger asChild>
            <Button className="gap-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 font-semibold">
              <Plus className="w-4 h-4" />
              Criar <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0 rounded-xl shadow-lg border-border bg-card">
            <div className="p-1 max-h-[500px] overflow-y-auto">
              <div className="p-3 text-xs font-semibold text-muted-foreground">
                Tipo de evento
              </div>
              {creationOptions.map((opt) => (
                <div 
                  key={opt.id}
                  className="px-4 py-3 hover:bg-secondary/50 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedCreationType(opt.id);
                    setIsCreateOpen(false);
                    setIsEditorOpen(true);
                  }}
                >
                  <h3 className="text-sm font-bold text-blue-600">{opt.title}</h3>
                  <p className="text-sm text-foreground mt-0.5">{opt.subtitle}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                </div>
              ))}
              <div className="p-3 mt-1 border-t text-xs font-semibold text-muted-foreground">
                Mais formas de reunir
              </div>
              <div className="px-4 py-3 hover:bg-secondary/50 cursor-pointer transition-colors">
                <h3 className="text-sm font-bold text-blue-600">Reunião única</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Ofereça horários fora da sua agenda normal</p>
              </div>
              <div className="px-4 py-3 hover:bg-secondary/50 cursor-pointer transition-colors">
                <h3 className="text-sm font-bold text-blue-600">Votação de reunião</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Deixe os convidados votarem no melhor horário</p>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex gap-6 border-b border-border/50 text-sm font-medium">
        <button 
          onClick={() => setActiveTab('event-types')}
          className={`pb-3 border-b-2 transition-colors ${activeTab === 'event-types' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Tipos de eventos
        </button>
        <button 
          onClick={() => setActiveTab('single-use')}
          className={`pb-3 border-b-2 transition-colors ${activeTab === 'single-use' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Links de uso único
        </button>
        <button 
          onClick={() => setActiveTab('polls')}
          className={`pb-3 border-b-2 transition-colors ${activeTab === 'polls' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Votações de reunião
        </button>
      </div>

      {activeTab === 'event-types' && (
        <>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button variant="outline" className="bg-background">
                Meu Calendly <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
              </Button>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar tipos de eventos" className="pl-9 h-10 bg-background" />
              </div>
              <Button variant="outline" className="bg-background gap-2">
                <Filter className="w-4 h-4" /> Filtro <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 mt-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8 font-semibold bg-blue-100 text-blue-700">
                <AvatarFallback>Q</AvatarFallback>
              </Avatar>
              <span className="font-semibold text-sm">Quinzinho Oliveira</span>
            </div>
            <a href="#" className="text-sm text-blue-600 hover:underline flex items-center gap-1 font-medium">
              <ExternalLink className="w-4 h-4" /> Ver página de aterrissagem
            </a>
          </div>

          <div className="border border-border rounded-xl bg-card overflow-hidden">
            <div className="p-6 border-b border-border/50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Simplifique seu agendamento com tipos de eventos</h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                  Tipos de eventos são modelos para reuniões que você deseja agendar regularmente, como demonstrações de produtos, chamadas com clientes, horário de expediente e muito mais.
                </p>
                <a href="#" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-2 mb-4 font-medium">
                  <HelpCircleIcon className="w-4 h-4" /> Saiba mais
                </a>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold" onClick={() => {
                  setSelectedCreationType('one-on-one');
                  setIsEditorOpen(true);
                }}>
                  <Plus className="w-4 h-4 mr-1" /> Novo tipo de evento <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </div>
              
              {/* Little graphic from the screenshot */}
              <div className="hidden md:flex gap-4 items-center mr-8">
                <div className="bg-background border rounded-lg p-3 w-48 shadow-sm space-y-3">
                  <div className="h-2 w-24 bg-border rounded-full"></div>
                  <div className="h-1.5 w-full bg-secondary rounded-full"></div>
                  <div className="h-2 w-16 bg-border rounded-full"></div>
                  <div className="h-1.5 w-full bg-secondary rounded-full"></div>
                  <div className="h-2 w-20 bg-border rounded-full"></div>
                  <div className="h-1.5 w-full bg-secondary rounded-full"></div>
                </div>
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center -ml-12 border-4 border-card relative z-10">
                  <div className="bg-background border rounded-md p-2 shadow-sm text-center">
                    <Avatar className="w-6 h-6 mx-auto mb-1"><AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026024d" /></Avatar>
                    <div className="text-[9px] font-bold">Confirmed</div>
                    <CalendarDays className="w-3 h-3 mx-auto mt-1" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-secondary/20 text-sm font-semibold">
              Shared
            </div>

            <div className="divide-y divide-border">
              {events.map((event, i) => (
                <div key={i} className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-card hover:bg-secondary/30 transition-colors">
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${event.color}`} />
                  <div className="pl-3 flex items-start gap-3">
                    <div className="mt-1">
                      <input type="checkbox" className="rounded border-border w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold">{event.title}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {event.duration} • {event.type} • {event.mode}
                      </p>
                      <p className="text-sm text-muted-foreground">Hours vary by host</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-0 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold text-muted-foreground mr-4">
                      P
                    </div>
                    <Button variant="outline" className="rounded-full gap-2 font-semibold">
                      <Copy className="w-4 h-4" /> Copy link
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => setIsEmbedOpen(true)}>
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <button className="text-blue-600 text-sm font-semibold hover:underline">
              Show more event types (7)
            </button>
          </div>
        </>
      )}

      {/* Editor Modal */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-[1200px] h-[90vh] p-0 overflow-hidden flex flex-col md:flex-row gap-0 bg-secondary/10">
          {/* Editor Sidebar */}
          <div className="w-full md:w-[400px] border-r flex flex-col h-full bg-card overflow-y-auto">
            <div className="p-4 flex justify-between items-center sticky top-0 bg-card z-10 border-b">
              <span className="font-semibold">Tipo de evento</span>
              <Button variant="ghost" size="icon" onClick={() => setIsEditorOpen(false)}><X className="w-5 h-5"/></Button>
            </div>
            
            <div className="p-4 border-b">
              <div className="border rounded-lg p-3 hover:border-blue-500 cursor-pointer">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <h3 className="font-bold text-lg">Nova Reunião</h3>
                </div>
                <p className="text-sm text-muted-foreground ml-5 mt-1">Um-a-um</p>
              </div>
            </div>

            <div className="flex-1">
              {/* Accordion-like items based on screenshot */}
              {[
                { title: "Duração", subtitle: "30 min", icon: <Clock className="w-4 h-4 text-muted-foreground" /> },
                { title: "Localização", subtitle: "Zoom, Chamada telefônica, Presencial", icon: <Monitor className="w-4 h-4 text-muted-foreground" /> },
                { title: "Disponibilidade", subtitle: "Dias úteis, 09:00 - 17:00", icon: <CalendarDays className="w-4 h-4 text-muted-foreground" /> },
                { title: "Anfitrião", subtitle: "Quinzinho Oliveira (você)", icon: <Avatar className="w-4 h-4 text-[8px] bg-secondary"><AvatarFallback>Q</AvatarFallback></Avatar> },
                { title: "Descrição", subtitle: "Diga aos seus convidados sobre o que é esta reunião" },
                { title: "Limites e buffers", subtitle: "Tempos de buffer, limites máximos" },
                { title: "Regras de livre/ocupado", subtitle: "Permitir que convidados agendem sobre reuniões selecionadas em sua..." },
                { title: "Opções da página de agendamento", subtitle: "/nova-reuniao • incrementos de 30 min • fuso horário automático" },
                { title: "Formulário de convidado", subtitle: "Pedindo nome, e-mail, +1 pergunta" },
                { title: "Pagamento", subtitle: "Colete pagamento pelo seu evento" },
                { title: "Notificações e fluxos de trabalho", subtitle: "Convites de calendário" },
                { title: "Página de confirmação", subtitle: "Exibir página de confirmação" },
              ].map((item, i) => (
                <div key={i} className="p-4 border-b hover:bg-secondary/30 cursor-pointer group">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-semibold text-sm">{item.title}</h4>
                    <ChevronDown className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {item.icon}
                    <span className="truncate">{item.subtitle}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t sticky bottom-0 bg-card z-10 flex justify-between items-center">
              <Button variant="ghost" className="font-semibold">Cancelar</Button>
              <div className="flex gap-2">
                <Button variant="outline" className="font-semibold">Mais opções</Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-6">Salvar alterações</Button>
              </div>
            </div>
          </div>

          {/* Preview Area */}
            <div className="flex-1 bg-background p-8 overflow-y-auto hidden md:flex flex-col items-center">
            <div className="w-full max-w-3xl flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="font-semibold">Visualização de Nova Reunião</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 gap-2 rounded-full font-semibold"><Copy className="w-3 h-3" /> Copiar link</Button>
              </div>
            </div>

            <div className="bg-card border rounded-lg shadow-lg w-full max-w-3xl overflow-hidden flex flex-col md:flex-row relative">
              <div className="absolute top-0 left-0 right-0 bg-[#1A1A1A] text-white text-xs font-semibold py-2 px-4 flex justify-between">
                <span>Esta é uma visualização. Para agendar um evento, compartilhe o link com seus convidados.</span>
                <ExternalLink className="w-3 h-3" />
              </div>
              
              <div className="w-full md:w-1/3 border-r p-8 pt-16">
                <div className="mb-8 font-bold text-xl flex items-center gap-2">
                   <div className="w-6 h-6 bg-blue-600 rounded-sm"></div>
                   CALL ESTRATÉGICA
                </div>
                <div className="text-muted-foreground font-semibold text-sm mb-1">Quinzinho Oliveira</div>
                <h1 className="text-2xl font-bold mb-6 text-foreground">Nova Reunião</h1>
                <div className="space-y-4 text-muted-foreground text-sm font-medium">
                  <p className="flex items-center gap-3"><Clock className="w-5 h-5" /> 30 min</p>
                  <p className="flex items-center gap-3"><Monitor className="w-5 h-5" /> Adicione um local para aparecer aqui</p>
                </div>
              </div>
              
              <div className="flex-1 p-8 pt-16 flex flex-col items-center">
                <h3 className="font-bold text-lg mb-6 w-full text-center">Selecione uma Data e Hora</h3>
                
                <div className="flex items-center justify-center gap-4 mb-6">
                  <Button variant="ghost" size="icon"><ChevronDown className="w-4 h-4 rotate-90"/></Button>
                  <span className="font-semibold text-sm">Março 2026</span>
                  <Button variant="ghost" size="icon" className="bg-blue-50 text-blue-600 rounded-full"><ChevronDown className="w-4 h-4 -rotate-90"/></Button>
                </div>

                <div className="w-full max-w-[300px]">
                  <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-muted-foreground mb-4">
                    <div>DOM</div><div>SEG</div><div>TER</div><div>QUA</div><div>QUI</div><div>SEX</div><div>SAB</div>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center text-sm font-semibold">
                    {/* Empty slots for spacing */}
                    <div></div>
                    
                    {Array.from({ length: 31 }).map((_, i) => {
                      const isAvailable = [11, 12, 13, 17, 18, 19, 20, 24, 25, 26, 27].includes(i+1);
                      const isSelected = i+1 === 11;
                      return (
                        <div 
                          key={i} 
                          className={`
                            mx-auto w-10 h-10 flex items-center justify-center rounded-full
                            ${isSelected ? 'bg-blue-600 text-white' : ''}
                            ${isAvailable && !isSelected ? 'bg-blue-50 text-blue-600 cursor-pointer hover:bg-blue-100' : ''}
                            ${!isAvailable && !isSelected ? 'text-muted-foreground opacity-50' : ''}
                          `}
                        >
                          {i + 1}
                        </div>
                      )
                    })}
                  </div>
                </div>
                
                <div className="mt-8 w-full">
                  <div className="text-sm font-bold mb-1">Fuso horário</div>
                  <div className="text-sm flex items-center gap-1 cursor-pointer hover:underline">
                     Horário de Brasília (19:20) <ChevronDown className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Embed Modal */}
      <Dialog open={isEmbedOpen} onOpenChange={setIsEmbedOpen}>
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-card">
          <div className="p-6 border-b flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold">Adicionar ao site</h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-sm text-muted-foreground font-medium">Nova Reunião</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsEmbedOpen(false)}><X className="w-5 h-5"/></Button>
          </div>
          
          <div className="p-6">
            <p className="text-sm font-medium mb-4">Como você deseja adicionar o Calendly ao seu site?</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card 
                className={`cursor-pointer transition-all rounded-xl overflow-hidden border-2 ${embedType === 'inline' ? 'border-blue-600 shadow-sm' : 'border-border hover:border-muted-foreground/50'}`}
                onClick={() => setEmbedType('inline')}
              >
                <div className="bg-secondary/30 h-32 flex items-center justify-center p-4">
                  {/* Mock browser window showing inline embed */}
                  <div className="w-full h-full bg-background rounded shadow-sm border flex flex-col overflow-hidden opacity-80">
                    <div className="h-3 border-b flex gap-1 p-1"><div className="w-1 h-1 rounded-full bg-border"/><div className="w-1 h-1 rounded-full bg-border"/><div className="w-1 h-1 rounded-full bg-border"/></div>
                    <div className="flex-1 flex p-2 gap-2">
                      <div className="w-1/3 space-y-1"><div className="h-1 bg-border rounded w-full"/><div className="h-1 bg-border rounded w-2/3"/></div>
                      <div className="flex-1 border rounded bg-background flex flex-col justify-center items-center">
                        <div className="grid grid-cols-4 gap-0.5 w-10">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"/>
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"/>
                          <div className="w-1.5 h-1.5 bg-border rounded-full"/>
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"/>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4 text-center">
                  <h3 className="font-bold text-lg">Incorporação em linha</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-tight">Adicione uma página de agendamento ao seu site</p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all rounded-xl overflow-hidden border-2 ${embedType === 'popup-widget' ? 'border-blue-600 shadow-sm' : 'border-border hover:border-muted-foreground/50'}`}
                onClick={() => setEmbedType('popup-widget')}
              >
                <div className="bg-secondary/30 h-32 flex items-center justify-center p-4">
                  {/* Mock browser window showing popup widget */}
                  <div className="w-full h-full bg-background rounded shadow-sm border flex flex-col overflow-hidden opacity-80 relative">
                    <div className="h-3 border-b flex gap-1 p-1"><div className="w-1 h-1 rounded-full bg-border"/><div className="w-1 h-1 rounded-full bg-border"/><div className="w-1 h-1 rounded-full bg-border"/></div>
                    <div className="flex-1 flex flex-col p-2 gap-2">
                      <div className="h-4 bg-secondary rounded w-full"/>
                      <div className="flex gap-2 flex-1"><div className="w-1/2 bg-secondary rounded"/><div className="w-1/2 bg-secondary rounded"/></div>
                    </div>
                    <div className="absolute bottom-2 right-2 w-8 h-3 bg-blue-600 rounded-full"></div>
                  </div>
                </div>
                <CardContent className="p-4 text-center">
                  <h3 className="font-bold text-lg">Widget popup</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-tight">Adicione um botão flutuante que abre um popup</p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all rounded-xl overflow-hidden border-2 ${embedType === 'popup-text' ? 'border-blue-600 shadow-sm' : 'border-border hover:border-muted-foreground/50'}`}
                onClick={() => setEmbedType('popup-text')}
              >
                <div className="bg-secondary/30 h-32 flex items-center justify-center p-4">
                  {/* Mock browser window showing popup text */}
                  <div className="w-full h-full bg-background rounded shadow-sm border flex flex-col overflow-hidden opacity-80">
                    <div className="h-3 border-b flex gap-1 p-1"><div className="w-1 h-1 rounded-full bg-border"/><div className="w-1 h-1 rounded-full bg-border"/><div className="w-1 h-1 rounded-full bg-border"/></div>
                    <div className="flex-1 flex flex-col p-2 gap-2 items-center justify-center">
                      <div className="h-1.5 bg-border rounded w-2/3 mb-1"/>
                      <div className="h-1.5 bg-blue-600 rounded w-1/3 mb-1"/>
                      <div className="h-1.5 bg-border rounded w-1/2"/>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4 text-center">
                  <h3 className="font-bold text-lg">Texto popup</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-tight">Adicione um link de texto que abre um popup</p>
                </CardContent>
              </Card>
            </div>

            <a href="#" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-6 font-medium">
              Veja como os membros usam o Calendly em seus sites. <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-6 border-t bg-card flex justify-end gap-3">
            <Button variant="ghost" className="font-semibold" onClick={() => setIsEmbedOpen(false)}>Cancelar</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 font-semibold" onClick={() => setIsEmbedOpen(false)}>Continuar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}