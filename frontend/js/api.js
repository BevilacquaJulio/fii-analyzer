const Api = {
  async salvarAnalise(payload) {
    return this._fetchJson(`${AppConfig.API_URL}/analises`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  async verificarApi() {
    try {
      const response = await fetch(`${AppConfig.API_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  },

  async _fetchJson(url, options = {}) {
    let response;
    try {
      response = await fetch(url, options);
    } catch {
      throw new Error(
        'Não foi possível conectar à API. Inicie o backend (npm start em backend/) e acesse http://localhost:3000'
      );
    }

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error('Resposta inválida da API.');
    }

    if (!response.ok) {
      const msg = data.erros?.join(' ') || data.mensagem || 'Erro na requisição.';
      throw new Error(msg);
    }

    return data;
  },

  async listarAnalises(limite = 50) {
    return this._fetchJson(`${AppConfig.API_URL}/analises?limite=${limite}`);
  },

  async buscarAnalise(id) {
    return this._fetchJson(`${AppConfig.API_URL}/analises/${id}`);
  }
};
