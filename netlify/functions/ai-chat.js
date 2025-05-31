const { Groq } = require('groq-sdk');
// const path = require('path'); // No longer needed
// const fs = require('fs/promises'); // No longer needed

const aiConfig = require('./ai_config.json'); // Directly require the JSON config

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed' })
        };
    }

    const GROP_API_KEY = process.env.GROQ_API_KEY;

    if (!GROP_API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Server configuration error: GROQ_API_KEY not set.' })
        };
    }

    try {
        const { message, scenario } = JSON.parse(event.body);

        // // Load AI configuration (Previous code, no longer needed)
        // const configPath = path.resolve(__dirname, 'ai_config.json');
        // const aiConfigRaw = await fs.readFile(configPath, 'utf8');
        // const aiConfig = JSON.parse(aiConfigRaw);

        const groq = new Groq({ apiKey: GROP_API_KEY });

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are a helpful assistant for a car wash business simulator. The user is asking questions about their car wash business scenario. The current simulator context is: ${JSON.stringify(scenario)}. Answer questions, provide insights, and suggest adjustments to the simulator inputs where relevant. If the user asks you to change values, suggest the new values in a structured way (e.g., "I suggest setting carsPerHour to 15").`
                },
                {
                    role: 'user',
                    content: message,
                }
            ],
            model: aiConfig.model, // Use model from config
            temperature: aiConfig.temperature, // Use temperature from config
            max_tokens: aiConfig.max_tokens,   // Use max_tokens from config
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ reply: chatCompletion.choices[0]?.message?.content || "No response from AI." })
        };

    } catch (error) {
        console.error('AI Function Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error communicating with AI.', error: error.message })
        };
    }
}; 