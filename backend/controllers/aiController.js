const { GoogleGenAI } = require('@google/genai');

const getAiTips = async (req, res) => {
  try {
    const { deliveryAddress } = req.body;
    if (!deliveryAddress) {
      return res.status(400).json({ error: "Delivery address is required" });
    }
    if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'AI tips are not configured.' });
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `You are an AI assistant for a delivery app. Given the delivery address: "${deliveryAddress}", generate a single, helpful 1-sentence 'Rider Tip' for the delivery boy (e.g., about traffic, weather, or area characteristics). Keep it brief and practical.`;
    const result = await genAI.models.generateContent({ model: process.env.GEMINI_MODEL || 'gemini-3.8-flash', contents: prompt });
    const tip = result.text?.trim();
    if (!tip) return res.status(502).json({ error: 'AI service returned an empty response.' });
    res.json({ tip });
  } catch (error) {
    const status = Number(error.status || error.statusCode);
    console.error('Gemini tip request failed', { status: Number.isFinite(status) ? status : undefined });
    res.status(status === 429 ? 429 : 502).json({ error: 'AI service unavailable.' });
  }
};

const Product = require("../models/Product");

//older--------->>>>>>>>>>
// const chatFreshCurator = async (req, res) => {
//   const { message, history } = req.body;
//   try {
//     const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
//     const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

//     // Fetch current products for precise AI grounding
//     const currentProducts = await Product.find().limit(50).lean();
//     const productSnapshot = currentProducts.map(p => `${p.name} (₹${p.price}) - ${p.category}`).join(', ');

//     // Format history for Gemini & ensure it starts with 'user'
//     let formattedHistory = (history || []).map((h) => ({
//       role: h.role === 'user' ? 'user' : 'model',
//       parts: [{ text: h.content }],
//     }));
//     while (formattedHistory.length > 0 && formattedHistory[0].role !== 'user') {
//       formattedHistory.shift();
//     }

//     const chat = model.startChat({ history: formattedHistory });

//     const instruction = `System: You are "FreshAssistant", a friendly, premium shopping assistant for FreshCurator.
//     FreshCurator specializes in organic, pesticide-free farm products in India.
//     Be helpful, concise, and encourage healthy living.
//     CURRENT INVENTORY IN STOCK: [${productSnapshot}].
//     If a user asks about a product, ONLY confirm availability if it's in this list.
//     User Query: ${message}`;

//     console.log(`[FreshAssistant] Processing message: "${message.substring(0, 50)}..."`);
//     const result = await chat.sendMessage(instruction);
//     const responseText = result.response.text();

//     res.json({ response: responseText });
//   } catch (error) {
//     console.error('CRITICAL AI ERROR:', {
//       message: error.message,
//       stack: error.stack,
//       keyExists: !!process.env.GEMINI_API_KEY
//     });
//     res.status(500).json({
//       error: 'Failed to chat',
//       details: error.message,
//       troubleshooting: "Check if GEMINI_API_KEY is valid and not rate-limited."
//     });
//   }
// };

//newer to fix responses--------->>>>>>>>
const chatWindows = new Map();
const chatFreshCurator = async (req, res) => {
  const { message, history } = req.body || {};
  try {
    if (typeof message !== 'string' || !message.trim() || message.length > 2000) return res.status(400).json({ error: 'Message must contain 1 to 2000 characters.' });
    if (!Array.isArray(history) || history.length > 12 || history.some((item) => !item || !['user', 'assistant'].includes(item.role) || typeof item.content !== 'string' || item.content.length > 2000)) return res.status(400).json({ error: 'Conversation history is invalid or too long.' });
    const now = Date.now();
    const lastRequest = chatWindows.get(String(req.user._id)) || 0;
    if (now - lastRequest < 10_000) return res.status(429).json({ error: 'Please wait a few seconds before sending another message.' });
    chatWindows.set(String(req.user._id), now);
    if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'Chat assistant is not configured.' });
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // 2. Fetch current products for grounding
    const currentProducts = await Product.find().limit(50).lean();
    const productSnapshot = currentProducts
      .map((p) => `${p.name} (₹${p.price})`)
      .join(", ");

    // 3. Format history and ensure it starts with 'user'
    let formattedHistory = history.map((h) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.content }],
    }));

    // Safety check: History MUST start with 'user' or Gemini throws a 400 error
    while (formattedHistory.length > 0 && formattedHistory[0].role !== "user") formattedHistory.shift();

    const chat = genAI.chats.create({
      model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
      history: formattedHistory,
      config: { systemInstruction: "You are FreshAssistant, a friendly FreshCurator shopping assistant. Only recommend items from the supplied current inventory. Do not invent prices, availability, order data, or tracking information. Keep replies concise.", maxOutputTokens: 200 },
    });

    // 4. Send message with current context
    const contextPrompt = `Current inventory (authoritative product names and INR prices): [${productSnapshot}].\nCustomer question: ${message.trim()}`;
    const result = await chat.sendMessage({ message: contextPrompt });
    const responseText = result.text?.trim();
    if (!responseText) return res.status(502).json({ error: 'The assistant returned an empty response. Please try again.' });

    res.json({ response: responseText });
  } catch (error) {
    const status = Number(error.status || error.statusCode);
    console.error('Gemini request failed', { status: Number.isFinite(status) ? status : undefined, message: String(error.message || '').slice(0, 250) });
    // This sends a clear error so your frontend can show a specific message
    if (status === 429) return res.status(429).json({ error: 'The assistant is busy. Please try again shortly.' });
    if ([401, 403].includes(status)) return res.status(503).json({ error: 'The assistant credentials are unavailable. Please contact support.' });
    res.status(502).json({ error: 'The assistant could not process this request. Please try again.' });
  }
};

module.exports = {
  getAiTips,
  chatFreshCurator,
};
