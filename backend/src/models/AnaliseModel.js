const db = require('../config/database');

const AnaliseModel = {
  async criar(analise) {
    const sql = `
      INSERT INTO analises (ticker, tipo, status, aprovados, total, dados, resultado)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const valores = [
      analise.ticker,
      analise.tipo,
      analise.status,
      analise.aprovados,
      analise.total,
      JSON.stringify(analise.dados),
      JSON.stringify(analise.resultado)
    ];

    const [resultado] = await db.execute(sql, valores);
    return resultado.insertId;
  },

  async listar(limite = 50) {
    const sql = `
      SELECT id, ticker, tipo, status, aprovados, total, criado_em
      FROM analises
      ORDER BY criado_em DESC
      LIMIT ?
    `;

    const [linhas] = await db.execute(sql, [limite]);
    return linhas;
  },

  async buscarPorId(id) {
    const sql = `
      SELECT id, ticker, tipo, status, aprovados, total, dados, resultado, criado_em
      FROM analises
      WHERE id = ?
      LIMIT 1
    `;

    const [linhas] = await db.execute(sql, [id]);
    if (linhas.length === 0) return null;

    const analise = linhas[0];
    analise.dados = JSON.parse(analise.dados);
    analise.resultado = JSON.parse(analise.resultado);
    return analise;
  }
};

module.exports = AnaliseModel;
