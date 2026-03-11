const fs = require('fs');

let layout = fs.readFileSync('client/src/components/layout/Layout.tsx', 'utf8');

// If there's an import from AppContext in Layout, let's make sure it's valid
if (layout.includes('import { useAppContext }')) {
    console.log("AppContext is imported in Layout");
} else {
    console.log("AppContext NOT imported in Layout");
}

let appContext = fs.readFileSync('client/src/context/AppContext.tsx', 'utf8');
if (appContext.includes('export const useAppContext = () => {')) {
    console.log("useAppContext is exported from AppContext");
}

