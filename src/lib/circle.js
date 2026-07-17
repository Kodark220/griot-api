/**
 * Circle Programmable Wallets helper.
 *
 * Environment variables needed:
 *   CIRCLE_API_KEY=...
 *   CIRCLE_ENTITY_SECRET=...
 *   CIRCLE_WALLET_SET_ID=...
 *   CIRCLE_AGENT_WALLET_ID=...   (default agent wallet)
 */

import crypto from 'crypto';

const API_BASE = 'https://api.circle.com/v1/w3s';
const USDC_TOKEN_ID = 'ef87c8c3-85de-598a-af50-c5135eecfa74';

/**
 * RSA-OAEP encrypt the entity secret with Circle's public key.
 */
async function encryptEntitySecret(entitySecret, apiKey) {
  const resp = await fetch(`${API_BASE}/config/entity/publicKey`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const data = await resp.json();
  const pubKeyPem = data.data?.publicKey;
  if (!pubKeyPem) throw new Error('Failed to fetch Circle public key');

  return crypto.publicEncrypt(
    {
      key: pubKeyPem,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    Buffer.from(entitySecret, 'hex')
  ).toString('base64');
}

/**
 * Create a new wallet for a user (developer-controlled).
 * @param {string} userId - User identifier
 * @returns {Promise<object>} Wallet details
 */
export async function createWallet(userId) {
  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;
  if (!apiKey) {
    return { success: false, error: 'Circle API key not configured' };
  }

  const ciphertext = await encryptEntitySecret(entitySecret, apiKey);

  const resp = await fetch(`${API_BASE}/wallets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      idempotencyKey: `${userId}-${Date.now()}`,
      entitySecretCiphertext: ciphertext,
      walletSetId: process.env.CIRCLE_WALLET_SET_ID,
      blockchains: ['ARC-TESTNET'],
      count: 1,
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    return { success: false, error: `Circle API error: ${err}` };
  }

  const data = await resp.json();
  return { success: true, wallet: data.data.wallets[0] };
}

/**
 * Create a new embedded wallet (no user challenge) — used for reader wallets
 * and email-signup creators where there's no connected wallet to sign with.
 * @returns {Promise<{success: boolean, walletId?: string, address?: string, error?: string}>}
 */
export async function createEmbeddedWallet() {
  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;
  if (!apiKey) {
    return { success: false, error: 'Circle API key not configured' };
  }

  const ciphertext = await encryptEntitySecret(entitySecret, apiKey);

  const resp = await fetch(`${API_BASE}/wallets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      idempotencyKey: `embedded-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      entitySecretCiphertext: ciphertext,
      walletSetId: process.env.CIRCLE_WALLET_SET_ID,
      blockchains: ['ARC-TESTNET'],
      count: 1,
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    return { success: false, error: `Circle API error: ${err}` };
  }

  const data = await resp.json();
  const wallet = data.data?.wallets?.[0];
  if (!wallet) {
    return { success: false, error: 'No wallet returned from Circle' };
  }

  return {
    success: true,
    walletId: wallet.id,
    address: wallet.address,
  };
}

/**
 * Check wallet balance for USDC on Arc testnet.
 * @param {string} walletId - Circle wallet ID
 * @returns {Promise<object>}
 */
export async function checkBalance(walletId) {
  const apiKey = process.env.CIRCLE_API_KEY;
  if (!apiKey) {
    return { success: false, error: 'Circle API key not configured' };
  }

  const resp = await fetch(`${API_BASE}/wallets/${walletId}/balances`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!resp.ok) {
    const err = await resp.text();
    return { success: false, error: `Balance check error: ${err}` };
  }

  const data = await resp.json();
  const usdcBalance = data.data?.tokenBalances?.find(
    t => t.token.address === process.env.USDC_CONTRACT
  );

  return {
    success: true,
    usdc: usdcBalance?.amount || '0',
    chain: 'ARC-TESTNET',
  };
}

/**
 * Get wallet USDC balance as a number (for reader balance endpoint).
 * @param {string} walletId - Circle wallet ID
 * @returns {Promise<number>}
 */
export async function getWalletUsdcBalance(walletId) {
  const result = await checkBalance(walletId);
  if (!result.success) return 0;
  return parseFloat(result.usdc) / 1_000_000;
}

/**
 * Execute a USDC transfer from a specific wallet to a destination address.
 * Uses RSA-OAEP encrypted entity secret.
 */
export async function transferUsdc(sourceWalletId, destinationAddress, amount) {
  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;
  if (!apiKey) {
    return { success: false, error: 'Circle API key not configured' };
  }

  const atomicAmount = BigInt(Math.round(parseFloat(amount) * 1_000_000)).toString();
  const ciphertext = await encryptEntitySecret(entitySecret, apiKey);

  const resp = await fetch(`${API_BASE}/developer/transactions/transfer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      walletId: sourceWalletId,
      destinationAddress,
      amounts: [atomicAmount],
      feeLevel: 'MEDIUM',
      tokenId: USDC_TOKEN_ID,
      idempotencyKey: `${sourceWalletId}-${Date.now()}`,
      entitySecretCiphertext: ciphertext,
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    return { success: false, error: `Transfer error: ${err}` };
  }

  const data = await resp.json();
  const tx = data.data?.transaction;

  return {
    success: true,
    tx_hash: tx?.transactionHash || null,
    tx_id: tx?.id,
    amount,
    currency: 'USDC',
    status: tx?.state || 'PENDING',
  };
}

/**
 * Alias for transferUsdc — used by creator.js to keep code intent clear.
 */
export async function transferUsdcFromWallet(walletId, toAddress, amount) {
  return transferUsdc(walletId, toAddress, amount);
}

/**
 * Send a contract call via Circle's Programmable Wallets.
 * Uses the developer-controlled signing flow (no user challenge).
 * @param {string} walletId - Circle wallet ID to sign from
 * @param {string} contractAddress - Target contract
 * @param {string} abiFunction - Function signature e.g. "approve(address,uint256)"
 * @param {string[]} abiParams - Encoded parameter values
 * @returns {Promise<{success: boolean, tx_hash?: string, error?: string}>}
 */
export async function sendContractCall(walletId, contractAddress, abiFunction, abiParams) {
  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;
  if (!apiKey) {
    return { success: false, error: 'Circle API key not configured' };
  }

  const ciphertext = await encryptEntitySecret(entitySecret, apiKey);

  const resp = await fetch(`${API_BASE}/developer/transactions/contractExecution`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      walletId,
      contractAddress,
      abiFunctionSignature: abiFunction,
      abiParameters: abiParams,
      feeLevel: 'MEDIUM',
      idempotencyKey: `${walletId}-${Date.now()}`,
      entitySecretCiphertext: ciphertext,
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    return { success: false, error: `Contract execution error: ${err}` };
  }

  const data = await resp.json();
  const tx = data.data?.transaction;

  return {
    success: true,
    tx_hash: tx?.transactionHash || null,
    tx_id: tx?.id,
    status: tx?.state || 'PENDING',
  };
}
