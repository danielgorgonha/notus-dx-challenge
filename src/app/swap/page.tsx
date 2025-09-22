import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRightLeft, ArrowDown } from "lucide-react";

export default function SwapPage() {
  return (
    <DashboardLayout 
      title="Swap & Transfer"
      description="Exchange tokens and transfer assets"
    >
      <div className="max-w-2xl mx-auto">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <ArrowRightLeft className="h-5 w-5 mr-2" />
              Token Swap
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* From Token */}
            <div>
              <label className="text-slate-400 text-sm mb-2 block">From</label>
              <div className="flex gap-2">
                <Button className="bg-blue-600/20 border border-blue-500/30 text-white">
                  USDC
                </Button>
                <Input 
                  placeholder="0.0" 
                  className="flex-1 bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="text-right text-slate-400 text-sm mt-1">
                Balance: 1,250.00 USDC
              </div>
            </div>

            {/* Swap Arrow */}
            <div className="flex justify-center">
              <Button size="sm" className="bg-white/10 hover:bg-white/20">
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>

            {/* To Token */}
            <div>
              <label className="text-slate-400 text-sm mb-2 block">To</label>
              <div className="flex gap-2">
                <Button className="bg-purple-600/20 border border-purple-500/30 text-white">
                  ETH
                </Button>
                <Input 
                  placeholder="0.0" 
                  className="flex-1 bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="text-right text-slate-400 text-sm mt-1">
                Balance: 0.875 ETH
              </div>
            </div>

            {/* Swap Details */}
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Rate</span>
                <span className="text-white">1 USDC = 0.00045 ETH</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Slippage</span>
                <span className="text-white">0.5%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Network Fee</span>
                <span className="text-white">~$2.50</span>
              </div>
            </div>

            {/* Swap Button */}
            <Button className="w-full btn-primary">
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Swap Tokens
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
