import express from 'express';
import { supabase } from '../services/supabase.js';
import { memoryDb } from './submissions.js';
import { broadcast } from '../services/websocket.js';

const router = express.Router();

// Helper to log admin activities
const logActivity = async (email, action, details) => {
  const logData = {
    admin_email: email,
    action,
    details
  };
  try {
    const { error } = await supabase.from('admin_activity_logs').insert([logData]);
    if (error) {
      console.warn('Logging to Supabase failed, falling back to memory log.');
      memoryDb.admin_activity_logs.unshift({
        id: `log-mem-${Date.now()}`,
        created_at: new Date().toISOString(),
        ...logData
      });
    }
  } catch (err) {
    memoryDb.admin_activity_logs.unshift({
      id: `log-mem-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...logData
    });
  }
};

// Admin Analytics Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    // Attempt Supabase fetch
    const { data: vReqs, error: vErr } = await supabase.from('volunteer_requests').select('*');
    const { data: fQueries, error: qErr } = await supabase.from('feedback_queries').select('*');

    if (vErr || qErr) {
      console.warn('Supabase fetch for stats failed, using fallback database.');
      throw new Error('Fallback active');
    }

    const totalVolunteers = vReqs.filter(v => v.status === 'approved').length;
    const pendingVolunteers = vReqs.filter(v => v.status === 'pending').length;
    const spamDetected = fQueries.filter(q => q.ai_is_spam).length + vReqs.filter(v => v.ai_is_spam).length;
    const totalFeedback = fQueries.filter(q => q.query_type === 'feedback').length;
    const pendingQueries = fQueries.filter(q => !q.is_resolved && !q.ai_is_spam).length;

    return res.json({
      totalUsers: vReqs.length + fQueries.length + 5, // mock users offset
      volunteers: totalVolunteers,
      pendingVolunteers,
      feedbackReceived: totalFeedback,
      activeQueries: pendingQueries,
      spamDetected
    });

  } catch (error) {
    // Use Memory Fallback stats
    const vReqs = memoryDb.volunteer_requests;
    const fQueries = memoryDb.feedback_queries;

    const totalVolunteers = vReqs.filter(v => v.status === 'approved').length;
    const pendingVolunteers = vReqs.filter(v => v.status === 'pending').length;
    const spamDetected = fQueries.filter(q => q.ai_is_spam).length + vReqs.filter(v => v.ai_is_spam).length;
    const totalFeedback = fQueries.filter(q => q.query_type === 'feedback').length;
    const pendingQueries = fQueries.filter(q => !q.is_resolved && !q.ai_is_spam).length;

    return res.json({
      totalUsers: vReqs.length + fQueries.length + 15,
      volunteers: totalVolunteers,
      pendingVolunteers,
      feedbackReceived: totalFeedback,
      activeQueries: pendingQueries,
      spamDetected
    });
  }
});

// Fetch Submissions list
router.get('/submissions', async (req, res) => {
  const { type = 'all', status = 'all', search = '', spam = 'false' } = req.query;

  try {
    let volunteers = [];
    let queries = [];

    // 1. Fetch volunteers from Supabase
    if (type === 'all' || type === 'volunteers') {
      let query = supabase.from('volunteer_requests').select('*');
      if (status !== 'all') {
        query = query.eq('status', status);
      }
      if (spam !== 'all') {
        query = query.eq('ai_is_spam', spam === 'true');
      }
      const { data, error } = await query;
      if (error) throw error;
      volunteers = data || [];
    }

    // 2. Fetch queries from Supabase
    if (type === 'all' || type === 'queries') {
      let query = supabase.from('feedback_queries').select('*');
      if (spam !== 'all') {
        query = query.eq('ai_is_spam', spam === 'true');
      }
      if (status === 'resolved') {
        query = query.eq('is_resolved', true);
      } else if (status === 'pending') {
        query = query.eq('is_resolved', false);
      }
      const { data, error } = await query;
      if (error) throw error;
      queries = data || [];
    }

    // Apply search filter and compile
    let results = [
      ...volunteers.map(v => ({ ...v, type: 'volunteer' })),
      ...queries.map(q => ({ ...q, type: q.query_type || 'query' }))
    ];

    if (search) {
      const qLower = search.toLowerCase();
      results = results.filter(item => 
        (item.name && item.name.toLowerCase().includes(qLower)) ||
        (item.email && item.email.toLowerCase().includes(qLower)) ||
        (item.message && item.message.toLowerCase().includes(qLower))
      );
    }

    // Sort by created_at descending
    results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return res.json(results);

  } catch (error) {
    // Fallback Memory Data
    let volunteers = [];
    let queries = [];

    if (type === 'all' || type === 'volunteers') {
      volunteers = memoryDb.volunteer_requests;
      if (status !== 'all') {
        volunteers = volunteers.filter(v => v.status === status);
      }
      if (spam !== 'all') {
        volunteers = volunteers.filter(v => v.ai_is_spam === (spam === 'true'));
      }
    }

    if (type === 'all' || type === 'queries') {
      queries = memoryDb.feedback_queries;
      if (spam !== 'all') {
        queries = queries.filter(q => q.ai_is_spam === (spam === 'true'));
      }
      if (status === 'resolved') {
        queries = queries.filter(q => q.is_resolved === true);
      } else if (status === 'pending') {
        queries = queries.filter(q => q.is_resolved === false);
      }
    }

    let results = [
      ...volunteers.map(v => ({ ...v, type: 'volunteer' })),
      ...queries.map(q => ({ ...q, type: q.query_type || 'query' }))
    ];

    if (search) {
      const qLower = search.toLowerCase();
      results = results.filter(item => 
        (item.name && item.name.toLowerCase().includes(qLower)) ||
        (item.email && item.email.toLowerCase().includes(qLower)) ||
        (item.message && item.message.toLowerCase().includes(qLower))
      );
    }

    results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return res.json(results);
  }
});

// Update Volunteer Status (Approved/Rejected)
router.post('/volunteer/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, adminEmail = 'admin@shecanfoundation.org' } = req.body;

  try {
    const { data, error } = await supabase
      .from('volunteer_requests')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) throw error;

    await logActivity(adminEmail, 'Update Volunteer Status', `Updated volunteer ID ${id} to ${status}`);
    broadcast('SUBMISSION_UPDATED', { ...data[0], type: 'volunteer' });
    return res.json({ success: true, data: data[0] });

  } catch (error) {
    // Memory database update
    const volunteer = memoryDb.volunteer_requests.find(v => v.id === id);
    if (volunteer) {
      volunteer.status = status;
      if (status === 'approved' && !volunteer.assigned_role) {
        volunteer.assigned_role = volunteer.role_interested + ' Representative';
      }
      await logActivity(adminEmail, 'Update Volunteer Status (Memory)', `Updated volunteer ${volunteer.name} to ${status}`);
      broadcast('SUBMISSION_UPDATED', { ...volunteer, type: 'volunteer' });
      return res.json({ success: true, data: volunteer });
    }
    return res.status(404).json({ error: 'Volunteer not found' });
  }
});

// Assign Volunteer Role
router.post('/volunteer/:id/role', async (req, res) => {
  const { id } = req.params;
  const { role, adminEmail = 'admin@shecanfoundation.org' } = req.body;

  try {
    const { data, error } = await supabase
      .from('volunteer_requests')
      .update({ assigned_role: role, status: 'approved' })
      .eq('id', id)
      .select();

    if (error) throw error;

    await logActivity(adminEmail, 'Assign Role', `Assigned role "${role}" to volunteer ID ${id}`);
    broadcast('SUBMISSION_UPDATED', { ...data[0], type: 'volunteer' });
    return res.json({ success: true, data: data[0] });

  } catch (error) {
    const volunteer = memoryDb.volunteer_requests.find(v => v.id === id);
    if (volunteer) {
      volunteer.assigned_role = role;
      volunteer.status = 'approved';
      await logActivity(adminEmail, 'Assign Role (Memory)', `Assigned role "${role}" to volunteer ${volunteer.name}`);
      broadcast('SUBMISSION_UPDATED', { ...volunteer, type: 'volunteer' });
      return res.json({ success: true, data: volunteer });
    }
    return res.status(404).json({ error: 'Volunteer not found' });
  }
});

// Resolve Query/Feedback
router.post('/query/:id/resolve', async (req, res) => {
  const { id } = req.params;
  const { is_resolved, adminEmail = 'admin@shecanfoundation.org' } = req.body;

  try {
    const { data, error } = await supabase
      .from('feedback_queries')
      .update({ is_resolved })
      .eq('id', id)
      .select();

    if (error) throw error;

    await logActivity(adminEmail, 'Toggle Query Resolution', `Set query ID ${id} resolved status to ${is_resolved}`);
    broadcast('SUBMISSION_UPDATED', { ...data[0], type: data[0].query_type || 'query' });
    return res.json({ success: true, data: data[0] });

  } catch (error) {
    const query = memoryDb.feedback_queries.find(q => q.id === id);
    if (query) {
      query.is_resolved = is_resolved;
      await logActivity(adminEmail, 'Toggle Query Resolution (Memory)', `Set query from ${query.name} resolved status to ${is_resolved}`);
      broadcast('SUBMISSION_UPDATED', { ...query, type: query.query_type || 'query' });
      return res.json({ success: true, data: query });
    }
    return res.status(404).json({ error: 'Query not found' });
  }
});

// AI Insights dashboard aggregations
router.get('/insights', async (req, res) => {
  try {
    const { data: fQueries } = await supabase.from('feedback_queries').select('ai_category, priority, ai_is_spam');
    const { data: vReqs } = await supabase.from('volunteer_requests').select('ai_category, ai_is_spam');

    const allData = [
      ...(fQueries || []).map(q => ({ category: q.ai_category, is_spam: q.ai_is_spam, priority: q.priority })),
      ...(vReqs || []).map(v => ({ category: v.ai_category, is_spam: v.ai_is_spam, priority: 'medium' }))
    ];

    const categoryCounts = {};
    let spamCount = 0;
    let highPriorityCount = 0;

    allData.forEach(item => {
      if (item.is_spam) {
        spamCount++;
      } else {
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
        if (item.priority === 'high') {
          highPriorityCount++;
        }
      }
    });

    return res.json({
      categoryDistribution: Object.entries(categoryCounts).map(([name, value]) => ({ name, value })),
      spamCount,
      urgentCount: highPriorityCount,
      frequentTopic: Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'General Query'
    });

  } catch (error) {
    const allData = [
      ...memoryDb.feedback_queries.map(q => ({ category: q.ai_category, is_spam: q.ai_is_spam, priority: q.priority })),
      ...memoryDb.volunteer_requests.map(v => ({ category: v.ai_category, is_spam: v.ai_is_spam, priority: 'medium' }))
    ];

    const categoryCounts = {};
    let spamCount = 0;
    let highPriorityCount = 0;

    allData.forEach(item => {
      if (item.is_spam) {
        spamCount++;
      } else {
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
        if (item.priority === 'high') {
          highPriorityCount++;
        }
      }
    });

    return res.json({
      categoryDistribution: Object.entries(categoryCounts).map(([name, value]) => ({ name, value })),
      spamCount,
      urgentCount: highPriorityCount,
      frequentTopic: Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'General Query'
    });
  }
});

// Logs feed
router.get('/logs', async (req, res) => {
  try {
    const { data, error } = await supabase.from('admin_activity_logs').select('*').order('created_at', { ascending: false }).limit(20);
    if (error) throw error;
    return res.json(data);
  } catch (error) {
    return res.json(memoryDb.admin_activity_logs.slice(0, 20));
  }
});

export default router;
