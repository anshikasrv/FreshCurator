const { GoogleGenerativeAI } = require('@google/generative-ai');

const getAiTips = async (req, res) => {
  try {
    const { deliveryAddress } = req.body;
    if (!deliveryAddress) {
      return res.status(400).json({ error: 'Delivery address is required' });
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are an AI assistant for a delivery app. Given the delivery address: "${deliveryAddress}", generate a single, helpful 1-sentence 'Rider Tip' for the delivery boy (e.g., about traffic, weather, or area characteristics). Keep it brief and practical.`;
    const result = await model.generateContent(prompt);
    const tip = result.response.text().trim();
    res.json({ tip });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ tip: 'Check local traffic conditions before heading out.', error: 'AI service unavailable' });
  }
};

const Product = require('../models/Product');

const chatFreshCurator = async (req, res) => {
  const { message, history } = req.body;
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Fetch current products for precise AI grounding
    const currentProducts = await Product.find().limit(50).lean();
    const productSnapshot = currentProducts.map(p => `${p.name} (₹${p.price}) - ${p.category}`).join(', ');

    // Format history for Gemini & ensure it starts with 'user'
    let formattedHistory = (history || []).map((h) => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }],
    }));
    while (formattedHistory.length > 0 && formattedHistory[0].role !== 'user') {
      formattedHistory.shift();
    }

    const chat = model.startChat({ history: formattedHistory });

    const instruction = `System: You are "FreshAssistant", a friendly, premium shopping assistant for FreshCurator. 
    FreshCurator specializes in organic, pesticide-free farm products in India. 
    Be helpful, concise, and encourage healthy living. 
    CURRENT INVENTORY IN STOCK: [${productSnapshot}]. 
    If a user asks about a product, ONLY confirm availability if it's in this list.
    User Query: ${message}`;

    console.log(`[FreshAssistant] Processing message: "${message.substring(0, 50)}..."`);
    const result = await chat.sendMessage(instruction);
    const responseText = result.response.text();
    
    res.json({ response: responseText });
  } catch (error) {
    console.error('CRITICAL AI ERROR:', {
      message: error.message,
      stack: error.stack,
      keyExists: !!process.env.GEMINI_API_KEY
    });
    res.status(500).json({ 
      error: 'Failed to chat', 
      details: error.message,
      troubleshooting: "Check if GEMINI_API_KEY is valid and not rate-limited."
    });
  }
};

module.exports = {
  getAiTips,
  chatFreshCurator
};
