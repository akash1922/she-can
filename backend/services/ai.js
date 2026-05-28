import { Groq } from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Standard fallbacks if Groq API fails or is missing
const fallbackCategorize = (message) => {
  const msg = message.toLowerCase();
  let category = 'General Query';
  let isSpam = false;
  let priority = 'medium';
  let summary = message.slice(0, 60) + (message.length > 60 ? '...' : '');

  if (msg.includes('volunteer') || msg.includes('join') || msg.includes('team') || msg.includes('contribute') || msg.includes('help as a')) {
    category = 'Volunteer Interest';
    priority = 'medium';
  } else if (msg.includes('bleed') || msg.includes('period') || msg.includes('pad') || msg.includes('hygiene') || msg.includes('menstrual') || msg.includes('emergency') || msg.includes('distress') || msg.includes('abuse') || msg.includes('violence') || msg.includes('save') || msg.includes('urgent')) {
    category = 'Help Request';
    priority = 'high';
  } else if (msg.includes('great') || msg.includes('good') || msg.includes('awesome') || msg.includes('excellent') || msg.includes('event was') || msg.includes('feedback') || msg.includes('suggest')) {
    category = 'Feedback';
    priority = 'low';
  } else if (msg.match(/(pills|cryptocurrency|lottery|casino|earn money|seo rank|http|sex|dating|viagra)/)) {
    category = 'Spam';
    isSpam = true;
    priority = 'low';
  }

  return {
    category,
    is_spam: isSpam,
    priority,
    summary
  };
};

const getGroqClient = () => {
  if (process.env.GROQ_API_KEY) {
    return new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return null;
};

export const classifyMessage = async (message) => {
  const groq = getGroqClient();
  
  if (!groq) {
    console.warn('Groq API key not set. Using smart local NLP fallback classification.');
    return fallbackCategorize(message);
  }

  try {
    const systemPrompt = `You are an AI assistant for the She Can Foundation, a registered NGO empowering women. 
Your task is to analyze user submissions (queries, support requests, feedback, or volunteer applications) and classify them.

Classify the text into EXACTLY one of these categories:
- "Volunteer Interest" (User wants to volunteer, join, offer skills, or contribute time)
- "Feedback" (User is sending reviews, suggestions, compliments about the NGO, or general thoughts)
- "Help Request" (User is asking for menstrual pads, kits, resources, educational support, or assistance)
- "Urgent Issue" (Sensitive matters, extreme distress, domestic issues, urgent menstrual health emergencies)
- "General Query" (Basic questions about timings, credentials, location, or generic info)
- "Spam" (Unrelated promotional content, links, random letters like 'asdasd', advertisements, coin deals)

Determine if the text is Spam (true or false).
Determine priority ("high", "medium", "low"). Give "high" to urgent issues or emergency help requests.
Provide a clean 1-sentence summary of what the user wants.

Respond ONLY with a valid JSON block of the following structure. Do not output conversational text or code fences:
{
  "category": "Volunteer Interest | Feedback | Help Request | Urgent Issue | General Query | Spam",
  "is_spam": boolean,
  "priority": "high | medium | low",
  "summary": "1-sentence summary of the message"
}`;

    const response = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Message content to classify:\n\n"${message}"` }
      ],
      model: 'llama3-8b-8192',
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from Groq API');
    }

    const result = JSON.parse(content);
    return {
      category: result.category || 'General Query',
      is_spam: typeof result.is_spam === 'boolean' ? result.is_spam : false,
      priority: result.priority || 'medium',
      summary: result.summary || message.slice(0, 60)
    };
  } catch (error) {
    console.error('Groq AI Classification Error, falling back to local classifier:', error);
    return fallbackCategorize(message);
  }
};
