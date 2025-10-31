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
      return null;
    }

    const authToken = await privy.verifyAuthToken(token.value);

		if (!authToken) {
			return null;
		}

		let user = await privy.getUserById(authToken.userId);


    // Create wallet if user doesn't have one
    if (!user.wallet?.address) {
      user = await privy.createWallets({
        userId: user.id,
        createEthereumWallet: true,
      });
    }

    // Check if smart wallet exists
    const { wallet } = await getWalletAddress({
      externallyOwnedAccount: user.wallet?.address as string,
    });

    // Register smart wallet if it doesn't exist
    if (!wallet.registeredAt) {
      await registerWallet({
        externallyOwnedAccount: user.wallet?.address as string,
        factory: '0x7a1dbab750f12a90eb1b60d2ae3ad17d4d81effe',
        salt: '0',
      });
    }


    // Return user with smart wallet address
    return {
      ...user,
      accountAbstractionAddress: wallet.accountAbstraction,
    };
  } catch (error) {
    return null;
  }
}
