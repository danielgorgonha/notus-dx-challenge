/**
 * Autenticação server-side
 * Integração com Privy para autenticação no servidor
 * Seguindo padrão da documentação oficial Privy + Notus API
 */

import { cookies } from "next/headers";
import { PrivyClient } from "@privy-io/server-auth";
import { walletActions } from '../actions';
import { AuthUser } from '@/types/auth';

// Privy client server-side
const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!,
);


// Server-side authentication function that handles Privy auth and smart wallet setup
export async function auth(): Promise<AuthUser | null> {
  try {
    // Get Privy token from cookies
    const { get } = await cookies();
    const token = get("privy-id-token");
    if (!token) {
      return null;
    }

    // Get user from Privy
    let user = await privy.getUser({ idToken: token.value });

    console.log('🔍 User:', user);

    // Create wallet if user doesn't have one
    if (!user.wallet?.address) {
      user = await privy.createWallets({
        userId: user.id,
        createEthereumWallet: true,
      });
    }

    // Check if smart wallet exists
    const { wallet } = await walletActions.getAddress({
      externallyOwnedAccount: user.wallet?.address as string,
    });

    // Register smart wallet if it doesn't exist
    if (!wallet.registeredAt) {
      await walletActions.register({
        externallyOwnedAccount: user.wallet?.address as string,
      });
    }

    console.log('🔍 Wallet:', wallet.accountAbstraction);

    // Return user with smart wallet address
    return {
      ...user,
      accountAbstractionAddress: wallet.accountAbstraction,
    };
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return null;
  }
}
