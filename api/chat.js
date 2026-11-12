// Vercel Serverless Function: Secure Gemini AI Chat Backend for Ron's Chicken ERP
// Reads GEMINI_API_KEY from environment variables to protect credentials.

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY || req.body?.apiKey;

  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 10) {
    return res.status(400).json({
      error: 'GEMINI_API_KEY not configured in backend environment or request.',
      fallbackToLocal: true
    });
  }

  try {
    const { contents, systemPrompt, generationConfig } = req.body;

    if (!contents || !Array.isArray(contents)) {
      return res.status(400).json({ error: 'Missing or invalid contents payload.' });
    }

    const payload = {
      contents,
      generationConfig: generationConfig || {
        temperature: 0.75,
        maxOutputTokens: 800
      }
    };

    if (systemPrompt) {
      payload.systemInstruction = {
        parts: [{ text: systemPrompt }]
      };
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return res.status(geminiRes.status).json({
        error: `Gemini API responded with status ${geminiRes.status}`,
        details: errText,
        fallbackToLocal: true
      });
    }

    const data = await geminiRes.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      const replyText = data.candidates[0].content.parts.map(p => p.text).join('\n');
      return res.status(200).json({ reply: replyText });
    }

    return res.status(500).json({
      error: 'No content parts returned by Gemini model.',
      fallbackToLocal: true
    });
  } catch (err) {
    console.error('[API Chat Exception]:', err);
    return res.status(500).json({
      error: err.message || 'Internal server error in AI chat endpoint.',
      fallbackToLocal: true
    });
  }
}
