// =============================================================
// API: /api/catalog
// GET -> qualquer pessoa pode ler o catálogo (a loja e o painel usam
//        isso). Se ainda não existir nada salvo no banco, a gente
//        "semeia" com o catálogo padrão (o que já existia antes,
//        mais os itens novos) e já grava isso no banco também.
// PUT -> só salva se vier a senha certa no cabeçalho x-admin-password
//        (o painel usa isso quando você adiciona/edita/remove uma
//        categoria ou um sabor na aba "Catálogo").
//
// O catálogo fica guardado no Vercel KV como um único objeto:
// {
//   whatsappNumber: "55...",
//   promoImages: ["https://...", ...],
//   categories: [
//     { id, name, emoji, pricingType: "combo" | "sizes",
//       combo: { single, pair } | null,
//       sizes: [{ id, label }] | null },
//     ...
//   ],
//   products: [
//     { id, category, name, image: "https://..." | "",
//       prices: { [sizeId]: number } | null },  // só p/ pricingType "sizes"
//     ...
//   ]
// }
// =============================================================

import { kv } from "@vercel/kv";

const CATALOG_KEY = "nw_catalog";

// Catálogo padrão — igual ao que já existia em products-data.js,
// com os itens novos já incluídos (Cone de Ovomaltine e Bolos de Pote).
const DEFAULT_CATALOG = {
  whatsappNumber: "5515997966786",
  promoImages: [],
  categories: [
    {
      id: "trufas-tradicionais",
      name: "Trufas Tradicionais",
      emoji: "🍫",
      pricingType: "combo",
      combo: { single: 6.0, pair: 10.0 },
      sizes: null,
    },
    {
      id: "trufas-gourmet",
      name: "Trufas Gourmet",
      emoji: "✨",
      pricingType: "combo",
      combo: { single: 7.0, pair: 12.0 },
      sizes: null,
    },
    {
      id: "cones-trufados",
      name: "Cones Trufados",
      emoji: "🍦",
      pricingType: "combo",
      combo: { single: 14.0, pair: 20.0 },
      sizes: null,
    },
    {
      id: "palha-italiana",
      name: "Palha Italiana",
      emoji: "🍬",
      pricingType: "combo",
      combo: { single: 6.0, pair: 10.0 },
      sizes: null,
    },
    {
      id: "esfirras",
      name: "Esfirras Artesanais",
      emoji: "🥟",
      pricingType: "combo",
      combo: { single: 7.5, pair: 12.0 },
      sizes: null,
    },
    {
      id: "bolos-de-pote",
      name: "Bolos de Pote",
      emoji: "🍰",
      pricingType: "sizes",
      combo: null,
      sizes: [
        { id: "250ml", label: "250ml" },
        { id: "350ml", label: "350ml" },
      ],
    },
  ],
  products: [
    // ---- Trufas Tradicionais ----
    { id: "trad-avela", category: "trufas-tradicionais", name: "Avelã", image: "", prices: null },
    { id: "trad-pistache", category: "trufas-tradicionais", name: "Pistache", image: "", prices: null },
    { id: "trad-pacoca", category: "trufas-tradicionais", name: "Paçoca", image: "", prices: null },
    { id: "trad-choc-branco", category: "trufas-tradicionais", name: "Chocolate Branco", image: "", prices: null },
    { id: "trad-brigadeiro", category: "trufas-tradicionais", name: "Brigadeiro", image: "", prices: null },
    { id: "trad-ovomaltine", category: "trufas-tradicionais", name: "Ovomaltine", image: "", prices: null },
    { id: "trad-maracuja", category: "trufas-tradicionais", name: "Maracujá", image: "", prices: null },

    // ---- Trufas Gourmet ----
    { id: "gourmet-maracuja-brigadeiro", category: "trufas-gourmet", name: "Maracujá com Brigadeiro", image: "", prices: null },
    { id: "gourmet-maracuja-avela", category: "trufas-gourmet", name: "Maracujá com Avelã", image: "", prices: null },
    { id: "gourmet-pacoca-choc-branco", category: "trufas-gourmet", name: "Paçoca com Chocolate Branco", image: "", prices: null },

    // ---- Cones Trufados ----
    { id: "cone-nutella-ninho", category: "cones-trufados", name: "Nutella com Ninho", image: "", prices: null },
    { id: "cone-ferrero", category: "cones-trufados", name: "Ferrero Rocher", image: "", prices: null },
    { id: "cone-sonho-valsa", category: "cones-trufados", name: "Sonho de Valsa", image: "", prices: null },
    { id: "cone-kinder-bueno", category: "cones-trufados", name: "Kinder Bueno", image: "", prices: null },
    { id: "cone-ovomaltine", category: "cones-trufados", name: "Ovomaltine", image: "", prices: null },

    // ---- Palha Italiana ----
    { id: "palha-brigadeiro-maizena", category: "palha-italiana", name: "Brigadeiro com Maizena", image: "", prices: null },
    { id: "palha-ninho-oreo", category: "palha-italiana", name: "Ninho com Oreo", image: "", prices: null },

    // ---- Esfirras Artesanais ----
    { id: "esfirra-carne", category: "esfirras", name: "Carne", image: "", prices: null },
    { id: "esfirra-frango", category: "esfirras", name: "Frango com Requeijão", image: "", prices: null },
    { id: "esfirra-calabresa", category: "esfirras", name: "Calabresa", image: "", prices: null },

    // ---- Bolos de Pote ----
    { id: "bolo-coco", category: "bolos-de-pote", name: "Coco Gelado", image: "", prices: { "250ml": 10.0, "350ml": 15.0 } },
    { id: "bolo-prestigio", category: "bolos-de-pote", name: "Prestígio", image: "", prices: { "250ml": 15.0, "350ml": 20.0 } },
    { id: "bolo-brigadeiro", category: "bolos-de-pote", name: "Brigadeiro", image: "", prices: { "250ml": 15.0, "350ml": 20.0 } },
    { id: "bolo-ninho", category: "bolos-de-pote", name: "Ninho", image: "", prices: { "250ml": 15.0, "350ml": 20.0 } },
    { id: "bolo-bem-casado", category: "bolos-de-pote", name: "Bem Casado", image: "", prices: { "250ml": 15.0, "350ml": 20.0 } },
  ],
};

