const HistoricoDatePicker = {
  step: 0,
  draft: { ano: '', mes: '', dia: '' },
  MONTHS: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],

  init() {
    const trigger = document.getElementById('historico-trigger');
    const modal = document.getElementById('historico-date-modal');
    if (!trigger || !modal) return;

    trigger.onclick = () => this.open();
    document.getElementById('historico-date-next').onclick = () => this.next();
    document.getElementById('historico-date-back').onclick = () => this.back();

    modal.querySelectorAll('[data-close-historico-modal]').forEach((el) => {
      el.onclick = () => this.close();
    });

    if (!this._docBound) {
      this._docBound = true;
      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        const m = document.getElementById('historico-date-modal');
        if (m && !m.hidden) this.close();
      });
    }
  },

  getStored() {
    return {
      ano: document.getElementById('historico-ano')?.value || '',
      mes: document.getElementById('historico-mes')?.value || '',
      dia: document.getElementById('historico-dia')?.value || ''
    };
  },

  getValues() {
    const stored = this.getStored();
    return {
      ano: Utils.parseNumber(stored.ano),
      mes: Utils.parseNumber(stored.mes),
      dia: Utils.parseNumber(stored.dia)
    };
  },

  getYears() {
    const v = this.getValues();
    return Utils.yearsSinceDate(v.ano, v.mes, v.dia);
  },

  open() {
    const stored = this.getStored();
    this.draft = { ...stored };
    this.step = 0;
    this.clearError();
    this.renderStep();
    const modal = document.getElementById('historico-date-modal');
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    modal.querySelector('#historico-date-body input, #historico-date-body button')?.focus()
      || document.getElementById('historico-date-next')?.focus();
  },

  close() {
    const modal = document.getElementById('historico-date-modal');
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    if (!document.getElementById('checklist-modal') || document.getElementById('checklist-modal').hidden) {
      document.body.classList.remove('modal-open');
    }
    document.getElementById('historico-trigger')?.focus();
  },

  clearError() {
    const err = document.getElementById('historico-date-error');
    if (err) {
      err.hidden = true;
      err.textContent = '';
    }
  },

  showError(message) {
    const err = document.getElementById('historico-date-error');
    if (!err) return;
    err.textContent = message;
    err.hidden = false;
  },

  updateStepIndicators() {
    document.querySelectorAll('.date-modal__step').forEach((el) => {
      const step = Number(el.dataset.step);
      el.classList.toggle('is-active', step === this.step);
      el.classList.toggle('is-done', step < this.step);
    });
  },

  renderStep() {
    const body = document.getElementById('historico-date-body');
    const backBtn = document.getElementById('historico-date-back');
    const nextBtn = document.getElementById('historico-date-next');
    if (!body || !backBtn || !nextBtn) return;

    this.updateStepIndicators();
    backBtn.hidden = this.step === 0;
    nextBtn.textContent = this.step === 2 ? 'Confirmar' : 'Próximo';
    this.clearError();

    if (this.step === 0) {
      body.innerHTML = `
        <label class="date-modal__field-label" for="historico-draft-ano">Ano</label>
        <input class="input" type="number" id="historico-draft-ano" inputmode="numeric" placeholder="Ex.: 2018" min="1990" max="${new Date().getFullYear()}" value="${this.draft.ano}">`;
      const input = document.getElementById('historico-draft-ano');
      input?.focus();
      input?.select();
      return;
    }

    if (this.step === 1) {
      body.innerHTML = `
        <p class="date-modal__field-label">Mês</p>
        <div class="date-modal__grid date-modal__grid--months" role="group" aria-label="Mês">
          ${this.MONTHS.map((name, i) => {
            const val = i + 1;
            const selected = Number(this.draft.mes) === val ? ' is-selected' : '';
            return `<button type="button" class="date-modal__chip${selected}" data-month="${val}">${name}</button>`;
          }).join('')}
        </div>`;
      body.querySelectorAll('[data-month]').forEach((btn) => {
        btn.onclick = () => {
          body.querySelectorAll('[data-month]').forEach((b) => b.classList.remove('is-selected'));
          btn.classList.add('is-selected');
          this.draft.mes = btn.dataset.month;
        };
      });
      return;
    }

    const ano = Utils.parseNumber(this.draft.ano);
    const mes = Utils.parseNumber(this.draft.mes);
    const maxDay = Utils.daysInMonth(ano, mes);
    body.innerHTML = `
      <p class="date-modal__field-label">Dia</p>
      <div class="date-modal__grid date-modal__grid--days" role="group" aria-label="Dia">
        ${Array.from({ length: maxDay }, (_, i) => {
          const val = i + 1;
          const selected = Number(this.draft.dia) === val ? ' is-selected' : '';
          return `<button type="button" class="date-modal__chip${selected}" data-day="${val}">${val}</button>`;
        }).join('')}
      </div>`;
    body.querySelectorAll('[data-day]').forEach((btn) => {
      btn.onclick = () => {
        body.querySelectorAll('[data-day]').forEach((b) => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        this.draft.dia = btn.dataset.day;
      };
    });
  },

  validateCurrentStep() {
    if (this.step === 0) {
      const input = document.getElementById('historico-draft-ano');
      const ano = Utils.parseNumber(input?.value);
      const currentYear = new Date().getFullYear();
      if (!Number.isFinite(ano) || ano < 1990 || ano > currentYear) {
        this.showError(`Informe um ano entre 1990 e ${currentYear}.`);
        input?.focus();
        return false;
      }
      this.draft.ano = String(Math.trunc(ano));
      return true;
    }

    if (this.step === 1) {
      const mes = Utils.parseNumber(this.draft.mes);
      if (!Number.isFinite(mes) || mes < 1 || mes > 12) {
        this.showError('Selecione o mês.');
        return false;
      }
      return true;
    }

    const ano = Utils.parseNumber(this.draft.ano);
    const mes = Utils.parseNumber(this.draft.mes);
    const dia = Utils.parseNumber(this.draft.dia);
    if (!Utils.isValidDate(ano, mes, dia)) {
      this.showError('Selecione um dia válido. A data não pode ser futura.');
      return false;
    }
    return true;
  },

  next() {
    if (!this.validateCurrentStep()) return;

    if (this.step < 2) {
      this.step += 1;
      if (this.step === 2) {
        const ano = Utils.parseNumber(this.draft.ano);
        const mes = Utils.parseNumber(this.draft.mes);
        const maxDay = Utils.daysInMonth(ano, mes);
        if (Number(this.draft.dia) > maxDay) this.draft.dia = '';
      }
      this.renderStep();
      return;
    }

    this.confirm();
  },

  back() {
    if (this.step === 0) return;
    if (this.step === 1) {
      const input = document.getElementById('historico-draft-ano');
      if (input) this.draft.ano = input.value;
    }
    this.step -= 1;
    this.renderStep();
  },

  confirm() {
    const ano = Utils.parseNumber(this.draft.ano);
    const mes = Utils.parseNumber(this.draft.mes);
    const dia = Utils.parseNumber(this.draft.dia);

    document.getElementById('historico-ano').value = ano;
    document.getElementById('historico-mes').value = mes;
    document.getElementById('historico-dia').value = dia;

    const years = Utils.yearsSinceDate(ano, mes, dia);
    const display = document.getElementById('historico-display');
    const trigger = document.getElementById('historico-trigger');
    if (display) {
      display.textContent = `${Utils.formatDateBR(ano, mes, dia)} · ${years} ${years === 1 ? 'ano' : 'anos'}`;
    }
    trigger?.classList.remove('error');
    trigger?.classList.add('input--picker--filled');
    document.dispatchEvent(new CustomEvent('analyser:form-changed'));
    this.close();
  },

  reset() {
    ['historico-ano', 'historico-mes', 'historico-dia'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const display = document.getElementById('historico-display');
    const trigger = document.getElementById('historico-trigger');
    if (display) display.textContent = 'Selecionar ano, mês e dia';
    trigger?.classList.remove('error', 'input--picker--filled');
    document.dispatchEvent(new CustomEvent('analyser:form-changed'));
  }
};
