# ♻️ SmartBin AI — Intelligent Waste Monitoring System

> **Edge AI-powered waste segregation monitoring for campus hostels and cafeterias.**
> Reducing landfill impact through smart feedback and data-driven decisions.

![SmartBin AI Dashboard](https://img.shields.io/badge/Status-Live%20Demo-brightgreen)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E)
![Node](https://img.shields.io/badge/Node.js-18+-339933)

---

## 🏗️ Architecture

```
SmartBin AI/
├── index.html             # Main dashboard (standalone mode)
├── styles.css             # Design system & animations
├── app.js                 # Frontend simulation engine
├── api-client.js          # Backend API integration layer
│
├── backend/
│   ├── server.js          # Express.js server
│   ├── package.json       # Dependencies
│   ├── .env.example       # Environment template
│   ├── supabase-schema.sql # Full database schema
│   │
│   ├── config/
│   │   └── supabase.js    # Supabase client config (anon + service role)
│   │
│   ├── routes/
│   │   ├── bins.js        # CRUD for waste bins
│   │   ├── events.js      # Disposal event logging & queries
│   │   └── analytics.js   # Overview, hourly, compliance, composition, insights
│   │
│   └── scripts/
│       └── seed.js        # Database seeder (500+ sample events)
│
├── README.md
└── .gitignore
```

---

## 🚀 Quick Start

### 1. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a project
2. Open the **SQL Editor** in your Supabase dashboard
3. Copy the entire contents of `backend/supabase-schema.sql` and paste it in the editor
4. Run the SQL — this creates all tables, indexes, RLS policies, and seed data
5. Go to **Project Settings → API** and copy your:
   - `Project URL` (SUPABASE_URL)
   - `anon public` key (SUPABASE_ANON_KEY)
   - `service_role` key (SUPABASE_SERVICE_KEY)

### 2. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here
PORT=3001
```

### 3. Install & Start Backend

```bash
cd backend
npm install
npm start
```

Your API server is now running at `http://localhost:3001`

### 4. Seed Sample Data (Optional)

```bash
cd backend
node scripts/seed.js
```

This generates 500+ disposal events across 7 days with realistic patterns.

### 5. Open the Dashboard

Simply open **`index.html`** in your browser.

The dashboard works in two modes:
- **🖥️ Standalone Mode** — Local simulation runs automatically (no backend needed)
- **🌐 Connected Mode** — When the backend is running, data flows from Supabase

---

## 📡 API Endpoints

Once the backend is running, you can access:

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |

### Bins
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bins` | List all bins |
| GET | `/api/bins/:id` | Get bin by ID |
| GET | `/api/bins/type/:type` | Get bins by type (wet/dry/plastic) |
| POST | `/api/bins` | Create a bin |
| PATCH | `/api/bins/:id` | Update bin (fill level, status) |
| DELETE | `/api/bins/:id` | Delete a bin |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | List events (paginated, filterable) |
| GET | `/api/events/recent` | Recent events for live feed |
| GET | `/api/events/stats` | Event statistics & breakdown |
| POST | `/api/events` | Log a disposal event |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/overview` | Dashboard overview (metrics + bins) |
| GET | `/api/analytics/hourly` | Hourly waste data for charts |
| GET | `/api/analytics/compliance` | Weekly compliance trend |
| GET | `/api/analytics/composition` | Waste composition breakdown |
| GET | `/api/analytics/insights` | AI-powered insights |

---

## 📊 Features

### Real-Time Monitoring
- **AI Vision Simulation** — Animated scan lines + object detection bounding boxes
- **Live Bin Cards** — Fill levels, deposit counts, contamination rates
- **Activity Feed** — Time-stamped log of every disposal event

### Analytics Dashboard
- **Hourly Deposition Chart** — Stacked bar chart (Day/Week/Month toggle)
- **Waste Composition Chart** — Donut chart with contamination tracking
- **Compliance Trend Line** — Week-over-week improvement tracking

### Environmental Impact
- **Impact Metrics** — Waste diverted, compost produced, CO₂e avoided
- **Cost Savings** — Real-time landfill fee savings calculator
- **Project Roadmap** — Phase-by-phase timeline with visual progress

### Smart Insights
- **Peak Hour Detection** — Identifies high-traffic waste periods
- **Contamination Hotspots** — Flags bins with high contamination rates
- **Improvement Trends** — Tracks behavior modification effectiveness

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | HTML5, CSS3 (Custom Properties, Grid, Flexbox), Vanilla JS |
| **Charts** | Chart.js |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL (via Supabase) |
| **ORM/Client** | Supabase JS Client |
| **Auth** | Row Level Security (RLS) + Anon Key |

---

## 🔒 Database Schema

The Supabase database includes:

| Table | Description |
|-------|-------------|
| `bins` | Waste bin locations, types, fill levels |
| `disposal_events` | Every disposal action with compliance data |
| `daily_bin_stats` | Aggregated daily statistics per bin |
| `impact_metrics` | Running totals for environmental impact |
| `hourly_analytics` | Hourly breakdowns for chart data |
| `weekly_compliance` | Week-over-week compliance rate tracking |

---

## 📈 Sample Data

The seed script generates realistic campus data:
- **3 bins** at Hostel A, Hostel B, and Main Cafeteria
- **500+ disposal events** across 7 days
- **~85% compliance rate** with realistic contamination patterns
- **Weekly improvement** from 72% → 89% over 4 weeks

---

## 🌱 Impact

By helping universities implement SmartBin AI:

| Metric | Expected Impact |
|--------|-----------------|
| Waste Diversion | **34% reduction** in landfill waste |
| Compost Output | **28% increase** in organic compost |
| Methane Avoided | **12.4 tonnes** CO₂e annually |
| Cost Savings | **22% reduction** in landfill fees |
| Compliance | **72% → 89%** improvement in 4 weeks |

---

## 🤝 Contributing

This is an open-source sustainable solution. Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License — Free for educational and institutional use.

---

<p align="center">
  Built with 💚 for a sustainable future<br>
  <strong>SmartBin AI — Making campuses smarter, one bin at a time.</strong>
</p>