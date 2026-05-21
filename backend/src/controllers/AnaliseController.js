const AnaliseService = require('../services/AnaliseService');

const AnaliseController = {
  async salvar(req, res) {
    try {
      const resultado = await AnaliseService.salvar(req.body);

      if (!resultado.ok) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Dados inválidos.',
          erros: resultado.erros
        });
      }

      return res.status(201).json({
        sucesso: true,
        mensagem: 'Análise salva com sucesso.',
        id: resultado.id
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
      const resultado = await AnaliseService.listar(limite);

      return res.json({
        sucesso: true,
        total: resultado.analises.length,
        analises: resultado.analises
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
      const resultado = await AnaliseService.buscarPorId(id);

      if (!resultado.ok) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Análise não encontrada.'
        });
      }

      return res.json({
        sucesso: true,
        analise: resultado.analise
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
