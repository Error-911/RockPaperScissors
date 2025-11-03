import * as StellarSdk from '@stellar/stellar-sdk';
import { isConnected, getAddress, isAllowed, requestAccess, signTransaction } from '@stellar/freighter-api';

export const NETWORK_PASSPHRASE = import.meta.env.VITE_NETWORK_PASSPHRASE;
export const RPC_URL = import.meta.env.VITE_STELLAR_RPC_URL;

// Connect to Freighter Wallet
export async function connectWallet() {
  try {
    const connected = await isConnected();
    if (!connected) {
      throw new Error('Freighter wallet is not installed');
    }

    await requestAccess()
    
    const publicKey = await getAddress();
    return publicKey;
  } catch (error) {
    console.error('Wallet connection error:', error);
    throw error;
  }
}

// Sign and submit transaction
export async function signAndSubmitTransaction(xdr) {
  try {
    const signedXDR = await signTransaction(xdr, {
      network: NETWORK_PASSPHRASE,
      networkPassphrase: NETWORK_PASSPHRASE
    });
    
    const server = new StellarSdk.SorobanRpc.Server(RPC_URL);
    const transaction = StellarSdk.TransactionBuilder.fromXDR(
      signedXDR,
      NETWORK_PASSPHRASE
    );
    
    const response = await server.sendTransaction(transaction);
    return response;
  } catch (error) {
    console.error('Transaction error:', error);
    throw error;
  }
}