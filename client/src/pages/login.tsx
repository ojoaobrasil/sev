import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { EyeIcon, EyeOffIcon, Loader2, Terminal } from "lucide-react";
import { TerminalText } from "@/components/terminal-text";
import { motion } from "framer-motion";

export default function Login() {
  const [, setLocation] = useLocation();
  const { user, loginMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [authStatus, setAuthStatus] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error" | null>(null);

  const { register, handleSubmit, reset } = useForm<{ password: string }>({
    defaultValues: {
      password: "",
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const onSubmit = async (data: { password: string }) => {
    try {
      // Para compatibilidade com o backend que espera username e password
      loginMutation.mutate({ 
        username: "admin", 
        password: data.password 
      });
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  // Handle UI feedback based on mutation status
  useEffect(() => {
    if (loginMutation.isPending) {
      setAuthStatus("Autenticando...");
      setStatusType(null);
    } else if (loginMutation.isError) {
      setAuthStatus("Falha na autenticação. Acesso negado.");
      setStatusType("error");
      // Clear error message after 3 seconds
      const timer = setTimeout(() => {
        setAuthStatus(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [loginMutation.isPending, loginMutation.isError]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center p-4 bg-black relative overflow-hidden"
    >
      {/* Scan line effect */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      
      <Card className="max-w-md w-full bg-black border border-terminal shadow-lg rounded-sm overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col items-center">
            <div className="mb-8 text-center">
              <div className="flex items-center justify-center mb-2">
                <Terminal className="h-12 w-12 text-terminal" />
              </div>
              <h1 className="font-tech-mono text-2xl text-terminal mb-2 terminal-shadow tracking-wider">
                TERMINAL<span className="text-terminal/80">_OS</span>
              </h1>
              <TerminalText 
                text="Sistema de autenticação v1.0" 
                className="text-sm text-center text-terminal/70 font-tech-mono"
              />
            </div>
            
            <div className="bg-black p-4 border border-terminal/70 rounded-sm w-full mb-6 relative">
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
                <div className="h-2 w-2 rounded-full bg-terminal mr-2"></div>
                <p className="text-xs ml-1 font-tech-mono text-terminal/80">root@terminal:~</p>
              </div>
              
              <div className="font-tech-mono text-sm mt-4 text-terminal">
                <p>&gt; Iniciando conexão segura...</p>
                <p>&gt; Protocolos de criptografia ativados</p>
                <p>&gt; Autenticação necessária</p>
                <p>&gt; Digite a senha mestra_<span className="animate-pulse">|</span></p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
              <div className="relative mb-6">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="SENHA MESTRA"
                  className="w-full bg-black border border-terminal/70 focus:border-terminal font-tech-mono text-lg p-6 rounded-sm focus:outline-none focus:ring-1 focus:ring-terminal transition-all placeholder:text-terminal/50 text-terminal"
                  {...register("password", { required: true })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-terminal/70 hover:text-terminal transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeIcon className="h-5 w-5" />
                  ) : (
                    <EyeOffIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-terminal/10 border border-terminal hover:bg-terminal/20 font-tech-mono text-terminal font-bold py-6 rounded-sm transition-all"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : null}
                AUTENTICAR
              </Button>
            </form>
            
            <div className="mt-6 text-center h-6">
              {authStatus && (
                <p 
                  className={`font-tech-mono text-sm transition-opacity duration-300 ${
                    statusType === "error" ? "text-red-500" : 
                    statusType === "success" ? "text-terminal" : "text-terminal/90"
                  }`}
                >
                  {authStatus}
                </p>
              )}
            </div>
            
            <div className="mt-8 border-t border-terminal/30 pt-4 w-full">
              <div className="flex justify-between text-xs text-terminal/50 font-tech-mono">
                <span>STATUS: <span className="text-terminal">ONLINE</span></span>
                <span>SEGURANÇA: <span className="text-terminal">ALTA</span></span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
