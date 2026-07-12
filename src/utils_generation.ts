import { Resultado } from "./types";
import { GRUPOS_BICHO, obterGrupoPorDezena } from "./bicho_rules";

// Helper to shuffle array
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Calculate stats from results for intelligent generators
export interface ResultsStats {
  groupFrequencies: Record<number, number>;
  tensFrequencies: Record<string, number>;
  groupDelays: Record<number, number>; // How many draws since last occurrence
  tensDelays: Record<string, number>;
  hotGroups: number[];
  coldGroups: number[];
  delayedGroups: number[];
  hotTens: string[];
  coldTens: string[];
  delayedTens: string[];
}

export function computeStats(results: Resultado[]): ResultsStats {
  const groupFreq: Record<number, number> = {};
  const tensFreq: Record<string, number> = {};
  const groupLastSeen: Record<number, number> = {};
  const tensLastSeen: Record<string, number> = {};

  // Initialize all
  for (let i = 1; i <= 25; i++) {
    groupFreq[i] = 0;
    groupLastSeen[i] = results.length; // Max delay initially
  }
  for (let i = 0; i < 100; i++) {
    const ten = i.toString().padStart(2, "0");
    tensFreq[ten] = 0;
    tensLastSeen[ten] = results.length;
  }

  // Sort results by date/hour ascending to calculate delays properly
  const sorted = [...results].sort((a, b) => {
    const dateCompare = a.data.localeCompare(b.data);
    if (dateCompare !== 0) return dateCompare;
    return a.horario.localeCompare(b.horario);
  });

  sorted.forEach((res, index) => {
    const tens = [
      res.r1.substring(2),
      res.r2.substring(2),
      res.r3.substring(2),
      res.r4.substring(2),
      res.r5.substring(2)
    ];

    tens.forEach(ten => {
      tensFreq[ten] = (tensFreq[ten] || 0) + 1;
      tensLastSeen[ten] = sorted.length - 1 - index;

      const group = obterGrupoPorDezena(ten);
      if (group) {
        groupFreq[group.numero] = (groupFreq[group.numero] || 0) + 1;
        groupLastSeen[group.numero] = sorted.length - 1 - index;
      }
    });
  });

  const sortedGroups = Object.keys(groupFreq)
    .map(Number)
    .sort((a, b) => groupFreq[b] - groupFreq[a]);
  const sortedTens = Object.keys(tensFreq).sort((a, b) => tensFreq[b] - tensFreq[a]);

  const delayGroups = Object.keys(groupLastSeen)
    .map(Number)
    .sort((a, b) => groupLastSeen[b] - groupLastSeen[a]);
  const delayTens = Object.keys(tensLastSeen).sort((a, b) => tensLastSeen[b] - tensLastSeen[a]);

  return {
    groupFrequencies: groupFreq,
    tensFrequencies: tensFreq,
    groupDelays: groupLastSeen,
    tensDelays: tensLastSeen,
    hotGroups: sortedGroups.slice(0, 8),
    coldGroups: sortedGroups.slice(-8),
    delayedGroups: delayGroups.slice(0, 8),
    hotTens: sortedTens.slice(0, 20),
    coldTens: sortedTens.slice(-20),
    delayedTens: delayTens.slice(0, 20)
  };
}

