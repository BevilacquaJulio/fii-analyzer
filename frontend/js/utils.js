const Utils = {
  parseNumber(value) {
    if (value === null || value === undefined || value === '') return NaN;
    const num = Number(String(value).replace(',', '.'));
    return Number.isFinite(num) ? num : NaN;
  },

  parseScaledValue(value, scale) {
    const num = this.parseNumber(value);
    if (!Number.isFinite(num)) return NaN;
    if (scale === 'bilhoes') return num * 1_000_000_000;
    if (scale === 'milhoes') return num * 1_000_000;
    return num;
  },

  formatCurrency(value) {
    if (!Number.isFinite(value)) return '—';
    const formatted = value.toFixed(2).replace('.', ',');
    const parts = formatted.split(',');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `R$ ${parts.join(',')}`;
  },

  formatCotas(value) {
    if (!Number.isFinite(value)) return '—';
    return value.toFixed(3).replace('.', ',');
  },

  formatPercent(value) {
    if (!Number.isFinite(value)) return '—';
    return `${value.toFixed(1).replace('.', ',')}%`;
  },

  formatCompactCurrency(value) {
    if (!Number.isFinite(value)) return '—';
    if (value >= 1e9) return `R$ ${(value / 1e9).toFixed(1).replace('.', ',')}B`;
    if (value >= 1e6) return `R$ ${(value / 1e6).toFixed(0)}M`;
    return this.formatCurrency(value);
  },

  validateRequired(fields) {
    const missing = [];
    for (const { id, label, value, required = true } of fields) {
      if (!required) continue;
      if (value === null || value === undefined || value === '' || Number.isNaN(value)) {
        missing.push({ id, label });
      }
    }
    return missing;
  },

  isNearLimit(value, min, max, tolerancePercent = 0.05) {
    if (!Number.isFinite(value)) return false;
    if (Number.isFinite(min)) {
      const range = max !== undefined && Number.isFinite(max) ? max - min : Math.abs(min) || 1;
      if (value >= min && value <= min + range * tolerancePercent) return true;
    }
    if (Number.isFinite(max)) {
      const range = min !== undefined && Number.isFinite(min) ? max - min : Math.abs(max) || 1;
      if (value <= max && value >= max - range * tolerancePercent) return true;
    }
    return false;
  },

  isNearMin(value, min, tolerancePercent = 0.05) {
    if (!Number.isFinite(value) || !Number.isFinite(min)) return false;
    const range = Math.abs(min) || 1;
    return value >= min && value <= min + range * tolerancePercent;
  },

  isNearMax(value, max, tolerancePercent = 0.05) {
    if (!Number.isFinite(value) || !Number.isFinite(max)) return false;
    const range = Math.abs(max) || 1;
    return value <= max && value >= max - range * tolerancePercent;
  },

  daysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  },

  isValidDate(year, month, day) {
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return false;
    const y = Math.trunc(year);
    const m = Math.trunc(month);
    const d = Math.trunc(day);
    const date = new Date(y, m - 1, d);
    if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date <= today;
  },

  yearsSinceDate(year, month, day) {
    if (!this.isValidDate(year, month, day)) return NaN;
    const start = new Date(Math.trunc(year), Math.trunc(month) - 1, Math.trunc(day));
    const today = new Date();
    let years = today.getFullYear() - start.getFullYear();
    const monthDiff = today.getMonth() - start.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < start.getDate())) {
      years -= 1;
    }
    return years;
  },

  formatDateBR(year, month, day) {
    const d = String(Math.trunc(day)).padStart(2, '0');
    const m = String(Math.trunc(month)).padStart(2, '0');
    return `${d}/${m}/${Math.trunc(year)}`;
  },

  formatHistoricoValue(historico, historicoDate) {
    if (!Number.isFinite(historico)) return '—';
    if (historicoDate && this.isValidDate(historicoDate.ano, historicoDate.mes, historicoDate.dia)) {
      return `${historico} anos (${this.formatDateBR(historicoDate.ano, historicoDate.mes, historicoDate.dia)})`;
    }
    return `${historico} anos`;
  },

  formatDateTime(value) {
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} · ${hours}:${mins}`;
  }
};
