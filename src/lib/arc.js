import { JsonRpcProvider } from 'ethers';

const RPC_URL = process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network';
const USDC_CONTRACT = process.env.USDC_CONTRACT || '0x3600000000000000000000000000000000000000';

let provider;

export function getProvider() {
  if (!provider) {
    provider = new JsonRpcProvider(RPC_URL);
  }
  return provider;
}

/**
 * Verify a USDC transfer transaction on Arc testnet.
 * Checks ERC20 Transfer event logs for the correct amount and recipient.
 *
 * @param {string} txHash - Transaction hash to verify
 * @param {string} expectedAmount - Expected amount in USDC (e.g. "0.02")
 * @param {string} expectedWallet - Expected recipient wallet address
 * @returns {{ valid: boolean, reason?: string }}
 */
export async function verifyPayment(txHash, expectedAmount, expectedWallet) {
  try {
    const provider = getProvider();

    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt) {
      return { valid: false, reason: 'Receipt not found — transaction may not be confirmed' };
    }

    if (receipt.status !== 1) {
      return { valid: false, reason: 'Transaction failed (status !== 1)' };
    }

    const expectedAddr = expectedWallet.toLowerCase();
    const expectedAtomic = BigInt(Math.round(parseFloat(expectedAmount) * 1_000_000));
    const usdcAddr = USDC_CONTRACT.toLowerCase();

    // Parse Transfer event logs
    // Transfer event: keccak256("Transfer(address,address,uint256)")
    const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

    for (const log of receipt.logs) {
      // Check if this log is from the USDC contract
      if (log.address.toLowerCase() !== usdcAddr) continue;
      // Check topic[0] is Transfer event
      if (log.topics[0] !== transferTopic) continue;
      // Check recipient (topic[2] is the `to` address, padded to 32 bytes)
      const toAddress = '0x' + log.topics[2].slice(26); // last 20 bytes
      if (toAddress.toLowerCase() !== expectedAddr) continue;
      // Check amount (data is uint256 in hex)
      const amount = BigInt(log.data);
      if (amount < expectedAtomic) {
        return {
          valid: false,
          reason: `Amount mismatch: ${amount} < ${expectedAtomic} (USDC atomic units)`,
        };
      }

      return { valid: true };
    }

    return { valid: false, reason: 'No valid USDC Transfer event to expected recipient found' };
  } catch (err) {
    return { valid: false, reason: `RPC error: ${err.message}` };
  }
}