// ==========================================
// MODALIDADE 1: TERNOS DE GRUPOS
// ==========================================
export function gerarTernosDeGrupos(
  quantidadeJogos: number,
  tamanhoTerno: number = 3,
  config: {
    excluidos: number[];
    fixados: number[];
    favoritos: number[];
    estrategia: string;
    misturar: boolean;
    ordenar: boolean;
  },
  results: Resultado[]
): string[][] {
  const stats = computeStats(results);
  const ternos: string[][] = [];
  const ternosSet = new Set<string>();

  // Determine available pool of groups (1 to 25)
  let pool = Array.from({ length: 25 }, (_, i) => i + 1);
  // Apply exclusions
  pool = pool.filter(g => !config.excluidos.includes(g));

  // If there are not enough items to form a game, bypass exclusions
  if (pool.length < tamanhoTerno) {
    pool = Array.from({ length: 25 }, (_, i) => i + 1);
  }

  // Handle fixed groups
  const fixed = config.fixados.filter(g => pool.includes(g));

  // Generate games
  let attempts = 0;
  const maxAttempts = quantidadeJogos * 200;

  while (ternos.length < quantidadeJogos && attempts < maxAttempts) {
    attempts++;
    
    // Select pool according to strategy
    let strategyPool = [...pool];
    
    if (config.estrategia === "delayed") {
      strategyPool = pool.filter(g => stats.delayedGroups.includes(g));
      if (strategyPool.length < tamanhoTerno) strategyPool = [...pool];
    } else if (config.estrategia === "hot") {
      strategyPool = pool.filter(g => stats.hotGroups.includes(g));
      if (strategyPool.length < tamanhoTerno) strategyPool = [...pool];
    } else if (config.estrategia === "cold") {
      strategyPool = pool.filter(g => stats.coldGroups.includes(g));
      if (strategyPool.length < tamanhoTerno) strategyPool = [...pool];
    } else if (config.estrategia === "high_freq") {
      // Sort pool by frequency descending
      strategyPool = [...pool].sort((a, b) => stats.groupFrequencies[b] - stats.groupFrequencies[a]);
    } else if (config.estrategia === "low_freq") {
      // Sort pool by frequency ascending
      strategyPool = [...pool].sort((a, b) => stats.groupFrequencies[a] - stats.groupFrequencies[b]);
    }

    // Shuffle the strategy pool if requested or if we need randomness
    if (config.misturar || config.estrategia === "random" || config.estrategia === "balanced" || Math.random() > 0.5) {
      strategyPool = shuffleArray(strategyPool);
    }

    // Select items
    const selected = [...fixed];
    
    for (const group of strategyPool) {
      if (selected.length >= tamanhoTerno) break;
      if (!selected.includes(group)) {
        selected.push(group);
      }
    }

    // Ensure we have enough groups
    if (selected.length < tamanhoTerno) {
      // Fallback: fill with remaining random groups from main pool
      const shuffledPool = shuffleArray(pool);
      for (const group of shuffledPool) {
        if (selected.length >= tamanhoTerno) break;
        if (!selected.includes(group)) {
          selected.push(group);
        }
      }
    }

    // Sort or order
    const formatted = selected.map(g => g.toString().padStart(2, "0"));
    if (config.ordenar) {
      formatted.sort((a, b) => a.localeCompare(b));
    }

    const key = formatted.join("-");
    if (!ternosSet.has(key)) {
      ternosSet.add(key);
      ternos.push(formatted);
    }
  }

  return ternos;
}

// ==========================================
// MODALIDADE 2: TERNOS DE DEZENAS
// ==========================================
export function gerarTernosDeDezenas(
  quantidadeJogos: number,
  base60Dezenas: string[],
  config: {
    estrategia: string; // 'pares' | 'impares' | 'altas' | 'baixas' | 'mais_sorteadas' | 'menos_sorteadas' | 'atrasadas' | 'quentes' | 'mistura'
  },
  results: Resultado[]
): string[][] {
  const stats = computeStats(results);
  const ternos: string[][] = [];
  const ternosSet = new Set<string>();

  // Ensure base60Dezenas exists and is valid
  let base = [...base60Dezenas];
  if (base.length < 3) {
    // Generate standard base of 60 tens if not provided
    base = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));
  }

  let attempts = 0;
  const maxAttempts = quantidadeJogos * 200;

  while (ternos.length < quantidadeJogos && attempts < maxAttempts) {
    attempts++;

    let filteredBase = [...base];

    // Apply filters
    if (config.estrategia === "pares") {
      filteredBase = base.filter(d => parseInt(d, 10) % 2 === 0);
    } else if (config.estrategia === "impares") {
      filteredBase = base.filter(d => parseInt(d, 10) % 2 !== 0);
    } else if (config.estrategia === "altas") {
      filteredBase = base.filter(d => parseInt(d, 10) >= 50);
    } else if (config.estrategia === "baixas") {
      filteredBase = base.filter(d => parseInt(d, 10) < 50);
    } else if (config.estrategia === "mais_sorteadas") {
      filteredBase = base.sort((a, b) => (stats.tensFrequencies[b] || 0) - (stats.tensFrequencies[a] || 0)).slice(0, 30);
    } else if (config.estrategia === "menos_sorteadas") {
      filteredBase = base.sort((a, b) => (stats.tensFrequencies[a] || 0) - (stats.tensFrequencies[b] || 0)).slice(0, 30);
    } else if (config.estrategia === "atrasadas") {
      filteredBase = base.filter(d => stats.delayedTens.includes(d));
    } else if (config.estrategia === "quentes") {
      filteredBase = base.filter(d => stats.hotTens.includes(d));
    }

    if (filteredBase.length < 3) {
      filteredBase = [...base]; // Fallback if filter too strict
    }

    // Shuffle and pick 3
    const shuffled = shuffleArray(filteredBase);
    const selected = shuffled.slice(0, 3);
    selected.sort((a, b) => a.localeCompare(b));

    const key = selected.join("-");
    if (!ternosSet.has(key)) {
      ternosSet.add(key);
      ternos.push(selected);
    }
  }

  return ternos;
}

