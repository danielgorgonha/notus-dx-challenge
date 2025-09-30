/**
 * Autenticação server-side
 * Integração com Privy para autenticação no servidor
 * Seguindo padrão da documentação oficial Privy + Notus API
 */
import 'server-only';
import { PrivyClient } from "@privy-io/server-auth";

// Privy client server-side
export const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!,
);
