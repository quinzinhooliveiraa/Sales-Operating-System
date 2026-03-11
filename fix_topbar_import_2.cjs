const fs = require('fs');

let layout = fs.readFileSync('client/src/components/layout/Layout.tsx', 'utf8');

// Ensure the Topbar component actually has access to the import
if (!layout.includes('import { useAppContext } from "@/context/AppContext";')) {
    layout = layout.replace(
        `import { Button } from "@/components/ui/button";`,
        `import { Button } from "@/components/ui/button";\nimport { useAppContext } from "@/context/AppContext";\nimport { Globe, DollarSign } from "lucide-react";`
    );
    fs.writeFileSync('client/src/components/layout/Layout.tsx', layout);
    console.log("Forced useAppContext import in Layout");
}

