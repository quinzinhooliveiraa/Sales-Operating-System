const fs = require('fs');

let layout = fs.readFileSync('client/src/components/layout/Layout.tsx', 'utf8');

// I need to properly add the DropdownMenu back to the Topbar to include the language/currency switch.
if (!layout.includes('DropdownMenu')) {
    layout = layout.replace(
        `import { Globe, DollarSign } from "lucide-react";`,
        `import { Globe, DollarSign } from "lucide-react";\nimport { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";`
    );
    
    // Replace the simple Avatar with the DropdownMenu
    const avatarOld = `<Avatar className="w-7 h-7 cursor-pointer hover:opacity-80 transition-all border border-border">
          <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>`;
        
    const avatarNew = `<DropdownMenu>
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
        </DropdownMenu>`;
        
    layout = layout.replace(avatarOld, avatarNew);
    
    // Make sure Topbar uses the context
    layout = layout.replace(
        `export function Topbar({ setSidebarOpen }: { setSidebarOpen: (open: boolean) => void }) {`,
        `export function Topbar({ setSidebarOpen }: { setSidebarOpen: (open: boolean) => void }) {\n  const { settings, setSettings } = useAppContext();`
    );
    
    fs.writeFileSync('client/src/components/layout/Layout.tsx', layout);
    console.log("Fixed Avatar to be a DropdownMenu with settings");
}

