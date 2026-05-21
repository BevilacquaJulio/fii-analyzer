/**
 * Testes de lógica — executar na raiz do projeto:
 *   node frontend/test/logic.test.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const sandbox = { console };
vm.createContext(sandbox);
const bundle = ['utils.js', 'analyser.js', 'simulator.js']
  .map((file) => fs.readFileSync(path.join(root, 'js', file), 'utf8'))
  .join('\n') + '\n;this.Utils=Utils;this.Analyser=Analyser;this.Simulator=Simulator;';
vm.runInContext(bundle, sandbox);
const { Utils, Analyser, Simulator } = sandbox;

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${msg}`);
  } else {
    failed++;
    console.error(`  ✕ ${msg}`);
  }
}

console.log('\n=== Utils — escala milhões/bilhões ===');
assert(Utils.parseScaledValue(1.2, 'bilhoes') === 1_200_000_000, '1,2 bilhões');
assert(Utils.parseScaledValue(2.5, 'milhoes') === 2_500_000, '2,5 milhões');

console.log('\n=== Utils — data de constituição ===');
assert(Utils.isValidDate(2018, 3, 15), 'data válida');
assert(!Utils.isValidDate(2030, 1, 1), 'data futura inválida');
assert(Utils.yearsSinceDate(2018, 3, 15) >= 6, 'anos desde 15/03/2018');
assert(Utils.formatDateBR(2018, 3, 15) === '15/03/2018', 'formato BR');

console.log('\n=== Analyser — FII Papel (dados do prompt) ===');
Analyser.currentType = 'papel';
Analyser.qualitative = { dividendos: 'estavel', cotistas: 'sim' };
const papelData = {
  ticker: 'HGLG11',
  patrimonioLiquido: 1_200_000_000,
  liquidez: 2_500_000,
  pvp: 0.95,
  dy: 11.5,
  valorCota: 105.5,
  historico: 6,
  imoveis: 12,
  plMax: 5,
  vacancia: 3,
  dividendos: 'estavel',
  cotistas: 'sim',
  type: 'papel'
};
const papelResult = Analyser.analyze(papelData);
assert(papelResult.status === 'approved', `Papel aprovado (status=${papelResult.status})`);
assert(papelResult.passedCount === papelResult.totalCount, `Placar completo: ${papelResult.passedCount}/${papelResult.totalCount}`);

console.log('\n=== Analyser — FII Tijolo reprovado (vacância > 10%) ===');
const tijoloFail = { ...papelData, type: 'tijolo', dy: 10, vacancia: 12, imoveis: 10 };
const tijoloFailResult = Analyser.analyze(tijoloFail);
assert(tijoloFailResult.status === 'rejected', `Tijolo reprovado por vacância (status=${tijoloFailResult.status})`);

console.log('\n=== Analyser — ATENÇÃO (P/VP borderline) ===');
const borderline = { ...papelData, pvp: 0.86 };
const warnResult = Analyser.analyze(borderline);
assert(warnResult.status === 'warning', `ATENÇÃO por P/VP borderline (status=${warnResult.status})`);

console.log('\n=== Simulator — 12 meses (dados de referência) ===');
const simData = {
  cotasIniciais: 1144,
  valorCota: 100,
  dividendoCota: 0.10,
  novasCotas: 12,
  valorGastoCota: 112.80,
  numMeses: 12,
  caixaInicial: 0
};
const rows = Simulator.calculate(simData);
const last = rows[rows.length - 1];
assert(rows.length === 12, '12 linhas geradas');
assert(Math.abs(last.cotasInicio - 1276) < 0.001, `Mês 12 cotas início = 1276 (got ${last.cotasInicio})`);
assert(Math.abs(last.cotasFinal - 1288) < 0.001, `Mês 12 cotas final = 1288 (got ${last.cotasFinal})`);
assert(Math.abs(last.dividendo - 127.6) < 0.01, `Mês 12 dividendo = R$ 127,60 (got ${last.dividendo})`);
assert(Math.abs(last.valorTotalReal - 128800) < 0.01, `Valor Total Real = R$ 128.800 (got ${last.valorTotalReal})`);

const summary = Simulator.computeSummary(simData, rows);
assert(summary.totalInvestido === 12 * 12 * 112.80, `Total investido = ${summary.totalInvestido}`);

console.log(`\n=== Resultado: ${passed} passou, ${failed} falhou ===\n`);
process.exit(failed > 0 ? 1 : 0);
