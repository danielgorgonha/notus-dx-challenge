import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AppLayout } from "@/components/layout/app-layout";
import { WalletInfo } from "@/components/wallet/wallet-info";
import { WalletFeatures } from "@/components/wallet/wallet-features";

export const dynamic = 'force-dynamic';

export default async function WalletPage() {
  const user = await auth();

  if (!user) {
    redirect("/");
  }

  return (
    <AppLayout 
      title="Carteira Inteligente"
      description="Gerencie sua carteira inteligente e visualize detalhes da carteira"
    >
      <div className="space-y-8">
        <WalletInfo user={user} />
        <WalletFeatures />
      </div>
    </AppLayout>
  );
}