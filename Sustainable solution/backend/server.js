const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const binsRouter = require('./routes/bins');
const eventsRouter = require('./routes/events');
const analyticsRouter = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ===== Middleware =====
app.use(cors({
    origin: FRONTEND_URL.split(',').map(u => u.trim()),
    credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// ===== Routes =====
app.use('/api/bins', binsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/analytics', analyticsRouter);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        system: 'SmartBin AI Backend'
    });
});

// ===== Error Handler =====
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ===== Start Server =====
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════╗
║          SmartBin AI Backend             ║
║──────────────────────────────────────────║
║  Status:    🟢 Running                   ║
║  Port:      ${String(PORT).padEnd(30)}║
║  API:       http://localhost:${PORT}/api  ║
║  Frontend:  ${FRONTEND_URL.padEnd(22)}║
║  Mode:      ${(process.env.NODE_ENV || 'development').padEnd(30)}║
╚══════════════════════════════════════════╝
    `);
});