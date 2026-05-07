import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Mistral } from '@mistralai/mistralai';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ─── API Keys ─────────────────────────────────────────────────────────────────

const DEFAULT_TAVILY_KEY =
  process.env.TAVILY_API_KEY ||
  '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';
const DEFAULT_SERPER_KEY =
  process.env.SERPER_API_KEY || '60738fce452a865368332321d9507edde21c5b1a';

function isValidKey(key) {
  if (!key) return false;
  const k = key.trim();
  return k !== '' && !k.includes('MY_') && !k.includes('TODO') && k !== 'undefined' && k !== 'null';
}

// ─── Gemini REST API ──────────────────────────────────────────────────────────

async function callGemini(apiKey, prompt) {
  // Try gemini-flash-latest first, fallback to 2.5/2.0
  const models = ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-2.0-flash'];

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
      }),
    });

    if (response.status === 429) {
      console.warn(`Rate limit on ${model}, trying next model...`);
      continue; // try next model
    }

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${err}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (text) {
      console.log(`✅ Used model: ${model}`);
      return text;
    }
  }

  throw new Error('All Gemini models rate-limited. Please wait a moment and try again.');
}


// ─── Web Search (Tavily) ──────────────────────────────────────────────────────

async function performWebSearch(query, settings) {
  let results = '';
  const tavilyKey = isValidKey(settings?.tavilyApiKey) ? settings.tavilyApiKey : DEFAULT_TAVILY_KEY;
  const serperKey = isValidKey(settings?.serperApiKey) ? settings.serperApiKey : DEFAULT_SERPER_KEY;

  if (isValidKey(tavilyKey)) {
    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyKey,
          query,
          search_depth: 'advanced',
          max_results: 5,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        results = data.results
          .map((r) => `Title: ${r.title}\nURL: ${r.url}\nContent: ${r.content}`)
          .join('\n\n');
      }
    } catch (e) {
      console.error('Tavily search failed:', e.message);
    }
  }

  if (!results && isValidKey(serperKey)) {
    try {
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': serperKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: query }),
      });
      if (response.ok) {
        const data = await response.json();
        results = data.organic?.map((r) => `Title: ${r.title}\nURL: ${r.link}\nSnippet: ${r.snippet}`).join('\n\n') || '';
      }
    } catch (e) {
      console.error('Serper search failed:', e.message);
    }
  }

  return results;
}

function extractProvider(url) {
  try {
    const hostname = new URL(url).hostname;
    const parts = hostname.replace('www.', '').split('.');
    return parts.length >= 2
      ? parts[0].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : hostname;
  } catch {
    return 'Unknown';
  }
}

// ─── POST /api/search ─────────────────────────────────────────────────────────

