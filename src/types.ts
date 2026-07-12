export interface User {
  id: string;
  username: string;
  role: string;
}

export interface Resultado {
  id: string;
  data: string; // YYYY-MM-DD
  horario: string; // e.g. "11:30"
  extracao: string; // e.g. "PTM", "PT", "PTV", "PTN", "COR"
  r1: string; // 4 digits, e.g., "1965"
  r2: string; // 4 digits
  r3: string; // 4 digits
  r4: string; // 4 digits
  r5: string; // 4 digits
}

export type ModalidadeType = 'ternos_grupos' | 'ternos_dezenas' | 'milhares' | 'duques_dezenas';

export interface JogoGerado {
  id: string;
  modalidade: ModalidadeType;
  dataGeracao: string; // ISO string
  jogos: string[][]; // array of combinations, e.g. [["05", "12", "23"], ...]
  configuracoes: {
    quantidadeJogos: number;
    quantidadeElementos?: number;
    filtros: string[];
    excluidos: string[];
    fixados: string[];
    estrategia: string;
    [key: string]: any;
  };
  favoritado: boolean;
}

export interface JogoFavorito {
  id: string;
  modalidade: ModalidadeType;
  jogo: string[]; // single combination, e.g. ["05", "12", "23"]
  dataFavoritado: string; // ISO string
}

export interface SystemConfig {
  tema: 'claro' | 'escuro' | 'neon';
  idioma: 'pt' | 'en';
  limiteDeJogos: number;
}

export interface AppLog {
  id: string;
  data: string;
  usuario: string;
  acao: string;
  detalhes: string;
}
