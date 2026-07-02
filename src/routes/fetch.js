import { Router } from 'express';

export const fetchRouter = Router();

/**
 * POST /api/fetch-content
 * Fetch a URL, strip HTML to clean text.
 * Body: { url }
 */
fetchRouter.post('/fetch-content', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'Missing url' });
    }

    console.log(`[fetch] Fetching: ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Griot/1.0 (content-fetcher; +https://griot.xyz)',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return res.status(502).json({
        error: `Failed to fetch URL: ${response.status} ${response.statusText}`,
      });
    }

    const html = await response.text();

    // Basic HTML stripping
    const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || 'Untitled';
    const cleaned = html
      // Remove scripts
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      // Remove styles
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      // Remove HTML tags
      .replace(/<[^>]+>/g, ' ')
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      .trim()
      // Take first 5000 chars for preview
      .slice(0, 5000);

    const wordCount = cleaned.split(/\s+/).filter(Boolean).length;

    res.json({
      title,
      content: cleaned,
      word_count: wordCount,
      source_url: url,
    });
  } catch (err) {
    if (err.name === 'TimeoutError') {
      return res.status(504).json({ error: 'Request timed out fetching URL' });
    }
    res.status(500).json({ error: `Fetch failed: ${err.message}` });
  }
});
