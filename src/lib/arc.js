import { JsonRpcProvider, keccak256, toUtf8Bytes, Contract } from 'ethers';

const RPC_URL = process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network';
const USDC_CONTRACT = process.env.USDC_CONTRACT || '0x3600000000000000000000000000000000000000';

let provider;

export function getProvider() {
  if (!provider) {
    provider = new JsonRpcProvider(RPC_URL);
  }
  return provider;
}

export function getUsdcAddress() {
  return USDC_CONTRACT;
}

/**
 * Returns the GriotRegistry contract address from env, or null if not set.
 * Used by reader.js and agent.js to know where to send approve/pay calls.
 */
export function getRegistryAddress() {
  return process.env.GRIOT_REGISTRY_ADDRESS || null;
}

/**
 * Compute a content ID from a canonical URL (bytes32).
 * Matches the on-chain contract's computeContentId (keccak256 of the URL).
 */
export function computeContentId(canonicalUrl) {
  return keccak256(toUtf8Bytes(canonicalUrl));
}

/**
 * Pay for a citation on-chain by calling payForCitation on the GriotRegistry contract.
 * This path is used as a fallback when no reader_id is provided (dev/testing).
 */
export async function payForCitationOnChain(canonicalUrl) {
  const registryAddr = getRegistryAddress();
  if (!registryAddr) {
    return { success: false, error: 'GRIOT_REGISTRY_ADDRESS not configured' };
  }

  const agentKey = process.env.AGENT_WALLET_PRIVATE_KEY;
  if (!agentKey) {
    return { success: false, error: 'AGENT_WALLET_PRIVATE_KEY not configured' };
  }

  try {
    const provider = getProvider();
    const wallet = new ethers.Wallet(agentKey, provider);
    const registry = new Contract(
      registryAddr,
      ['function payForCitation(bytes32)'],
      wallet
    );

    const contentId = computeContentId(canonicalUrl);
    const tx = await registry.payForCitation(contentId);
    const receipt = await tx.wait();

    return {
      success: true,
      tx_hash: receipt.hash,
      content_id: contentId,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Ensure the agent relay wallet has approved the GriotRegistry contract to spend USDC.
 * This is a no-op stub if the env vars aren't configured (simulated mode).
 */
export async function ensureAgentApproval() {
  const registryAddr = getRegistryAddress();
  const agentKey = process.env.AGENT_WALLET_PRIVATE_KEY;
  if (!registryAddr || !agentKey) return;

  try {
    const provider = getProvider();
    const wallet = new ethers.Wallet(agentKey, provider);
    const usdc = new Contract(
      USDC_CONTRACT,
      ['function approve(address,uint256) returns (bool)'],
      wallet
    );

    const tx = await usdc.approve(registryAddr, ethers.MaxUint256);
    await tx.wait();
  } catch (err) {
    console.warn('[arc] ensureAgentApproval failed:', err.message);
  }
}

/**
 * Verify a USDC transfer transaction on Arc testnet.
 * Checks ERC20 Transfer event logs for the correct amount and recipient.
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

    const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== usdcAddr) continue;
      if (log.topics[0] !== transferTopic) continue;
      const toAddress = '0x' + log.topics[2].slice(26);
      if (toAddress.toLowerCase() !== expectedAddr) continue;
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
