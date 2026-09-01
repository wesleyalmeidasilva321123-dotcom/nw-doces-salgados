// =============================================================
// API: /api/verify-password
// O painel chama isso ao digitar a senha, antes de mostrar a tela
// de edição. Não expõe a senha real em nenhum momento — só confirma
// se bateu com a variável de ambiente ADMIN_PASSWORD.
// =============================================================

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: "Método não permitido." });
    return;
  }

  const { password } = req.body || {};

  if (!process.env.ADMIN_PASSWORD) {
    res.status(500).json({ error: "Senha do painel ainda não foi configurada no Vercel." });
    return;
  }

  if (password && password === process.env.ADMIN_PASSWORD) {
    res.status(200).json({ ok: true });
    return;
  }

  res.status(401).json({ ok: false, error: "Senha incorreta." });
}
