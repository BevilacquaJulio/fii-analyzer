const TIPOS_VALIDOS = ['papel', 'tijolo'];
const STATUS_VALIDOS = ['approved', 'rejected', 'warning'];

const Analise = {
  TIPOS_VALIDOS,
  STATUS_VALIDOS,

  fromPayload(body) {
    return {
      ticker: body.ticker.trim().toUpperCase(),
      tipo: body.tipo,
      status: body.status,
      aprovados: body.aprovados,
      total: body.total,
      dados: body.dados,
      resultado: body.resultado
    };
  }
};

module.exports = Analise;
