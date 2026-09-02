// =============================================================
// API: /api/orders
// GET   -> lista todos os pedidos (só admin, com senha) — usado
//          pela aba "Faturamento" do painel.
// POST  -> qualquer pessoa pode criar um pedido PENDENTE — a loja
//          chama isso sozinha quando o cliente clica em "Enviar
//          pedido pelo WhatsApp". Não mexe no estoque ainda.
// PATCH -> confirma ou cancela um pedido (só admin, com senha).
//          Confirmar = entra no faturamento E desconta do estoque.
//          Cancelar  = só marca como cancelado, não mexe em nada.
//
// Os pedidos ficam guardados no Vercel KV como uma lista única:
// [{ id, createdAt, status, customerName, address, items, total,
//    confirmedAt }, ...]
// status pode ser "pending" | "confirmed" | "cancelled"
//
// IMPORTANTE: o valor (total) que chega aqui é o mesmo que o site
// calculou pro cliente ver — não é recalculado no servidor. Como a
// venda só entra de fato no faturamento quando VOCÊ clica em
// "Confirmar venda" no painel (depois de conferir o pagamento), dá
// pra confiar nesse número sem precisar duplicar a lógica de preços
// aqui também.
// =============================================================

import { kv } from "@vercel/kv";

const ORDERS_KEY = "nw_orders";
const STOCK_KEY = "nw_stock";

function isAdmin(req) {
  const password = req.headers["x-admin-password"];
  return Boolean(password) && password === process.env.ADMIN_PASSWORD;
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    if (!isAdmin(req)) {
      res.status(401).json({ error: "Senha incorreta." });
      return;
    }
    try {
      const orders = (await kv.get(ORDERS_KEY)) || [];
      res.status(200).json({ orders });
    } catch (error) {
      console.error("Erro ao ler pedidos:", error);
      res.status(500).json({ error: "Não foi possível carregar os pedidos agora." });
    }
    return;
  }

  if (req.method === "POST") {
    const { customerName, address, items, total } = req.body || {};

    if (typeof items !== "object" || items === null || Array.isArray(items) || Object.keys(items).length === 0) {
      res.status(400).json({ error: "Pedido sem itens." });
      return;
    }
    if (typeof total !== "number" || !isFinite(total) || total < 0) {
      res.status(400).json({ error: "Total do pedido inválido." });
      return;
    }

    const order = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      status: "pending",
      customerName: typeof customerName === "string" ? customerName.slice(0, 200) : "",
      address: typeof address === "string" ? address.slice(0, 500) : "",
      items,
      total,
      confirmedAt: null,
    };

    try {
      const orders = (await kv.get(ORDERS_KEY)) || [];
      orders.unshift(order);
      await kv.set(ORDERS_KEY, orders);
      res.status(200).json({ ok: true, id: order.id });
    } catch (error) {
      // Falha "aberta": se o banco falhar aqui, o pedido do cliente
      // já foi mandado pro WhatsApp de qualquer jeito — só avisamos
      // que ele não vai aparecer sozinho no painel dessa vez.
      console.error("Erro ao salvar pedido:", error);
      res.status(200).json({ ok: false, error: "Não foi possível registrar o pedido no painel." });
    }
    return;
  }

  if (req.method === "PATCH") {
    if (!isAdmin(req)) {
      res.status(401).json({ error: "Senha incorreta." });
      return;
    }

    const { id, action } = req.body || {};
    if (!id || (action !== "confirm" && action !== "cancel")) {
      res.status(400).json({ error: "Requisição inválida." });
      return;
    }

    try {
      const orders = (await kv.get(ORDERS_KEY)) || [];
      const order = orders.find((o) => o.id === id);

      if (!order) {
        res.status(404).json({ error: "Pedido não encontrado." });
        return;
      }
      if (order.status !== "pending") {
        res.status(400).json({ error: "Esse pedido já foi processado." });
        return;
      }

      if (action === "cancel") {
        order.status = "cancelled";
      } else {
        order.status = "confirmed";
        order.confirmedAt = new Date().toISOString();

        // Desconta do estoque só os sabores com controle explícito
        // (mesma regra usada na loja: sabor sem número = ilimitado).
        const stock = (await kv.get(STOCK_KEY)) || {};
        Object.entries(order.items).forEach(([productId, qty]) => {
          if (Object.prototype.hasOwnProperty.call(stock, productId)) {
            stock[productId] = Math.max(0, stock[productId] - Number(qty || 0));
          }
        });
        await kv.set(STOCK_KEY, stock);
      }

      await kv.set(ORDERS_KEY, orders);
      res.status(200).json({ ok: true, order });
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error);
      res.status(500).json({ error: "Não foi possível atualizar o pedido agora." });
    }
    return;
  }

  res.setHeader("Allow", ["GET", "POST", "PATCH"]);
  res.status(405).json({ error: "Método não permitido." });
}