// ==========================================
// MODALIDADE 3: MILHARES
// ==========================================
export function gerarMilhares(
  quantidadeJogos: number,
  config: {
    gruposReferencia: number[]; // User selected reference groups
    excluidos: number[];
    fixados: string[]; // Fixed digits or prefix
    misturar: boolean;
    inteligente: boolean;
  },
  results: Resultado[]
): string[][] {
  const milhares: string[][] = [];
  const milharesSet = new Set<string>();

  // Determine which groups to use for endings
  let groups = [...config.gruposReferencia];
  if (groups.length === 0) {
    // Pick random groups
    groups = Array.from({ length: 25 }, (_, i) => i + 1);
  }

  // Remove excluded groups
  groups = groups.filter(g => !config.excluidos.includes(g));
  if (groups.length === 0) {
    groups = Array.from({ length: 25 }, (_, i) => i + 1);
  }

  let attempts = 0;
  const maxAttempts = quantidadeJogos * 200;

  // Each Milhar has 4 digits.
  // The last 2 digits correspond to a ten belonging to the chosen Jogo do Bicho Group.
  // The first 2 digits are random or selected.
  while (milhares.length < quantidadeJogos && attempts < maxAttempts) {
    attempts++;

    // Pick a group
    const chosenGroupNum = groups[Math.floor(Math.random() * groups.length)];
    const bichoGroup = GRUPOS_BICHO.find(g => g.numero === chosenGroupNum);
    if (!bichoGroup) continue;

    // Pick a ten belonging to this group
    const possibleTens = bichoGroup.dezenas;
    const chosenTen = possibleTens[Math.floor(Math.random() * possibleTens.length)];

    // Generate prefix (first 2 digits)
    let prefix = "";
    if (config.fixados && config.fixados.length > 0) {
      const fixedPrefix = config.fixados[0]; // e.g. "19"
      if (fixedPrefix && fixedPrefix.length === 2) {
        prefix = fixedPrefix;
      } else {
        prefix = Math.floor(Math.random() * 100).toString().padStart(2, "0");
      }
    } else {
      prefix = Math.floor(Math.random() * 100).toString().padStart(2, "0");
    }

    const milhar = prefix + chosenTen;

    if (!milharesSet.has(milhar)) {
      milharesSet.add(milhar);
      milhares.push([milhar]); // Returned as standard game array
    }
  }

  return milhares;
}

// ==========================================
// MODALIDADE 4: DUQUES DE DEZENAS
// ==========================================
export function gerarDuquesDeDezenas(
  quantidadeJogos: number,
  base60Dezenas: string[],
  config: {
    estrategia: string; // 'mais_frequentes' | 'menos_frequentes' | 'atrasadas' | 'recentes' | 'pares' | 'impares' | 'sequenciais' | 'aleatorias' | 'balanceadas'
  },
  results: Resultado[]
): string[][] {
  const stats = computeStats(results);
  const duques: string[][] = [];
  const duquesSet = new Set<string>();

  let base = [...base60Dezenas];
  if (base.length < 2) {
    base = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));
  }

  let attempts = 0;
  const maxAttempts = quantidadeJogos * 200;

  while (duques.length < quantidadeJogos && attempts < maxAttempts) {
    attempts++;

    let filteredBase = [...base];

    if (config.estrategia === "pares") {
      filteredBase = base.filter(d => parseInt(d, 10) % 2 === 0);
    } else if (config.estrategia === "impares") {
      filteredBase = base.filter(d => parseInt(d, 10) % 2 !== 0);
    } else if (config.estrategia === "mais_frequentes") {
      filteredBase = base.sort((a, b) => (stats.tensFrequencies[b] || 0) - (stats.tensFrequencies[a] || 0)).slice(0, 30);
    } else if (config.estrategia === "menos_frequentes") {
      filteredBase = base.sort((a, b) => (stats.tensFrequencies[a] || 0) - (stats.tensFrequencies[b] || 0)).slice(0, 30);
    } else if (config.estrategia === "atrasadas") {
      filteredBase = base.filter(d => stats.delayedTens.includes(d));
    } else if (config.estrategia === "recentes") {
      filteredBase = base.filter(d => !stats.delayedTens.includes(d));
    }

    if (filteredBase.length < 2) {
      filteredBase = [...base];
    }

    let selected: string[] = [];

    if (config.estrategia === "sequenciais") {
      // Find pairs that are sequential (e.g. 23-24)
      const shuffledBase = shuffleArray(filteredBase);
      for (const d of shuffledBase) {
        const val = parseInt(d, 10);
        const nextValStr = (val + 1).toString().padStart(2, "0");
        if (filteredBase.includes(nextValStr)) {
          selected = [d, nextValStr];
          break;
        }
      }
      if (selected.length < 2) {
        selected = shuffleArray(filteredBase).slice(0, 2);
      }
    } else {
      selected = shuffleArray(filteredBase).slice(0, 2);
    }

    selected.sort((a, b) => a.localeCompare(b));

    const key = selected.join("-");
    if (!duquesSet.has(key)) {
      duquesSet.add(key);
      duques.push(selected);
    }
  }

  return duques;
}
