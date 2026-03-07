import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Import Pages
import Home from "./pages/Home";
import ChildTablet from "./pages/child/ChildTablet";
import Overview from "./pages/dashboard/Overview";
import Configuration from "./pages/dashboard/Configuration";
import Logs from "./pages/dashboard/Logs";
import SkillAssessment from "./pages/assessment/SkillAssessment";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/child" component={ChildTablet} />
      <Route path="/assessment" component={SkillAssessment} />

      {/* Dashboard Routes */}
      <Route path="/dashboard" component={Overview} />
      <Route path="/dashboard/config" component={Configuration} />
      <Route path="/dashboard/analytics" component={Logs} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
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
