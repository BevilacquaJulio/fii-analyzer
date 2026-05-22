const PageInit = {
  init(page) {
    if (page === 'analise') AnalyserPage.init();
    if (page === 'simulador') SimulatorPage.init();
    if (page === 'historico') HistoricoPage.init();
  }
};
