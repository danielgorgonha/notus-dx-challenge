import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, TrendingUp, Activity } from "lucide-react";

export default function LiquidityPage() {
  return (
    <DashboardLayout 
      title="Liquidity Pools"
      description="Add liquidity to pools and earn rewards"
    >
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Available Pools */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Available Pools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold mr-2">
                    USDC
                  </div>
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold -ml-2">
                    ETH
                  </div>
                  <span className="text-white font-semibold ml-2">USDC/ETH</span>
                </div>
                <span className="text-emerald-400 text-sm">12.5% APR</span>
              </div>
              <div className="flex justify-between text-sm text-slate-400 mb-3">
                <span>TVL: $2.4M</span>
                <span>24h Volume: $847K</span>
              </div>
              <Button className="w-full bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20">
                Add Liquidity
              </Button>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-white text-xs font-semibold mr-2">
                    USDT
                  </div>
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold -ml-2">
                    USDC
                  </div>
                  <span className="text-white font-semibold ml-2">USDT/USDC</span>
                </div>
                <span className="text-emerald-400 text-sm">8.2% APR</span>
              </div>
              <div className="flex justify-between text-sm text-slate-400 mb-3">
                <span>TVL: $1.8M</span>
                <span>24h Volume: $623K</span>
              </div>
              <Button className="w-full bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20">
                Add Liquidity
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* My Positions */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              My Positions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-semibold">USDC/ETH Pool</span>
                <span className="text-emerald-400 text-sm">+$127.50</span>
              </div>
              <div className="text-sm text-slate-400 mb-3">
                LP Tokens: 12.5 • Value: $1,247.50
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 bg-emerald-600/10 border border-emerald-500/20 hover:bg-emerald-600/20">
                  Add More
                </Button>
                <Button size="sm" className="flex-1 bg-red-600/10 border border-red-500/20 hover:bg-red-600/20">
                  Remove
                </Button>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-semibold">USDT/USDC Pool</span>
                <span className="text-emerald-400 text-sm">+$45.20</span>
              </div>
              <div className="text-sm text-slate-400 mb-3">
                LP Tokens: 8.2 • Value: $845.20
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 bg-emerald-600/10 border border-emerald-500/20 hover:bg-emerald-600/20">
                  Add More
                </Button>
                <Button size="sm" className="flex-1 bg-red-600/10 border border-red-500/20 hover:bg-red-600/20">
                  Remove
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
