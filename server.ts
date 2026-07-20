import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

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

// Helper to load or initialize DB
function loadDB(): DatabaseSchema {
  if (inMemoryDB) {
    return inMemoryDB;
  }

  // Try to load from file
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf8");
      inMemoryDB = JSON.parse(raw);
      return inMemoryDB!;
    }
  } catch (e) {
    console.warn("Could not read database.json, using fallback/initial state", e);
  }

  // Fallback initial database
  const initialDB: DatabaseSchema = {
    users: [
      { id: "1", username: "admin", password: "123", role: "admin" }
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
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2), "utf8");
  } catch (e) {
    console.warn("Could not write initial database.json (read-only filesystem)", e);
  }

  inMemoryDB = initialDB;
  return inMemoryDB;
}

function saveDB(db: DatabaseSchema) {
  inMemoryDB = db;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch (e) {
    console.warn("Could not write to database.json (read-only filesystem)", e);
  }
}

const app = express();
app.use(express.json());

// Log requests and normalize URLs for Vercel routing compatibility
app.use((req, res, next) => {
  const matchedPath = req.headers["x-matched-path"] as string;
  const forwardedPath = req.headers["x-vercel-forwarded-path"] as string;
  const originalPath = matchedPath || forwardedPath || req.url;
  
  console.log(`[Request] Method: ${req.method} | URL: ${req.url} | Matched: ${matchedPath} | Forwarded: ${forwardedPath} | FinalResolved: ${originalPath}`);
  
  let cleanedPath = originalPath;
  
  // Strip query parameters from path if any for processing
  const queryIndex = cleanedPath.indexOf("?");
  let pathOnly = queryIndex !== -1 ? cleanedPath.substring(0, queryIndex) : cleanedPath;
  const queryString = queryIndex !== -1 ? cleanedPath.substring(queryIndex) : "";

  // Strip Vercel's internal function path mapping if present
  if (pathOnly.startsWith("/api/index.ts")) {
    pathOnly = pathOnly.replace("/api/index.ts", "/api");
  } else if (pathOnly.startsWith("/api/index.js")) {
    pathOnly = pathOnly.replace("/api/index.js", "/api");
  } else if (pathOnly.startsWith("/api/index")) {
    pathOnly = pathOnly.replace("/api/index", "/api");
  }
  
  // Ensure "/api" prefix for routing matching if stripped
  if (!pathOnly.startsWith("/api") && !pathOnly.includes(".") && pathOnly !== "/") {
    pathOnly = "/api" + pathOnly;
  }
  
  // Reconstruct req.url
  req.url = pathOnly + queryString;
  next();
});

  // API Routes
  // 1. Auth API
  app.post("/api/auth/login", (req, res) => {
    const { username, password, deviceId } = req.body;
    const db = loadDB();
    const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    
    if (user) {
      const isUserAdmin = user.role === "admin";
      
      // Check if user is active (admins are always active)
      if (!isUserAdmin && user.active === false) {
        return res.status(403).json({
          success: false,
          unactivated: true,
          message: "Sua conta ainda não foi ativada. Realize o pagamento único de R$ 99,90 e envie o comprovante para o WhatsApp (62) 98575-6881 para liberar seu acesso."
        });
      }

      // Handle Device Registering/Checking
      if (!isUserAdmin && deviceId) {
        if (!user.devices) {
          user.devices = [];
        }
        
        const isDeviceRegistered = user.devices.includes(deviceId);
        if (!isDeviceRegistered) {
          if (user.devices.length >= 2) {
            return res.status(403).json({
              success: false,
              deviceLimitReached: true,
              message: "Limite de aparelhos atingido! Esta licença já está vinculada a 2 dispositivos (ex: seu celular e seu PC). Entre em contato com o suporte para transferir a licença."
            });
          } else {
            // Automatically register device
            user.devices.push(deviceId);
            db.logs.push({
              id: `log-${Date.now()}`,
              data: new Date().toISOString(),
              usuario: username,
              acao: "Aparelho Vinculado",
              detalhes: `Novo dispositivo vinculado à conta de ${username} (${user.devices.length}/2).`
            });
          }
        }
      }

      // Return details and mock token
      db.logs.push({
        id: `log-${Date.now()}`,
        data: new Date().toISOString(),
        usuario: username,
        acao: "Login realizado",
        detalhes: `Usuário ${username} acessou o sistema.`
      });
      saveDB(db);
      res.json({
        success: true,
        token: `token-${user.id}-${Date.now()}`,
        user: { 
          id: user.id, 
          username: user.username, 
          role: user.role,
          active: user.active !== false,
          devices: user.devices || []
        }
      });
    } else {
      res.status(401).json({ success: false, message: "Usuário ou senha inválidos." });
    }
  });

  app.post("/api/auth/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Preencha todos os campos." });
    }
    const db = loadDB();
    const exists = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (exists) {
      return res.status(400).json({ success: false, message: "Este usuário já existe." });
    }
    const newUser = {
      id: `user-${Date.now()}`,
      username,
      password,
      role: "user",
      active: false, // New users are unactivated by default
      devices: []    // Empty registered devices
    };
    db.users.push(newUser);
    db.logs.push({
      id: `log-${Date.now()}`,
      data: new Date().toISOString(),
      usuario: username,
      acao: "Cadastro realizado",
      detalhes: `Usuário ${username} se cadastrou e aguarda ativação de licença.`
    });
    saveDB(db);
    res.json({ 
      success: true, 
      message: "Cadastro realizado com sucesso! Sua conta está aguardando ativação após o pagamento de R$ 99,90. Entre em contato no WhatsApp (62) 98575-6881 enviando seu comprovante." 
    });
  });

  // Verify device and activation status on mount or tab change
  app.post("/api/auth/verify", (req, res) => {
    const { username, id, deviceId } = req.body;
    const db = loadDB();
    const user = db.users.find(u => u.id === id || u.username.toLowerCase() === username?.toLowerCase());
    
    if (user) {
      const isUserAdmin = user.role === "admin";
      
      if (!isUserAdmin && user.active === false) {
        return res.json({ active: false, message: "Conta inativa." });
      }
      
      if (!isUserAdmin && deviceId) {
        if (!user.devices) user.devices = [];
        if (!user.devices.includes(deviceId)) {
          if (user.devices.length >= 2) {
            return res.json({ active: true, deviceMatch: false, message: "Aparelho não cadastrado e limite excedido." });
          } else {
            // Automatically register second device
            user.devices.push(deviceId);
            db.logs.push({
              id: `log-${Date.now()}`,
              data: new Date().toISOString(),
              usuario: user.username,
              acao: "Aparelho Vinculado",
              detalhes: `Dispositivo extra vinculado à conta de ${user.username} (${user.devices.length}/2).`
            });
            saveDB(db);
          }
        }
      }
      
      res.json({ 
        active: true, 
        deviceMatch: true, 
        user: { 
          id: user.id, 
          username: user.username, 
          role: user.role,
          active: user.active !== false,
          devices: user.devices || []
        } 
      });
    } else {
      res.status(404).json({ active: false, message: "Usuário não encontrado." });
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

  // Only start listening if we are NOT on Vercel
  if (!process.env.VERCEL) {
    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
    });
  }
}

// Start server if we are either in development or not on Vercel
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  startServer();
}

export default app;
