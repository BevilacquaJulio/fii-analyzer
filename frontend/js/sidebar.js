const SidebarNav = {
  pageUrls: {
    analise: 'index.html',
    simulador: 'simulador.html',
    historico: 'historico.html'
  },

  pages: {
    'index.html': 'analise',
    'simulador.html': 'simulador',
    'historico.html': 'historico'
  },

  pageOrder: {
    analise: 0,
    simulador: 1,
    historico: 2
  },

  cache: {},
  isNavigating: false,

  init() {
    this.nav = document.querySelector('.sidebar__nav');
    this.indicator = document.querySelector('.sidebar__indicator');
    this.content = document.querySelector('.app-content');
    this.currentPage = this.getCurrentPage();

    if (!this.nav) return;

    this.bindLinks();
    this.preloadPages();
    PageInit.init(this.currentPage);
    this.playEnterAnimation();

    window.addEventListener('popstate', (e) => {
      const page = e.state?.page || this.getCurrentPage();
      if (page !== this.currentPage) {
        this.navigate(page, { fromHistory: true });
      }
    });

    if (!history.state?.page) {
      history.replaceState({ page: this.currentPage }, '', this.pageUrls[this.currentPage]);
    }
  },

  getCurrentPage() {
    if (history.state?.page) return history.state.page;
    const path = window.location.pathname.split('/').pop() || 'index.html';
    return this.pages[path] || 'analise';
  },

  getLinkByPage(page) {
    return this.nav.querySelector(`[data-page="${page}"]`);
  },

  getTransitionDirection(fromPage, toPage) {
    const from = this.pageOrder[fromPage] ?? 0;
    const to = this.pageOrder[toPage] ?? 0;
    return to > from ? 'forward' : 'backward';
  },

  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  preloadPages() {
    Object.keys(this.pageUrls).forEach((page) => {
      if (page !== this.currentPage) this.fetchPage(page);
    });
  },

  fetchPage(page) {
    if (this.cache[page]) return Promise.resolve(this.cache[page]);
    return fetch(this.pageUrls[page])
      .then((r) => r.text())
      .then((html) => {
        this.cache[page] = html;
        return html;
      });
  },

  setActiveLink(page) {
    this.nav.querySelectorAll('.sidebar__link').forEach((link) => {
      const isActive = link.dataset.page === page;
      link.classList.toggle('sidebar__link--active', isActive);
      link.classList.toggle('sidebar__link--pending', false);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  },

  positionIndicator(link, instant = false) {
    if (!this.indicator || !link || !this.nav) return;

    const navRect = this.nav.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const isHorizontal = getComputedStyle(this.nav).flexDirection === 'row';

    this.indicator.style.height = `${linkRect.height}px`;

    if (isHorizontal) {
      const offsetX = linkRect.left - navRect.left;
      const offsetY = linkRect.top - navRect.top;
      this.indicator.style.width = `${linkRect.width}px`;
      this.indicator.style.right = 'auto';

      if (instant) {
        this.indicator.style.transition = 'none';
        this.indicator.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        this.indicator.offsetHeight;
        this.indicator.style.transition = '';
      } else {
        this.indicator.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      }
    } else {
      this.indicator.style.width = '';
      this.indicator.style.right = '0';
      const offsetY = linkRect.top - navRect.top;

      if (instant) {
        this.indicator.style.transition = 'none';
        this.indicator.style.transform = `translateY(${offsetY}px)`;
        this.indicator.offsetHeight;
        this.indicator.style.transition = '';
      } else {
        this.indicator.style.transform = `translateY(${offsetY}px)`;
      }
    }

    this.indicator.classList.add('sidebar__indicator--visible');
  },

  playEnterAnimation() {
    const activeLink = this.getLinkByPage(this.currentPage);
    this.positionIndicator(activeLink, true);
    if (this.content) {
      this.content.classList.add('page-enter-initial');
    }
  },

  bindLinks() {
    this.nav.querySelectorAll('.sidebar__link').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const toPage = link.dataset.page;
        if (toPage && toPage !== this.currentPage) {
          this.navigate(toPage);
        }
      });
    });

    const brand = document.querySelector('.sidebar__brand');
    if (brand) {
      brand.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.currentPage !== 'analise') {
          this.navigate('analise');
        }
      });
    }
  },

  async navigate(toPage, options = {}) {
    if (toPage === this.currentPage || this.isNavigating) return;

    this.isNavigating = true;
    const fromPage = this.currentPage;
    const targetLink = this.getLinkByPage(toPage);
    const direction = this.getTransitionDirection(fromPage, toPage);

    this.setActiveLink(toPage);
    this.positionIndicator(targetLink, false);
    targetLink?.classList.add('sidebar__link--pending');

    if (!options.fromHistory && this.content) {
      this.content.classList.remove(
        'page-enter-initial',
        'page-enter-from-right',
        'page-enter-from-left'
      );
      this.content.classList.add(
        direction === 'forward' ? 'page-exit-left' : 'page-exit-right'
      );
      await this.wait(280);
    }

    try {
      const html = await this.fetchPage(toPage);
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const newContent = doc.querySelector('.app-content');

      if (!newContent) throw new Error('Conteúdo não encontrado');

      this.content.innerHTML = newContent.innerHTML;
      document.title = doc.querySelector('title')?.textContent || document.title;

      if (!options.fromHistory) {
        this.content.classList.remove('page-exit-left', 'page-exit-right');
        void this.content.offsetWidth;
        this.content.classList.add(
          direction === 'forward' ? 'page-enter-from-right' : 'page-enter-from-left'
        );
      }

      if (!options.fromHistory) {
        history.pushState({ page: toPage }, '', this.pageUrls[toPage]);
      }

      this.currentPage = toPage;
      PageInit.init(toPage);

      requestAnimationFrame(() => {
        this.positionIndicator(this.getLinkByPage(toPage), false);
      });
    } catch {
      window.location.href = this.pageUrls[toPage];
    } finally {
      this.isNavigating = false;
      this.nav.querySelectorAll('.sidebar__link--pending').forEach((l) => {
        l.classList.remove('sidebar__link--pending');
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', () => SidebarNav.init());

window.addEventListener('resize', () => {
  const active = SidebarNav.nav?.querySelector('.sidebar__link--active');
  if (active) SidebarNav.positionIndicator(active, true);
});
