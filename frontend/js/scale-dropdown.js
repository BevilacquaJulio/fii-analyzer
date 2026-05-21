const ScaleDropdown = {
  init() {
    document.querySelectorAll('.scale-dropdown').forEach((root) => this.bind(root));
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.scale-dropdown')) {
        this.closeAll();
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeAll();
    });
  },

  bind(root) {
    const trigger = root.querySelector('.scale-dropdown__trigger');
    const menu = root.querySelector('.scale-dropdown__menu');
    const hidden = root.querySelector('.scale-dropdown__value');
    const options = root.querySelectorAll('.scale-dropdown__option');

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = root.classList.contains('is-open');
      this.closeAll();
      if (!isOpen) this.open(root);
    });

    options.forEach((option) => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        this.select(root, option.dataset.value);
        this.close(root);
      });
    });

    if (hidden?.value) {
      this.syncSelection(root, hidden.value);
    }
  },

  open(root) {
    root.classList.add('is-open');
    root.querySelector('.scale-dropdown__trigger')?.setAttribute('aria-expanded', 'true');
  },

  close(root) {
    root.classList.remove('is-open');
    root.querySelector('.scale-dropdown__trigger')?.setAttribute('aria-expanded', 'false');
  },

  closeAll() {
    document.querySelectorAll('.scale-dropdown.is-open').forEach((root) => this.close(root));
  },

  select(root, value) {
    const hidden = root.querySelector('.scale-dropdown__value');
    if (hidden) hidden.value = value;
    this.syncSelection(root, value);
  },

  syncSelection(root, value) {
    let labelText = '';
    root.querySelectorAll('.scale-dropdown__option').forEach((option) => {
      const selected = option.dataset.value === value;
      option.classList.toggle('is-selected', selected);
      option.setAttribute('aria-selected', selected ? 'true' : 'false');
      if (selected) labelText = option.textContent.trim();
    });
    const label = root.querySelector('.scale-dropdown__label');
    if (label && labelText) label.textContent = labelText;
    document.dispatchEvent(new CustomEvent('analyser:form-changed'));
  },

  getValue(id) {
    return document.getElementById(id)?.value || 'milhoes';
  }
};