app.post('/api/search', async (req, res) => {
  try {
    const { query, settings } = req.body;

    const geminiKey = isValidKey(settings?.geminiApiKey)
      ? settings.geminiApiKey
      : process.env.GEMINI_API_KEY;

    const mistralKey = isValidKey(settings?.mistralApiKey)
      ? settings.mistralApiKey
      : process.env.MISTRAL_API_KEY;

    // Try Gemini first (REST API)
    if (settings?.primaryProvider !== 'mistral' && isValidKey(geminiKey)) {
      try {
        const prompt = `Find the best 5 FREE online courses for "${query}". Focus on reputable providers like Coursera, edX, MIT OpenCourseWare, YouTube, freeCodeCamp, Khan Academy, etc.
Return ONLY a valid JSON array (no markdown, no code blocks) with exactly these fields:
[{"title":"...","provider":"...","url":"https://...","description":"...","isFree":true,"rating":"4.5/5"}]`;

        const text = await callGemini(geminiKey, prompt);
        console.log('Gemini search response (first 200 chars):', text.slice(0, 200));

        // Extract JSON array from response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const courses = JSON.parse(jsonMatch[0]);
          return res.json({ success: true, courses });
        }
      } catch (e) {
        console.warn('Gemini search failed:', e.message);
      }
    }

    // Fallback: Web search + Mistral
    const searchResults = await performWebSearch(`free online courses for ${query}`, settings);

    if (isValidKey(mistralKey)) {
      try {
        const mistral = new Mistral({ apiKey: mistralKey });
        const prompt = `Find the best 5 FREE online courses for "${query}".
Return ONLY a JSON array with: title, provider, url, description, isFree (boolean), rating (optional string).
${searchResults ? `\nSearch context:\n${searchResults}` : ''}`;

        const response = await mistral.chat.complete({
          model: 'mistral-medium-latest',
          messages: [{ role: 'user', content: prompt + '\n\nReturn ONLY the JSON array, no markdown.' }],
        });

        const text = response.choices?.[0]?.message?.content;
        if (typeof text === 'string') {
          const jsonMatch = text.match(/\[[\s\S]*\]/);
          return res.json({ success: true, courses: jsonMatch ? JSON.parse(jsonMatch[0]) : [] });
        }
      } catch (e) {
        console.error('Mistral search failed:', e.message);
      }
    }

    // Last resort: Use Tavily results directly
    if (searchResults) {
      return res.json({
        success: false,
        error: 'AI provider failed. Please add a valid Gemini or Mistral API key in Settings.',
      });
    }

    return res.json({ success: false, error: 'All search providers failed. Please check your API keys in Settings.' });
  } catch (error) {
    console.error('Search route error:', error);
    return res.status(500).json({ success: false, error: `Server error: ${error.message}` });
  }
});

// ─── POST /api/roadmap ────────────────────────────────────────────────────────

app.post('/api/roadmap', async (req, res) => {
  try {
    const { topic, settings } = req.body;

    const geminiKey = isValidKey(settings?.geminiApiKey)
      ? settings.geminiApiKey
      : process.env.GEMINI_API_KEY;

    const mistralKey = isValidKey(settings?.mistralApiKey)
      ? settings.mistralApiKey
      : process.env.MISTRAL_API_KEY;

    // Try Gemini first (REST API)
    if (settings?.primaryProvider !== 'mistral' && isValidKey(geminiKey)) {
      try {
        const prompt = `Generate a complete learning roadmap for "${topic}".
Return ONLY a valid JSON object (no markdown, no code blocks) with exactly this structure:
{"topic":"${topic}","title":"...","description":"...","totalDuration":"...","steps":[{"step":1,"title":"...","description":"...","resources":[{"title":"...","url":"https://...","type":"course"}]}]}
Types can be: course, article, video, or project. Include 4-6 steps with 2-3 resources each.`;

        const text = await callGemini(geminiKey, prompt);
        console.log('Gemini roadmap response (first 200 chars):', text.slice(0, 200));

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return res.json({
            success: true,
            roadmap: {
              topic,
              title: parsed.title,
              description: parsed.description,
              totalDuration: parsed.totalDuration || 'Varies',
              steps: parsed.steps,
            },
          });
        }
      } catch (e) {
        console.warn('Gemini roadmap failed:', e.message);
      }
    }

    // Fallback: Mistral
    if (isValidKey(mistralKey)) {
      try {
        const mistral = new Mistral({ apiKey: mistralKey });
        const searchResults = await performWebSearch(`learning path resources for ${topic}`, settings);

        const prompt = `Generate a structured learning roadmap for "${topic}".
Return ONLY a JSON object with: title, description, totalDuration, steps (array with step number, title, description, resources array with title, url, type).
${searchResults ? `\nContext:\n${searchResults}` : ''}`;

        const response = await mistral.chat.complete({
          model: 'mistral-medium-latest',
          messages: [{ role: 'user', content: prompt + '\n\nReturn ONLY the JSON object.' }],
        });

        const text = response.choices?.[0]?.message?.content;
        if (typeof text === 'string') {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return res.json({
              success: true,
              roadmap: {
                topic,
                title: parsed.title,
                description: parsed.description,
                totalDuration: parsed.totalDuration || 'Varies',
                steps: parsed.steps,
              },
            });
          }
        }
      } catch (e) {
        console.error('Mistral roadmap failed:', e.message);
      }
    }

    return res.json({ success: false, error: 'All roadmap providers failed. Please check your API keys in Settings.' });
  } catch (error) {
    console.error('Roadmap route error:', error);
    return res.status(500).json({ success: false, error: `Server error: ${error.message}` });
  }
});

