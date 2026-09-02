// =============================================================
// API: /api/stock
// GET  -> qualquer pessoa pode ler o estoque atual (a loja usa isso)
// POST -> só salva se vier a senha certa no cabeçalho x-admin-password
//         (o painel usa isso)
//
// O estoque fica guardado no Vercel KV como um único objeto:
// { "trad-avela": 12, "cone-ferrero": 0, ... }
// Um sabor que não aparece nesse objeto é tratado como ESTOQUE
// ILIMITADO pela loja — assim, se o banco de dados falhar ou um
// sabor novo for adicionado, a venda não trava.
// =============================================================

import { kv } from "@vercel/kv";

const STOCK_KEY = "nw_stock";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const stock = (await kv.get(STOCK_KEY)) || {};
      res.status(200).json({ stock });
    } catch (error) {
      // Falha "aberta": se o banco de dados estiver fora do ar,
      // mostramos tudo como disponível em vez de travar a loja.
      console.error("Erro ao ler estoque:", error);
      res.status(200).json({ stock: {} });
    }
    return;
  }

  if (req.method === "POST") {
    const password = req.headers["x-admin-password"];
    if (!password || password !== process.env.ADMIN_PASSWORD) {
      res.status(401).json({ error: "Senha incorreta." });
      return;
    }

    const { stock } = req.body || {};
    if (typeof stock !== "object" || stock === null || Array.isArray(stock)) {
      res.status(400).json({ error: "Formato de estoque inválido." });
      return;
    }

    try {
      await kv.set(STOCK_KEY, stock);
      res.status(200).json({ ok: true });
    } catch (error) {
      console.error("Erro ao salvar estoque:", error);
      res.status(500).json({ error: "Não foi possível salvar o estoque agora." });
    }
    return;
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).json({ error: "Método não permitido." });
}


