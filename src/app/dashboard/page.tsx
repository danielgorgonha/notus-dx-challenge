import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { TrendingUp, Activity, Zap, ArrowRightLeft, Wallet, Droplets, Shield } from "lucide-react";

export default async function DashboardPage() {
  const user = await auth();

  console.log('user', user);

  if (!user) {
    redirect("/");
  }

  return (
    <AppLayout 
      title="Dashboard"
      description="Testing Notus API - Authentication, Transfers, Swaps, and Liquidity Pools"
    >
      <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">$3,247.82</div>
          <div className="text-slate-400 text-sm mb-1">Total Balance</div>
          <div className="text-emerald-400 text-sm">+12.5%</div>
        </div>

        <div className="glass-card text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">$1,847.23</div>
          <div className="text-slate-400 text-sm mb-1">24h Volume</div>
          <div className="text-red-400 text-sm">-3.2%</div>
        </div>

        <div className="glass-card text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">7</div>
          <div className="text-slate-400 text-sm mb-1">Active Pools</div>
          <div className="text-emerald-400 text-sm">+2</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Portfolio */}
        <div className="glass-card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Portfolio</h2>
            <Button variant="ghost" className="text-blue-400 hover:text-blue-300">
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                  USDC
                </div>
                <div>
                  <div className="font-semibold text-white">USD Coin</div>
                  <div className="text-slate-400 text-sm">1,250.00 USDC</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-white">$1,250.00</div>
                <div className="text-emerald-400 text-sm">+0.1%</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                  ETH
                </div>
                <div>
                  <div className="font-semibold text-white">Ethereum</div>
                  <div className="text-slate-400 text-sm">0.875 ETH</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-white">$1,997.82</div>
                <div className="text-emerald-400 text-sm">+5.2%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card">
          <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Button className="h-24 flex flex-col items-center justify-center bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20">
              <ArrowRightLeft className="h-8 w-8 text-blue-400 mb-2" />
              <span className="font-semibold text-white">Swap</span>
              <span className="text-xs text-slate-400">Exchange tokens</span>
            </Button>

            <Button className="h-24 flex flex-col items-center justify-center bg-emerald-600/10 border border-emerald-500/20 hover:bg-emerald-600/20">
              <Wallet className="h-8 w-8 text-emerald-400 mb-2" />
              <span className="font-semibold text-white">Send</span>
              <span className="text-xs text-slate-400">Transfer tokens</span>
            </Button>

            <Button className="h-24 flex flex-col items-center justify-center bg-purple-600/10 border border-purple-500/20 hover:bg-purple-600/20">
              <Droplets className="h-8 w-8 text-purple-400 mb-2" />
              <span className="font-semibold text-white">Pool</span>
              <span className="text-xs text-slate-400">Add liquidity</span>
            </Button>

            <Button className="h-24 flex flex-col items-center justify-center bg-yellow-600/10 border border-yellow-500/20 hover:bg-yellow-600/20">
              <Shield className="h-8 w-8 text-yellow-400 mb-2" />
              <span className="font-semibold text-white">KYC</span>
              <span className="text-xs text-slate-400">Verify identity</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass-card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
          <Button variant="ghost" className="text-blue-400 hover:text-blue-300">
            View All
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-emerald-600/20 rounded-full flex items-center justify-center mr-3">
                <ArrowRightLeft className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <div className="font-semibold text-white">Swap USDC → ETH</div>
                <div className="text-slate-400 text-sm">2 minutes ago</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-white">+0.45 ETH</div>
              <div className="text-slate-400 text-sm">-1,000 USDC</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center mr-3">
                <Droplets className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <div className="font-semibold text-white">Add Liquidity USDC/ETH</div>
                <div className="text-slate-400 text-sm">1 hour ago</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-white">+12.5 LP</div>
              <div className="text-slate-400 text-sm">Pool deposit</div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </AppLayout>
  );
}