// ─── POST /api/chat ───────────────────────────────────────────────────────────

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, settings } = req.body;

    // Try Gemini chat first
    const geminiKey = isValidKey(settings?.geminiApiKey)
      ? settings.geminiApiKey
      : process.env.GEMINI_API_KEY;

    const mistralKey = isValidKey(settings?.mistralApiKey)
      ? settings.mistralApiKey
      : process.env.MISTRAL_API_KEY;

    if (settings?.primaryProvider !== 'mistral' && isValidKey(geminiKey)) {
      try {
        // Build conversation context
        const historyText = (history || [])
          .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
          .join('\n');

        const prompt = `You are a helpful learning assistant. Help the user find educational resources and explain topics clearly. Use markdown formatting.

${historyText ? `Conversation so far:\n${historyText}\n\n` : ''}User: ${message}
Assistant:`;

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        const text = await callGemini(geminiKey, prompt);
        res.write(text);
        return res.end();
      } catch (e) {
        console.warn('Gemini chat failed:', e.message);
      }
    }

    // Fallback: Mistral streaming
    if (!isValidKey(mistralKey)) {
      return res.status(500).json({
        error: 'No valid API key found. Please add your Gemini or Mistral API key in Settings.',
      });
    }

    const client = new Mistral({ apiKey: mistralKey });
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful learning assistant. Help the user find educational resources and explain complex topics simply. Use markdown formatting.',
      },
      ...(history || []).map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
      { role: 'user', content: message },
    ];

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    const stream = await client.chat.stream({ model: 'mistral-medium-latest', messages });
    for await (const chunk of stream) {
      const content = chunk.data?.choices?.[0]?.delta?.content;
      if (typeof content === 'string') res.write(content);
    }
    return res.end();
  } catch (error) {
    console.error('Chat route error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: `Server error: ${error.message}` });
    }
  }
});

// ─── POST /api/suggestions ────────────────────────────────────────────────────

app.post('/api/suggestions', async (req, res) => {
  try {
    const { favorites } = req.body;
    if (!favorites || favorites.length === 0) {
      return res.json({ success: false, error: 'No favorites provided' });
    }

    const topics = favorites.map((f) => f.title).slice(0, 3).join(', ');
    const query = `free online courses related to ${topics}`;

    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: DEFAULT_TAVILY_KEY,
        query,
        search_depth: 'basic',
        max_results: 8,
      }),
    });

    if (!response.ok) throw new Error('Tavily search failed');

    const data = await response.json();
    const courses = data.results
      .map((result) => {
        const url = result.url || '';
        const provider = extractProvider(url);
        return {
          title: result.title || '',
          provider,
          url,
          description: (result.content || '').slice(0, 300),
          isFree: true,
          platform: provider,
        };
      })
      .filter((c) => c.title && c.url && c.title.length > 5 && !c.title.includes('404'))
      .filter((c) => !favorites.map((f) => f.url).includes(c.url))
      .slice(0, 6);

    return res.json({ success: true, courses });
  } catch (error) {
    console.error('Suggestions error:', error.message);
    return res.json({ success: false, error: 'Failed to get suggestions.' });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  const gemini = process.env.GEMINI_API_KEY ? '✅' : '❌';
  const mistral = process.env.MISTRAL_API_KEY ? '✅' : '❌';
  const tavily = process.env.TAVILY_API_KEY ? '✅' : '❌';
  console.log(`\n🚀 API Server running on http://localhost:${PORT}`);
  console.log(`   Gemini:  ${gemini} ${process.env.GEMINI_API_KEY ? 'configured' : 'missing'}`);
  console.log(`   Mistral: ${mistral} ${process.env.MISTRAL_API_KEY ? 'configured' : 'missing'}`);
  console.log(`   Tavily:  ${tavily} ${process.env.TAVILY_API_KEY ? 'configured' : 'missing'}\n`);
});
