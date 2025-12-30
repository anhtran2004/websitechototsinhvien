// Simple Express server that proxies chat requests to OpenAI.
// Usage: set OPENAI_API_KEY in environment (or .env) and run `node server.js`
// npm deps: express axios express-rate-limit cors dotenv
const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo'; // change if you want

if (!OPENAI_API_KEY) {
    console.error('Missing OPENAI_API_KEY in environment. Create a .env file or set the variable.');
    process.exit(1);
}

app.use(express.json({ limit: '128kb' })); // limit body size
app.use(cors({
    origin: true, // in prod restrict to your frontend origin
    credentials: true
}));

// basic rate limit - tune as required
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // limit each IP to 30 requests per windowMs
    message: { error: 'Too many requests, please slow down.' }
});
app.use('/api/', limiter);

// Helper to build messages for OpenAI from client history
function buildMessages(clientHistory = [], userMessage = '') {
    // system prompt: set assistant behavior aligned with your app
    const systemPrompt = "Bạn là trợ lý của 'Chợ thuê đồ'. Trả lời ngắn gọn, thân thiện, gợi ý sản phẩm, và hướng dẫn người dùng cách liên hệ chủ cho thuê.";
    const messages = [{ role: 'system', content: systemPrompt }];

    // clientHistory expected to be array of { role: 'user'|'assistant', text: '...' }
    if (Array.isArray(clientHistory)) {
        clientHistory.slice(-6).forEach(h => {
            messages.push({ role: h.role === 'user' ? 'user' : 'assistant', content: String(h.text || '') });
        });
    }

    // add current user message
    messages.push({ role: 'user', content: String(userMessage || '') });
    return messages;
}

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body || {};
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({ error: 'Missing message in body' });
        }

        // basic protection: length limit
        if (message.length > 2000) {
            return res.status(400).json({ error: 'Message too long' });
        }

        const messages = buildMessages(history, message);

        // call OpenAI Chat Completions
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: OPENAI_MODEL,
            messages,
            max_tokens: 600,
            temperature: 0.2,
            n: 1
        }, {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 20000
            });

        const choice = response.data && response.data.choices && response.data.choices[0];
        const reply = choice && choice.message && choice.message.content ? choice.message.content : 'Xin lỗi, tôi không có phản hồi.';
        return res.json({ reply });
    } catch (err) {
        console.error('Error calling OpenAI', err ?.response ?.data || err.message || err);
        const status = err ?.response ?.status || 500;
        return res.status(status).json({ error: 'AI service error', detail: err ?.response ?.data || err.message || null });
    }
});

app.listen(PORT, () => {
    console.log(`Chat proxy server listening on port ${PORT}`);
});