import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, ArrowRightLeft, Droplets, Shield } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Notus DX Challenge
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Testing Notus API for Developer Experience research. 
            Explore Web3 functionality through a unified dashboard.
          </p>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            NotusLabs DX Research
          </Badge>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Wallet className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Smart Wallet</CardTitle>
              <CardDescription>
                Create and manage smart wallets with Privy integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Web3 authentication</li>
                <li>• Wallet creation</li>
                <li>• Portfolio tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <ArrowRightLeft className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Transfers & Swaps</CardTitle>
              <CardDescription>
                Execute transfers and token swaps seamlessly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Cross-wallet transfers</li>
                <li>• Token swaps</li>
                <li>• Transaction history</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Droplets className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Liquidity Pools</CardTitle>
              <CardDescription>
                Interact with DeFi liquidity pools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Add/remove liquidity</li>
                <li>• Pool analytics</li>
                <li>• Yield tracking</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Test?</CardTitle>
              <CardDescription>
                Start exploring the Notus API functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="w-full">
                <Shield className="mr-2 h-4 w-4" />
                Begin Testing
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 dark:text-gray-400">
          <p>NotusLabs DX Research • 10 Days Challenge</p>
        </footer>
      </div>
    </div>
  );
}
