import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, ArrowRightLeft, Droplets, Wallet, ExternalLink } from "lucide-react";

export default function HistoryPage() {
  return (
    <AppLayout 
      title="Histórico"
      description="Visualize suas transações e atividades passadas"
    >
      <div className="space-y-8">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <History className="h-5 w-5 mr-2" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Transaction 1 */}
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
              <Button size="sm" variant="ghost" className="ml-4">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>

            {/* Transaction 2 */}
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
              <Button size="sm" variant="ghost" className="ml-4">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>

            {/* Transaction 3 */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center mr-3">
                  <Wallet className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <div className="font-semibold text-white">Transfer ETH</div>
                  <div className="text-slate-400 text-sm">3 hours ago</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-white">-0.25 ETH</div>
                <div className="text-slate-400 text-sm">To: 0xabcd...1234</div>
              </div>
              <Button size="sm" variant="ghost" className="ml-4">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>

            {/* Transaction 4 */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-yellow-600/20 rounded-full flex items-center justify-center mr-3">
                  <Droplets className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <div className="font-semibold text-white">Remove Liquidity USDT/USDC</div>
                  <div className="text-slate-400 text-sm">1 day ago</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-white">-8.2 LP</div>
                <div className="text-slate-400 text-sm">Pool withdrawal</div>
              </div>
              <Button size="sm" variant="ghost" className="ml-4">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>

            {/* Transaction 5 */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-emerald-600/20 rounded-full flex items-center justify-center mr-3">
                  <ArrowRightLeft className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <div className="font-semibold text-white">Swap ETH → USDC</div>
                  <div className="text-slate-400 text-sm">2 days ago</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-white">+2,100 USDC</div>
                <div className="text-slate-400 text-sm">-0.875 ETH</div>
              </div>
              <Button size="sm" variant="ghost" className="ml-4">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Load More Button */}
          <div className="mt-6 text-center">
            <Button variant="ghost" className="text-blue-400 hover:text-blue-300">
              Load More Transactions
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </AppLayout>
  );
}
