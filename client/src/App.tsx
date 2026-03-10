import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Layout } from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import SchedulingView from "@/pages/SchedulingView";
import CRMView from "@/pages/CRMView";
import CalendarView from "@/pages/CalendarView";
import TasksView from "@/pages/TasksView";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard}/>
        <Route path="/scheduling" component={SchedulingView}/>
        <Route path="/crm" component={CRMView}/>
        <Route path="/calendar" component={CalendarView}/>
        <Route path="/tasks" component={TasksView}/>
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
