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
      };
    });

    ScaleDropdown.init();
    this.bindSalvarAnalise();
    this.bindLimparFormulario();

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
        return;
      }

      const result = Analyser.analyze(data);
      Analyser.setLastAnalysis(data, result);
      Analyser.renderResult(result);
    };
  },

  async _isDuplicate(ticker) {
    try {
      const data = await Api.listarAnalises(200);
      return (data.analises || []).some((a) => a.ticker === ticker);
    } catch {
      return false;
    }
  },

  bindSalvarAnalise() {
    const container = document.getElementById('analyser-result');
    if (!container || container.dataset.saveBound === 'true') return;
    container.dataset.saveBound = 'true';

    container.addEventListener('click', async (e) => {
      const btn = e.target.closest('#btn-salvar-analise');
      if (!btn || btn.disabled) return;

      e.preventDefault();
      e.stopPropagation();

      const data   = Analyser.readFormData();
      const result = Analyser.analyze(data);
      Analyser.setLastAnalysis(data, result);

      const payload = Analyser.buildSavePayload();
      if (!payload) {
        Analyser.showSaveFeedback('Não foi possível preparar a análise para salvar.', 'error');
        return;
      }

      btn.disabled = true;
      Analyser.hideSaveFeedback();
      Analyser.openSaveModal();

      try {
        // Verificação de duplicata em paralelo com o delay visual
        const [isDuplicate] = await Promise.all([
          this._isDuplicate(payload.ticker),
          Analyser._delay(480)
        ]);

        if (isDuplicate) {
          Analyser.setSaveModalState('duplicate');
          clearTimeout(Analyser._saveModalCloseTimer);
          Analyser._saveModalCloseTimer = setTimeout(() => Analyser.closeSaveModal(), 3200);
          return;
        }

        Analyser.setSaveModalState('saving');
        await Api.salvarAnalise(payload);

        Analyser.setSaveModalState('done', result);
        clearTimeout(Analyser._saveModalCloseTimer);
        Analyser._saveModalCloseTimer = setTimeout(() => Analyser.closeSaveModal(), 1800);
      } catch (err) {
        Analyser.closeSaveModal();
        Analyser.showSaveFeedback(
          err.message || 'Não foi possível salvar. Verifique se a API está rodando.',
          'error'
        );
      } finally {
        btn.disabled = false;
      }
    });
  },

  bindLimparFormulario() {
    const btn = document.getElementById('btn-limpar-formulario');
    if (!btn || btn.dataset.bound === 'true') return;
    btn.dataset.bound = 'true';

    btn.onclick = () => {
      Analyser.playClearFormAnimation();
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
      return;
    }

    Analyser.setType(type);
    Analyser.revealBalloonHint(type);

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
