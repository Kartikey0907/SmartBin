/**
 * SmartBin AI - Database Seed Script
 * 
 * Run with: node scripts/seed.js
 * 
 * This script populates the Supabase database with sample data
 * for testing the dashboard. Make sure your .env is configured.
 */

require('dotenv').config();
const { supabaseAdmin } = require('../config/supabase');

const wasteTypes = [
    { name: 'Food scraps', category: 'wet' },
    { name: 'Vegetable peels', category: 'wet' },
    { name: 'Tea leaves', category: 'wet' },
    { name: 'Leftover rice', category: 'wet' },
    { name: 'Fruit waste', category: 'wet' },
    { name: 'Egg shells', category: 'wet' },
    { name: 'Paper cup', category: 'dry' },
    { name: 'Cardboard box', category: 'dry' },
    { name: 'Newspaper', category: 'dry' },
    { name: 'Paper napkin', category: 'dry' },
    { name: 'Plastic bottle', category: 'plastic' },
    { name: 'Plastic wrapper', category: 'plastic' },
    { name: 'PET bottle', category: 'plastic' },
    { name: 'Aluminum can', category: 'plastic' },
    { name: 'Plastic bag', category: 'plastic' },
    { name: 'Glass bottle', category: 'plastic' },
];

const binIds = [
    'a0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000003'
];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(3));
}

function generateEvent(binId, hoursAgo) {
    const timestamp = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
    const wasteItem = wasteTypes[getRandomInt(0, wasteTypes.length - 1)];

    // 85% chance of being compliant
    const isCompliant = Math.random() < 0.85;
    const detectedCategory = isCompliant
        ? wasteItem.category
        : wasteTypes[getRandomInt(0, wasteTypes.length - 1)].category;

    return {
        bin_id: binId,
        waste_type: wasteItem.name,
        waste_category: wasteItem.category,
        detected_category: detectedCategory,
        is_compliant: isCompliant,
        weight_estimate_kg: getRandomFloat(0.05, 2.0),
        confidence_score: getRandomFloat(0.75, 0.99),
        feedback_type: isCompliant ? 'correct' : (detectedCategory !== wasteItem.category ? 'alert' : 'warning'),
        created_at: timestamp.toISOString()
    };
}

async function seed() {
    console.log('🌱 SmartBin AI - Database Seeder');
    console.log('================================\n');

    // 1. Seed Bins
    console.log('📦 Seeding bins...');
    const bins = [
        { id: binIds[0], name: 'Wet Waste Bin', type: 'wet', location: 'Hostel A - Mess Hall', zone: 'Hostel A', fill_level: 62, current_capacity: 62, max_capacity: 100 },
        { id: binIds[1], name: 'Dry Waste Bin', type: 'dry', location: 'Hostel B - Cafeteria', zone: 'Hostel B', fill_level: 45, current_capacity: 45, max_capacity: 100 },
        { id: binIds[2], name: 'Plastic/Recyclable Bin', type: 'plastic', location: 'Main Cafeteria - Food Court', zone: 'Main Campus', fill_level: 78, current_capacity: 78, max_capacity: 100 },
    ];

    for (const bin of bins) {
        const { error } = await supabaseAdmin
            .from('bins')
            .upsert(bin, { onConflict: 'id' });
        if (error) console.error(`  ❌ Error seeding bin ${bin.name}:`, error.message);
        else console.log(`  ✅ ${bin.name}`);
    }

    // 2. Seed Disposal Events (last 7 days of data)
    console.log('\n📝 Seeding disposal events...');
    let eventCount = 0;
    const totalEvents = 500;

    for (let day = 0; day < 7; day++) {
        const eventsPerDay = getRandomInt(60, 100);
        for (let i = 0; i < eventsPerDay; i++) {
            const binId = binIds[getRandomInt(0, 2)];
            const hoursAgo = day * 24 + getRandomInt(0, 23);
            const event = generateEvent(binId, hoursAgo);

            const { error } = await supabaseAdmin
                .from('disposal_events')
                .insert(event);

            if (!error) eventCount++;
            if (eventCount % 100 === 0) process.stdout.write('.');
        }
    }
    console.log(`\n  ✅ ${eventCount} events seeded`);

    // 3. Seed Impact Metrics
    console.log('\n📊 Seeding impact metrics...');
    const metrics = [
        { metric_type: 'waste_diverted_kg', value: 1427, unit: 'kg' },
        { metric_type: 'compost_produced_kg', value: 584, unit: 'kg' },
        { metric_type: 'methane_avoided_kg', value: 312, unit: 'kg' },
        { metric_type: 'co2e_avoided_t', value: 12.4, unit: 't' },
        { metric_type: 'landfill_fees_saved', value: 48500, unit: '₹' },
        { metric_type: 'total_interventions', value: 312, unit: 'events' },
        { metric_type: 'overall_compliance_rate', value: 87, unit: '%' },
        { metric_type: 'active_bins', value: 3, unit: 'bins' },
        { metric_type: 'total_events_logged', value: 2847, unit: 'events' },
    ];

    for (const metric of metrics) {
        const { error } = await supabaseAdmin
            .from('impact_metrics')
            .upsert(metric, { onConflict: 'metric_type' });
        if (error) console.error(`  ❌ Error seeding ${metric.metric_type}:`, error.message);
        else console.log(`  ✅ ${metric.metric_type}: ${metric.value} ${metric.unit}`);
    }

    // 4. Seed Weekly Compliance
    console.log('\n📈 Seeding weekly compliance...');
    const weeklyData = [
        { week_start: '2026-06-22', week_label: 'Week 1', compliance_rate: 72, total_events: 420, compliant_events: 302 },
        { week_start: '2026-06-29', week_label: 'Week 2', compliance_rate: 78, total_events: 510, compliant_events: 398 },
        { week_start: '2026-07-06', week_label: 'Week 3', compliance_rate: 85, total_events: 480, compliant_events: 408 },
        { week_start: '2026-07-13', week_label: 'Week 4', compliance_rate: 89, total_events: 540, compliant_events: 481 },
    ];

    for (const week of weeklyData) {
        const { error } = await supabaseAdmin
            .from('weekly_compliance')
            .upsert(week, { onConflict: 'week_start' });
        if (error) console.error(`  ❌ Error seeding ${week.week_label}:`, error.message);
        else console.log(`  ✅ ${week.week_label}: ${week.compliance_rate}% compliance`);
    }

    console.log('\n================================');
    console.log('🎉 Seeding complete!');
    console.log(`   • 3 Bins`);
    console.log(`   • ${eventCount} Disposal Events`);
    console.log(`   • 9 Impact Metrics`);
    console.log(`   • 4 Weekly Compliance Records`);
    console.log('================================\n');
}

seed().catch(err => {
    console.error('\n❌ Seed failed:', err);
    process.exit(1);
});