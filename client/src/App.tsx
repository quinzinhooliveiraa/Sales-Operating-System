import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider } from "@/context/AppContext";

import { Layout } from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import SchedulingView from "@/pages/SchedulingView";
import CRMView from "@/pages/CRMView";
import CalendarView from "@/pages/CalendarView";
import TasksView from "@/pages/TasksView";
import ZapierPage from "@/pages/ZapierPage";
import { useZapierSync } from "@/hooks/useZapierSync";

function Router() {
  useZapierSync();
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard}/>
        <Route path="/agendamento" component={SchedulingView}/>
        <Route path="/crm" component={CRMView}/>
        <Route path="/calendario" component={CalendarView}/>
        <Route path="/tarefas" component={TasksView}/>
        <Route path="/zapier" component={ZapierPage}/>
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </AppProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
