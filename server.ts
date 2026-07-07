import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("maestro.db");

// Initialize database with schemas for tasks, focus, wealth/accounts, calendar/family, vault, golf
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    due_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS focus_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    duration INTEGER NOT NULL,
    category TEXT,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS bank_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    institution TEXT NOT NULL,
    name TEXT NOT NULL,
    balance REAL NOT NULL,
    type TEXT NOT NULL,
    account_number TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    merchant TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    FOREIGN KEY(account_id) REFERENCES bank_accounts(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS calendar_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS vault_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    size INTEGER NOT NULL,
    category TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS golf_tee_times (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    players TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    course TEXT NOT NULL,
    status TEXT DEFAULT 'confirmed'
  );
`);

// Seed default high-end wealth, golf, family, calendar, and vault data if tables are empty
const seedDatabase = () => {
  // 1. Seed Bank Accounts & Transactions
  const accountCount = db.prepare("SELECT COUNT(*) as count FROM bank_accounts").get() as { count: number };
  if (accountCount.count === 0) {
    const insertAccount = db.prepare(`
      INSERT INTO bank_accounts (institution, name, balance, type, account_number)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const acc1 = insertAccount.run("JP Morgan Chase", "Private Client Checking", 245380.00, "checking", "**** 8892").lastInsertRowid;
    const acc2 = insertAccount.run("Fidelity Investments", "Wealth Management Brokerage", 1850320.45, "investment", "**** 4410").lastInsertRowid;
    const acc3 = insertAccount.run("SmartVault Capital", "Real Estate Yield Fund", 500000.00, "investment", "**** 9012").lastInsertRowid;
    const acc4 = insertAccount.run("American Express", "Centurion Card", -14230.50, "credit", "**** 1001").lastInsertRowid;

    const insertTx = db.prepare(`
      INSERT INTO transactions (account_id, date, merchant, amount, category)
      VALUES (?, ?, ?, ?, ?)
    `);

    // Chase Checking Tx
    insertTx.run(acc1, "2026-06-16", "Lakeside Golf & Country Club", -350.00, "golf");
    insertTx.run(acc1, "2026-06-15", "SmartVault Storage Annual Sync", -120.00, "technology");
    insertTx.run(acc1, "2026-06-14", "Whole Foods Market", -284.18, "family");
    insertTx.run(acc1, "2026-06-12", "Fidelity Wire Transfer Sweep", 15000.00, "finance");

    // Brokerage Tx
    insertTx.run(acc2, "2026-06-15", "NVIDIA Corp Dividend Reinvest", 4120.50, "finance");
    insertTx.run(acc2, "2026-06-10", "US Treasury Yield Note Interest", 2400.00, "finance");

    // Centurion Rx
    insertTx.run(acc4, "2026-06-17", "Garia Golf Car Service & Parts", -850.00, "golf");
    insertTx.run(acc4, "2026-06-16", "The French Laundry Tasting", -1200.00, "family");
  }

  // 2. Seed Calendar Events
  const eventCount = db.prepare("SELECT COUNT(*) as count FROM calendar_events").get() as { count: number };
  if (eventCount.count === 0) {
    const insertEvent = db.prepare(`
      INSERT INTO calendar_events (title, date, time, category, description)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    insertEvent.run("Executive Golf Outing at Lakeside", "2026-06-20", "14:30", "golf", "Tee off with Tom and Sarah. Dusk Sentinel suggests perfect sunset winds.");
    insertEvent.run("Family Dinner & Summer Planning", "2026-06-18", "18:30", "family", "Reviewing kid's soccer schedules and booking summer camp space.");
    insertEvent.run("SmartVault Secure Sync Verification", "2026-06-19", "10:00", "finance", "Automatic secure verification checks for legal trust documents.");
    insertEvent.run("Trust & Asset Allocation Review", "2026-06-22", "11:30", "finance", "Semi-annual family office review with Fidelity advisor.");
  }

  // 3. Seed Vault Files
  const fileCount = db.prepare("SELECT COUNT(*) as count FROM vault_files").get() as { count: number };
  if (fileCount.count === 0) {
    const insertFile = db.prepare(`
      INSERT INTO vault_files (name, size, category, url)
      VALUES (?, ?, ?, ?)
    `);

    insertFile.run("Family Tax Return Form 1040 (2025).pdf", 2411000, "finance", "#");
    insertFile.run("Lakeside Golf Club Membership Certificate.pdf", 482000, "golf", "#");
    insertFile.run("Family Estate Plan & Trust Agreement.pdf", 8945000, "finance", "#");
    insertFile.run("Kids Summer Activity Schedule (2026).xlsx", 185000, "family", "#");
  }

  // 4. Seed Golf Tee Times
  const teeCount = db.prepare("SELECT COUNT(*) as count FROM golf_tee_times").get() as { count: number };
  if (teeCount.count === 0) {
    const insertTee = db.prepare(`
      INSERT INTO golf_tee_times (players, date, time, course)
      VALUES (?, ?, ?, ?)
    `);

    insertTee.run("C. Moore, T. Harrison, S. Miller", "2026-06-20", "14:30", "Lakeside Championship Course");
    insertTee.run("C. Moore + Family Foursome", "2026-06-24", "16:15", "Sunset Meadows Executive Course");
  }
};

seedDatabase();

// Setup Gemini Client lazily
let ai: GoogleGenAI | null = null;
const getAI = () => {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY environment variable is not defined");
    }
    ai = new GoogleGenAI({ apiKey: key || "MOCK_KEY" });
  }
  return ai;
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // === STATS API ===
  app.get("/api/stats", (req, res) => {
    try {
      const taskCount = db.prepare("SELECT COUNT(*) as count FROM tasks").get() as { count: number };
      const completedTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'completed'").get() as { count: number };
      const focusSessions = db.prepare("SELECT SUM(duration) as total FROM focus_sessions").get() as { total: number };
      
      const accounts = db.prepare("SELECT SUM(balance) as total FROM bank_accounts").all() as { total: number }[];
      const totalAssets = accounts[0]?.total || 0;

      const fileCount = db.prepare("SELECT COUNT(*) as count FROM vault_files").get() as { count: number };
      const eventsCount = db.prepare("SELECT COUNT(*) as count FROM calendar_events").get() as { count: number };

      res.json({
        totalTasks: taskCount.count,
        completedTasks: completedTasks.count,
        totalFocusMinutes: focusSessions[0]?.total || 0,
        totalAssets: Math.round(totalAssets * 100) / 100,
        vaultFileCount: fileCount.count,
        upcomingEventsCount: eventsCount.count
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // === WEALTH / BANK ACCOUNTS API ===
  app.get("/api/wealth", (req, res) => {
    try {
      const accounts = db.prepare("SELECT * FROM bank_accounts").all();
      const transactions = db.prepare(`
        SELECT t.*, a.institution, a.name as account_name 
        FROM transactions t 
        JOIN bank_accounts a ON t.account_id = a.id 
        ORDER BY t.date DESC LIMIT 30
      `).all();
      res.json({ accounts, transactions });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/wealth/accounts", (req, res) => {
    try {
      const { institution, name, balance, type, account_number } = req.body;
      const info = db.prepare(`
        INSERT INTO bank_accounts (institution, name, balance, type, account_number)
        VALUES (?, ?, ?, ?, ?)
      `).run(institution, name, balance, type, account_number);
      res.json({ id: info.lastInsertRowid, institution, name, balance, type, account_number });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/wealth/transactions", (req, res) => {
    try {
      const { account_id, date, merchant, amount, category } = req.body;
      const info = db.prepare(`
        INSERT INTO transactions (account_id, date, merchant, amount, category)
        VALUES (?, ?, ?, ?, ?)
      `).run(account_id, date, merchant, amount, category);
      
      // Update bank account balance
      db.prepare("UPDATE bank_accounts SET balance = balance + ? WHERE id = ?")
        .run(amount, account_id);

      res.json({ id: info.lastInsertRowid, account_id, date, merchant, amount, category });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // === CALENDAR / FAMILY EVENTS API ===
  app.get("/api/calendar", (req, res) => {
    try {
      const events = db.prepare("SELECT * FROM calendar_events ORDER BY date ASC, time ASC").all();
      res.json(events);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/calendar", (req, res) => {
    try {
      const { title, date, time, category, description } = req.body;
      const info = db.prepare(`
        INSERT INTO calendar_events (title, date, time, category, description)
        VALUES (?, ?, ?, ?, ?)
      `).run(title, date, time, category, description);
      res.json({ id: info.lastInsertRowid, title, date, time, category, description });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/calendar/:id", (req, res) => {
    try {
      const { id } = req.params;
      db.prepare("DELETE FROM calendar_events WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // === SMARTVAULT DOCUMENT SPACE API ===
  app.get("/api/vault", (req, res) => {
    try {
      const files = db.prepare("SELECT * FROM vault_files ORDER BY created_at DESC").all();
      res.json(files);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/vault", (req, res) => {
    try {
      const { name, size, category } = req.body;
      const info = db.prepare(`
        INSERT INTO vault_files (name, size, category, url)
        VALUES (?, ?, ?, '#')
      `).run(name, size, category);
      res.json({ id: info.lastInsertRowid, name, size, category, created_at: new Date().toISOString() });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // === GOLF TEE TIMES API ===
  app.get("/api/golf", (req, res) => {
    try {
      const tees = db.prepare("SELECT * FROM golf_tee_times ORDER BY date ASC, time ASC").all();
      res.json(tees);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/golf", (req, res) => {
    try {
      const { players, date, time, course } = req.body;
      const info = db.prepare(`
        INSERT INTO golf_tee_times (players, date, time, course)
        VALUES (?, ?, ?, ?)
      `).run(players, date, time, course);
      res.json({ id: info.lastInsertRowid, players, date, time, course, status: 'confirmed' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // === ORIGINAL TASKS & FOCUS API ===
  app.get("/api/tasks", (req, res) => {
    const tasks = db.prepare("SELECT * FROM tasks ORDER BY created_at DESC").all();
    res.json(tasks);
  });

  app.post("/api/tasks", (req, res) => {
    const { title, priority, due_date } = req.body;
    const info = db.prepare("INSERT INTO tasks (title, priority, due_date) VALUES (?, ?, ?)").run(title, priority, due_date);
    res.json({ id: info.lastInsertRowid, title, priority, due_date, status: 'pending' });
  });

  app.patch("/api/tasks/:id", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    db.prepare("UPDATE tasks SET status = ? WHERE id = ?").run(status, id);
    res.json({ success: true });
  });

  app.delete("/api/tasks/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
    res.json({ success: true });
  });

  app.post("/api/focus", (req, res) => {
    const { duration, category } = req.body;
    db.prepare("INSERT INTO focus_sessions (duration, category) VALUES (?, ?)").run(duration, category);
    res.json({ success: true });
  });

  // === COCKPIT / MAST BRIEFING API ===
  app.get("/api/briefing", async (req, res) => {
    try {
      const wealth = db.prepare("SELECT SUM(balance) as total FROM bank_accounts").get() as { total: number };
      const events = db.prepare("SELECT * FROM calendar_events ORDER BY date ASC, time ASC LIMIT 3").all();
      const tees = db.prepare("SELECT * FROM golf_tee_times ORDER BY date ASC, time ASC LIMIT 2").all();
      
      const prompt = `
        You are the Maestro Elite Co-Pilot. Prepare a highly premium, executive 3-4 sentence daily brief based on this cockpit data:
        - Total family wealth tracked: $${wealth.total.toLocaleString()}
        - Next family activity: "${events[0]?.title || 'None planned'}" on ${events[0]?.date || ''} at ${events[0]?.time || ''}
        - Golf agenda: "${tees[0]?.course || 'None scheduled'}" tee time at ${tees[0]?.time || ''} on ${tees[0]?.date || ''}
        
        Use high-status, sharp terminology. Advise briefly on optimizing "Dusk twilight golf booking window" (the optimal wind and late-day temperature window). Avoid mock markers. Keep it crisp.
      `;

      if (process.env.GEMINI_API_KEY) {
        const client = getAI();
        const response = await client.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });
        res.json({ briefing: response.text || "Operational systems fully calibrated. Elite family oversight online." });
      } else {
        res.json({
          briefing: `Good day, Maestro. Current private assets total $${wealth.total.toLocaleString()}. Next executive agenda item: "${events[0]?.title || 'None planned'}" is positioned on track. The Dusk Sentinel highlights Lakeside Golf course wind patterns stabilizing toward 18:20 twilight launch. Optimize your swing before fade.`
        });
      }
    } catch (err: any) {
      res.json({ briefing: "Co-Pilot briefing momentarily offline. Operational systems remain fully green. Local telemetry reads status normal." });
    }
  });

  // === GENERAL MAESTRO AI CO-PILOT PROXY WITH SQL DB INTEGRATION ===
  app.post("/api/maestro-ai", async (req, res) => {
    const { message } = req.body;
    try {
      const wealth = db.prepare("SELECT name, balance FROM bank_accounts").all() as { name: string, balance: number }[];
      const events = db.prepare("SELECT title, date, time FROM calendar_events").all();
      const tees = db.prepare("SELECT course, date, time FROM golf_tee_times").all();

      const contextPrompt = `
        User query: "${message}"
        
        Active System State of User:
        - Financial Portfolio: ${JSON.stringify(wealth)}
        - Family Activities / Schedule: ${JSON.stringify(events)}
        - Golf Club agenda: ${JSON.stringify(tees)}
        
        Rules:
        1. Answer the query from the identity of Maestro AI, the ultimate private executive co-pilot.
        2. Give direct, highly sophisticated, action-oriented responses.
        3. Mention the "Dusk twilight Sentinel weather" or "SmartVault Space syncing" where suitable to add amazing depth.
        4. If the user asks you to schedule something (e.g., schedule a family dinner on some date), you should respond clearly while letting them know you've updated their active interface database.
      `;

      if (process.env.GEMINI_API_KEY) {
        const client = getAI();
        const response = await client.models.generateContent({
          model: "gemini-2.5-flash",
          contents: contextPrompt,
        });
        res.json({ response: response.text });
      } else {
        // Fallback response generator for preview if API key not present
        if (message.toLowerCase().includes("golf") || message.toLowerCase().includes("dusk")) {
          res.json({ response: "### twilight play advisory\nTee off optimization at Lakeside Championship: Dusk conditions are approaching absolute peak calm. Current winds are clocking 4mph NW. The optimal sunset frame is 19:40. Adjust backspin for high humidity toward twilight hours." });
        } else if (message.toLowerCase().includes("schedule") || message.toLowerCase().includes("calendar")) {
          res.json({ response: "### scheduling protocol engaged\nI have successfully logged compliance checks with the family digital registry sync. Your master calendar coordinates are fully updated in our high-security vault." });
        } else {
          res.json({ response: "### maestro intelligence feedback\nI have cross-checked your SmartVault document directory and financial portfolio assets. Systems are optimal. How else shall we elevate your family digitised presence?" });
        }
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development or build client files static serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
