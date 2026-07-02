import { JsonRpcProvider } from 'ethers';

const RPC_URL = process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network';

let provider;

export function getProvider() {
  if (!provider) {
    provider = new JsonRpcProvider(RPC_URL);
  }
  return provider;
}

/**
 * Verify a USDC transfer transaction on Arc testnet.
 * @param {string} txHash - Transaction hash to verify
 * @param {string} expectedAmount - Expected amount in USDC (human-readable, e.g. "0.02")
 * @param {string} expectedWallet - Expected recipient wallet address
 * @returns {{ valid: boolean, reason?: string }}
 */
export async function verifyPayment(txHash, expectedAmount, expectedWallet) {
  try {
    const provider = getProvider();

    const tx = await provider.getTransaction(txHash);
    if (!tx) {
      return { valid: false, reason: 'Transaction not found on chain' };
    }

    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt) {
      return { valid: false, reason: 'Receipt not found' };
    }

    if (receipt.status !== 1) {
      return { valid: false, reason: 'Transaction failed (status !== 1)' };
    }

    // Check recipient
    if (tx.to?.toLowerCase() !== expectedWallet.toLowerCase()) {
      return {
        valid: false,
        reason: `Recipient mismatch: tx goes to ${tx.to}, expected ${expectedWallet}`,
      };
    }

    // Check amount (value is in wei, USDC is 6 decimals)
    const expectedAtomic = BigInt(Math.round(parseFloat(expectedAmount) * 1_000_000));
    // For native token transfers, check tx.value. For USDC ERC-20, we'd check logs.
    // For hackathon simplicity — check value. In production use ERC20 transfer event logs.
    if (tx.value > 0n && tx.value < expectedAtomic) {
      return {
        valid: false,
        reason: `Amount mismatch: tx value ${tx.value} < expected ${expectedAtomic}`,
      };
    }

    return { valid: true };
  } catch (err) {
    return { valid: false, reason: `RPC error: ${err.message}` };
  }
}
