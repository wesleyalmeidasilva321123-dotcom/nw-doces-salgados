/* =============================================================
   FUNÇÕES COMPARTILHADAS — usadas por index.html (loja) e
   admin.html (painel) pra ler o catálogo (categorias, sabores e
   preços), que agora mora no banco de dados e é editado pelo
   painel, na aba "Catálogo" — não precisa mais editar HTML/código
   pra adicionar um sabor ou categoria nova.
============================================================= */

async function fetchCatalog() {
  const res = await fetch("/api/catalog");
  if (!res.ok) throw new Error("Não foi possível carregar o catálogo.");
  const data = await res.json();
  return data.catalog;
}

function formatBRL(value) {
  return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Uma "linha vendável" (lineId) identifica o que está no carrinho ou
// no estoque: pra categorias de combo (compre 1 ou 2), é só o id do
// produto. Pra categorias de tamanho (ex.: bolos de pote), é
// "produtoId::tamanhoId", porque cada tamanho tem preço (e estoque)
// próprio.
function makeLineId(productId, sizeId) {
  return sizeId ? `${productId}::${sizeId}` : productId;
}

function parseLineId(lineId) {
  const [productId, sizeId] = lineId.split("::");
  return { productId, sizeId: sizeId || null };
}
