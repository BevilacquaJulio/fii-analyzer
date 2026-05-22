const HistoricoDatePicker = {
  step: 0,
  draft: { ano: '', mes: '', dia: '' },

  ITEM_H:   44,
  VISIBLE:  5,
  MONTHS:   ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
  MONTH_FULL: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  STEP_LABELS: ['Selecione o ano', 'Selecione o mês', 'Selecione o dia'],

  _scrollTimer: null,
  _docBound:    false,

  // ─── públicos ─────────────────────────────────────────────────────────────

  init() {
    const trigger = document.getElementById('historico-trigger');
    if (!trigger) return;
    trigger.onclick = () => this.open();

    const modal = document.getElementById('historico-date-modal');
    if (!modal) return;

    modal.querySelectorAll('[data-close-historico-modal]').forEach((el) => {
      el.onclick = () => this.close();
    });

    const advBtn = document.getElementById('drum-advance-btn');
    if (advBtn) advBtn.onclick = () => this._advanceOrConfirm();

    if (!this._docBound) {
      this._docBound = true;
      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        const m = document.getElementById('historico-date-modal');
        if (m && !m.hidden) this.close();
      });
    }
  },

  getValues() {
    return {
      ano: Utils.parseNumber(document.getElementById('historico-ano')?.value || ''),
      mes: Utils.parseNumber(document.getElementById('historico-mes')?.value || ''),
      dia: Utils.parseNumber(document.getElementById('historico-dia')?.value || '')
    };
  },

  getYears() {
    const v = this.getValues();
    return Utils.yearsSinceDate(v.ano, v.mes, v.dia);
  },

  open() {
    const stored = {
      ano: document.getElementById('historico-ano')?.value || '',
      mes: document.getElementById('historico-mes')?.value || '',
      dia: document.getElementById('historico-dia')?.value || ''
    };
    this.draft = { ...stored };
    this.step  = 0;

    clearTimeout(this._scrollTimer);

    const modal = document.getElementById('historico-date-modal');
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    this._renderDrum(false);
  },

  close() {
    clearTimeout(this._scrollTimer);

    const modal = document.getElementById('historico-date-modal');
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');

    const hasOther = document.getElementById('checklist-modal')
      && !document.getElementById('checklist-modal').hidden;
    if (!hasOther) document.body.classList.remove('modal-open');

    document.getElementById('historico-trigger')?.focus();
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
  },

  // ─── renderização ────────────────────────────────────────────────────────

  _renderDrum(animate = true) {
    const label     = document.getElementById('drum-step-label');
    const crumb     = document.getElementById('drum-breadcrumb');
    const stage     = document.getElementById('drum-stage');
    if (!stage) return;

    if (label) label.textContent = this.STEP_LABELS[this.step];
    if (crumb) crumb.textContent = this._crumbText();

    const items   = this._stepItems();
    const current = [this.draft.ano, this.draft.mes, this.draft.dia][this.step];
    const padding = this.ITEM_H * Math.floor(this.VISIBLE / 2);

    const itemsHtml = items.map((item) => {
      const val = typeof item === 'object' ? item.value : item;
      const txt = typeof item === 'object' ? item.label : String(item);
      return `<div class="drum-item" data-value="${val}">${txt}</div>`;
    }).join('');

    const drum = document.createElement('div');
    drum.className = 'drum-picker' + (animate ? ' drum-enter' : '');
    drum.innerHTML = `
      <div class="drum-picker__fade drum-picker__fade--top" aria-hidden="true"></div>
      <div class="drum-picker__track" id="drum-track" tabindex="-1">
        <div style="height:${padding}px" aria-hidden="true"></div>
        ${itemsHtml}
        <div style="height:${padding}px" aria-hidden="true"></div>
      </div>
      <div class="drum-picker__band" aria-hidden="true"></div>
      <div class="drum-picker__fade drum-picker__fade--bottom" aria-hidden="true"></div>`;

    stage.innerHTML = '';
    stage.appendChild(drum);

    const track = drum.querySelector('.drum-picker__track');

    // Scroll imediato para o valor atual
    const idx = items.findIndex((item) => {
      const v = typeof item === 'object' ? String(item.value) : String(item);
      return v === String(current);
    });
    const startIdx = idx >= 0 ? idx : 0;

    track.style.scrollBehavior = 'auto';
    track.scrollTop = startIdx * this.ITEM_H;

    requestAnimationFrame(() => {
      track.style.scrollBehavior = '';
      this._highlightItems(track, items, startIdx);
      this._bindScroll(track, items);
      this._bindClicks(track, items);
      if (animate) {
        requestAnimationFrame(() => drum.classList.remove('drum-enter'));
      }
    });
  },

  _itemValue(item) {
    return typeof item === 'object' ? String(item.value) : String(item);
  },

  _setDraftValue(value) {
    if (this.step === 0) this.draft.ano = value;
    else if (this.step === 1) this.draft.mes = value;
    else this.draft.dia = value;
  },

  _selectAtIndex(track, items, idx, smooth = true) {
    const safeIdx = Math.max(0, Math.min(idx, items.length - 1));
    const value   = this._itemValue(items[safeIdx]);

    track.scrollTo({ top: safeIdx * this.ITEM_H, behavior: smooth ? 'smooth' : 'auto' });
    this._highlightItems(track, items, safeIdx);
    this._setDraftValue(value);

    return { safeIdx, value };
  },

  _stepItems() {
    if (this.step === 0) {
      const max = new Date().getFullYear();
      const items = [];
      for (let y = max; y >= 1985; y--) items.push(y);
      return items;
    }
    if (this.step === 1) {
      return this.MONTHS.map((name, i) => ({ value: i + 1, label: name }));
    }
    const ano  = Number(this.draft.ano)  || new Date().getFullYear();
    const mes  = Number(this.draft.mes)  || 1;
    const maxD = Utils.daysInMonth(ano, mes);
    return Array.from({ length: maxD }, (_, i) => i + 1);
  },

  _crumbText() {
    const parts = [];
    if (this.step >= 1 && this.draft.ano) parts.push(this.draft.ano);
    if (this.step >= 2 && this.draft.mes) {
      parts.push(this.MONTH_FULL[Number(this.draft.mes) - 1] || this.draft.mes);
    }
    return parts.join(' / ');
  },

  // ─── scroll e seleção ───────────────────────────────────────────────────

  _bindScroll(track, items) {
    track.addEventListener('scroll', () => {
      clearTimeout(this._scrollTimer);

      // Atualiza visual dos itens em tempo real
      const rawIdx = track.scrollTop / this.ITEM_H;
      this._highlightItems(track, items, rawIdx);

      this._scrollTimer = setTimeout(() => {
        const idx     = Math.round(track.scrollTop / this.ITEM_H);
        // Snap suave e armazena no draft — avanço/confirma só pelo botão →
        this._selectAtIndex(track, items, idx, true);
      }, 280);
    }, { passive: true });
  },

  _bindClicks(track, items) {
    track.querySelectorAll('.drum-item').forEach((el, idx) => {
      el.onclick = () => {
        clearTimeout(this._scrollTimer);
        this._selectAtIndex(track, items, idx, true);
      };
    });
  },

  // Lê o valor atual no drum e avança/confirma dependendo da etapa
  _advanceOrConfirm() {
    const track = document.getElementById('drum-track');
    if (!track) return;

    const items = this._stepItems();
    const idx   = Math.round(track.scrollTop / this.ITEM_H);
    const { value } = this._selectAtIndex(track, items, idx, true);

    clearTimeout(this._scrollTimer);

    if (this.step === 0) {
      this.draft.ano = value;
      setTimeout(() => this._advance(), 180);
    } else if (this.step === 1) {
      this.draft.mes = value;
      setTimeout(() => this._advance(), 180);
    } else {
      this.draft.dia = value;
      setTimeout(() => this.confirm(), 180);
    }
  },

  _highlightItems(track, items, centerIndex) {
    track.querySelectorAll('.drum-item').forEach((el, i) => {
      const dist    = Math.abs(i - centerIndex);
      const opacity = Math.max(0.22, 1 - dist * 0.28);
      const scale   = Math.max(0.82, 1 - dist * 0.055);
      const weight  = dist < 0.5 ? 700 : dist < 1.5 ? 500 : 400;
      el.style.opacity   = opacity;
      el.style.transform = `scale(${scale})`;
      el.style.fontWeight = weight;
    });
  },

  // ─── avanço entre etapas ────────────────────────────────────────────────

  _advance() {
    const stage = document.getElementById('drum-stage');
    const drum  = stage?.querySelector('.drum-picker');
    if (!drum) return;

    drum.classList.add('drum-exit');
    setTimeout(() => {
      this.step += 1;
      if (this.step === 2) {
        const ano  = Number(this.draft.ano);
        const mes  = Number(this.draft.mes);
        const maxD = Utils.daysInMonth(ano, mes);
        if (Number(this.draft.dia) > maxD) this.draft.dia = '';
      }
      this._renderDrum(true);
    }, 260);
  },

  // ─── confirmação ─────────────────────────────────────────────────────────

  confirm() {
    const ano = Utils.parseNumber(this.draft.ano);
    const mes = Utils.parseNumber(this.draft.mes);
    const dia = Utils.parseNumber(this.draft.dia);

    if (!Utils.isValidDate(ano, mes, dia)) {
      this.close();
      return;
    }

    document.getElementById('historico-ano').value = ano;
    document.getElementById('historico-mes').value = mes;
    document.getElementById('historico-dia').value = dia;

    const years   = Utils.yearsSinceDate(ano, mes, dia);
    const display = document.getElementById('historico-display');
    const trigger = document.getElementById('historico-trigger');

    if (display) {
      display.textContent =
        `${Utils.formatDateBR(ano, mes, dia)} · ${years} ${years === 1 ? 'ano' : 'anos'}`;
    }
    trigger?.classList.remove('error');
    trigger?.classList.add('input--picker--filled');

    document.dispatchEvent(new CustomEvent('analyser:form-changed'));
    this.close();
  }
};
