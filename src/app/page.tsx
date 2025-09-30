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
  Users
} from "lucide-react";
import { redirect } from "next/navigation";

export default function LandingPage() {
  const { ready, authenticated, user, login } = usePrivy();

  // Se o usuário já estiver autenticado, redirecionar para o dashboard
  if (ready && authenticated && user) {
    redirect("/dashboard");
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-xl mx-auto mb-4 flex items-center justify-center animate-pulse">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-xl flex items-center justify-center mr-3">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-white text-lg">Notus DX</div>
                <div className="text-slate-400 text-xs">Challenge</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 border-blue-500/30">
                NotusLabs DX Research
              </Badge>
              <Button
                size="sm"
                className="btn-primary"
                onClick={login}
              >
                <Shield className="mr-2 h-4 w-4" />
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-32 pb-20">
        <div className="text-center mb-20">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6">
            <span className="text-blue-400">Notus API</span><br />
            <span className="text-white">Testing Made Simple</span>
          </h1>
          <p className="text-xl text-slate-300 mb-12 max-w-4xl mx-auto">
            Test Web3 functionality through a unified dashboard.
            Experience the future of blockchain APIs with comprehensive testing tools.
          </p>

        </div>

        {/* API Features Section */}
        <div id="features" className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Notus API Features</h2>
            <p className="text-slate-300 text-lg">What we&apos;re testing from the Notus API</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-card text-center hover:scale-105 transition-transform">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <Wallet className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-white">Smart Wallet</CardTitle>
                <CardDescription className="text-slate-300">
                  Account Abstraction & Wallet Management
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card text-center hover:scale-105 transition-transform">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <ArrowRightLeft className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-white">Cross-Chain Swaps</CardTitle>
                <CardDescription className="text-slate-300">
                  Seamless Token Exchanges
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card text-center hover:scale-105 transition-transform">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <Droplets className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-white">Liquidity Pools</CardTitle>
                <CardDescription className="text-slate-300">
                  DeFi Pool Management
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card text-center hover:scale-105 transition-transform">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-white">Portfolio Tracking</CardTitle>
                <CardDescription className="text-slate-300">
                  Real-time Analytics
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Our Features Section */}
        <div id="about" className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Our Testing Platform</h2>
            <p className="text-slate-300 text-lg">What our dApp offers for comprehensive API testing</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="glass-card">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white">Unified Dashboard</CardTitle>
                <CardDescription className="text-slate-300">
                  Single interface to test all Notus API endpoints
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-slate-400 space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-400 mr-2" />
                    Real-time testing
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-400 mr-2" />
                    Interactive UI
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-400 mr-2" />
                    Error handling
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                  <Code className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white">Developer Experience</CardTitle>
                <CardDescription className="text-slate-300">
                  Focus on API usability and developer feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-slate-400 space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-400 mr-2" />
                    API documentation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-400 mr-2" />
                    Code examples
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-400 mr-2" />
                    Best practices
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white">Research Focus</CardTitle>
                <CardDescription className="text-slate-300">
                  Contributing to NotusLabs DX Research program
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-slate-400 space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-400 mr-2" />
                  Feedback collection
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-400 mr-2" />
                  Performance metrics
          </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-400 mr-2" />
                  UX insights
          </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900/80 backdrop-blur-xl border-t border-white/10 mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-slate-400">
            <p className="mb-2 text-lg">NotusLabs DX Research</p>
            <p className="text-sm">Testing Notus API for Developer Experience research</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
