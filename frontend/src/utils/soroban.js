import * as StellarSdk from '@stellar/stellar-sdk';
import { signAndSubmitTransaction, NETWORK_PASSPHRASE, RPC_URL } from './stellar';

const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID;

// Initialize Soroban Server
const server = new StellarSdk.rpc.Server(RPC_URL);

// Helper: Convert choice to contract format
export function choiceToScVal(choice) {
  const choices = {
    'Rock': 0,
    'Paper': 1,
    'Scissors': 2
  };
  return StellarSdk.nativeToScVal(choices[choice], { type: 'u32' });
}

// Create Game Function
export async function createGame(playerAddress, betAmount, choice) {
  try {
    const account = await server.getAccount(playerAddress);
    
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE
    })
      .addOperation(
        contract.call(
          'create_game',
          StellarSdk.Address.fromString(playerAddress).toScVal(),
          StellarSdk.nativeToScVal(betAmount, { type: 'i128' }),
          choiceToScVal(choice)
        )
      )
      .setTimeout(30)
      .build();
    
    const preparedTransaction = await server.prepareTransaction(transaction);
    const xdr = preparedTransaction.toXDR();
    
    const result = await signAndSubmitTransaction(xdr);
    return result;
  } catch (error) {
    console.error('Create game error:', error);
    throw error;
  }
}

// Join Game Function
export async function joinGame(gameId, playerAddress, choice) {
  try {
    const account = await server.getAccount(playerAddress);
    
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE
    })
      .addOperation(
        contract.call(
          'join_game',
          StellarSdk.nativeToScVal(gameId, { type: 'u64' }),
          StellarSdk.Address.fromString(playerAddress).toScVal(),
          choiceToScVal(choice)
        )
      )
      .setTimeout(30)
      .build();
    
    const preparedTransaction = await server.prepareTransaction(transaction);
    const xdr = preparedTransaction.toXDR();
    
    const result = await signAndSubmitTransaction(xdr);
    return result;
  } catch (error) {
    console.error('Join game error:', error);
    throw error;
  }
}

// Complete Game Function
export async function completeGame(gameId, playerAddress) {
  try {
    const account = await server.getAccount(playerAddress);
    
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE
    })
      .addOperation(
        contract.call(
          'complete_game',
          StellarSdk.nativeToScVal(gameId, { type: 'u64' })
        )
      )
      .setTimeout(30)
      .build();
    
    // const preparedTransaction = await server.prepareTransaction(transaction);
    const preparedTransaction = transaction;
    const xdr = preparedTransaction.toXDR();
    
    const result = await signAndSubmitTransaction(xdr);
    return result;
  } catch (error) {
    console.error('Complete game error:', error);
    throw error;
  }
}

// View Game Function
export async function viewGame(gameId) {
  try {
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    
    // Create a temporary account for read-only operation
    const sourceAccount = StellarSdk.Keypair.random();
    const account = new StellarSdk.Account(sourceAccount.publicKey(), '0');
    
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE
    })
      .addOperation(
        contract.call(
          'view_game',
          StellarSdk.nativeToScVal(gameId, { type: 'u64' })
        )
      )
      .setTimeout(30)
      .build();
    
    const result = await server.sendTransaction(transaction);
    
    if (result.results && result.results.length > 0) {
      return StellarSdk.scValToNative(result.results[0].xdr);
    }
    
    throw new Error('Failed to fetch game data');
  } catch (error) {
    console.error('View game error:', error);
    throw error;
  }
}