/* =============================================================
   NW DOCES&SALGADOS — CONFIGURAÇÃO DO CARDÁPIO
   Este arquivo é usado tanto pela loja (index.html) quanto pelo
   painel de estoque (admin.html). O ESTOQUE (quantidades) não fica
   aqui — ele é editado pelo painel e mora no banco de dados (KV).
   Aqui ficam só: sabores, categorias e preços.
============================================================= */

// -------------------------------------------------------------
// SEU NÚMERO DE WHATSAPP — 55 + DDD + número, somente dígitos.
// -------------------------------------------------------------
const WHATSAPP_NUMBER = "5515997966786";

// -------------------------------------------------------------
// PREÇOS POR CATEGORIA (modelo de combo: 1 unidade / 2 unidades)
// A quantidade que conta pro combo é a SOMA de todos os sabores
// daquela categoria no carrinho (pode misturar sabores).
// -------------------------------------------------------------
const CATEGORY_PRICING = {
  "trufas-tradicionais": { single: 6.00,  pair: 10.00 }, // <-- PREÇO: 1 por R$6 / 2 por R$10
  "trufas-gourmet":      { single: 7.00,  pair: 12.00 }, // <-- PREÇO: 1 por R$7 / 2 por R$12
  "cones-trufados":      { single: 14.00, pair: 20.00 }, // <-- PREÇO: 1 por R$14 / 2 por R$20
  "palha-italiana":      { single: 6.00,  pair: 10.00 }, // <-- PREÇO: confirme este valor
  "esfirras":            { single: 7.50,  pair: 12.00 }, // <-- PREÇO: 1 por R$7,50 / 2 por R$12
};

// Nome, emoji e ordem de exibição de cada categoria
const CATEGORY_INFO = {
  "trufas-tradicionais": { name: "Trufas Tradicionais", emoji: "🍫" },
  "trufas-gourmet":      { name: "Trufas Gourmet",      emoji: "✨" },
  "cones-trufados":      { name: "Cones Trufados",      emoji: "🍦" },
  "palha-italiana":      { name: "Palha Italiana",      emoji: "🍬" },
  "esfirras":            { name: "Esfirras Artesanais", emoji: "🥟" },
};
const CATEGORY_ORDER = Object.keys(CATEGORY_INFO);

// -------------------------------------------------------------
// CATÁLOGO DE SABORES
// Para adicionar um sabor novo: copie uma linha, mude "id" (sem
// espaços/acentos) e "name". Ele já nasce como estoque ilimitado
// até você definir uma quantidade no painel.
// -------------------------------------------------------------
const PRODUCTS = [
  // ---- Trufas Tradicionais ----
  { id: "trad-avela",        category: "trufas-tradicionais", name: "Avelã" },
  { id: "trad-pistache",     category: "trufas-tradicionais", name: "Pistache" },
  { id: "trad-pacoca",       category: "trufas-tradicionais", name: "Paçoca" },
  { id: "trad-choc-branco",  category: "trufas-tradicionais", name: "Chocolate Branco" },
  { id: "trad-brigadeiro",   category: "trufas-tradicionais", name: "Brigadeiro" },
  { id: "trad-ovomaltine",   category: "trufas-tradicionais", name: "Ovomaltine" },
  { id: "trad-maracuja",     category: "trufas-tradicionais", name: "Maracujá" },

  // ---- Trufas Gourmet ----
  { id: "gourmet-maracuja-brigadeiro", category: "trufas-gourmet", name: "Maracujá com Brigadeiro" },
  { id: "gourmet-maracuja-avela",      category: "trufas-gourmet", name: "Maracujá com Avelã" },
  { id: "gourmet-pacoca-choc-branco",  category: "trufas-gourmet", name: "Paçoca com Chocolate Branco" },

  // ---- Cones Trufados ----
  { id: "cone-nutella-ninho", category: "cones-trufados", name: "Nutella com Ninho" },
  { id: "cone-ferrero",       category: "cones-trufados", name: "Ferrero Rocher" },
  { id: "cone-sonho-valsa",   category: "cones-trufados", name: "Sonho de Valsa" },
  { id: "cone-kinder-bueno",  category: "cones-trufados", name: "Kinder Bueno" },

  // ---- Palha Italiana ----
  { id: "palha-brigadeiro-maizena", category: "palha-italiana", name: "Brigadeiro com Maizena" },
  { id: "palha-ninho-oreo",         category: "palha-italiana", name: "Ninho com Oreo" },

  // ---- Esfirras Artesanais ----
  { id: "esfirra-carne",     category: "esfirras", name: "Carne" },
  { id: "esfirra-frango",    category: "esfirras", name: "Frango com Requeijão" },
  { id: "esfirra-calabresa", category: "esfirras", name: "Calabresa" },
];
