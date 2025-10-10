"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Zap,
  Shield,
  TrendingUp,
  Activity,
  Settings,
  QrCode,
  Smartphone,
  BarChart3,
  DollarSign,
  Clock
} from "lucide-react";

export function WalletFeatures() {
  const features = [
    {
      icon: Shield,
      title: "Abstração de Conta",
      description: "Carteira inteligente ERC-4337 com transações sem gas e segurança avançada",
      gradient: "from-emerald-600/20 to-green-600/20",
      border: "border-emerald-500/30",
      iconBg: "bg-emerald-500/20",
      iconColor: "text-emerald-400"
    },
    {
      icon: TrendingUp,
      title: "Acompanhamento de Portfólio",
      description: "Saldos de tokens em tempo real, valor do portfólio e análises de desempenho",
      gradient: "from-blue-600/20 to-cyan-600/20",
      border: "border-blue-500/30",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400"
    },
    {
      icon: Activity,
      title: "Histórico de Transações",
      description: "Histórico completo de transações com análises detalhadas e insights",
      gradient: "from-purple-600/20 to-pink-600/20",
      border: "border-purple-500/30",
      iconBg: "bg-purple-500/20",
      iconColor: "text-purple-400"
    },
    {
      icon: DollarSign,
      title: "Transações Sem Gas",
      description: "Execute transações sem precisar de ETH para gas fees",
      gradient: "from-orange-600/20 to-red-600/20",
      border: "border-orange-500/30",
      iconBg: "bg-orange-500/20",
      iconColor: "text-orange-400"
    },
    {
      icon: Clock,
      title: "Execução Agendada",
      description: "Agende transações para execução em horários específicos",
      gradient: "from-indigo-600/20 to-blue-600/20",
      border: "border-indigo-500/30",
      iconBg: "bg-indigo-500/20",
      iconColor: "text-indigo-400"
    },
    {
      icon: BarChart3,
      title: "Analytics Avançado",
      description: "Relatórios detalhados de gastos e padrões de uso",
      gradient: "from-teal-600/20 to-emerald-600/20",
      border: "border-teal-500/30",
      iconBg: "bg-teal-500/20",
      iconColor: "text-teal-400"
    }
  ];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg mr-3">
            <Zap className="h-6 w-6 text-white" />
          </div>
          Recursos da Carteira Inteligente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={index}
                className={`p-4 bg-gradient-to-br ${feature.gradient} rounded-xl border ${feature.border} hover:scale-105 transition-transform duration-200`}
              >
                <div className="flex items-center mb-3">
                  <div className={`p-2 ${feature.iconBg} rounded-lg mr-3`}>
                    <IconComponent className={`h-5 w-5 ${feature.iconColor}`} />
                  </div>
                  <span className="text-white font-semibold">{feature.title}</span>
                </div>
                <p className="text-slate-300 text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <h3 className="text-white font-semibold mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Ações Rápidas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              <QrCode className="h-4 w-4 mr-2" />
              Gerar QR Code
            </Button>
            <Button 
              variant="outline" 
              className="bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Conectar Mobile
            </Button>
            <Button 
              variant="outline" 
              className="bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}