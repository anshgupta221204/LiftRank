const { GoogleGenerativeAI } = require('@google/generative-ai');

// @route   POST api/ai/chat
// @desc    Chat with LiftRank AI Coach
// @access  Private
exports.chatWithCoach = async (req, res) => {
  const { message } = req.body;

  // 1. Validate the message
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ message: 'Please provide a valid message' });
  }

  // 2. Check if GEMINI_API_KEY is configured
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    console.warn('AI Coach Request blocked: GEMINI_API_KEY is not configured in backend/.env');
    return res.status(503).json({
      reply: 'The LiftRank AI Coach is currently offline. Please configure your GEMINI_API_KEY in the backend/.env file to start chatting.',
    });
  }

  try {
    // 3. Initialize Google Generative AI with the system instructions
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',
      systemInstruction: 
        'You are LiftRank AI Coach, a fitness and wellness assistant. ' +
        'Your goal is to help LiftRank users by answering questions about diet, exercise, and fitness progress. ' +
        'Provide practical fitness guidance, general nutrition advice, exercise explanations, and workout suggestions. ' +
        'Encourage safe progression and progressive overload. Ask clarifying questions when useful. ' +
        'Keep answers concise, direct, and formatted in clear markdown. ' +
        'Do not claim to personally know the user\'s physical health condition. ' +
        'Avoid pretending to be a doctor, dietitian, physiotherapist, or other licensed professional. ' +
        'Avoid diagnosing medical conditions or prescribing medications. ' +
        'Avoid making dangerous, extreme, or high-risk recommendations. ' +
        'Always encourage consulting professional medical advice for injuries, serious pain, or other medical concerns.',
    });

    // 4. Send message to model and wait for response
    const result = await model.generateContent(message.trim());
    const replyText = result.response.text();

    // 5. Send back formatted reply
    return res.status(200).json({
      reply: replyText,
    });

  } catch (err) {
    console.error('Gemini API Error:', err.message);
    
    // Graceful error handling (no stack traces, keys, or raw provider errors sent to client)
    return res.status(500).json({
      message: 'Sorry, I couldn\'t reach the AI Coach right now. Please try again.',
    });
  }
};
