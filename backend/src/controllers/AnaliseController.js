const AnaliseModel = require('../models/AnaliseModel');

const TIPOS_VALIDOS = ['papel', 'tijolo'];
const STATUS_VALIDOS = ['approved', 'rejected', 'warning'];

function validarAnalise(body) {
  const erros = [];

  if (!body.ticker || typeof body.ticker !== 'string') {
    erros.push('Ticker é obrigatório.');
  }

  if (!TIPOS_VALIDOS.includes(body.tipo)) {
    erros.push('Tipo deve ser "papel" ou "tijolo".');
  }

  if (!STATUS_VALIDOS.includes(body.status)) {
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
}

const AnaliseController = {
  async salvar(req, res) {
    try {
      const erros = validarAnalise(req.body);

      if (erros.length > 0) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Dados inválidos.',
          erros
        });
      }

      const analise = {
        ticker: req.body.ticker.trim().toUpperCase(),
        tipo: req.body.tipo,
        status: req.body.status,
        aprovados: req.body.aprovados,
        total: req.body.total,
        dados: req.body.dados,
        resultado: req.body.resultado
      };

      const id = await AnaliseModel.criar(analise);

      return res.status(201).json({
        sucesso: true,
        mensagem: 'Análise salva com sucesso.',
        id
      });
    } catch (error) {
      console.error('Erro ao salvar análise:', error.message);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro interno ao salvar a análise.'
      });
    }
  },

  async listar(req, res) {
    try {
      const limite = Number(req.query.limite) || 50;
      const analises = await AnaliseModel.listar(limite);

      return res.json({
        sucesso: true,
        total: analises.length,
        analises
      });
    } catch (error) {
      console.error('Erro ao listar análises:', error.message);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro interno ao listar análises.'
      });
    }
  },

  async buscar(req, res) {
    try {
      const id = Number(req.params.id);
      const analise = await AnaliseModel.buscarPorId(id);

      if (!analise) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Análise não encontrada.'
        });
      }

      return res.json({
        sucesso: true,
        analise
      });
    } catch (error) {
      console.error('Erro ao buscar análise:', error.message);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro interno ao buscar a análise.'
      });
    }
  }
};

module.exports = AnaliseController;
