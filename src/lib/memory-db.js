/**
 * In-memory storage fallback when Supabase is not configured.
 * Mirrors the same interface so registry/read/pay all work without a DB.
 */

const creators = new Map();
const registry = new Map();
const payments = new Map();
const readers = new Map();

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

export const db = {
  // Creators
  async findCreatorByWallet(wallet) {
    for (const c of creators.values()) {
      if (c.wallet_address === wallet) return c;
    }
    return null;
  },

  async findCreatorByEmail(email) {
    for (const c of creators.values()) {
      if (c.email === email) return c;
    }
    return null;
  },

  async createCreator(wallet, username, email) {
    const existing = await this.findCreatorByWallet(wallet);
    if (existing) return existing;

    const creator = { id: uuid(), wallet_address: wallet, username, email, wallet_id: null, created_at: new Date().toISOString() };
    creators.set(creator.id, creator);
    return creator;
  },

  async getCreator(id) {
    return creators.get(id) || null;
  },

  // Registry
  async register(entry) {
    const existing = await this.findByUrl(entry.canonical_url);
    if (existing) throw Object.assign(new Error('URL already registered'), { code: '23505' });

    const record = {
      id: uuid(),
      creator_id: entry.creator_id,
      original_url: entry.original_url,
      canonical_url: entry.canonical_url,
      title: entry.title || null,
      content: entry.content || null,
      price: parseFloat(entry.price),
      wallet_address: entry.wallet_address,
      mode: entry.mode,
      created_at: new Date().toISOString(),
    };
    registry.set(record.id, record);
    return record;
  },

  async findByUrl(url) {
    for (const r of registry.values()) {
      if (r.canonical_url === url) return r;
    }
    return null;
  },

  async getRegistryByCreator(creatorId) {
    const results = [];
    for (const r of registry.values()) {
      if (r.creator_id === creatorId) results.push(r);
    }
    return results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async getRegistryById(id) {
    return registry.get(id) || null;
  },

  // Payments
  async recordPayment(p) {
    const record = {
      id: uuid(),
      registry_id: p.registry_id,
      tx_hash: p.tx_hash,
      amount: p.amount,
      payer_wallet: p.payer_wallet,
      creator_wallet: p.creator_wallet,
      verified: p.verified || false,
      created_at: new Date().toISOString(),
    };
    payments.set(record.id, record);
    return record;
  },

  getPaymentsByRegistryId(registryId) {
    const results = [];
    for (const p of payments.values()) {
      if (p.registry_id === registryId) results.push(p);
    }
    return results;
  },

  async getRegistryFeed(limit, offset) {
    const all = Array.from(registry.values())
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return all.slice(offset, offset + limit);
  },

  async getRegistryCount() {
    return registry.size;
  },

  // ---------- Readers ----------

  async findReaderByEmail(email) {
    for (const r of readers.values()) {
      if (r.email === email) return r;
    }
    return null;
  },

  async createReader(email, walletId, walletAddress) {
    const existing = await this.findReaderByEmail(email);
    if (existing) return existing;

    const reader = {
      id: `reader-${uuid()}`,
      email,
      wallet_id: walletId,
      wallet_address: walletAddress,
      budget: 0,
      created_at: new Date().toISOString(),
    };
    readers.set(reader.id, reader);
    return reader;
  },

  async getReader(id) {
    return readers.get(id) || null;
  },

  async setReaderBudget(id, amount) {
    const reader = readers.get(id);
    if (reader) {
      reader.budget = amount;
    }
  },

  async recordPayment(p) {
    const record = {
      id: uuid(),
      registry_id: p.registry_id,
      content_id: p.content_id,
      endpoint: p.endpoint,
      payer: p.payer,
      creator_wallet: p.creator_wallet,
      amount_usdc: p.amount_usdc,
      network: p.network,
      gateway_tx: p.gateway_tx,
      created_at: new Date().toISOString(),
    };
    payments.set(record.id, record);
    return record;
  },
};
