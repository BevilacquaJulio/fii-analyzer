const Analise = require('../models/Analise');
const AnaliseRepository = require('../repositories/AnaliseRepository');

const AnaliseService = {
  validar(body) {
    const erros = [];

    if (!body.ticker || typeof body.ticker !== 'string') {
      erros.push('Ticker é obrigatório.');
    }

    if (!Analise.TIPOS_VALIDOS.includes(body.tipo)) {
      erros.push('Tipo deve ser "papel" ou "tijolo".');
    }

    if (!Analise.STATUS_VALIDOS.includes(body.status)) {
      erros.push('Status inválido.');
    }

    if (!Number.isInteger(body.aprovados) || body.aprovados < 0) {
      erros.push('Campo "aprovados" inválido.');
    }

    if (!Number.isInteger(body.total) || body.total < 1) {
      erros.push('Campo "total" inválido.');
    }

    if (!body.dados || typeof body.dados !== 'object') {
      erros.push('Campo "dados" é obrigatório.');
    }

    if (!body.resultado || typeof body.resultado !== 'object') {
      erros.push('Campo "resultado" é obrigatório.');
    }

    return erros;
  },

  async salvar(body) {
    const erros = this.validar(body);
    if (erros.length > 0) {
      return { ok: false, erros };
    }

    const analise = Analise.fromPayload(body);
    const id = await AnaliseRepository.criar(analise);

    return { ok: true, id };
  },

  async listar(limite = 50) {
    const analises = await AnaliseRepository.listar(limite);
    return { ok: true, analises };
  },

  async buscarPorId(id) {
    const analise = await AnaliseRepository.buscarPorId(id);

    if (!analise) {
      return { ok: false, notFound: true };
    }

    return { ok: true, analise };
  }
};

module.exports = AnaliseService;