function isAdmin(req) {
  const password = req.headers["x-admin-password"];
  return Boolean(password) && password === process.env.ADMIN_PASSWORD;
}

function isValidCatalog(catalog) {
  if (!catalog || typeof catalog !== "object") return false;
  if (typeof catalog.whatsappNumber !== "string") return false;
  if (!Array.isArray(catalog.categories) || !Array.isArray(catalog.products)) return false;
  if (!Array.isArray(catalog.promoImages)) return false;

  for (const cat of catalog.categories) {
    if (!cat.id || !cat.name || !cat.pricingType) return false;
    if (cat.pricingType === "combo") {
      if (!cat.combo || typeof cat.combo.single !== "number" || typeof cat.combo.pair !== "number") return false;
    } else if (cat.pricingType === "sizes") {
      if (!Array.isArray(cat.sizes) || cat.sizes.length === 0) return false;
    } else {
      return false;
    }
  }

  for (const p of catalog.products) {
    if (!p.id || !p.category || !p.name) return false;
  }

  return true;
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      let catalog = await kv.get(CATALOG_KEY);
      if (!catalog) {
        catalog = DEFAULT_CATALOG;
        // Semeia o banco na primeira leitura, sem travar a resposta
        // se isso falhar por algum motivo.
        kv.set(CATALOG_KEY, catalog).catch((error) => {
          console.error("Erro ao semear catálogo padrão:", error);
        });
      }
      res.status(200).json({ catalog });
    } catch (error) {
      // Falha "aberta": se o banco cair, a loja continua funcionando
      // com o catálogo padrão embutido no código.
      console.error("Erro ao ler catálogo:", error);
      res.status(200).json({ catalog: DEFAULT_CATALOG });
    }
    return;
  }

  if (req.method === "PUT") {
    if (!isAdmin(req)) {
      res.status(401).json({ error: "Senha incorreta." });
      return;
    }

    const { catalog } = req.body || {};
    if (!isValidCatalog(catalog)) {
      res.status(400).json({ error: "Formato de catálogo inválido." });
      return;
    }

    try {
      await kv.set(CATALOG_KEY, catalog);
      res.status(200).json({ ok: true });
    } catch (error) {
      console.error("Erro ao salvar catálogo:", error);
      res.status(500).json({ error: "Não foi possível salvar o catálogo agora." });
    }
    return;
  }

  res.setHeader("Allow", ["GET", "PUT"]);
  res.status(405).json({ error: "Método não permitido." });
}
