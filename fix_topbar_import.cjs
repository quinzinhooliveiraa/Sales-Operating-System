const fs = require('fs');

let layout = fs.readFileSync('client/src/components/layout/Layout.tsx', 'utf8');

// If Layout.tsx doesn't have the useAppContext import where it needs it, we fix it.
if (!layout.includes('import { useAppContext } from "@/context/AppContext";') && layout.includes('const { settings, setSettings } = useAppContext();')) {
    layout = layout.replace(
        `import { Bell, Search, Menu, MessageSquare, Plus, Settings, Globe, DollarSign } from "lucide-react";`,
        `import { Bell, Search, Menu, MessageSquare, Plus, Settings, Globe, DollarSign } from "lucide-react";\nimport { useAppContext } from "@/context/AppContext";`
    );
    fs.writeFileSync('client/src/components/layout/Layout.tsx', layout);
    console.log("Fixed missing useAppContext import in Layout");
}

