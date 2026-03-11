const fs = require('fs');

// 1. Fix types in AppContext
let contextContent = fs.readFileSync('client/src/context/AppContext.tsx', 'utf8');

contextContent = contextContent.replace(
  /export type Lead = {[\s\S]*?};/,
  `export type Lead = {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  value: string;
  stage: string;
  owner: string;
  tags: string[];
  score: number;
  formResponses: Record<string, string>;
  notes: string;
  history: LeadActivity[];
  meetingDate?: string;
  nextTask?: string;
};`
);

fs.writeFileSync('client/src/context/AppContext.tsx', contextContent);

// 2. Fix imports in CRMView
let crmContent = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

crmContent = crmContent.replace(
  /import \{ Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger \} from "@\/components\/ui\/dialog";/,
  'import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog";'
);

fs.writeFileSync('client/src/pages/CRMView.tsx', crmContent);
console.log('Fixed types and imports');
