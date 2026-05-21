const Simulator = {
  lastRows: [],

  COLUMNS: [
    { key: 'mes', label: 'Mês', format: (v) => String(v) },
    { key: 'cotasInicio', label: 'Cotas Início', format: (v) => Utils.formatCotas(v) },
    { key: 'dividendo', label: 'Dividendo (R$)', format: (v) => Utils.formatCurrency(v) },
    { key: 'caixaAnterior', label: 'Caixa Anterior (R$)', format: (v) => Utils.formatCurrency(v) },
    { key: 'totalDisponivel', label: 'Total Disponível (R$)', format: (v) => Utils.formatCurrency(v) },
    { key: 'novasCotas', label: 'Novas Cotas', format: (v) => String(Math.round(v)) },
    { key: 'valorGasto', label: 'Valor Gasto (R$)', format: (v) => Utils.formatCurrency(v) },
    { key: 'caixaProx', label: 'Caixa p/ Próx. Mês (R$)', format: (v) => Utils.formatCurrency(v) },
    { key: 'cotasFinal', label: 'Cotas Final', format: (v) => Utils.formatCotas(v) },
    { key: 'divMensalFinal', label: 'Div. Mensal Final (R$)', format: (v) => Utils.formatCurrency(v) },
    { key: 'valorTotal', label: 'Valor Total (R$)', format: (v) => Utils.formatCurrency(v) },
    { key: 'valorTotalReal', label: 'Valor Total Real (R$)', format: (v) => Utils.formatCurrency(v), className: 'col-total-real' },
    { key: 'dividendoReal', label: 'Dividendo Real (R$)', format: (v) => Utils.formatCurrency(v), className: 'col-div-real' }
  ],

  readFormData() {
    return {
      cotasIniciais: Utils.parseNumber(document.getElementById('cotas-iniciais').value),
      valorCota: Utils.parseNumber(document.getElementById('sim-valor-cota').value),
      dividendoCota: Utils.parseNumber(document.getElementById('dividendo-cota').value),
      novasCotas: Utils.parseNumber(document.getElementById('novas-cotas').value),
      valorGastoCota: Utils.parseNumber(document.getElementById('valor-gasto-cota').value),
      numMeses: Utils.parseNumber(document.getElementById('num-meses').value),
      caixaInicial: Utils.parseNumber(document.getElementById('caixa-inicial').value) || 0
    };
  },

  validateForm(data) {
    return Utils.validateRequired([
      { id: 'cotas-iniciais', label: 'Cotas iniciais', value: data.cotasIniciais },
      { id: 'sim-valor-cota', label: 'Valor da cota', value: data.valorCota },
      { id: 'dividendo-cota', label: 'Dividendo mensal por cota', value: data.dividendoCota },
      { id: 'novas-cotas', label: 'Novas cotas por mês', value: data.novasCotas },
      { id: 'valor-gasto-cota', label: 'Valor gasto por cota nova', value: data.valorGastoCota },
      { id: 'num-meses', label: 'Número de meses', value: data.numMeses }
    ]);
  },

  calculate(data) {
    const rows = [];
    let cotasAnterior = data.cotasIniciais;
    let caixaAnterior = data.caixaInicial;

    for (let mes = 1; mes <= data.numMeses; mes++) {
      const cotasInicio = cotasAnterior;
      const dividendo = cotasInicio * data.dividendoCota;
      const totalDisponivel = caixaAnterior + dividendo;
      const novasCotas = data.novasCotas;
      const valorGasto = novasCotas * data.valorGastoCota;
      const caixaProx = totalDisponivel - valorGasto;
      const cotasFinal = cotasInicio + novasCotas;
      const divMensalFinal = cotasFinal * data.dividendoCota;
      const valorTotal = cotasFinal * data.valorCota + caixaProx;
      const valorTotalReal = cotasFinal * data.valorCota;
      const dividendoReal = cotasFinal * data.dividendoCota;

      rows.push({
        mes,
        cotasInicio,
        dividendo,
        caixaAnterior,
        totalDisponivel,
        novasCotas,
        valorGasto,
        caixaProx,
        cotasFinal,
        divMensalFinal,
        valorTotal,
        valorTotalReal,
        dividendoReal
      });

      cotasAnterior = cotasFinal;
      caixaAnterior = caixaProx;
    }

    return rows;
  },

  computeSummary(data, rows) {
    if (rows.length === 0) return null;
    const last = rows[rows.length - 1];
    const totalInvestido = data.novasCotas * data.valorGastoCota * data.numMeses;
    const investimentoInicial = data.cotasIniciais * data.valorCota + data.caixaInicial;
    const patrimonioFinal = last.valorTotal;
    const crescimento = investimentoInicial > 0
      ? ((patrimonioFinal - investimentoInicial) / investimentoInicial) * 100
      : 0;

    return {
      cotasFinal: last.cotasFinal,
      dividendoFinal: last.dividendoReal,
      patrimonioFinal,
      totalInvestido,
      crescimento
    };
  },

  renderTable(rows) {
    const tbody = document.getElementById('simulator-tbody');
    tbody.innerHTML = rows.map((row) => {
      const cells = this.COLUMNS.map((col) => {
        const cls = col.className ? ` class="${col.className}"` : '';
        return `<td${cls}>${col.format(row[col.key])}</td>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
  },

  renderSummary(summary) {
    const container = document.getElementById('simulator-summary');
    container.innerHTML = `
      <div class="metric-card">
        <p class="metric-label">Total de cotas</p>
        <p class="metric-value">${Utils.formatCotas(summary.cotasFinal)}</p>
      </div>
      <div class="metric-card">
        <p class="metric-label">Dividendo mensal</p>
        <p class="metric-value">${Utils.formatCurrency(summary.dividendoFinal)}</p>
      </div>
      <div class="metric-card">
        <p class="metric-label">Patrimônio total</p>
        <p class="metric-value">${Utils.formatCurrency(summary.patrimonioFinal)}</p>
      </div>
      <div class="metric-card">
        <p class="metric-label">Total investido</p>
        <p class="metric-value metric-value--warning">${Utils.formatCurrency(summary.totalInvestido)}</p>
      </div>
      <div class="metric-card">
        <p class="metric-label">Crescimento</p>
        <p class="metric-value">${summary.crescimento >= 0 ? '+' : ''}${summary.crescimento.toFixed(1).replace('.', ',')}%</p>
      </div>`;
  },

  simulate() {
    const data = this.readFormData();
    const missing = this.validateForm(data);

    if (missing.length > 0) {
      return { error: `Preencha os campos: ${missing.map((m) => m.label).join(', ')}.` };
    }

    if (data.numMeses < 1) {
      return { error: 'O número de meses deve ser pelo menos 1.' };
    }

    const rows = this.calculate(data);
    this.lastRows = rows;
    const summary = this.computeSummary(data, rows);

    this.renderTable(rows);
    this.renderSummary(summary);

    document.getElementById('simulator-output').hidden = false;
    document.getElementById('btn-export').disabled = false;

    return { success: true, data, rows, summary };
  },

  clear() {
    document.getElementById('simulator-form').reset();
    document.getElementById('caixa-inicial').value = '0';
    document.getElementById('simulator-tbody').innerHTML = '';
    document.getElementById('simulator-summary').innerHTML = '';
    document.getElementById('simulator-output').hidden = true;
    document.getElementById('btn-export').disabled = true;
    document.getElementById('simulator-error').hidden = true;
    this.lastRows = [];
  },

  exportCSV() {
    if (this.lastRows.length === 0) return;

    const headers = this.COLUMNS.map((c) => c.label);
    const csvRows = [headers.join(';')];

    for (const row of this.lastRows) {
      const values = this.COLUMNS.map((col) => {
        const raw = row[col.key];
        if (typeof raw === 'number') {
          return String(raw).replace('.', ',');
        }
        return String(raw);
      });
      csvRows.push(values.join(';'));
    }

    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'simulacao-fii.csv';
    link.click();
    URL.revokeObjectURL(url);
  }
};
