const Api = {
  async salvarAnalise(payload) {
    const response = await fetch(`${AppConfig.API_URL}/analises`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      const msg = data.erros?.join(' ') || data.mensagem || 'Erro ao salvar.';
      throw new Error(msg);
    }

    return data;
  },

  async verificarApi() {
    const response = await fetch(`${AppConfig.API_URL}/health`);
    return response.ok;
  }
};
