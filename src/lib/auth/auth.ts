import { cookies } from "next/headers";
import { privy } from "./server";
import { AuthUser } from "@/types";
import { getWalletAddress, registerWallet } from "../actions/wallet";


// Server-side authentication function that handles Privy auth and smart wallet setup
export async function auth(): Promise<AuthUser | null> {
  try {
    // Get Privy token from cookies
    const { get } = await cookies();
    
    const token = get("privy-token");

    if (!token) {
      // Log apenas em produção se necessário (evitar spam de logs)
      return null;
    }

    const authToken = await privy.verifyAuthToken(token.value);

    if (!authToken) {
      console.error('❌ Auth: Token verification failed');
      return null;
    }

    let user = await privy.getUserById(authToken.userId);

    if (!user) {
      console.error('❌ Auth: User not found');
      return null;
    }

    // Create wallet if user doesn't have one
    if (!user.wallet?.address) {
      try {
        user = await privy.createWallets({
          userId: user.id,
          createEthereumWallet: true,
        });
      } catch (error) {
        console.error('❌ Auth: Error creating wallet:', error);
        // Continuar mesmo se a criação da wallet falhar - o usuário já está autenticado
      }
    }

    // Se ainda não tiver wallet após tentar criar, retornar null
    if (!user.wallet?.address) {
      console.error('❌ Auth: User has no wallet address');
      return null;
    }

    // Check if smart wallet exists
    let wallet;
    try {
      const walletData = await getWalletAddress({
        externallyOwnedAccount: user.wallet.address as string,
      });
      wallet = walletData.wallet;
    } catch (error) {
      console.error('❌ Auth: Error getting wallet address:', error);
      // Retornar user básico sem smart wallet se falhar
      return {
        ...user,
        accountAbstractionAddress: undefined,
      };
    }

    // Register smart wallet if it doesn't exist
    if (!wallet?.registeredAt) {
      try {
        await registerWallet({
          externallyOwnedAccount: user.wallet.address as string,
          factory: '0x7a1dbab750f12a90eb1b60d2ae3ad17d4d81effe',
          salt: '0',
        });
        // Buscar novamente após registrar
        const walletData = await getWalletAddress({
          externallyOwnedAccount: user.wallet.address as string,
        });
        wallet = walletData.wallet;
      } catch (error) {
        console.error('❌ Auth: Error registering wallet:', error);
        // Continuar mesmo se o registro falhar
      }
    }

    // Return user with smart wallet address
    return {
      ...user,
      accountAbstractionAddress: wallet?.accountAbstraction,
    };
  } catch (error) {
    console.error('❌ Auth: Unexpected error:', error);
    return null;
  }
}
