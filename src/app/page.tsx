"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  ArrowRightLeft,
  Droplets,
  Shield,
  Lock,
  Zap,
  TrendingUp,
  CheckCircle,
  Code,
  BarChart3,
  Globe,
  Users,
  Smartphone,
  CreditCard,
  MapPin,
  Star,
  ChevronDown,
  ExternalLink
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const { ready, authenticated, user, login } = usePrivy();
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [hasRedirected, setHasRedirected] = useState(false);

  // Handler para login com callback
  const handleLogin = async () => {
    try {
      await login();
      // Após login, o Privy vai atualizar o estado authenticated
      // Não fazer redirect aqui, deixar o useEffect fazer
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  // Se o usuário já estiver autenticado, redirecionar para o dashboard
  useEffect(() => {
    if (ready && authenticated && user) {
      console.log('✅ User authenticated, redirecting to dashboard...', {
        ready,
        authenticated,
        hasUser: !!user,
        userId: user?.id,
        hasRedirected
      });
      
      // Reset hasRedirected se ainda não redirecionou
      if (!hasRedirected) {
        setHasRedirected(true);
        // Pequeno delay para garantir que o Privy finalizou a autenticação
        const timer = setTimeout(() => {
          router.replace("/dashboard");
        }, 300);
        
        return () => clearTimeout(timer);
      }
    }
  }, [ready, authenticated, user, router, hasRedirected]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl mx-auto mb-4 flex items-center justify-center animate-pulse">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <p className="text-white text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  const faqs = [
    {
      q: "É realmente grátis?",
      a: "Sim. Criação de carteira, transfers e swaps não cobram taxa adicional. Você paga apenas o gas da rede (que cobrimos em muitos casos)."
    },
    {
      q: "Como adiciono dinheiro?",
      a: "Via PIX, cartão de crédito ou transferindo de outra carteira. Suportamos múltiplas formas de depósito."
    },
    {
      q: "Posso perder meus fundos?",
      a: "Não se você mantiver seu dispositivo seguro. Como a chave fica com você, nem nós podemos acessar. É sua responsabilidade (e seu controle total)."
    },
    {
      q: "Funciona fora do Brasil?",
      a: "Sim! Sua carteira funciona globalmente. Ideal para receber de turistas ou pagar no exterior."
    },
    {
      q: "Preciso entender de cripto?",
      a: "Não. Fizemos tudo para parecer um app de pagamento comum. A tecnologia fica invisível."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-green-800">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-green-900/80 backdrop-blur-xl border-b border-yellow-400/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center mr-3">
                <Lock className="h-5 w-5 text-green-900" />
              </div>
              <div>
                <div className="font-bold text-white text-lg">Notus</div>
                <div className="text-yellow-200 text-xs">Carteira Digital</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-300 border-yellow-400/30">
                🇧🇷 Suporte BR
              </Badge>
              <Button
                size="sm"
                className="bg-yellow-400 hover:bg-yellow-500 text-green-900 font-bold"
                onClick={() => {
                  if (authenticated) {
                    router.replace("/dashboard");
                  } else {
                    handleLogin();
                  }
                }}
              >
                <Shield className="mr-2 h-4 w-4" />
                Começar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center px-4 bg-gradient-to-br from-green-900 via-blue-900 to-green-800">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Sua carteira digital.
            <span className="text-yellow-400 block mt-2">Simples como deveria ser.</span>
          </h1>
          
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Pague, receba e troque criptomoedas sem complicação.
            Feito no Brasil, pensado para você.
          </p>
          
          <button 
            className="bg-yellow-400 hover:bg-yellow-500 text-green-900 font-bold text-lg px-8 py-4 rounded-lg transition-all transform hover:scale-105"
            onClick={() => {
              if (authenticated) {
                router.replace("/dashboard");
              } else {
                handleLogin();
              }
            }}
          >
            Criar Carteira Grátis
          </button>
          
          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-blue-200">
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4" /> Autocustodial
            </span>
            <span className="flex items-center gap-2">
              🇧🇷 Suporte BR
            </span>
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4" /> Gratuito
            </span>
          </div>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section className="py-20 bg-blue-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Como Funciona</h2>
            <p className="text-blue-100 text-lg">Três passos simples para começar</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass-card text-center bg-green-800/20 border-green-400/20">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <Smartphone className="h-8 w-8 text-green-900" />
                </div>
                <CardTitle className="text-white text-xl">1. Login Simples</CardTitle>
                <CardDescription className="text-blue-100">
                  Entre com Google ou Email. Sem seed phrases pra decorar.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card text-center bg-blue-800/20 border-blue-400/20">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-white text-xl">2. Carteira Segura</CardTitle>
                <CardDescription className="text-blue-100">
                  Sua carteira é criada na hora. Segura e só sua.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card text-center bg-yellow-800/20 border-yellow-400/20">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <ArrowRightLeft className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-white text-xl">3. Use Normalmente</CardTitle>
                <CardDescription className="text-blue-100">
                  Transfira, troque, adicione liquidez. Tudo em um só lugar.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Para Quem É Section */}
      <section className="py-20 bg-green-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Para Quem É</h2>
            <p className="text-green-100 text-lg">Feito para diferentes necessidades</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass-card text-center hover:scale-105 transition-transform bg-yellow-800/20 border-yellow-400/20">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-green-900" />
                </div>
                <CardTitle className="text-white">Turistas em Floripa</CardTitle>
                <CardDescription className="text-green-100">
                  Receba pagamentos sem taxa de câmbio
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card text-center hover:scale-105 transition-transform bg-blue-800/20 border-blue-400/20">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <CreditCard className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-white">Freelancers</CardTitle>
                <CardDescription className="text-green-100">
                  Receba de clientes do exterior
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card text-center hover:scale-105 transition-transform bg-green-800/20 border-green-400/20">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-white">Iniciantes em Cripto</CardTitle>
                <CardDescription className="text-green-100">
                  Primeira carteira sem medo
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Segurança Explicada Section */}
      <section className="py-20 bg-blue-900">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Sua chave privada fica <span className="text-yellow-400">SÓ</span> com você
          </h2>
          
          <div className="bg-green-800/20 border border-green-400/20 rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center">
                <Lock className="h-10 w-10 text-green-900" />
              </div>
            </div>
            <p className="text-blue-100 text-lg">
              Nem nós temos acesso aos seus fundos.
              Sua carteira usa tecnologia auditada e open-source.
            </p>
          </div>
          
          <details className="text-left bg-green-800/20 border border-green-400/20 rounded-lg p-6">
            <summary className="cursor-pointer font-semibold text-white">
              Como isso funciona tecnicamente?
            </summary>
            <p className="mt-4 text-blue-200 text-sm">
              Usamos Account Abstraction (ERC-4337) com fragmentação de chave.
              Sua chave é dividida e armazenada em múltiplos locais seguros,
              reconstruída apenas no momento da transação.
            </p>
          </details>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-green-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">FAQ Rápido</h2>
            <p className="text-green-100 text-lg">Perguntas que todo mundo faz</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="glass-card bg-blue-800/20 border-blue-400/20">
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold">{faq.q}</h3>
                    <ChevronDown 
                      className={`h-5 w-5 text-blue-200 transition-transform ${
                        openFaq === index ? 'rotate-180' : ''
                      }`} 
                    />
                  </div>
                </CardHeader>
                {openFaq === index && (
                  <CardContent>
                    <p className="text-green-100">{faq.a}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-yellow-400 to-yellow-500">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-green-900 mb-6">
            Pronto pra começar?
          </h2>
          <p className="text-green-800 text-lg mb-8">
            Crie sua carteira em menos de 2 minutos
          </p>
          <button 
            className="bg-green-900 hover:bg-green-800 text-white font-bold text-lg px-8 py-4 rounded-lg transition-all transform hover:scale-105"
            onClick={() => {
              if (authenticated) {
                router.replace("/dashboard");
              } else {
                handleLogin();
              }
            }}
          >
            Criar Minha Carteira Agora
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-900/80 backdrop-blur-xl border-t border-yellow-400/20">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-blue-200">
            <p className="mb-2 text-lg">Notus - Carteira Digital</p>
            <p className="text-sm">Feito no Brasil, pensado para você</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
