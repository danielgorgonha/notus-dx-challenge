/**
 * Autenticação server-side
 * Integração com Privy para autenticação no servidor
 */

import { cookies } from "next/headers";
import { PrivyClient } from "@privy-io/server-auth";
import { notusAPI } from '../api/client';
import { AuthUser } from '@/types/auth';

// Privy client server-side
const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!,
);

const FACTORY_ADDRESS = "0x7a1dbab750f12a90eb1b60d2ae3ad17d4d81effe";

export async function auth(): Promise<AuthUser | null> {
  try {
    const { get } = await cookies();

    const token = get("privy-id-token");

    if (!token) {
      return null;
    }

    let user = await privy.getUser({ idToken: token.value });

    if (!user.wallet?.address) {
      user = await privy.createWallets({
        userId: user.id,
        createEthereumWallet: true,
      });
    }

    const { wallet } = await notusAPI.get<{
      wallet: { accountAbstraction: string; registeredAt: string | null };
    }>(`/wallets/address?externallyOwnedAccount=${user.wallet?.address}&factory=${FACTORY_ADDRESS}`);

    if (!wallet.registeredAt) {
      await notusAPI.post('/wallets/register', {
        externallyOwnedAccount: user.wallet?.address as string,
        factory: FACTORY_ADDRESS,
        salt: "0",
      });
    }

    return {
      ...user,
      accountAbstractionAddress: wallet.accountAbstraction,
    };
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return null;
  }
}
