import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  CheckSquare, 
  Clock, 
  Settings,
  Menu,
  Bell,
  Search,
  Plus,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";
import { Globe, DollarSign } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { PushNotificationBanner } from "@/components/PushNotificationBanner";
import logoImage from "@assets/ChatGPT_Image_27_de_nov._de_2025,_16_43_05_1773182905923.png";



export function Sidebar({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
  const [location] = useLocation();
  const { t } = useAppContext();
  
  const navItems = [
    { href: "/", label: t.dashboard, icon: LayoutDashboard },
    { href: "/agendamento", label: t.scheduling, icon: Clock },
    { href: "/crm", label: t.crm, icon: Users },
    { href: "/tarefas", label: t.tasks, icon: CheckSquare },
    { href: "/calendario", label: t.calendar, icon: CalendarDays },
    { href: "/zapier", label: "Zapier", icon: Zap },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex flex-col ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-transparent">
          <img src={logoImage} alt="Olivar Logo" className="w-full h-full object-cover" />
        </div>
        <span className="font-heading font-semibold text-lg tracking-tight">Olivar OS</span>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto mt-4">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}>
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 mt-auto border-t">
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-muted-foreground hover:bg-secondary/50 hover:text-foreground">
          <Settings className="w-4 h-4" />
          <span>{t.settings}</span>
        </Link>
      </div>
    </aside>
  );
}

export function Topbar({ setSidebarOpen }: { setSidebarOpen: (open: boolean) => void }) {
  const { settings, setSettings } = useAppContext();
  return (
    <header className="h-14 bg-background border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}>
          <Menu className="w-5 h-5" />
        </Button>
        <div className="relative hidden md:block w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar em tudo..." className="pl-9 h-9 bg-secondary/50 border-transparent focus-visible:bg-background" />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-primary rounded-full"></span>
        </Button>
        <div className="h-4 w-px bg-border mx-1"></div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="w-7 h-7 cursor-pointer hover:opacity-80 transition-all border border-border">
              <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Perfil</DropdownMenuItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center gap-2"><Globe className="w-3 h-3" /> Idioma</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setSettings({...settings, language: 'pt-BR'})} className={settings?.language === 'pt-BR' ? 'bg-secondary' : ''}>Português (BR)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSettings({...settings, language: 'en-US'})} className={settings?.language === 'en-US' ? 'bg-secondary' : ''}>English (US)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSettings({...settings, language: 'es-ES'})} className={settings?.language === 'es-ES' ? 'bg-secondary' : ''}>Español (ES)</DropdownMenuItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center gap-2"><DollarSign className="w-3 h-3" /> Moeda</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setSettings({...settings, currency: 'BRL'})} className={settings?.currency === 'BRL' ? 'bg-secondary' : ''}>BRL (R$)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSettings({...settings, currency: 'USD'})} className={settings?.currency === 'USD' ? 'bg-secondary' : ''}>USD ($)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSettings({...settings, currency: 'EUR'})} className={settings?.currency === 'EUR' ? 'bg-secondary' : ''}>EUR (€)</DropdownMenuItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  
  const isFullWidth = location === '/calendario';

  return (
    <div className="min-h-screen bg-background flex text-foreground selection:bg-primary/30">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col min-w-0">
        <Topbar setSidebarOpen={setSidebarOpen} />
        <PushNotificationBanner />
        <div className={`flex-1 overflow-y-auto ${isFullWidth ? 'p-0' : 'p-4 md:p-8'}`}>
          <div className={`${isFullWidth ? 'w-full h-full' : 'max-w-5xl mx-auto w-full'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}