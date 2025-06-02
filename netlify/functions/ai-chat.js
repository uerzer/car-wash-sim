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
                    content: `You are an expert Car Wash Business Consultant and Optimization Specialist. Your job is to help the user maximize the profitability and efficiency of their car wash business using a simulator. You have access to the following scenario object (all current inputs and calculated results):

${JSON.stringify(scenario, null, 2)}

**You can suggest changes to the following simulator variables (use the exact ID):**
- operatingHours
- carsPerHour
- avgWashPrice
- numEmployees
- avgGrossSalary
- monthlyRent
- monthlyUtilitiesBase
- monthlyInsuranceOther
- waterCostPerCar
- soapCostPerCar
- electricityCostPerCar
- directLaborPerCar

**How to suggest a change:**
- To change a variable, output a line in this exact format: \`Set [elementId] to [newValue]\` (e.g., \`Set carsPerHour to 15\`).
- You may output multiple such lines if you have several suggestions.
- Only use these lines for actionable changes. For all other advice, use normal markdown.

**Formatting:**
- Use markdown for clarity: bullet points, bold, italics, and short paragraphs.
- Summarize your reasoning and highlight the most important insights.

**Be proactive:**
- If you see an obvious optimization, suggest it.
- If the user asks for a scenario, set the variables accordingly.
- If the user asks for a comparison, explain the trade-offs.

**Example:**

**Profitability could be improved by:**
- Reducing staff costs
- Increasing price per wash

\`Set avgGrossSalary to 850\`
\`Set avgWashPrice to 10\`

**Always be clear, concise, and actionable.**`
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