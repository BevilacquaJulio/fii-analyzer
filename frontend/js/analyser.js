const Analyser = {
  currentType: 'papel',
  qualitative: { dividendos: null, cotistas: null },
  BALLOON_ANIM_MS: 450,
  lastFormData: null,
  lastResult: null,

  TYPE_LABELS: {
    papel: 'FII de Papel',
    tijolo: 'FII de Tijolo'
  },

  getTypeCriteria(type) {
    const common = [
      {
        id: 'liquidez',
        name: 'Liquidez Diária',
        blocking: true,
        evaluate: (d) => d.liquidez >= 1_000_000,
        formatValue: (d) => Utils.formatCompactCurrency(d.liquidez),
        limit: '≥ R$ 1M',
        warn: (d) => Utils.isNearMin(d.liquidez, 1_000_000)
      },
      {
        id: 'pvp',
        name: 'P/VP',
        blocking: true,
        evaluate: (d) => d.pvp >= 0.85 && d.pvp <= 1.15,
        formatValue: (d) => d.pvp.toFixed(2).replace('.', ','),
        limit: 'entre 0,85 e 1,15',
        warn: (d) => Utils.isNearLimit(d.pvp, 0.85, 1.15)
      },
      {
        id: 'historico',
        name: 'Histórico',
        blocking: true,
        evaluate: (d) => d.historico >= 4,
        formatValue: (d) => Utils.formatHistoricoValue(d.historico, d.historicoDate),
        limit: '≥ 4 anos',
        warn: (d) => Utils.isNearMin(d.historico, 4)
      },
      {
        id: 'dividendos',
        name: 'Histórico de Dividendos',
        blocking: true,
        evaluate: (d) => d.dividendos === 'estavel' || d.dividendos === 'crescente',
        formatValue: (d) => (d.dividendos === 'estavel' ? 'Estável' : d.dividendos === 'crescente' ? 'Crescente' : '—'),
        limit: 'Estável ou crescente'
      },
      {
        id: 'dy',
        name: 'Dividend Yield',
        blocking: true,
        evaluate: (d) => type === 'papel'
          ? d.dy >= 9 && d.dy <= 20
          : d.dy >= 5 && d.dy <= 15,
        formatValue: (d) => Utils.formatPercent(d.dy),
        limit: type === 'papel' ? 'entre 9% e 20%' : 'entre 5% e 15%',
        warn: (d) => type === 'papel'
          ? Utils.isNearLimit(d.dy, 9, 20)
          : Utils.isNearLimit(d.dy, 5, 15)
      }
    ];

    if (type === 'papel') {
      return [
        ...common,
        {
          id: 'plMax',
          name: '% PL Máximo',
          blocking: true,
          evaluate: (d) => d.plMax <= 6,
          formatValue: (d) => Utils.formatPercent(d.plMax),
          limit: '≤ 6%',
          warn: (d) => Utils.isNearMax(d.plMax, 6)
        }
      ];
    }

    return [
      ...common,
      {
        id: 'imoveis',
        name: 'Número de imóveis',
        blocking: true,
        evaluate: (d) => d.imoveis >= 8,
        formatValue: (d) => String(d.imoveis),
        limit: '≥ 8',
        warn: (d) => Utils.isNearMin(d.imoveis, 8)
      },
      {
        id: 'vacancia',
        name: 'Vacância',
        blocking: true,
        evaluate: (d) => d.vacancia <= 10,
        formatValue: (d) => Utils.formatPercent(d.vacancia),
        limit: '≤ 10%',
        warn: (d) => Utils.isNearMax(d.vacancia, 10)
      }
    ];
  },

  getGeneralCriteria() {
    return [
      {
        id: 'patrimonioLiquido',
        name: 'Patrimônio Líquido',
        blocking: true,
        evaluate: (d) => d.patrimonioLiquido >= 1_000_000_000,
        formatValue: (d) => Utils.formatCompactCurrency(d.patrimonioLiquido),
        limit: '≥ R$ 1B',
        warn: (d) => Utils.isNearMin(d.patrimonioLiquido, 1_000_000_000)
      },
      {
        id: 'cotistas',
        name: 'Cotistas',
        blocking: true,
        evaluate: (d) => d.cotistas === 'sim',
        formatValue: (d) => (d.cotistas === 'sim' ? 'Sim (≥100k)' : 'Não'),
        limit: '≥ 100 mil'
      },
      {
        id: 'existencia',
        name: 'Existência',
        blocking: true,
        evaluate: (d) => d.historico >= 5,
        formatValue: (d) => Utils.formatHistoricoValue(d.historico, d.historicoDate),
        limit: '≥ 5 anos',
        warn: (d) => Utils.isNearMin(d.historico, 5)
      },
      {
        id: 'valorCota',
        name: 'Valor da Cota',
        blocking: false,
        evaluate: () => true,
        formatValue: (d) => Utils.formatCurrency(d.valorCota),
        limit: 'informativo'
      }
    ];
  },

  readFormData() {
    const type = this.currentType;
    const historicoDate = {
      ano: Utils.parseNumber(document.getElementById('historico-ano')?.value),
      mes: Utils.parseNumber(document.getElementById('historico-mes')?.value),
      dia: Utils.parseNumber(document.getElementById('historico-dia')?.value)
    };
    const historico = Utils.isValidDate(historicoDate.ano, historicoDate.mes, historicoDate.dia)
      ? Utils.yearsSinceDate(historicoDate.ano, historicoDate.mes, historicoDate.dia)
      : NaN;

    const data = {
      ticker: document.getElementById('ticker').value.trim().toUpperCase(),
      patrimonioLiquido: Utils.parseScaledValue(
        document.getElementById('patrimonio-liquido').value,
        document.getElementById('patrimonio-liquido-scale').value
      ),
      liquidez: Utils.parseScaledValue(
        document.getElementById('liquidez').value,
        document.getElementById('liquidez-scale').value
      ),
      pvp: Utils.parseNumber(document.getElementById('pvp').value),
      dy: Utils.parseNumber(document.getElementById('dy').value),
      valorCota: Utils.parseNumber(document.getElementById('valor-cota').value),
      historico,
      historicoDate,
      imoveis: Utils.parseNumber(document.getElementById('imoveis').value),
      plMax: Utils.parseNumber(document.getElementById('pl-max').value),
      vacancia: Utils.parseNumber(document.getElementById('vacancia').value),
      dividendos: this.qualitative.dividendos,
      cotistas: this.qualitative.cotistas,
      type
    };
    return data;
  },

  validateForm(data) {
    if (!data.type) {
      return [{ id: 'type', label: 'Tipo do FII' }];
    }

    const fields = [
      { id: 'ticker', label: 'Ticker', value: data.ticker },
      { id: 'patrimonio-liquido', label: 'Patrimônio Líquido', value: data.patrimonioLiquido },
      { id: 'liquidez', label: 'Liquidez Diária', value: data.liquidez },
      { id: 'pvp', label: 'P/VP', value: data.pvp },
      { id: 'dy', label: 'Dividend Yield', value: data.dy },
      { id: 'valor-cota', label: 'Valor da Cota', value: data.valorCota },
      { id: 'historico-trigger', label: 'Data de constituição', value: data.historico }
    ];

    if (data.type === 'papel') {
      fields.push({ id: 'pl-max', label: '% PL Máximo', value: data.plMax });
    } else if (data.type === 'tijolo') {
      fields.push(
        { id: 'imoveis', label: 'Número de imóveis', value: data.imoveis },
        { id: 'vacancia', label: 'Vacância', value: data.vacancia }
      );
    }

    const missing = Utils.validateRequired(fields);

    if (!data.dividendos) missing.push({ id: 'dividendos', label: 'Histórico de dividendos' });
    if (!data.cotistas) missing.push({ id: 'cotistas', label: 'Cotistas' });

    return missing;
  },

  evaluateCriteria(criteria, data) {
    return criteria.map((c) => {
      const passed = c.evaluate(data);
      const warning = passed && c.warn ? c.warn(data) : false;
      return {
        ...c,
        passed,
        warning,
        displayValue: c.formatValue(data)
      };
    });
  },

  analyze(data) {
    const typeCriteria = this.getTypeCriteria(data.type);
    const generalCriteria = this.getGeneralCriteria();
    const allCriteria = [...typeCriteria, ...generalCriteria];

    const evaluated = allCriteria.map((c) => {
      const passed = c.evaluate(data);
      const warning = passed && c.warn ? c.warn(data) : false;
      return { ...c, passed, warning, displayValue: c.formatValue(data) };
    });

    const evaluable = evaluated.filter((c) => c.blocking);
    const passedCount = evaluable.filter((c) => c.passed).length;
    const totalCount = evaluable.length;
    const hasFailure = evaluable.some((c) => !c.passed);
    const hasWarning = !hasFailure && evaluated.some((c) => c.warning);

    let status;
    if (hasFailure) {
      status = 'rejected';
    } else if (hasWarning) {
      status = 'warning';
    } else {
      status = 'approved';
    }

    return {
      status,
      ticker: data.ticker,
      type: data.type,
      typeLabel: this.TYPE_LABELS[data.type],
      passedCount,
      totalCount,
      typeResults: evaluated.filter((c) => typeCriteria.some((t) => t.id === c.id)),
      generalResults: evaluated.filter((c) => generalCriteria.some((g) => g.id === c.id))
    };
  },

  serializeCriterion(c) {
    return {
      id: c.id,
      name: c.name,
      passed: c.passed,
      warning: c.warning,
      displayValue: c.displayValue,
      limit: c.limit,
      blocking: c.blocking
    };
  },

  isFormComplete() {
    if (!this.currentType) return false;
    return this.validateForm(this.readFormData()).length === 0;
  },

  buildSavePayload() {
    if (!this.lastResult || !this.lastFormData) return null;

    return {
      ticker: this.lastResult.ticker,
      tipo: this.lastResult.type,
      status: this.lastResult.status,
      aprovados: this.lastResult.passedCount,
      total: this.lastResult.totalCount,
      dados: this.lastFormData,
      resultado: {
        typeLabel: this.lastResult.typeLabel,
        typeResults: this.lastResult.typeResults.map((c) => this.serializeCriterion(c)),
        generalResults: this.lastResult.generalResults.map((c) => this.serializeCriterion(c))
      }
    };
  },

  setLastAnalysis(formData, result) {
    this.lastFormData = formData;
    this.lastResult = result;
  },

  clearLastAnalysis() {
    this.lastFormData = null;
    this.lastResult = null;
  },

  showSaveFeedback(message, type = 'success') {
    const el = document.getElementById('analyser-save-feedback');
    if (!el) return;
    el.textContent = message;
    el.className = `save-feedback save-feedback--${type}`;
    el.hidden = false;
  },

  hideSaveFeedback() {
    const el = document.getElementById('analyser-save-feedback');
    if (el) el.hidden = true;
  },

  renderResult(result) {
    const container = document.getElementById('analyser-result');
    const statusConfig = {
      approved: { badge: 'badge-approved', card: 'card-approved', icon: Icons.checkCircle(), label: 'APROVADO' },
      rejected: { badge: 'badge-rejected', card: 'card-rejected', icon: Icons.xCircle(), label: 'REPROVADO' },
      warning: { badge: 'badge-warning', card: 'card-warning', icon: Icons.alertCircle(), label: 'ATENÇÃO' }
    };
    const cfg = statusConfig[result.status];

    const renderCriterion = (c) => {
      let cls = 'info';
      let icon = Icons.info('icon--sm');
      if (c.blocking) {
        if (!c.passed) { cls = 'fail'; icon = Icons.x('icon--sm'); }
        else if (c.warning) { cls = 'warn'; icon = Icons.alert('icon--sm'); }
        else { cls = 'pass'; icon = Icons.check('icon--sm'); }
      }
      return `
        <div class="criterion ${cls}">
          <span class="criterion-icon">${icon}</span>
          <span class="criterion-name">${c.name}</span>
          <span class="criterion-value">${c.displayValue}</span>
          <span class="criterion-limit">${c.limit}</span>
        </div>`;
    };

    container.innerHTML = `
      <div class="${cfg.card} resultado">
        <div class="result-header">
          <span class="badge ${cfg.badge}">${cfg.icon} ${cfg.label}</span>
          <span class="result-ticker">${result.ticker}</span>
          <span class="result-type">${result.typeLabel}</span>
        </div>
        <p class="result-score">${result.passedCount} de ${result.totalCount} critérios aprovados</p>
        <p class="criteria-section-title">Critérios do tipo (${result.typeLabel})</p>
        ${result.typeResults.map(renderCriterion).join('')}
        <p class="criteria-section-title">Checklist geral</p>
        ${result.generalResults.map(renderCriterion).join('')}
      </div>`;

    container.hidden = false;
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  setType(type) {
    this.currentType = type;
    this.updateFieldVisibility();
    this.hideAllBalloonHints();

    document.querySelectorAll('.toggle-btn').forEach((btn) => {
      const isActive = btn.dataset.type === type;
      btn.classList.toggle('toggle-active', isActive);
      btn.classList.toggle('toggle-inactive', !isActive);
    });

    const result = document.getElementById('analyser-result');
    result.hidden = true;
    result.innerHTML = '';
    this.clearLastAnalysis();
  },

  clearType() {
    this.currentType = null;
    this.hideAllBalloonHints();
    this.updateFieldVisibility();

    document.querySelectorAll('.toggle-btn').forEach((btn) => {
      btn.classList.remove('toggle-active');
      btn.classList.add('toggle-inactive');
    });

    const result = document.getElementById('analyser-result');
    if (result) {
      result.hidden = true;
      result.innerHTML = '';
    }
    this.clearLastAnalysis();
  },

  updateFieldVisibility() {
    const plField = document.getElementById('field-pl-max');
    const vacField = document.getElementById('field-vacancia');
    const imoveisField = document.getElementById('field-imoveis');

    if (!this.currentType) {
      plField.classList.add('field--hidden');
      vacField.classList.add('field--hidden');
      imoveisField.classList.add('field--hidden');
      return;
    }

    if (this.currentType === 'papel') {
      plField.classList.remove('field--hidden');
      vacField.classList.add('field--hidden');
      imoveisField.classList.add('field--hidden');
    } else {
      plField.classList.add('field--hidden');
      vacField.classList.remove('field--hidden');
      imoveisField.classList.remove('field--hidden');
    }
  },

  hideAllBalloonHints() {
    document.querySelectorAll('.toggle-btn.show-balloon').forEach((btn) => {
      btn.classList.remove('show-balloon');
      btn.querySelector('.toggle-btn__balloon')?.setAttribute('aria-hidden', 'true');
    });
  },

  revealBalloonHint(type) {
    this.hideAllBalloonHints();
    const btn = document.querySelector(`.toggle-btn[data-type="${type}"]`);
    if (!btn) return;
    void btn.offsetWidth;
    btn.classList.add('show-balloon');
    const balloon = btn.querySelector('.toggle-btn__balloon');
    if (balloon) {
      balloon.setAttribute('aria-hidden', 'false');
      balloon.setAttribute('aria-label', `Ver checklist — ${this.TYPE_LABELS[type]}`);
    }
  },

  renderChecklistModalHtml(type) {
    const typeCriteria = this.getTypeCriteria(type);
    const generalCriteria = this.getGeneralCriteria();

    const renderCard = (c) => `
      <article class="checklist-card${c.blocking ? '' : ' checklist-card--info'}">
        <h4 class="checklist-card__name">${c.name}</h4>
        <p class="checklist-card__limit">${c.limit}</p>
        ${c.blocking ? '' : '<span class="checklist-card__tag">Informativo</span>'}
      </article>`;

    return `
      <header class="checklist-modal__header">
        <h2 class="checklist-modal__title" id="checklist-modal-title">${this.TYPE_LABELS[type]}</h2>
        <p class="checklist-modal__subtitle">Checklist completo para aprovar a análise</p>
      </header>
      <section class="checklist-modal__section">
        <h3 class="checklist-modal__section-title">Critérios do tipo</h3>
        <div class="checklist-modal__grid">${typeCriteria.map(renderCard).join('')}</div>
      </section>
      <section class="checklist-modal__section">
        <h3 class="checklist-modal__section-title">Checklist geral</h3>
        <div class="checklist-modal__grid">${generalCriteria.map(renderCard).join('')}</div>
      </section>`;
  },

  openChecklistModal(type) {
    const modal = document.getElementById('checklist-modal');
    const content = document.getElementById('checklist-modal-content');
    if (!modal || !content) return;

    content.innerHTML = this.renderChecklistModalHtml(type);
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    modal.querySelector('.checklist-modal__close')?.focus();
  },

  closeChecklistModal() {
    const modal = document.getElementById('checklist-modal');
    if (!modal || modal.hidden) return;

    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    const dateModal = document.getElementById('historico-date-modal');
    if (!dateModal || dateModal.hidden) {
      document.body.classList.remove('modal-open');
    }
  },

  setQualitative(field, value) {
    this.qualitative[field] = value;
    document.querySelectorAll(`.yes-no-btn[data-field="${field}"]`).forEach((btn) => {
      btn.classList.remove('selected-yes', 'selected-no', 'selected-crescente');
      if (btn.dataset.value !== value) return;
      if (field === 'dividendos' && value === 'crescente') {
        btn.classList.add('selected-crescente');
      } else if (field === 'cotistas' && value === 'nao') {
        btn.classList.add('selected-no');
      } else {
        btn.classList.add('selected-yes');
      }
    });
  }
};
