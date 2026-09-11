# 🎯 SkillTrack — Skill & Activity Tracker (MERN Stack)

**SkillTrack** is a full-stack web application for individuals and teams to log, track, and visualize learning progress, projects worked on, and coding problems solved across customizable categories and subcategories with streak calculation, leaderboard metrics, and interactive analytics.

---

## 🚀 Features

- **Multi-Person Activity Logging**: Seamlessly switch between team/family members or view aggregate statistics across all people.
- **Structured Categories & Subcategories**:
  - **Project** (Default: *Personal*, *Open Source*, *Freelance/Client*)
  - **Learning** (Default: *Course*, *Book*, *Tutorial*, *Article*)
  - **Problem Solving** (Default: *LeetCode*, *GeeksforGeeks*, *HackerRank*)
- **Specialized Problem Solving Fields**: Color-coded Difficulty tags (*Easy*, *Medium*, *Hard*) and clickable problem URLs opening directly in a new tab.
- **Dynamic Streak Calculation**: Computes active daily consecutive streaks, all-time best streaks, and total active days per person.
- **Visual Analytics with Recharts**:
  - Category breakdown donut chart with toggle between **By Count** and **By Time (Hours)**.
  - Activity trend timeline showing consistency and volume.
- **Team Leaderboard**: Ranked members with gold, silver, and bronze rank badges (🥇🥈🥉) sorted by activity volume and hours.
- **Full History & Filtering**: Filter activities by Date Range, Person, Category, Status, and full-text keyword search.
- **Management Hub**: Add, edit, or delete People, Categories (custom color & Lucide icon picker), and Subcategories.
- **WCAG 2.1 AA Accessibility**: High-contrast typography (Inter), tabular numeric stats, keyboard navigation, accessible chart text fallbacks, and motion safety.

---

## Sample Screenshots

- **Page 1**
<img width="1763" height="2157" alt="image" src="https://github.com/user-attachments/assets/030dbb7f-30bb-4dd9-ba07-854729bfcc64" />

- **Page 2**
<img width="1919" height="833" alt="image" src="https://github.com/user-attachments/assets/519f8c42-da3a-41ca-8b0b-3625736d5f21" />

- **Page 3**
<img width="1913" height="845" alt="image" src="https://github.com/user-attachments/assets/6e97e57a-3c65-4390-9e85-e13fc78cc697" />

  
## 📁 Monorepo Layout

```
Skill Tracker/
├── server/                 # Express + Mongoose REST API
│   ├── src/
│   │   ├── config/         # MongoDB connection
│   │   ├── controllers/    # Route controllers & aggregation pipelines
│   │   ├── middleware/     # Centralized error handler & Zod validator
│   │   ├── models/         # Category, Subcategory, Person, Entry Mongoose models
│   │   ├── routes/         # REST API endpoints
│   │   ├── scripts/seed.js # Database seeder
│   │   ├── app.js          # Express app configuration
│   │   └── index.js        # Server listener
│   ├── .env.example
│   ├── .env
│   └── package.json
├── client/                 # React (Vite) + Tailwind CSS SPA
│   ├── src/
│   │   ├── api/            # Axios API clients
│   │   ├── components/     # UI Component library (Buttons, Cards, Modals, Badges, Charts)
│   │   ├── pages/          # Dashboard, Entries, Manage pages
│   │   ├── utils/          # Date & formatting utilities
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── package.json            # Root workspace helper scripts
└── README.md
```

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, MongoDB, Mongoose, Zod, Cors, Morgan, Dotenv
- **Frontend**: React (Vite), React Router v6, Tailwind CSS, Recharts, Lucide React, date-fns, react-hot-toast, Axios
- **Database**: MongoDB (Local or MongoDB Atlas URI)

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ or v20+ installed
- **MongoDB**: Local MongoDB instance running on `mongodb://localhost:27017` or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection string.

---

### 2. Configure Backend Environment

Navigate to the `server/` directory and check `server/.env`:

```bash
cd server
cp .env.example .env
```

Ensure `.env` contains:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/skilltrack
NODE_ENV=development
```
*(If using MongoDB Atlas, replace `MONGO_URI` with your connection string).*

---

### 3. Install Dependencies & Seed Database

From the workspace root:

```bash
# 1. Install server dependencies
cd server
npm install

# 2. Seed default categories & subcategories
npm run seed

# 3. Install client dependencies
cd ../client
npm install
```

---

### 4. Run the Application

#### Start the Backend Server
```bash
cd server
npm run dev
# Server will run at http://localhost:5000
```

#### Start the Frontend Client (in a new terminal)
```bash
cd client
npm run dev
# Frontend will run at http://localhost:3000
```

Open your browser at [http://localhost:3000](http://localhost:3000).

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/categories` | List all categories |
| `POST` | `/api/categories` | Create category `{ name, color, icon }` |
| `PUT` | `/api/categories/:id` | Update category |
| `DELETE`| `/api/categories/:id` | Delete category (safeguarded against linked entries) |
| `GET` | `/api/subcategories` | List subcategories (optional `?categoryId=...`) |
| `POST` | `/api/subcategories` | Create subcategory `{ name, categoryId }` |
| `PUT` | `/api/subcategories/:id` | Update subcategory |
| `DELETE`| `/api/subcategories/:id` | Delete subcategory |
| `GET` | `/api/people` | List all people |
| `POST` | `/api/people` | Create person `{ name }` |
| `PUT` | `/api/people/:id` | Update person name |
| `DELETE`| `/api/people/:id` | Delete person (safeguarded against linked entries) |
| `GET` | `/api/entries` | List entries (supports `startDate`, `endDate`, `personId`, `categoryIds`, `status`, `search`) |
| `POST` | `/api/entries` | Create entry |
| `PUT` | `/api/entries/:id` | Update entry |
| `DELETE`| `/api/entries/:id` | Delete entry |
| `GET` | `/api/entries/summary` | Aggregation metrics (totals, categories, subcategories, timeline, difficulties, statuses) |
| `GET` | `/api/entries/leaderboard` | Leaderboard aggregation ranking all people by volume & time |
| `GET` | `/api/entries/streak/:personId` | Calculates current consecutive active day streak and best streak |

---

## 🧪 Verification & Testing Steps

1. **Seed verification**: Run `npm run seed` inside `server/` to verify default categories (Project `#3B82F6`, Learning `#22C55E`, Problem Solving `#F97316`) and subcategories are inserted.
2. **Add a Person**: Go to **Manage** or open the **Log Activity** modal to add a team member (e.g. "Alex").
3. **Log a Problem Solving Entry**:
   - Select Person: "Alex"
   - Select Category: "Problem Solving"
   - Select Subcategory: "LeetCode"
   - Choose Difficulty: "Medium"
   - Enter Problem Link: `https://leetcode.com/problems/two-sum/`
   - Set Time: 45 minutes
   - Save entry and verify toast notification.
4. **Inspect Dashboard**:
   - Check Summary cards (Total activities, Time Invested, Problem count with Easy/Medium/Hard pills).
   - Toggle Category breakdown chart between **By Count** and **By Time**.
   - Check Leaderboard ranking card.
   - Filter by person "Alex" to view his **Streak** badge.
5. **Inspect History**: Go to **Entries** to search, filter by status, and test inline edit & delete.
