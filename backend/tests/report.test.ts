import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ReportService } from '../src/services/report.service.js';

describe('Vérification des calculs financiers et de rentabilité (COGS, Bénéfices)', () => {
  test('Le rapport financier calcule correctement la synthèse et le bénéfice estimé', async () => {
    const report = await ReportService.getFinancialReport('year');
    
    assert.ok(report.summary);
    assert.ok(typeof report.summary.totalSales === 'number');
    assert.ok(typeof report.summary.totalCogs === 'number');
    assert.ok(typeof report.summary.estimatedGrossProfit === 'number');
    assert.ok(typeof report.summary.totalExpenses === 'number');
    assert.ok(typeof report.summary.estimatedNetProfit === 'number');

    // Vérification de la formule : Marge brute = Ventes - COGS
    const expectedGross = report.summary.totalSales - report.summary.totalCogs;
    assert.equal(report.summary.estimatedGrossProfit, expectedGross);

    // Vérification de la formule : Bénéfice net estimé = Ventes - COGS - Dépenses
    const expectedNet = expectedGross - report.summary.totalExpenses;
    assert.equal(report.summary.estimatedNetProfit, expectedNet);
  });

  test('L’export CSV contient bien l’en-tête et les sections financières', async () => {
    const csv = await ReportService.generateCsvReport('month');
    assert.match(csv, /RAPPORT COMMERCIAL ET FINANCIER - SOKHO VIANDES/);
    assert.match(csv, /Chiffre d'Affaires Brut/);
    assert.match(csv, /Coût des Marchandises Vendues \(COGS\)/);
    assert.match(csv, /Bénéfice Net Estimé/);
  });
});
