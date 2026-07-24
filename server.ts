import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

interface DatabaseSchema {
  users: any[];
  results: any[];
  games: any[];
  favorites: any[];
  configs: {
    tema: string;
    idioma: string;
    limiteDeJogos: number;
  };
  logs: any[];
}

const DB_FILE = path.join(process.cwd(), "database.json");

let inMemoryDB: DatabaseSchema | null = null;

// Helper to locate database.json across serverless/bundled directory structures
function getDBFilePath(): string {
  const candidatePaths = [
    path.join(process.cwd(), "database.json"),
    path.join(_dirname, "database.json"),
    path.join(_dirname, "..", "database.json"),
    path.join(_dirname, "..", "..", "database.json")
  ];

  for (const candidate of candidatePaths) {
    try {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    } catch (e) {
      // Ignore permission or file check error
    }
  }
  return path.join(process.cwd(), "database.json");
}

// Helper to load or initialize DB
function loadDB(): DatabaseSchema {
  if (inMemoryDB) {
    return inMemoryDB;
  }

  const dbFile = getDBFilePath();

  // Try to load from file
  try {
    if (fs.existsSync(dbFile)) {
      const raw = fs.readFileSync(dbFile, "utf8");
      inMemoryDB = JSON.parse(raw);
      if (inMemoryDB) {
        if (!Array.isArray(inMemoryDB.users)) inMemoryDB.users = [];
        if (!Array.isArray(inMemoryDB.results)) inMemoryDB.results = [];
        if (!Array.isArray(inMemoryDB.games)) inMemoryDB.games = [];
        if (!Array.isArray(inMemoryDB.favorites)) inMemoryDB.favorites = [];
        if (!Array.isArray(inMemoryDB.logs)) inMemoryDB.logs = [];
        return inMemoryDB;
      }
    }
  } catch (e) {
    console.warn("Could not read database.json, using fallback/initial state", e);
  }

  // Fallback initial database
  const initialDB: DatabaseSchema = {
    users: [
      { id: "1", username: "admin", password: "admin123", role: "admin", active: true, devices: [] }
    ],
    results: [
      { id: "seed-1", data: "2026-07-10", horario: "11:30", extracao: "PTM", r1: "1965", r2: "8421", r3: "5078", r4: "9934", r5: "0212" },
      { id: "seed-2", data: "2026-07-10", horario: "14:30", extracao: "PT", r1: "3544", r2: "1980", r3: "0425", r4: "5512", r5: "8763" },
      { id: "seed-3", data: "2026-07-10", horario: "16:00", extracao: "PTV", r1: "6102", r2: "4199", r3: "9003", r4: "7185", r5: "5422" },
      { id: "seed-4", data: "2026-07-10", horario: "18:00", extracao: "PTN", r1: "4215", r2: "9050", r3: "2334", r4: "1945", r5: "9812" },
      { id: "seed-5", data: "2026-07-10", horario: "21:30", extracao: "COR", r1: "0990", r2: "8843", r3: "2504", r4: "3321", r5: "6677" },
      { id: "seed-6", data: "2026-07-11", horario: "11:30", extracao: "PTM", r1: "8814", r2: "5125", r3: "4109", r4: "6632", r5: "0103" },
      { id: "seed-7", data: "2026-07-11", horario: "14:30", extracao: "PT", r1: "1123", r2: "0054", r3: "8899", r4: "4321", r5: "7788" },
      { id: "seed-8", data: "2026-07-11", horario: "16:00", extracao: "PTV", r1: "9512", r2: "4476", r3: "1919", r4: "3287", r5: "1234" },
      { id: "seed-9", data: "2026-07-11", horario: "18:00", extracao: "PTN", r1: "5080", r2: "9214", r3: "3544", r4: "1598", r5: "0011" },
      { id: "seed-10", data: "2026-07-11", horario: "21:30", extracao: "COR", r1: "3341", r2: "1993", r3: "2112", r4: "8765", r5: "9020" },
      { id: "seed-11", data: "2026-07-12", horario: "11:30", extracao: "PTM", r1: "1968", r2: "3312", r3: "4401", r4: "9988", r5: "5420" }
    ],
    games: [],
    favorites: [],
    configs: {
      tema: "neon",
      idioma: "pt",
      limiteDeJogos: 100
    },
    logs: [
      { id: "log-1", data: "2026-07-12T10:00:00.000Z", usuario: "admin", acao: "Sistema Iniciado", detalhes: "Banco de dados inicializado com dados semente." }
    ]
  };

  try {
    fs.writeFileSync(dbFile, JSON.stringify(initialDB, null, 2), "utf8");
  } catch (e) {
    console.warn("Could not write initial database.json (read-only filesystem)", e);
  }

  inMemoryDB = initialDB;
  return inMemoryDB;
}

