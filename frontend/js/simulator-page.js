const SimulatorPage = {
  init() {
    const form = document.getElementById('simulator-form');
    if (!form) return;

    const errorEl = document.getElementById('simulator-error');
    const btnClear = document.getElementById('btn-clear');
    const btnExport = document.getElementById('btn-export');

    form.onsubmit = (e) => {
      e.preventDefault();
      errorEl.hidden = true;
      document.querySelectorAll('#simulator-form .input').forEach((input) => {
        input.classList.remove('error');
      });

      const result = Simulator.simulate();
      if (result.error) {
        errorEl.textContent = result.error;
        errorEl.hidden = false;
      }
    };

    btnClear.onclick = () => Simulator.clear();
    btnExport.onclick = () => Simulator.exportCSV();
  }
};
