const fs = require('fs');
let code = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

const searchBtn = `<Button className="w-full h-10 text-base" onClick={() => setIsAddLeadOpen(false)}>
                Criar Lead
              </Button>`;
const replaceBtn = `<Button className="w-full h-10 text-base" onClick={(e) => { e.preventDefault(); handleAddLead(); }}>
                Criar Lead
              </Button>`;

code = code.replace(searchBtn, replaceBtn);
fs.writeFileSync('client/src/pages/CRMView.tsx', code);
