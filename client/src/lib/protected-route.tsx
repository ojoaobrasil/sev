
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen bg-cyber-dark">
          <Loader2 className="h-8 w-8 animate-spin text-terminal" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/login" />
      </Route>
    );
  }

  return (
    <Route path={path}>
      <AppLayout>
        <Component />
      </AppLayout>
    </Route>
  );
}
