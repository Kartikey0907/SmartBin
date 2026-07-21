const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/supabase');

// GET /api/events - Get disposal events (with pagination and filters)
router.get('/', async (req, res) => {
    try {
        const { bin_id, compliant, limit = 50, offset = 0, start_date, end_date } = req.query;

        let query = supabase
            .from('disposal_events')
            .select('*, bins(name, type, location)')
            .order('created_at', { ascending: false })
            .limit(parseInt(limit))
            .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

        if (bin_id) query = query.eq('bin_id', bin_id);
        if (compliant !== undefined) query = query.eq('is_compliant', compliant === 'true');
        if (start_date) query = query.gte('created_at', start_date);
        if (end_date) query = query.lte('created_at', end_date);

        const { data, error, count } = await query;
        if (error) throw error;

        res.json({ success: true, data, count: data.length });
    } catch (err) {
        console.error('Error fetching events:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/events/recent - Get recent events for live feed
router.get('/recent', async (req, res) => {
    try {
        const { limit = 20 } = req.query;

        const { data, error } = await supabase
            .from('disposal_events')
            .select('*, bins(name, type, location)')
            .order('created_at', { ascending: false })
            .limit(parseInt(limit));

        if (error) throw error;

        // Enrich events with display data
        const enriched = data.map(event => ({
            ...event,
            display: {
                icon: event.is_compliant ? 'fa-check-circle' : 'fa-exclamation-triangle',
                type: event.is_compliant ? 'compliant' : 'non-compliant',
                prefix: event.is_compliant ? '✅ Correct disposal:' : '⚠️ Alert:',
                bin_name: event.bins?.name || 'Unknown Bin',
                bin_type: event.bins?.type || 'unknown',
                location: event.bins?.location || 'Unknown'
            }
        }));

        res.json({ success: true, data: enriched });
    } catch (err) {
        console.error('Error fetching recent events:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/events - Log a new disposal event
router.post('/', async (req, res) => {
    try {
        const { bin_id, waste_type, waste_category, detected_category, is_compliant, weight_estimate_kg, confidence_score } = req.body;

        if (!bin_id || !waste_type || !waste_category || !detected_category) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: bin_id, waste_type, waste_category, detected_category'
            });
        }

        const validCategories = ['wet', 'dry', 'plastic'];
        if (!validCategories.includes(waste_category) || !validCategories.includes(detected_category)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid category. Must be wet, dry, or plastic.'
            });
        }

        const feedback_type = is_compliant ? 'correct' : (detected_category !== waste_category ? 'alert' : 'warning');

        const { data, error } = await supabaseAdmin
            .from('disposal_events')
            .insert([{
                bin_id,
                waste_type,
                waste_category,
                detected_category,
                is_compliant: is_compliant || false,
                weight_estimate_kg: weight_estimate_kg || null,
                confidence_score: confidence_score || null,
                feedback_type
            }])
            .select('*, bins(name, type, location)')
            .single();

        if (error) throw error;

        // Update bin's fill level
        if (data) {
            const weightIncrement = weight_estimate_kg || 0.5;
            const volumeIncrement = (weightIncrement / 100) * 100; // Approximate fill level increment
            const binUpdate = await supabaseAdmin.rpc('increment_bin_fill', {
                bin_id: bin_id,
                increment_amount: volumeIncrement
            }).single();

            // If RPC not available, do manual update
            if (binUpdate.error) {
                const { data: binData } = await supabase
                    .from('bins')
                    .select('fill_level, current_capacity, max_capacity')
                    .eq('id', bin_id)
                    .single();

                if (binData) {
                    const newFill = Math.min(100, binData.fill_level + (weightIncrement * 0.8));
                    const newCapacity = Math.min(binData.max_capacity, binData.current_capacity + weightIncrement);

                    await supabaseAdmin
                        .from('bins')
                        .update({
                            fill_level: parseFloat(newFill.toFixed(2)),
                            current_capacity: parseFloat(newCapacity.toFixed(2))
                        })
                        .eq('id', bin_id);
                }
            }
        }

        res.status(201).json({ success: true, data });
    } catch (err) {
        console.error('Error logging event:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/events/stats - Get event statistics
router.get('/stats', async (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        let query = supabase
            .from('disposal_events')
            .select('*', { count: 'exact', head: true });

        if (start_date) query = query.gte('created_at', start_date);
        if (end_date) query = query.lte('created_at', end_date);

        // Get total count
        const { count: totalCount } = await query;

        // Get compliant count
        let compliantQuery = supabase
            .from('disposal_events')
            .select('*', { count: 'exact', head: true })
            .eq('is_compliant', true);

        if (start_date) compliantQuery = compliantQuery.gte('created_at', start_date);
        if (end_date) compliantQuery = compliantQuery.lte('created_at', end_date);

        const { count: compliantCount } = await compliantQuery;

        // Get category breakdown
        let categoryQuery = supabase
            .from('disposal_events')
            .select('waste_category, is_compliant');

        if (start_date) categoryQuery = categoryQuery.gte('created_at', start_date);
        if (end_date) categoryQuery = categoryQuery.lte('created_at', end_date);

        const { data: categoryData } = await categoryQuery;

        // Calculate breakdown
        const breakdown = { wet: { total: 0, compliant: 0 }, dry: { total: 0, compliant: 0 }, plastic: { total: 0, compliant: 0 } };
        if (categoryData) {
            categoryData.forEach(event => {
                if (breakdown[event.waste_category]) {
                    breakdown[event.waste_category].total++;
                    if (event.is_compliant) breakdown[event.waste_category].compliant++;
                }
            });
        }

        const complianceRate = totalCount > 0 ? ((compliantCount / totalCount) * 100).toFixed(1) : 0;

        res.json({
            success: true,
            data: {
                total_events: totalCount || 0,
                compliant_events: compliantCount || 0,
                non_compliant_events: (totalCount || 0) - (compliantCount || 0),
                compliance_rate: parseFloat(complianceRate),
                category_breakdown: breakdown
            }
        });
    } catch (err) {
        console.error('Error fetching event stats:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;