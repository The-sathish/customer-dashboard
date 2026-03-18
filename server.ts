import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";

const db = new Database("database.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    country TEXT,
    product TEXT,
    quantity INTEGER,
    unit_price REAL,
    total REAL,
    status TEXT,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS dashboards (
    id TEXT PRIMARY KEY,
    name TEXT,
    layout TEXT,
    widgets TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed data if empty
const orderCount = db.prepare("SELECT COUNT(*) as count FROM orders").get() as { count: number };
if (orderCount.count === 0) {
  const products = ["Laptop", "Smartphone", "Tablet", "Monitor", "Keyboard", "Mouse"];
  const statuses = ["Pending", "Shipped", "Delivered", "Cancelled"];
  const insertOrder = db.prepare(`
    INSERT INTO orders (id, first_name, last_name, email, phone, address, country, product, quantity, unit_price, total, status, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (let i = 0; i < 50; i++) {
    const qty = Math.floor(Math.random() * 5) + 1;
    const price = Math.floor(Math.random() * 1000) + 100;
    insertOrder.run(
      uuidv4(),
      "First" + i,
      "Last" + i,
      `user${i}@example.com`,
      "123-456-7890",
      "Street " + i,
      "USA",
      products[Math.floor(Math.random() * products.length)],
      qty,
      price,
      qty * price,
      statuses[Math.floor(Math.random() * statuses.length)],
      "Admin"
    );
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get("/api/orders", (req, res) => {
    const orders = db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all();
    res.json(orders);
  });

  app.post("/api/orders", (req, res) => {
    const { first_name, last_name, email, phone, address, country, product, quantity, unit_price, status, created_by } = req.body;
    const id = uuidv4();
    const total = quantity * unit_price;
    db.prepare(`
      INSERT INTO orders (id, first_name, last_name, email, phone, address, country, product, quantity, unit_price, total, status, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, first_name, last_name, email, phone, address, country, product, quantity, unit_price, total, status, created_by);
    res.json({ id, total });
  });

  app.put("/api/orders/:id", (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, email, phone, address, country, product, quantity, unit_price, status } = req.body;
    const total = quantity * unit_price;
    db.prepare(`
      UPDATE orders SET first_name=?, last_name=?, email=?, phone=?, address=?, country=?, product=?, quantity=?, unit_price=?, total=?, status=?
      WHERE id=?
    `).run(first_name, last_name, email, phone, address, country, product, quantity, unit_price, total, status, id);
    res.json({ success: true });
  });

  app.delete("/api/orders/:id", (req, res) => {
    db.prepare("DELETE FROM orders WHERE id=?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/dashboard", (req, res) => {
    const dashboard = db.prepare("SELECT * FROM dashboards LIMIT 1").get() as { id: string, name: string, layout: string, widgets: string } | undefined;
    if (dashboard) {
      res.json({
        ...dashboard,
        layout: JSON.parse(dashboard.layout),
        widgets: JSON.parse(dashboard.widgets)
      });
    } else {
      res.json(null);
    }
  });

  app.post("/api/dashboard", (req, res) => {
    const { layout, widgets } = req.body;
    const id = "main-dashboard";
    const existing = db.prepare("SELECT id FROM dashboards WHERE id=?").get(id);
    if (existing) {
      db.prepare("UPDATE dashboards SET layout=?, widgets=? WHERE id=?").run(JSON.stringify(layout), JSON.stringify(widgets), id);
    } else {
      db.prepare("INSERT INTO dashboards (id, name, layout, widgets) VALUES (?, ?, ?, ?)").run(id, "Main", JSON.stringify(layout), JSON.stringify(widgets));
    }
    res.json({ success: true });
  });

  // Vite middleware for development
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