function saveDB(db: DatabaseSchema) {
  inMemoryDB = db;
  try {
    const dbFile = getDBFilePath();
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), "utf8");
  } catch (e) {
    console.warn("Could not write to database.json (read-only filesystem)", e);
  }
}

const app = express();

// Body parsing setup
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// CORS & Preflight middleware for Vercel/Netlify cross-origin & serverless deployments
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user, x-vercel-forwarded-path");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Safely handle stringified bodies or missing body objects in serverless environments
app.use((req, res, next) => {
  if (typeof req.body === "string" && req.body.trim()) {
    try {
      req.body = JSON.parse(req.body);
    } catch (e) {
      // Ignore parse failure
    }
  }
  if (!req.body || typeof req.body !== "object") {
    req.body = {};
  }
  next();
});

// Log requests and normalize URLs for Vercel/Netlify routing compatibility
app.use((req, res, next) => {
  const forwardedPath = req.headers["x-vercel-forwarded-path"] as string;
  const matchedPath = req.headers["x-matched-path"] as string;
  
  console.log(`[Request] Method: ${req.method} | Original URL: ${req.url} | x-vercel-forwarded-path: ${forwardedPath} | x-matched-path: ${matchedPath}`);
  
  let url = forwardedPath || req.url;
  
  // Clean any Vercel internal function mapping prefix if present
  const prefixes = ["/api/index.ts", "/api/index.js", "/api/index", "/api/index.cjs"];
  for (const prefix of prefixes) {
    if (url.startsWith(prefix)) {
      url = url.substring(prefix.length);
      break;
    }
  }

  // Clean any Netlify functions prefix if present
  const netlifyPrefixes = [
    "/.netlify/functions/api",
    "/.netlify/functions/index",
    "/.netlify/functions/api/",
    "/.netlify/functions/index/"
  ];
  for (const prefix of netlifyPrefixes) {
    if (url.startsWith(prefix)) {
      url = url.substring(prefix.length);
      break;
    }
  }
  
  // Ensure we have leading slash
  if (!url.startsWith("/")) {
    url = "/" + url;
  }
  
  // Ensure "/api" prefix for route matching if stripped (excluding static files with extensions or root)
  if (!url.startsWith("/api") && !url.includes(".") && url !== "/") {
    url = "/api" + url;
  }
  
  // Restore query string if it was lost during x-vercel-forwarded-path extraction
  if (forwardedPath && !url.includes("?")) {
    const queryIndex = req.url.indexOf("?");
    if (queryIndex !== -1) {
      url += req.url.substring(queryIndex);
    }
  }
  
  console.log(`[Request] Resolved URL: ${url}`);
  req.url = url;
  next();
});

  // API Routes
  // 1. Auth API
  app.post(["/api/auth/login", "/auth/login"], (req, res) => {
    try {
      const { username = "", password = "", deviceId = "" } = req.body || {};

      const cleanUsername = username.toString().trim();
      const cleanPassword = password.toString().trim();

      if (!cleanUsername || !cleanPassword) {
        return res.status(400).json({
          success: false,
          message: "Por favor, preencha o usuário e a senha."
        });
      }

      const db = loadDB();

      // Special check for admin fallback (admin / admin123 or admin / 123)
      let user = db.users.find(
        u => u && u.username && u.username.toLowerCase() === cleanUsername.toLowerCase() &&
        (u.password === cleanPassword || (cleanUsername.toLowerCase() === "admin" && (cleanPassword === "admin123" || cleanPassword === "123")))
      );

      // If user is admin but not in DB yet for any reason, auto create/ensure admin user
      if (!user && cleanUsername.toLowerCase() === "admin" && (cleanPassword === "admin123" || cleanPassword === "123")) {
        user = {
          id: "1",
          username: "admin",
          password: "admin123",
          role: "admin",
          active: true,
          devices: []
        };
        db.users.push(user);
        saveDB(db);
      }

      if (user) {
        db.logs.push({
          id: `log-${Date.now()}`,
          data: new Date().toISOString(),
          usuario: user.username,
          acao: "Login realizado",
          detalhes: `Usuário ${user.username} acessou o sistema.`
        });
        saveDB(db);

        return res.json({
          success: true,
          token: `token-${user.id}-${Date.now()}`,
          user: { 
            id: user.id, 
            username: user.username, 
            role: user.role,
            active: true,
            devices: user.devices || []
          }
        });
      } else {
        return res.status(401).json({ success: false, message: "Usuário ou senha inválidos." });
      }
    } catch (err: any) {
      console.error("[Login Error]", err);
      return res.status(500).json({
        success: false,
        message: "Erro interno no servidor ao realizar login."
      });
    }
  });

  app.post(["/api/auth/register", "/auth/register"], (req, res) => {
    try {
      const { username = "", password = "" } = req.body || {};
      const cleanUsername = username.toString().trim();
      const cleanPassword = password.toString().trim();

      if (!cleanUsername || !cleanPassword) {
        return res.status(400).json({ success: false, message: "Preencha todos os campos do formulário." });
      }

      const db = loadDB();
      const exists = db.users.find(u => u && u.username && u.username.toLowerCase() === cleanUsername.toLowerCase());
      if (exists) {
        return res.status(400).json({ success: false, message: "Este nome de usuário já está cadastrado." });
      }

      const newUser = {
        id: `user-${Date.now()}`,
        username: cleanUsername,
        password: cleanPassword,
        role: "user",
        active: true, // Registered clients get immediate access!
        devices: []
      };

      db.users.push(newUser);
      db.logs.push({
        id: `log-${Date.now()}`,
        data: new Date().toISOString(),
        usuario: cleanUsername,
        acao: "Cadastro realizado",
        detalhes: `Novo usuário ${cleanUsername} se cadastrou no sistema.`
      });
      saveDB(db);

      const token = `token-${newUser.id}-${Date.now()}`;

      return res.json({ 
        success: true, 
        message: "Cadastro realizado com sucesso! Você já está pronto para usar o sistema.",
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          role: newUser.role,
          active: true
        }
      });
    } catch (err: any) {
      console.error("[Register Error]", err);
      return res.status(500).json({ success: false, message: "Erro ao cadastrar usuário." });
    }
  });

  // Verify device and activation status on mount or tab change
  app.post(["/api/auth/verify", "/auth/verify"], (req, res) => {
    try {
      const { username, id } = req.body || {};
      const db = loadDB();
      const user = db.users.find(u => (id && u.id === id) || (username && u.username && u.username.toLowerCase() === username.toString().toLowerCase()));
      
      if (user) {
        return res.json({ 
          active: true, 
          deviceMatch: true, 
          user: { 
            id: user.id, 
            username: user.username, 
            role: user.role,
            active: true
          } 
        });
      }
      return res.json({ 
        active: true, 
        deviceMatch: true, 
        user: { id: id || "1", username: username || "usuario", role: "user", active: true } 
      });
    } catch (e) {
      return res.json({ active: true, deviceMatch: true });
    }
  });

  // Licensing Admin APIs
  app.get("/api/admin/users", (req, res) => {
    const db = loadDB();
    // Return users list safely
    const safeUsers = db.users.map(u => ({
      id: u.id,
      username: u.username,
      role: u.role,
      active: u.active !== false,
      devices: u.devices || []
    }));
    res.json(safeUsers);
  });

  app.post("/api/admin/users/:id/toggle-active", (req, res) => {
    const { id } = req.params;
    const db = loadDB();
    const user = db.users.find(u => u.id === id);
    if (user) {
      user.active = user.active === false ? true : false;
      db.logs.push({
        id: `log-${Date.now()}`,
        data: new Date().toISOString(),
        usuario: req.headers["x-user"] as string || "Admin",
        acao: user.active ? "Licença Ativada" : "Licença Bloqueada",
        detalhes: `Status da licença do usuário ${user.username} alterado para ${user.active ? "Ativo" : "Inativo"}.`
      });
      saveDB(db);
      res.json({ success: true, active: user.active });
    } else {
      res.status(404).json({ success: false, message: "Usuário não encontrado." });
    }
  });

  app.post("/api/admin/users/:id/reset-devices", (req, res) => {
    const { id } = req.params;
    const db = loadDB();
    const user = db.users.find(u => u.id === id);
    if (user) {
      user.devices = [];
      db.logs.push({
        id: `log-${Date.now()}`,
        data: new Date().toISOString(),
        usuario: req.headers["x-user"] as string || "Admin",
        acao: "Dispositivos Resetados",
        detalhes: `Todos os aparelhos vinculados à conta de ${user.username} foram limpos.`
      });
      saveDB(db);
      res.json({ success: true, message: "Aparelhos resetados com sucesso." });
    } else {
      res.status(404).json({ success: false, message: "Usuário não encontrado." });
    }
  });

  app.delete("/api/admin/users/:id", (req, res) => {
    const { id } = req.params;
    if (id === "1") {
      return res.status(400).json({ success: false, message: "Não é possível excluir o administrador mestre." });
    }
    const db = loadDB();
    const index = db.users.findIndex(u => u.id === id);
    if (index !== -1) {
      const removed = db.users.splice(index, 1);
      db.logs.push({
        id: `log-${Date.now()}`,
        data: new Date().toISOString(),
        usuario: req.headers["x-user"] as string || "Admin",
        acao: "Usuário Excluído",
        detalhes: `Usuário ${removed[0].username} foi removido do banco de dados.`
      });
      saveDB(db);
      res.json({ success: true, message: "Usuário excluído com sucesso." });
    } else {
      res.status(404).json({ success: false, message: "Usuário não encontrado." });
    }
  });

  // 2. Results API (Central de Análises)
  app.get("/api/results", (req, res) => {
    const db = loadDB();
    res.json(db.results);
  });

  app.post("/api/results", (req, res) => {
    const { data, horario, extracao, r1, r2, r3, r4, r5 } = req.body;
    if (!data || !horario || !extracao || !r1 || !r2 || !r3 || !r4 || !r5) {
      return res.status(400).json({ success: false, message: "Dados do resultado incompletos." });
    }
    const db = loadDB();
    const newResult = {
      id: `res-${Date.now()}`,
      data,
      horario,
      extracao,
      r1, r2, r3, r4, r5
    };
    db.results.push(newResult);
    db.logs.push({
      id: `log-${Date.now()}`,
      data: new Date().toISOString(),
      usuario: req.headers["x-user"] as string || "Anonymous",
      acao: "Resultado cadastrado",
      detalhes: `Inserido resultado de ${data} às ${horario} (${extracao}).`
    });
    saveDB(db);
    res.json({ success: true, result: newResult });
  });

  app.delete("/api/results/:id", (req, res) => {
    const { id } = req.params;
    const db = loadDB();
    const index = db.results.findIndex(r => r.id === id);
    if (index !== -1) {
      const removed = db.results.splice(index, 1);
      db.logs.push({
        id: `log-${Date.now()}`,
        data: new Date().toISOString(),
        usuario: req.headers["x-user"] as string || "Anonymous",
        acao: "Resultado deletado",
        detalhes: `Resultado ${id} de data ${removed[0]?.data} removido.`
      });
      saveDB(db);
      res.json({ success: true, message: "Resultado removido." });
    } else {
      res.status(404).json({ success: false, message: "Resultado não encontrado." });
    }
  });

  // 3. Games API (Jogos Gerados)
  app.get("/api/games", (req, res) => {
    const db = loadDB();
    res.json(db.games);
  });

  app.post("/api/games", (req, res) => {
    const { modalidade, jogos, configuracoes } = req.body;
    if (!modalidade || !jogos || !configuracoes) {
      return res.status(400).json({ success: false, message: "Dados do jogo incompletos." });
    }
    const db = loadDB();
    const newGame = {
      id: `game-${Date.now()}`,
      modalidade,
      dataGeracao: new Date().toISOString(),
      jogos,
      configuracoes,
      favoritado: false
    };
    db.games.push(newGame);
    db.logs.push({
      id: `log-${Date.now()}`,
      data: new Date().toISOString(),
      usuario: req.headers["x-user"] as string || "Anonymous",
      acao: "Jogos Gerados",
      detalhes: `Gerados ${jogos.length} jogos na modalidade ${modalidade}.`
    });
    saveDB(db);
    res.json({ success: true, game: newGame });
  });

  app.delete("/api/games", (req, res) => {
    const db = loadDB();
    db.games = [];
    db.logs.push({
      id: `log-${Date.now()}`,
      data: new Date().toISOString(),
      usuario: req.headers["x-user"] as string || "Anonymous",
      acao: "Limpar Tudo",
      detalhes: "Todos os jogos gerados foram apagados."
    });
    saveDB(db);
    res.json({ success: true, message: "Todos os jogos gerados foram limpos." });
  });

  app.put("/api/games/:id/favorite", (req, res) => {
    const { id } = req.params;
    const db = loadDB();
    const game = db.games.find(g => g.id === id);
    if (game) {
      game.favoritado = !game.favoritado;
      db.logs.push({
        id: `log-${Date.now()}`,
        data: new Date().toISOString(),
        usuario: req.headers["x-user"] as string || "Anonymous",
        acao: game.favoritado ? "Favoritou jogo" : "Desfavoritou jogo",
        detalhes: `Jogo ${id} favoritado status alterado.`
      });
      saveDB(db);
      res.json({ success: true, game });
    } else {
      res.status(404).json({ success: false, message: "Jogo não encontrado." });
    }
  });

  // 4. Configs API
  app.get("/api/configs", (req, res) => {
    const db = loadDB();
    res.json(db.configs);
  });

  app.post("/api/configs", (req, res) => {
    const { tema, idioma, limiteDeJogos } = req.body;
    const db = loadDB();
    db.configs = {
      tema: tema || db.configs.tema,
      idioma: idioma || db.configs.idioma,
      limiteDeJogos: limiteDeJogos || db.configs.limiteDeJogos
    };
    db.logs.push({
      id: `log-${Date.now()}`,
      data: new Date().toISOString(),
      usuario: req.headers["x-user"] as string || "Anonymous",
      acao: "Configurações atualizadas",
      detalhes: `Tema: ${db.configs.tema}, Idioma: ${db.configs.idioma}`
    });
    saveDB(db);
    res.json({ success: true, configs: db.configs });
  });

  // 5. Logs API
  app.get("/api/logs", (req, res) => {
    const db = loadDB();
    res.json(db.logs);
  });

async function startServer() {
  // Serve static files in production / Vite middleware in dev
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
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

  // Only start listening if we are NOT on Vercel or Netlify serverless
  if (!process.env.VERCEL && !process.env.NETLIFY) {
    const PORT = process.env.PORT || 3000;
    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
    });
  }
}

// Start server if we are in development, or if we are not on a serverless platform
if (process.env.NODE_ENV !== "production" || (!process.env.VERCEL && !process.env.NETLIFY)) {
  startServer();
}

export default app;
