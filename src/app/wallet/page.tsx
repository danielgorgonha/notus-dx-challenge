import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Copy, ExternalLink } from "lucide-react";

export default function WalletPage() {
  return (
    <DashboardLayout 
      title="Smart Wallet"
      description="Manage your smart wallet and view wallet details"
    >
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Wallet Info */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Wallet className="h-5 w-5 mr-2" />
              Wallet Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-slate-400 text-sm">Smart Wallet Address</label>
              <div className="flex items-center mt-1">
                <code className="text-white bg-white/10 px-3 py-2 rounded-lg text-sm flex-1">
                  0x1234567890abcdef1234567890abcdef12345678
                </code>
                <Button size="sm" variant="ghost" className="ml-2">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <label className="text-slate-400 text-sm">EOA Address</label>
              <div className="flex items-center mt-1">
                <code className="text-white bg-white/10 px-3 py-2 rounded-lg text-sm flex-1">
                  0xabcdef1234567890abcdef1234567890abcdef12
                </code>
                <Button size="sm" variant="ghost" className="ml-2">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="pt-4">
              <Button className="w-full btn-primary">
                <ExternalLink className="mr-2 h-4 w-4" />
                View on Explorer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Actions */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white">Wallet Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20">
              Create New Wallet
            </Button>
            <Button className="w-full bg-emerald-600/10 border border-emerald-500/20 hover:bg-emerald-600/20">
              Import Wallet
            </Button>
            <Button className="w-full bg-purple-600/10 border border-purple-500/20 hover:bg-purple-600/20">
              Export Private Key
            </Button>
            <Button className="w-full bg-red-600/10 border border-red-500/20 hover:bg-red-600/20">
              Disconnect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
