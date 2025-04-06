import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const loginSchema = z.object({
  username: z.string().min(3, "Nome de usuário deve ter pelo menos 3 caracteres"),
  password: z.string().min(3, "Senha deve ter pelo menos 3 caracteres"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Nome de usuário deve ter pelo menos 3 caracteres"),
  password: z.string().min(3, "Senha deve ter pelo menos 3 caracteres"),
});

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onLogin = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data);
  };

  const onRegister = (data: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(data);
  };

  // Se o usuário estiver autenticado, redirecione para a página principal
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex min-h-screen bg-cyber-dark">
      <div className="flex flex-col w-full md:flex-row">
        {/* Formulário */}
        <div className="flex items-center justify-center w-full md:w-1/2 p-6">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-cyber-cyan mb-2">CYBER SYSTEM</h1>
              <p className="text-cyber-text/70">Sistema de Produtividade Cyberpunk</p>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Registro</TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-6">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-cyber-text">Nome de Usuário</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Digite seu nome de usuário" 
                              className="bg-cyber-dark-light border-cyber-cyan/50 text-cyber-text" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-cyber-text">Senha Mestra</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Digite sua senha mestra" 
                              className="bg-cyber-dark-light border-cyber-cyan/50 text-cyber-text" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-cyber-cyan hover:bg-cyber-cyan/80 text-cyber-dark font-bold"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Carregando..." : "ACESSAR SISTEMA"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              {/* Register Form */}
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-6">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-cyber-text">Nome de Usuário</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Crie seu nome de usuário" 
                              className="bg-cyber-dark-light border-cyber-cyan/50 text-cyber-text" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-cyber-text">Senha Mestra</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Crie sua senha mestra" 
                              className="bg-cyber-dark-light border-cyber-cyan/50 text-cyber-text" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-cyber-magenta hover:bg-cyber-magenta/80 text-cyber-text font-bold"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Registrando..." : "CRIAR NOVA CONTA"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Hero */}
        <div className="hidden md:flex md:w-1/2 bg-cyber-dark-light relative overflow-hidden items-center justify-center">
          <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-cyber-cyan to-cyber-magenta"></div>
          <div className="z-10 p-10 text-center">
            <h2 className="text-4xl font-bold mb-4 text-cyber-cyan">SISTEMA CYBERPUNK <span className="text-cyber-magenta">DE PRODUTIVIDADE</span></h2>
            <p className="text-cyber-text/80 mb-6 max-w-md mx-auto">
              Aumente sua produtividade com um sistema completo de anotações, tarefas, 
              links, ideias e ferramentas de IA, tudo em uma interface futurista.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-left">
              <div className="flex items-center text-cyber-cyan">
                <span className="mr-2">✓</span> Anotações e Tarefas
              </div>
              <div className="flex items-center text-cyber-cyan">
                <span className="mr-2">✓</span> Ideias e Links
              </div>
              <div className="flex items-center text-cyber-yellow">
                <span className="mr-2">✓</span> Banco de Prompts
              </div>
              <div className="flex items-center text-cyber-yellow">
                <span className="mr-2">✓</span> IA Assistentes
              </div>
              <div className="flex items-center text-cyber-green">
                <span className="mr-2">✓</span> Integrações Externas
              </div>
              <div className="flex items-center text-cyber-green">
                <span className="mr-2">✓</span> Tema Cyberpunk
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}