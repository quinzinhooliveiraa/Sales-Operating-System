const fs = require('fs');
let content = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

// Ensure add lead form takes up available space efficiently
content = content.replace(
  /<div className="space-y-1">\n\s*<label className="text-xs font-medium">Nome<\/label>\n\s*<Input placeholder="Ex: João Silva" \/>\n\s*<\/div>/,
  `<div className="space-y-1">
                <label className="text-xs font-medium">Nome</label>
                <Input placeholder="Ex: João Silva" className="h-9" />
              </div>`
);
content = content.replace(
  /<div className="space-y-1">\n\s*<label className="text-xs font-medium">Empresa<\/label>\n\s*<Input placeholder="Ex: Acme Corp" \/>\n\s*<\/div>/,
  `<div className="space-y-1">
                <label className="text-xs font-medium">Empresa</label>
                <Input placeholder="Ex: Acme Corp" className="h-9" />
              </div>`
);
content = content.replace(
  /<div className="space-y-1">\n\s*<label className="text-xs font-medium">Email<\/label>\n\s*<Input type="email" placeholder="joao@acme\.com" \/>\n\s*<\/div>/,
  `<div className="space-y-1">
                <label className="text-xs font-medium">Email</label>
                <Input type="email" placeholder="joao@acme.com" className="h-9" />
              </div>`
);
content = content.replace(
  /<div className="space-y-1">\n\s*<label className="text-xs font-medium">Telefone<\/label>\n\s*<Input placeholder="\+55 11 99999-9999" \/>\n\s*<\/div>/,
  `<div className="space-y-1">
                <label className="text-xs font-medium">Telefone</label>
                <Input placeholder="+55 11 99999-9999" className="h-9" />
              </div>`
);

fs.writeFileSync('client/src/pages/CRMView.tsx', content);
console.log('Done');
