const fs = require('fs');
let content = fs.readFileSync('client/src/pages/CalendarView.tsx', 'utf8');

// Add DropdownMenu import
if (!content.includes('DropdownMenu')) {
  content = content.replace(
    'import { useAppContext } from "@/context/AppContext";',
    `import { useAppContext } from "@/context/AppContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";`
  );
}

// Replace the create button with a dropdown
content = content.replace(
  /<Button className="h-\[48px\] rounded-full px-4 pr-6 flex items-center gap-3 bg-background text-foreground hover:bg-secondary\/50 hover:shadow-md transition-all border border-border\/50 shadow-sm ml-2">[\s\S]*?<\/Button>/,
  `<DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="h-[48px] rounded-full px-4 pr-6 flex items-center gap-3 bg-background text-foreground hover:bg-secondary/50 hover:shadow-md transition-all border border-border/50 shadow-sm ml-2">
                  <svg width="36" height="36" viewBox="0 0 36 36"><path fill="#34A853" d="M16 16v14h4V20z"></path><path fill="#4285F4" d="M30 16H20l-4 4h14z"></path><path fill="#FBBC05" d="M6 16v4h10l4-4z"></path><path fill="#EA4335" d="M20 16V6h-4v14z"></path><path fill="none" d="M0 0h36v36H0z"></path></svg>
                  <span className="font-medium text-sm">Criar</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem className="cursor-pointer">Agendar Reunião</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Nova Tarefa</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Vincular a Lead CRM</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>`
);

fs.writeFileSync('client/src/pages/CalendarView.tsx', content);
console.log('Done');
