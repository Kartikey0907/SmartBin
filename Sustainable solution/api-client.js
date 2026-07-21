/**
 * SmartBin AI - Frontend API Client
 * 
 * This module connects the frontend dashboard to the Express/Supabase backend.
 * When backend is unavailable, it falls back gracefully to the local simulation.
 */

const SmartBinAPI = {
    // Base URL - update this to your backend URL when deployed
    BASE_URL: 'http://localhost:3001/api',

    /**
     * Generic fetch wrapper with error handling
     */
    async _fetch(endpoint, options = {}) {
        const url = `${this.BASE_URL}${endpoint}`;
        const defaultHeaders = {
            'Content-Type': 'application/json',
        };

        const config = {
            headers: { ...defaultHeaders, ...options.headers },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(
                    errorData?.error || `HTTP ${response.status}: ${response.statusText}`
                );
            }

            return await response.json();
        } catch (err) {
            if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
                console.warn(`🔌 API unavailable at ${url} - is the backend running?`);
                return null;
            }
            throw err;
        }
    },

    // ==================== Bins ====================

    /**
     * Get all bins
     */
    async getBins() {
        const result = await this._fetch('/bins');
        return result?.data || null;
    },

    /**
     * Get a single bin by ID
     */
    async getBin(id) {
        const result = await this._fetch(`/bins/${id}`);
        return result?.data || null;
    },

    /**
     * Create a new bin
     */
    async createBin(binData) {
        const result = await this._fetch('/bins', {
            method: 'POST',
            body: JSON.stringify(binData),
        });
        return result?.data || null;
    },

    /**
     * Update bin fields (fill level, status, etc.)
     */
    async updateBin(id, updates) {
        const result = await this._fetch(`/bins/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
        });
        return result?.data || null;
    },

    // ==================== Events ====================

    /**
     * Get recent disposal events for the live feed
     */
    async getRecentEvents(limit = 20) {
        const result = await this._fetch(`/events/recent?limit=${limit}`);
        return result?.data || null;
    },

    /**
     * Log a new disposal event
     */
    async logEvent(eventData) {
        const result = await this._fetch('/events', {
            method: 'POST',
            body: JSON.stringify(eventData),
        });
        return result?.data || null;
    },

    /**
     * Get event statistics
     */
    async getEventStats() {
        const result = await this._fetch('/events/stats');
        return result?.data || null;
    },

    // ==================== Analytics ====================

    /**
     * Get dashboard overview (metrics + bins summary + today's events)
     */
    async getOverview() {
        const result = await this._fetch('/analytics/overview');
        return result?.data || null;
    },

    /**
     * Get hourly waste data for charts
     */
    async getHourlyData(date, binId) {
        let endpoint = `/analytics/hourly?date=${date || new Date().toISOString().split('T')[0]}`;
        if (binId) endpoint += `&bin_id=${binId}`;
        const result = await this._fetch(endpoint);
        return result?.data || null;
    },

    /**
     * Get weekly compliance data
     */
    async getComplianceData() {
        const result = await this._fetch('/analytics/compliance');
        return result?.data || null;
    },

    /**
     * Get waste composition data
     */
    async getComposition() {
        const result = await this._fetch('/analytics/composition');
        return result?.data || null;
    },

    /**
     * Get AI-powered insights
     */
    async getInsights() {
        const result = await this._fetch('/analytics/insights');
        return result?.data || null;
    },

    // ==================== Health Check ====================

    /**
     * Check if backend is healthy
     */
    async healthCheck() {
        const result = await this._fetch('/health');
        return result || null;
    },

    /**
     * Try to connect to the backend. Returns true if successful.
     */
    async ping() {
        try {
            const health = await this.healthCheck();
            if (health && health.status === 'healthy') {
                console.log(`✅ Backend connected — SmartBin AI v${health.version}`);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }
};

// ==================== Supabase Direct Client (Optional) ====================
// For environments where you want to call Supabase directly from the frontend
// NOTE: Requires SUPABASE_ANON_KEY exposed to the client

class SmartBinSupabaseClient {
    constructor(supabaseUrl, supabaseAnonKey) {
        if (!supabaseUrl || !supabaseAnonKey) {
            console.warn('⚠️ Supabase client not initialized - missing credentials');
            this.initialized = false;
            return;
        }

        this.supabase = supabase.createClient(supabaseUrl, supabaseAnonKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        });
        this.initialized = true;
        console.log('✅ Supabase direct client initialized');
    }

    async getBins() {
        if (!this.initialized) return null;
        const { data } = await this.supabase.from('bins').select('*').order('created_at');
        return data;
    }

    async getRecentEvents(limit = 20) {
        if (!this.initialized) return null;
        const { data } = await this.supabase
            .from('disposal_events')
            .select('*, bins(name, type, location)')
            .order('created_at', { ascending: false })
            .limit(limit);
        return data;
    }

    async logEvent(eventData) {
        if (!this.initialized) return null;
        const { data } = await this.supabase
            .from('disposal_events')
            .insert(eventData)
            .select('*, bins(name, type, location)')
            .single();
        return data;
    }

    async getImpactMetrics() {
        if (!this.initialized) return null;
        const { data } = await this.supabase.from('impact_metrics').select('*');
        const metrics = {};
        if (data) {
            data.forEach(m => { metrics[m.metric_type] = { value: m.value, unit: m.unit }; });
        }
        return metrics;
    }
}

// Export for use
window.SmartBinAPI = SmartBinAPI;
window.SmartBinSupabaseClient = SmartBinSupabaseClient;