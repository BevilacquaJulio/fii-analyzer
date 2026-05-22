const HistoricoPage = {
  analyses: [],
  filter: 'all',
  _escapeBound: false,

  TYPE_LABELS: {
    papel: 'FII de Papel',
    tijolo: 'FII de Tijolo'
  },

  STATUS_CONFIG: {
    approved: { label: 'APROVADO', badge: 'badge-approved', card: 'hist-card--approved', icon: () => Icons.checkCircle('icon--sm') },
    rejected: { label: 'REPROVADO', badge: 'badge-rejected', card: 'hist-card--rejected', icon: () => Icons.xCircle('icon--sm') },
    warning:  { label: 'ATENÇÃO',   badge: 'badge-warning',  card: 'hist-card--warning',  icon: () => Icons.alertCircle('icon--sm') }
  },

  init() {
    if (!document.getElementById('hist-list')) return;

    this.ensureDetailModal();
    this.bindFilters();
    this.bindRefresh();
    this.bindDetailModal();
    this.load();
  },

  ensureDetailModal() {
    if (document.getElementById('hist-detail-modal')) return;

    const tpl = document.createElement('template');
    tpl.innerHTML = `
      <div class="hist-detail-modal" id="hist-detail-modal" hidden aria-hidden="true" data-page-overlay="historico">
        <div class="hist-detail-modal__backdrop" data-close-hist-modal></div>
        <div class="hist-detail-modal__panel" role="dialog" aria-labelledby="hist-detail-title" aria-modal="true">
          <button type="button" class="hist-detail-modal__close" aria-label="Fechar" data-close-hist-modal>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <h2 class="hist-detail-modal__title" id="hist-detail-title">Detalhes da análise</h2>
          <div class="hist-detail-modal__body" id="hist-detail-body"></div>
        </div>
      </div>`;
    document.body.appendChild(tpl.content.firstElementChild);
  },

  bindFilters() {
    document.querySelectorAll('.hist-filter').forEach((btn) => {
      btn.onclick = () => {
        this.filter = btn.dataset.filter;
        document.querySelectorAll('.hist-filter').forEach((b) => {
          const active = b.dataset.filter === this.filter;
          b.classList.toggle('hist-filter--active', active);
          b.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        this.renderList();
      };
    });
  },

  bindRefresh() {
    const btn = document.getElementById('hist-refresh');
    if (!btn || btn.dataset.bound === 'true') return;
    btn.dataset.bound = 'true';
    btn.onclick = () => this.refresh();
  },

  _delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  async refresh() {
    const btn = document.getElementById('hist-refresh');
    if (!btn || btn.disabled) return;

    btn.disabled = true;
    btn.classList.add('hist-refresh--loading');
    btn.setAttribute('aria-busy', 'true');

    await this._delay(2000);

    try {
      const data = await Api.listarAnalises();
      this.analyses = data.analises || [];
      this.renderStats();
      this.renderList();
    } catch (err) {
      this.showState('error', err.message);
    } finally {
      btn.disabled = false;
      btn.classList.remove('hist-refresh--loading');
      btn.removeAttribute('aria-busy');
    }
  },

  bindDetailModal() {
    const modal = document.getElementById('hist-detail-modal');
    if (modal) {
      modal.querySelectorAll('[data-close-hist-modal]').forEach((el) => {
        el.onclick = () => this.closeDetailModal();
      });
    }

    const list = document.getElementById('hist-list');
    if (list) {
      list.onclick = (e) => {
        const cta  = e.target.closest('.hist-card__cta');
        const card = e.target.closest('.hist-card');
        if (!card) return;
        if (cta) e.stopPropagation();
        this._openFromCard(card);
      };

      list.onkeydown = (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const card = e.target.closest('.hist-card');
        if (!card) return;
        e.preventDefault();
        this._openFromCard(card);
      };
    }

    if (!this._escapeBound) {
      this._escapeBound = true;
      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        const m = document.getElementById('hist-detail-modal');
        if (m && !m.hidden) this.closeDetailModal();
      });
    }
  },

  _openFromCard(card) {
    const id = Number(card.dataset.id);
    if (!Number.isFinite(id) || id <= 0) return;
    this.openDetailModal(id);
  },

  async load() {
    this.showState('loading');
    try {
      const data = await Api.listarAnalises();
      this.analyses = data.analises || [];
      const loading = document.getElementById('hist-loading');
      const error   = document.getElementById('hist-error');
      if (loading) loading.hidden = true;
      if (error)   error.hidden   = true;
      this.renderStats();
      this.renderList();
    } catch (err) {
      this.showState('error', err.message);
    }
  },

  showState(state, message = '') {
    const loading = document.getElementById('hist-loading');
    const empty   = document.getElementById('hist-empty');
    const error   = document.getElementById('hist-error');
    const content = document.getElementById('hist-content');
    const stats   = document.getElementById('hist-stats');

    loading.hidden = state !== 'loading';
    empty.hidden   = true;
    error.hidden   = state !== 'error';
    content.hidden = state === 'loading' || state === 'error';
    if (stats) stats.hidden = state === 'loading' || state === 'error';

    if (state === 'error') {
      const msgEl = document.getElementById('hist-error-msg');
      if (msgEl) msgEl.textContent = message;
    }
  },

  getFiltered() {
    if (this.filter === 'all') return this.analyses;
    return this.analyses.filter((a) => a.status === this.filter);
  },

  renderStats() {
    const stats = document.getElementById('hist-stats');
    if (!stats) return;
    const counts = {
      total:    this.analyses.length,
      approved: this.analyses.filter((a) => a.status === 'approved').length,
      rejected: this.analyses.filter((a) => a.status === 'rejected').length,
      warning:  this.analyses.filter((a) => a.status === 'warning').length
    };
    stats.hidden = false;
    stats.querySelector('[data-stat="total"]').textContent    = counts.total;
    stats.querySelector('[data-stat="approved"]').textContent = counts.approved;
    stats.querySelector('[data-stat="rejected"]').textContent = counts.rejected;
    stats.querySelector('[data-stat="warning"]').textContent  = counts.warning;
  },

  renderList() {
    const list    = document.getElementById('hist-list');
    const empty   = document.getElementById('hist-empty');
    const content = document.getElementById('hist-content');
    if (!list) return;

    const filtered = this.getFiltered();

    if (this.analyses.length === 0) {
      content.hidden = true;
      empty.hidden   = false;
      list.innerHTML = '';
      return;
    }

    content.hidden = false;
    empty.hidden   = true;

    if (filtered.length === 0) {
      list.innerHTML = `<div class="hist-no-match"><p>Nenhuma análise com este filtro.</p></div>`;
      return;
    }

    list.innerHTML = filtered.map((item, i) => this.renderCard(item, i)).join('');
  },

  renderCard(item, index) {
    const cfg = this.STATUS_CONFIG[item.status] || this.STATUS_CONFIG.rejected;
    const pct = item.total > 0 ? Math.round((item.aprovados / item.total) * 100) : 0;

    return `
      <article class="hist-card ${cfg.card}" data-id="${item.id}"
        style="--hist-delay:${index * 60}ms"
        tabindex="0" aria-label="Análise ${item.ticker}">
        <div class="hist-card__glow" aria-hidden="true"></div>
        <div class="hist-card__top">
          <span class="hist-card__ticker">${item.ticker}</span>
          <span class="badge ${cfg.badge}">${cfg.icon()} ${cfg.label}</span>
        </div>
        <div class="hist-card__meta">
          <span class="hist-card__type">${this.TYPE_LABELS[item.tipo] || item.tipo}</span>
          <time class="hist-card__date" datetime="${item.criado_em}">${Utils.formatDateTime(item.criado_em)}</time>
        </div>
        <div class="hist-card__score">
          <div class="hist-card__score-bar" role="progressbar"
            aria-valuenow="${item.aprovados}" aria-valuemin="0" aria-valuemax="${item.total}">
            <div class="hist-card__score-fill" style="width:${pct}%"></div>
          </div>
          <span class="hist-card__score-text">${item.aprovados}<span class="hist-card__score-sep">/</span>${item.total} critérios</span>
        </div>
        <button type="button" class="hist-card__cta" aria-label="Ver detalhes de ${item.ticker}">
          Ver detalhes
          <svg class="hist-card__cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </article>`;
  },

  async openDetailModal(id) {
    this.ensureDetailModal();

    const modal = document.getElementById('hist-detail-modal');
    const body  = document.getElementById('hist-detail-body');
    if (!modal || !body) return;

    clearTimeout(this._detailLeaveTimer);
    modal.classList.remove('is-leaving');
    modal.dataset.status = '';
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    void modal.offsetWidth;
    modal.classList.add('is-visible');
    document.body.classList.add('modal-open');

    body.innerHTML = `
      <div class="hist-detail-loading">
        <span class="hist-detail-spinner" aria-hidden="true"></span>
        <p>Carregando...</p>
      </div>`;

    try {
      const data = await Api.buscarAnalise(id);
      modal.dataset.status = data.analise.status || '';
      body.style.opacity = '0';
      body.innerHTML = this.renderDetailHtml(data.analise);
      requestAnimationFrame(() => {
        body.style.transition = 'opacity 0.28s ease';
        body.style.opacity    = '1';
        setTimeout(() => { body.style.transition = ''; body.style.opacity = ''; }, 320);
      });
    } catch (err) {
      body.innerHTML = `<p class="hist-detail-error">${err.message}</p>`;
    }
  },

  closeDetailModal() {
    const modal = document.getElementById('hist-detail-modal');
    if (!modal || modal.hidden) return;
    modal.classList.add('is-leaving');
    modal.classList.remove('is-visible');
    clearTimeout(this._detailLeaveTimer);
    this._detailLeaveTimer = setTimeout(() => {
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
      modal.classList.remove('is-leaving');
      modal.dataset.status = '';
      document.body.classList.remove('modal-open');
    }, 380);
  },

  renderDetailHtml(analise) {
    const cfg         = this.STATUS_CONFIG[analise.status] || this.STATUS_CONFIG.rejected;
    const resultado   = analise.resultado || {};
    const typeResults = resultado.typeResults   || [];
    const genResults  = resultado.generalResults || [];

    const renderCriterion = (c, i) => {
      let cls  = 'info';
      let icon = Icons.info('icon--sm');
      if (c.blocking) {
        if (!c.passed)      { cls = 'fail'; icon = Icons.x('icon--sm'); }
        else if (c.warning) { cls = 'warn'; icon = Icons.alert('icon--sm'); }
        else                { cls = 'pass'; icon = Icons.check('icon--sm'); }
      }
      return `
        <div class="criterion ${cls} hist-detail__criterion" style="--criterion-i:${i}">
          <span class="criterion-icon">${icon}</span>
          <span class="criterion-name">${c.name}</span>
          <span class="criterion-value">${c.displayValue ?? '—'}</span>
          <span class="criterion-limit">${c.limit ?? ''}</span>
        </div>`;
    };

    const pct = analise.total > 0 ? Math.round((analise.aprovados / analise.total) * 100) : 0;

    return `
      <header class="hist-detail__header">
        <div class="hist-detail__title-row">
          <h2 class="hist-detail__ticker">${analise.ticker}</h2>
          <span class="badge ${cfg.badge}">${cfg.icon()} ${cfg.label}</span>
        </div>
        <p class="hist-detail__meta">
          ${this.TYPE_LABELS[analise.tipo] || analise.tipo}
          &nbsp;·&nbsp; ${Utils.formatDateTime(analise.criado_em)}
        </p>
        <div class="hist-detail__score-row">
          <div class="hist-card__score-bar" role="progressbar"
            aria-valuenow="${analise.aprovados}" aria-valuemin="0" aria-valuemax="${analise.total}">
            <div class="hist-card__score-fill ${cfg.card.replace('hist-card--', 'hist-score-fill--')}"
              style="width:${pct}%"></div>
          </div>
          <span class="hist-detail__score-label">
            ${analise.aprovados} de ${analise.total} critérios aprovados
          </span>
        </div>
      </header>
      <section class="hist-detail__section">
        <h3 class="hist-detail__section-title">
          Critérios do tipo — ${this.TYPE_LABELS[analise.tipo] || analise.tipo}
        </h3>
        <div class="hist-detail__criteria">
          ${typeResults.map(renderCriterion).join('') ||
            '<p class="hist-detail__empty">Sem dados.</p>'}
        </div>
      </section>
      <section class="hist-detail__section">
        <h3 class="hist-detail__section-title">Checklist geral</h3>
        <div class="hist-detail__criteria">
          ${genResults.map(renderCriterion).join('') ||
            '<p class="hist-detail__empty">Sem dados.</p>'}
        </div>
      </section>`;
  }
};
