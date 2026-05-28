import express from 'express';
import { supabase } from '../services/supabase.js';
import { classifyMessage } from '../services/ai.js';
import { broadcast } from '../services/websocket.js';

const router = express.Router();

// Memory fallbacks to ensure zero-setup works instantly
export const memoryDb = {
  volunteer_requests: [
    {
      id: "v-fallback-1",
      created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      name: "Priya Sharma",
      email: "priya@gmail.com",
      role_interested: "Social Media",
      message: "I want to help with Instagram and outreach campaigns! I have 2 years of marketing experience.",
      status: "approved",
      assigned_role: "Social Media Manager",
      ai_category: "Volunteer Interest",
      ai_is_spam: false
    },
    {
      id: "v-fallback-2",
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      name: "Simran Kaur",
      email: "simran.k@yahoo.com",
      role_interested: "Educator",
      message: "I can teach school subjects to young girls and lead period hygiene awareness workshops.",
      status: "pending",
      assigned_role: null,
      ai_category: "Volunteer Interest",
      ai_is_spam: false
    },
    {
      id: "v-fallback-3",
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      name: "Rahul Verma",
      email: "rahul.v@outlook.com",
      role_interested: "Fundraising",
      message: "Hey guys! I can volunteer on weekends to help organize collection drives.",
      status: "reviewed",
      assigned_role: null,
      ai_category: "Volunteer Interest",
      ai_is_spam: false
    }
  ],
  feedback_queries: [
    {
      id: "q-fallback-1",
      created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      name: "Anjali Gupta",
      email: "anjali.g@gmail.com",
      message: "The sanitary pad donation event last week was amazing! Extremely transparent and well organized.",
      query_type: "feedback",
      ai_category: "Feedback",
      ai_is_spam: false,
      is_resolved: true,
      priority: "low"
    },
    {
      id: "q-fallback-2",
      created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
      name: "Komal S.",
      email: "komal.support@gmail.com",
      message: "URGENT: A rural boarding school near Alwar needs about 200 kits of sanitary pads for their students.",
      query_type: "query",
      ai_category: "Help Request",
      ai_is_spam: false,
      is_resolved: false,
      priority: "high"
    },
    {
      id: "q-fallback-3",
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      name: "Best SEO Rankers",
      email: "seo.expert1@spammers.ru",
      message: "Hey! Increase traffic to your website now! Cheap click deals for $99. Visit http://grow-clicks.ru",
      query_type: "query",
      ai_category: "Spam",
      ai_is_spam: true,
      is_resolved: false,
      priority: "low"
    }
  ],
  admin_activity_logs: [
    {
      id: "log-1",
      created_at: new Date().toISOString(),
      admin_email: "president@shecanfoundation.org",
      action: "System Initialization",
      details: "SaaS Dashboard initialized successfully with mock backend memory layer."
    }
  ]
};

// Volunteer Form Submission Route
router.post('/volunteer', async (req, res) => {
  const { name, email, role_interested, message } = req.body;

  if (!name || !email || !role_interested || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    console.log(`Processing volunteer request for: ${email}`);
    // Run AI Classification using Groq
    const classification = await classifyMessage(message);
    console.log('AI Classification result:', classification);

    const submissionData = {
      name,
      email,
      role_interested,
      message,
      status: 'pending',
      assigned_role: null,
      ai_category: classification.category,
      ai_is_spam: classification.is_spam,
      ai_confidence: 0.95
    };

    // Attempt to write to Supabase
    const { data, error } = await supabase
      .from('volunteer_requests')
      .insert([submissionData])
      .select();

    if (error) {
      console.warn('Supabase insert failed. Falling back to local memory database.', error.message);
      // Store in local memory db
      const fallbackEntry = {
        id: `v-mem-${Date.now()}`,
        created_at: new Date().toISOString(),
        ...submissionData
      };
      memoryDb.volunteer_requests.unshift(fallbackEntry);
      broadcast('NEW_SUBMISSION', { ...fallbackEntry, type: 'volunteer' });
      return res.status(201).json({
        message: 'Form submitted successfully (local memory storage active)',
        data: fallbackEntry
      });
    }

    broadcast('NEW_SUBMISSION', { ...data[0], type: 'volunteer' });
    return res.status(201).json({
      message: 'Form submitted successfully to Supabase database',
      data: data[0]
    });
  } catch (err) {
    console.error('Submission error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Feedback/Support Form Submission Route
router.post('/query', async (req, res) => {
  const { name, email, message, query_type = 'query' } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  try {
    console.log(`Processing query request for: ${email}`);
    const classification = await classifyMessage(message);
    console.log('AI Classification result:', classification);

    const submissionData = {
      name,
      email,
      message,
      query_type,
      ai_category: classification.category,
      ai_is_spam: classification.is_spam,
      is_resolved: false,
      priority: classification.priority || 'medium'
    };

    // Attempt to write to Supabase
    const { data, error } = await supabase
      .from('feedback_queries')
      .insert([submissionData])
      .select();

    if (error) {
      console.warn('Supabase insert failed. Falling back to local memory database.', error.message);
      // Store in local memory db
      const fallbackEntry = {
        id: `q-mem-${Date.now()}`,
        created_at: new Date().toISOString(),
        ...submissionData
      };
      memoryDb.feedback_queries.unshift(fallbackEntry);
      broadcast('NEW_SUBMISSION', { ...fallbackEntry, type: query_type });
      return res.status(201).json({
        message: 'Query submitted successfully (local memory storage active)',
        data: fallbackEntry
      });
    }

    broadcast('NEW_SUBMISSION', { ...data[0], type: query_type });
    return res.status(201).json({
      message: 'Query submitted successfully to Supabase database',
      data: data[0]
    });
  } catch (err) {
    console.error('Submission error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
