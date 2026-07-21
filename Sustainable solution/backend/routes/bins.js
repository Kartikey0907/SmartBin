const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/supabase');

// GET /api/bins - Get all bins
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('bins')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;
        res.json({ success: true, data });
    } catch (err) {
        console.error('Error fetching bins:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/bins/:id - Get a single bin by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('bins')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ success: false, error: 'Bin not found' });
        }
        res.json({ success: true, data });
    } catch (err) {
        console.error('Error fetching bin:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/bins/type/:type - Get bins by type (wet, dry, plastic)
router.get('/type/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const validTypes = ['wet', 'dry', 'plastic'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ success: false, error: 'Invalid bin type. Must be wet, dry, or plastic.' });
        }

        const { data, error } = await supabase
            .from('bins')
            .select('*')
            .eq('type', type)
            .order('created_at', { ascending: true });

        if (error) throw error;
        res.json({ success: true, data });
    } catch (err) {
        console.error('Error fetching bins by type:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/bins - Create a new bin
router.post('/', async (req, res) => {
    try {
        const { name, type, location, zone, max_capacity = 100, alert_threshold = 85 } = req.body;

        if (!name || !type || !location) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: name, type, location'
            });
        }

        const validTypes = ['wet', 'dry', 'plastic'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ success: false, error: 'Invalid bin type. Must be wet, dry, or plastic.' });
        }

        const { data, error } = await supabaseAdmin
            .from('bins')
            .insert([{
                name,
                type,
                location,
                zone: zone || 'Campus',
                max_capacity,
                alert_threshold,
                fill_level: 0,
                current_capacity: 0,
                status: 'active'
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ success: true, data });
    } catch (err) {
        console.error('Error creating bin:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// PATCH /api/bins/:id - Update bin (e.g., fill level, status)
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Only allow updating specific fields
        const allowedFields = ['fill_level', 'current_capacity', 'status', 'name', 'location', 'zone', 'alert_threshold'];
        const sanitizedUpdates = {};
        for (const key of Object.keys(updates)) {
            if (allowedFields.includes(key)) {
                sanitizedUpdates[key] = updates[key];
            }
        }

        if (Object.keys(sanitizedUpdates).length === 0) {
            return res.status(400).json({ success: false, error: 'No valid fields to update' });
        }

        const { data, error } = await supabaseAdmin
            .from('bins')
            .update(sanitizedUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ success: false, error: 'Bin not found' });
        }
        res.json({ success: true, data });
    } catch (err) {
        console.error('Error updating bin:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE /api/bins/:id - Delete a bin
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabaseAdmin
            .from('bins')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true, message: 'Bin deleted successfully' });
    } catch (err) {
        console.error('Error deleting bin:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;