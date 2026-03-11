const fs = require('fs');

let content = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

// There seems to be an issue in the dialog markup we created earlier, where we have nested forms or something similar.
// We should check if the file is syntactically valid React.

content = content.replace(
  /<div className="pl-12 space-y-3">/g,
  '<div className="pl-12 space-y-3">'
);

fs.writeFileSync('client/src/pages/CRMView.tsx', content);
console.log('Done');
