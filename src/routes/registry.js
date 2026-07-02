import { Router } from 'express';
import crypto from 'crypto';
import { getDb } from '../supabase.js';
import { createWallet } from '../lib/circle.js';

export const registryRouter = Router();

// Email-based signup — provisions a Circle wallet invisibly
registryRouter.post('/creator/email-signup', async (req, res) => {
  try {
    const { email, username } = req.body;

    if (!email || !username) {
      return res.status(400).json({ error: 'Missing required fields: email, username' });
    }

    const db = await getDb();

    // Check if email already registered
    const existing = await db.findCreatorByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered', creator: existing });
    }

    // Provision a Circle wallet invisibly (fall back to simulated if Circle isn't configured)
    const apiKey = process.env.CIRCLE_API_KEY;
    let walletAddress;

    if (apiKey && !apiKey.startsWith('TEST_API_KEY:')) {
      try {
        const walletResult = await createWallet(email);
        if (walletResult.success) {
          walletAddress = walletResult.wallet.address;
        }
      } catch (e) {
        console.log(`[email-signup] Circle wallet creation failed: ${e.message}, falling back to simulated`);
      }
    }

    if (!walletAddress) {
      const hash = crypto.createHash('sha256').update(email).digest('hex');
      walletAddress = '0x' + hash.slice(0, 40);
      console.log(`[email-signup] Simulated wallet for ${email}: ${walletAddress}`);
    }
    const creator = await db.createCreator(walletAddress, username, email);

    res.status(201).json({
      id: creator.id,
      wallet_address: walletAddress,
      username: creator.username,
      created_at: creator.created_at,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public article fetch by slug — no auth required
registryRouter.get('/articles/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const db = await getDb();

    let article = await db.getRegistryById(slug);
    if (!article) {
      article = await db.findByUrl(slug);
    }

    if (!article) return res.status(404).json({ error: 'Article not found' });

    res.json({
      id: article.id,
      title: article.title || 'Untitled',
      content: article.content || 'No content available.',
      price: article.price,
      mode: article.mode,
      canonical_url: article.canonical_url,
      wallet_address: article.wallet_address,
      created_at: article.created_at,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

registryRouter.post('/register', async (req, res) => {
  try {
    const { url, canonical_url, price, wallet, mode, creator_id, username } = req.body;

    if (!url || !canonical_url || !price || !wallet || !mode) {
      return res.status(400).json({
        error: 'Missing required fields: url, canonical_url, price, wallet, mode',
      });
    }

    if (!['paywall', 'citation'].includes(mode)) {
      return res.status(400).json({ error: 'mode must be "paywall" or "citation"' });
    }

    const db = await getDb();
    let creatorId = creator_id;

    if (!creatorId) {
      const existingCreator = await db.findCreatorByWallet(wallet);

      if (existingCreator) {
        creatorId = existingCreator.id;
      } else if (username) {
        const newCreator = await db.createCreator(wallet, username);
        creatorId = newCreator.id;
      } else {
        return res.status(400).json({ error: 'creator_id or username required for new creators' });
      }
    }

    try {
      const data = await db.register({
        creator_id: creatorId,
        original_url: url,
        canonical_url,
        price,
        wallet_address: wallet,
        mode,
      });

      res.status(201).json(data);
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ error: 'This URL is already registered' });
      }
      throw err;
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

registryRouter.get('/check', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'Missing url query parameter' });

    const db = await getDb();
    const data = await db.findByUrl(url);

    if (!data) return res.json({ registered: false });

    res.json({ registered: true, id: data.id, price: data.price, wallet: data.wallet_address, mode: data.mode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

registryRouter.get('/creator/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    const creator = await db.getCreator(id);
    if (!creator) return res.status(404).json({ error: 'Creator not found' });

    const articles = await db.getRegistryByCreator(id);

    const totalEarnings = await articles.reduce(async (sumPromise, a) => {
      const sum = await sumPromise;
      const payments = await db.getPaymentsByRegistryId(a.id);
      return sum + payments.reduce((s, p) => s + parseFloat(p.amount || '0'), 0);
    }, Promise.resolve(0));

    res.json({ creator, articles, total_earnings: totalEarnings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Wallet → creator lookup
registryRouter.get('/by-wallet/:wallet', async (req, res) => {
  try {
    const { wallet } = req.params;
    const db = await getDb();

    const creator = await db.findCreatorByWallet(wallet);
    if (!creator) return res.status(404).json({ error: 'Creator not found for this wallet' });

    const articles = await db.getRegistryByCreator(creator.id);
    const totalEarnings = await articles.reduce(async (sumPromise, a) => {
      const sum = await sumPromise;
      const payments = await db.getPaymentsByRegistryId(a.id);
      return sum + payments.reduce((s, p) => s + parseFloat(p.amount || '0'), 0);
    }, Promise.resolve(0));

    res.json({ creator, articles, total_earnings: totalEarnings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
