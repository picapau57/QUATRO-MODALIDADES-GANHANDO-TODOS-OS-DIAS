export interface GrupoBicho {
  numero: number;
  nome: string;
  dezenas: string[];
}

export const GRUPOS_BICHO: GrupoBicho[] = [
  { numero: 1, nome: "Avestruz", dezenas: ["01", "02", "03", "04"] },
  { numero: 2, nome: "Águia", dezenas: ["05", "06", "07", "08"] },
  { numero: 3, nome: "Burro", dezenas: ["09", "10", "11", "12"] },
  { numero: 4, nome: "Borboleta", dezenas: ["13", "14", "15", "16"] },
  { numero: 5, nome: "Cachorro", dezenas: ["17", "18", "19", "20"] },
  { numero: 6, nome: "Cabra", dezenas: ["21", "22", "23", "24"] },
  { numero: 7, nome: "Carneiro", dezenas: ["25", "26", "27", "28"] },
  { numero: 8, nome: "Camelo", dezenas: ["29", "30", "31", "32"] },
  { numero: 9, nome: "Cobra", dezenas: ["33", "34", "35", "36"] },
  { numero: 10, nome: "Coelho", dezenas: ["37", "38", "39", "40"] },
  { numero: 11, nome: "Cavalo", dezenas: ["41", "42", "43", "44"] },
  { numero: 12, nome: "Elefante", dezenas: ["45", "46", "47", "48"] },
  { numero: 13, nome: "Galo", dezenas: ["49", "50", "51", "52"] },
  { numero: 14, nome: "Gato", dezenas: ["53", "54", "55", "56"] },
  { numero: 15, nome: "Jacaré", dezenas: ["57", "58", "59", "60"] },
  { numero: 16, nome: "Leão", dezenas: ["61", "62", "63", "64"] },
  { numero: 17, nome: "Macaco", dezenas: ["65", "66", "67", "68"] },
  { numero: 18, nome: "Porco", dezenas: ["69", "70", "71", "72"] },
  { numero: 19, nome: "Pavão", dezenas: ["73", "74", "75", "76"] },
  { numero: 20, nome: "Peru", dezenas: ["77", "78", "79", "80"] },
  { numero: 21, nome: "Touro", dezenas: ["81", "82", "83", "84"] },
  { numero: 22, nome: "Tigre", dezenas: ["85", "86", "87", "88"] },
  { numero: 23, nome: "Urso", dezenas: ["89", "90", "91", "92"] },
  { numero: 24, nome: "Veado", dezenas: ["93", "94", "95", "96"] },
  { numero: 25, nome: "Vaca", dezenas: ["97", "98", "99", "00"] }
];

// Helper to find group by decimal (last 2 digits)
export function obterGrupoPorDezena(dezena: string): GrupoBicho | undefined {
  const num = parseInt(dezena, 10);
  if (isNaN(num) || num < 0 || num > 99) return undefined;
  
  // Find group
  return GRUPOS_BICHO.find(g => g.dezenas.includes(dezena));
}

// Helper to get group number for a milhar
export function obterGrupoPorMilhar(milhar: string): GrupoBicho | undefined {
  if (milhar.length < 2) return undefined;
  const dezena = milhar.substring(milhar.length - 2);
  return obterGrupoPorDezena(dezena);
}
