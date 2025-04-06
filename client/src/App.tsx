import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";

// Páginas
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import { ProtectedRoute } from "./lib/protected-route";

// Produtividade
import Notes from "@/pages/productivity/notes";
import Tasks from "@/pages/productivity/tasks";
import Links from "@/pages/productivity/links";
import Ideas from "@/pages/productivity/ideas";
import PromptBank from "@/pages/productivity/prompt-bank";

// Ferramentas
import ChatCEO from "@/pages/tools/chat-ceo";
import PromptMaker from "@/pages/tools/prompt-maker";
import Assistants from "@/pages/tools/assistants";

// Externos
import Farm from "@/pages/external/farm";
import BestRobot from "@/pages/external/best-robot";

// Configurações
import Settings from "@/pages/settings";
import { AppLayout } from "@/components/layout/AppLayout";

function Router() {
  return (
    <Switch>
      {/* Autenticação - usando a página de login simples com senha mestra */}
      <Route path="/login" component={Login} />

      {/* Dashboard */}
      <ProtectedRoute path="/" component={Dashboard} />

      {/* Produtividade */}
      <ProtectedRoute path="/productivity/notes" component={Notes} />
      <ProtectedRoute path="/productivity/tasks" component={Tasks} />
      <ProtectedRoute path="/productivity/links" component={Links} />
      <ProtectedRoute path="/productivity/ideas" component={Ideas} />
      <ProtectedRoute path="/productivity/prompt-bank" component={PromptBank} />

      {/* Ferramentas */}
      <ProtectedRoute path="/tools/chat-ceo" component={ChatCEO} />
      <ProtectedRoute path="/tools/prompt-maker" component={PromptMaker} />
      <ProtectedRoute path="/tools/assistants" component={Assistants} />

      {/* Externos */}
      <ProtectedRoute path="/external/farm" component={Farm} />
      <ProtectedRoute path="/external/best-robot" component={BestRobot} />

      {/* Configurações */}
      <ProtectedRoute path="/settings" component={Settings} />

      {/* Página não encontrada */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;