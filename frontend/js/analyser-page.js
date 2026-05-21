const AnalyserPage = {
  init() {
    const form = document.getElementById('analyser-form');
    if (!form) return;

    Analyser.setType('papel');
    Analyser.qualitative = { dividendos: null, cotistas: null };
    HistoricoDatePicker.reset();

    const errorEl = document.getElementById('analyser-error');
    const tickerInput = document.getElementById('ticker');

    tickerInput.oninput = () => {
      tickerInput.value = tickerInput.value.toUpperCase();
    };

    document.querySelectorAll('.toggle-btn').forEach((btn) => {
      btn.onclick = (e) => this.handleTypeToggleClick(e, btn);
    });

    this.bindChecklistModal();
    HistoricoDatePicker.init();

    document.querySelectorAll('.yes-no-btn').forEach((btn) => {
      btn.onclick = () => {
        Analyser.setQualitative(btn.dataset.field, btn.dataset.value);
        this.updateSaveButtonState();
      };
    });

    ScaleDropdown.init();
    this.bindFormWatchers(form);
    this.bindSalvarAnalise();

    form.onsubmit = (e) => {
      e.preventDefault();
      errorEl.hidden = true;
      document.querySelectorAll('#analyser-form .input, #analyser-form .input-combo, #analyser-form .input--picker').forEach((el) => {
        el.classList.remove('error');
      });

      const data = Analyser.readFormData();
      const missing = Analyser.validateForm(data);

      if (missing.length > 0) {
        errorEl.textContent = `Preencha os campos obrigatórios: ${missing.map((m) => m.label).join(', ')}.`;
        errorEl.hidden = false;
        missing.forEach((m) => {
          const el = document.getElementById(m.id);
          if (!el) return;
          if (el.classList.contains('input-combo__input')) {
            el.closest('.input-combo')?.classList.add('error');
          } else {
            el.classList.add('error');
          }
        });
        this.updateSaveButtonState();
        return;
      }

      const result = Analyser.analyze(data);
      Analyser.setLastAnalysis(data, result);
      Analyser.renderResult(result);
    };

    this.updateSaveButtonState();
  },

  bindFormWatchers(form) {
    form.addEventListener('input', () => this.updateSaveButtonState());
    form.addEventListener('change', () => this.updateSaveButtonState());
    document.addEventListener('analyser:form-changed', () => this.updateSaveButtonState());
  },

  updateSaveButtonState() {
    const btn = document.getElementById('btn-salvar-analise');
    const wrap = document.getElementById('save-historico-wrap');
    if (!btn || btn.dataset.saving === 'true') return;

    const complete = Analyser.isFormComplete();
    btn.disabled = !complete;
    btn.setAttribute('aria-disabled', complete ? 'false' : 'true');
    btn.classList.toggle('btn-save-historico--ready', complete);
    btn.classList.toggle('btn-save-historico--dimmed', !complete);
    wrap?.classList.toggle('save-historico-wrap--ready', complete);
    wrap?.classList.toggle('save-historico-wrap--dimmed', !complete);
  },

  bindSalvarAnalise() {
    const btn = document.getElementById('btn-salvar-analise');
    if (!btn || btn.dataset.bound === 'true') return;
    btn.dataset.bound = 'true';

    btn.onclick = async () => {
      if (btn.disabled || !Analyser.isFormComplete()) return;

      const data = Analyser.readFormData();
      const result = Analyser.analyze(data);
      Analyser.setLastAnalysis(data, result);
      Analyser.renderResult(result);

      const payload = Analyser.buildSavePayload();
      if (!payload) {
        Analyser.showSaveFeedback('Não foi possível preparar a análise para salvar.', 'error');
        return;
      }

      btn.dataset.saving = 'true';
      btn.disabled = true;
      btn.textContent = 'Salvando...';
      Analyser.hideSaveFeedback();

      try {
        const resposta = await Api.salvarAnalise(payload);
        Analyser.showSaveFeedback(`${resposta.mensagem} (ID #${resposta.id})`, 'success');
      } catch (err) {
        Analyser.showSaveFeedback(
          err.message || 'Não foi possível salvar. Verifique se a API está rodando.',
          'error'
        );
      } finally {
        btn.dataset.saving = 'false';
        btn.textContent = 'Salvar no histórico';
        this.updateSaveButtonState();
      }
    };
  },

  handleTypeToggleClick(e, btn) {
    const type = btn.dataset.type;

    if (e.target.closest('.toggle-btn__balloon')) {
      e.stopPropagation();
      Analyser.openChecklistModal(type);
      return;
    }

    if (Analyser.currentType === type && btn.classList.contains('toggle-active')) {
      Analyser.clearType();
      this.updateSaveButtonState();
      return;
    }

    Analyser.setType(type);
    Analyser.revealBalloonHint(type);
    this.updateSaveButtonState();

    setTimeout(() => {
      document.getElementById('analyser-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, Analyser.BALLOON_ANIM_MS);
  },

  bindChecklistModal() {
    const modal = document.getElementById('checklist-modal');
    if (!modal) return;

    modal.querySelectorAll('[data-close-modal]').forEach((el) => {
      el.onclick = () => Analyser.closeChecklistModal();
    });

    if (this._checklistModalBound) return;
    this._checklistModalBound = true;

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      Analyser.closeChecklistModal();
    });
  }
};
