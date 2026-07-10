import { useMemo, useState } from 'react';
import { Field } from './components/Field';
import { ResultCard } from './components/ResultCard';
import type { CalculatorInputs, DealerOfferInputs, Language, PaymentFrequency, ScenarioInput } from './types';
import { calculateLoan, compareDealerOffer, compareScenarios, formatCad } from './utils/loanCalculations';

const copy = {
  es: {
    header: 'Costo Real de Financiamiento de Auto', hero: 'Antes de firmar tu próximo auto, conoce el costo real del préstamo', sub: 'No te fijes solo en el pago semanal, quincenal o mensual. Calcula cuánto vas a financiar realmente, cuánto pagarás en intereses y cuál será el costo total al final del préstamo.', cta: 'Calcular mi préstamo', lang: 'English', vehicle: 'Vehículo nuevo', trade: 'Trade-in y préstamo actual', finance: 'Nuevo financiamiento', compare: 'Compara varias opciones de financiamiento', clear: 'Limpiar cálculo', copy: 'Copiar resumen', copied: 'Resumen copiado', best: 'Mejor costo total', recommendation: 'La opción con menor costo total es:', lowest: 'El pago más bajo no necesariamente significa el préstamo más barato.', breakdown: 'Desglose para detectar cobros extra', advertised: 'Precio anunciado del vehículo', tax: 'Impuestos estimados', dealerFees: 'Fees / cargos administrativos del dealer', financedExtras: 'Garantías, seguros y extras financiados', beforeTrade: 'Subtotal antes de trade-in y enganche', downPayment: 'Menos down payment / enganche', positiveTrade: 'Menos positive equity aplicado', negativeTrade: 'Más negative equity agregado', financed: 'Monto real financiado', dealerAddOns: 'Total agregado por dealer/financiera', aboveVehicle: 'Monto financiado por encima del precio anunciado', dealerOffer: 'Verificar oferta del dealer', dealerOfferTip: 'Ingresa el pago, tasa, plazo y frecuencia que te dio el dealer para calcular qué monto financiado está implícito en esa oferta. Si no coincide con tu cálculo, pide el contrato desglosado.', offeredPayment: 'Pago ofrecido por el dealer', impliedFinanced: 'Monto financiado implícito en esa oferta', offerDifference: 'Diferencia contra tu cálculo', offerMatches: 'La oferta parece hacer match con tu cálculo.', offerMismatch: 'La oferta NO hace match: puede haber cargos no explicados, extras o un monto financiado diferente.', addCurrent: 'Agregar mi cálculo a comparativa', addDealerOffer: 'Agregar oferta del dealer', auditTip: 'Úsalo como lista de chequeo: pide que cada cargo aparezca separado en el contrato. Si un cargo no está explicado, pregunta si es opcional o negocia quitarlo.', disclaimer: 'Este calculador es una herramienta educativa. Los resultados son estimados y pueden variar según impuestos, cargos, seguros, condiciones del prestamista y términos finales del contrato. Antes de firmar, revisa el contrato completo y confirma el monto total financiado, APR, plazo, cargos e intereses totales.'
  },
  en: {
    header: 'Real Auto Loan Cost Calculator', hero: 'Before signing for your next car, know the real loan cost', sub: 'Do not focus only on the weekly, bi-weekly, or monthly payment. Calculate what you will truly finance, how much interest you will pay, and the total cost by the end of the loan.', cta: 'Calculate my loan', lang: 'Español', vehicle: 'New vehicle', trade: 'Trade-in and current loan', finance: 'New financing', compare: 'Compare financing options', clear: 'Clear calculation', copy: 'Copy summary', copied: 'Summary copied', best: 'Lowest total cost', recommendation: 'The option with the lowest total cost is:', lowest: 'The lowest payment does not necessarily mean the cheapest loan.', breakdown: 'Breakdown to detect extra charges', advertised: 'Advertised vehicle price', tax: 'Estimated taxes', dealerFees: 'Dealer/admin fees', financedExtras: 'Warranties, insurance, and financed extras', beforeTrade: 'Subtotal before trade-in and down payment', downPayment: 'Less down payment', positiveTrade: 'Less positive equity applied', negativeTrade: 'Plus negative equity added', financed: 'Real amount financed', dealerAddOns: 'Total added by dealer/lender', aboveVehicle: 'Amount financed above advertised price', dealerOffer: 'Verify dealer offer', dealerOfferTip: 'Enter the payment, rate, term, and frequency the dealer gave you to calculate the financed amount implied by that offer. If it does not match your calculation, ask for an itemized contract.', offeredPayment: 'Payment offered by dealer', impliedFinanced: 'Implied amount financed in that offer', offerDifference: 'Difference vs your calculation', offerMatches: 'The offer appears to match your calculation.', offerMismatch: 'The offer does NOT match: there may be unexplained charges, extras, or a different financed amount.', addCurrent: 'Add my calculation to comparison', addDealerOffer: 'Add dealer offer', auditTip: 'Use this as a contract checklist: ask for every charge to be itemized. If a charge is not explained, ask whether it is optional or negotiate removing it.', disclaimer: 'This calculator is an educational tool. Results are estimates and may vary based on taxes, fees, insurance, lender conditions, and final contract terms. Before signing, review the full contract and confirm the total amount financed, APR, term, fees, and total interest.'
  }
};

const initialInputs: CalculatorInputs = { vehiclePrice: 35000, taxRate: 13, fees: 799, extras: 0, downPayment: 3000, tradeInValue: 12000, currentLoanBalance: 16000, annualRate: 7.49, termMonths: 72, frequency: 'biweekly' };
const initialDealerOffer: DealerOfferInputs = { offeredPayment: 0, annualRate: 7.49, termMonths: 72, frequency: 'biweekly' };
const freqLabels: Record<PaymentFrequency, string> = { weekly: 'Semanal / Weekly', biweekly: 'Quincenal / Bi-weekly', monthly: 'Mensual / Monthly' };

export default function App() {
  const [language, setLanguage] = useState<Language>('es');
  const [inputs, setInputs] = useState<CalculatorInputs>(initialInputs);
  const [copied, setCopied] = useState(false);
  const [dealerOffer, setDealerOffer] = useState<DealerOfferInputs>(initialDealerOffer);
  const [scenarios, setScenarios] = useState<ScenarioInput[]>([
    { id: '1', name: 'Dealer 72 meses', principal: 36849, annualRate: 7.49, termMonths: 72, frequency: 'biweekly' },
    { id: '2', name: 'Banco 60 meses', principal: 36849, annualRate: 6.49, termMonths: 60, frequency: 'monthly' },
  ]);
  const t = copy[language];
  const locale = language === 'es' ? 'es-CA' : 'en-CA';
  const results = useMemo(() => calculateLoan(inputs), [inputs]);
  const dealerMatch = useMemo(() => compareDealerOffer(dealerOffer, results.amountFinanced), [dealerOffer, results.amountFinanced]);
  const compared = useMemo(() => compareScenarios(scenarios), [scenarios]);
  const cheapest = compared.find((scenario) => scenario.isCheapest);

  const setInput = (key: keyof CalculatorInputs, value: number | PaymentFrequency) => setInputs((current) => ({ ...current, [key]: value }));
  const updateScenario = (id: string, patch: Partial<ScenarioInput>) => setScenarios((current) => current.map((scenario) => scenario.id === id ? { ...scenario, ...patch } : scenario));
  const setOffer = (key: keyof DealerOfferInputs, value: number | PaymentFrequency) => setDealerOffer((current) => ({ ...current, [key]: value }));
  const addCurrentToComparison = () => setScenarios((current) => current.length >= 4 ? current : [...current, { id: crypto.randomUUID(), name: `Mi cálculo ${current.length + 1}`, principal: results.amountFinanced, annualRate: inputs.annualRate, termMonths: inputs.termMonths, frequency: inputs.frequency }]);
  const addDealerOfferToComparison = () => setScenarios((current) => current.length >= 4 ? current : [...current, { id: crypto.randomUUID(), name: `Oferta dealer ${current.length + 1}`, principal: dealerMatch.impliedAmountFinanced, annualRate: dealerOffer.annualRate, termMonths: dealerOffer.termMonths, frequency: dealerOffer.frequency }]);

  async function copySummary() {
    const summary = `Resumen de financiamiento:
Precio vehículo: ${formatCad(inputs.vehiclePrice, locale)}
Impuestos estimados: ${formatCad(results.taxAmount, locale)}
Fees / cargos administrativos: ${formatCad(inputs.fees, locale)}
Extras financiados: ${formatCad(inputs.extras, locale)}
Total agregado por dealer/financiera: ${formatCad(results.dealerAddedCharges, locale)}
Trade-in: ${formatCad(inputs.tradeInValue, locale)}
Saldo pendiente vehículo actual: ${formatCad(inputs.currentLoanBalance, locale)}
Negative equity agregado: ${formatCad(results.negativeEquity, locale)}
Positive equity aplicado: ${formatCad(results.positiveEquity, locale)}
Down payment / enganche: ${formatCad(inputs.downPayment, locale)}
Monto real financiado: ${formatCad(results.amountFinanced, locale)}
Monto financiado por encima del precio anunciado: ${formatCad(results.amountAboveVehiclePriceBeforeInterest, locale)}
Tasa: ${inputs.annualRate}%
Plazo: ${inputs.termMonths} meses
Pago estimado: ${formatCad(results.payment, locale)}
Intereses totales: ${formatCad(results.totalInterest, locale)}
Total pagado al final: ${formatCad(results.totalPaid, locale)}

Verificación oferta dealer:
Pago ofrecido: ${formatCad(dealerOffer.offeredPayment, locale)}
Tasa ofrecida: ${dealerOffer.annualRate}%
Plazo ofrecido: ${dealerOffer.termMonths} meses
Frecuencia ofrecida: ${freqLabels[dealerOffer.frequency]}
Monto financiado implícito: ${formatCad(dealerMatch.impliedAmountFinanced, locale)}
Diferencia contra mi cálculo: ${formatCad(dealerMatch.absoluteDifference, locale)}
Resultado: ${dealerMatch.matches ? t.offerMatches : t.offerMismatch}`;
    await navigator.clipboard.writeText(summary);
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  }

  return <div>
    <header><strong>{t.header}</strong><button onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}>{t.lang}</button></header>
    <section className="hero"><div><h1>{t.hero}</h1><p>{t.sub}</p><a href="#calculator">{t.cta}</a></div></section>
    <main id="calculator">
      <section className="panel"><h2>{t.vehicle}</h2><div className="grid"><Field label="Precio del vehículo antes de impuestos / Vehicle price before tax" value={inputs.vehiclePrice} onChange={(v) => setInput('vehiclePrice', v)} /><Field label="Impuestos estimados / Estimated tax" suffix="%" step={0.1} value={inputs.taxRate} onChange={(v) => setInput('taxRate', v)} /><Field label="Fees / cargos administrativos" value={inputs.fees} onChange={(v) => setInput('fees', v)} /><Field label="Garantías, seguros u otros extras" value={inputs.extras} onChange={(v) => setInput('extras', v)} /><Field label="Down payment / enganche" value={inputs.downPayment} onChange={(v) => setInput('downPayment', v)} /></div></section>
      <section className="panel"><h2>{t.trade}</h2><div className="grid"><Field label="Valor ofrecido por el trade-in" value={inputs.tradeInValue} onChange={(v) => setInput('tradeInValue', v)} /><Field label="Saldo pendiente del préstamo actual" value={inputs.currentLoanBalance} onChange={(v) => setInput('currentLoanBalance', v)} /><Field optional label="Tasa de interés actual" suffix="%" step={0.1} value={inputs.currentInterestRate ?? ''} onChange={(v) => setInput('currentInterestRate', v)} /><Field optional label="Pago actual" value={inputs.currentPayment ?? ''} onChange={(v) => setInput('currentPayment', v)} /><Field optional label="Plazo restante" suffix="meses" step={1} value={inputs.remainingTerm ?? ''} onChange={(v) => setInput('remainingTerm', v)} /></div></section>
      <section className="panel"><h2>{t.finance}</h2><div className="grid"><Field label="Tasa de interés anual" suffix="%" step={0.1} value={inputs.annualRate} onChange={(v) => setInput('annualRate', v)} /><Field label="Plazo" suffix="meses" step={1} value={inputs.termMonths} onChange={(v) => setInput('termMonths', v)} /><label className="field"><span>Frecuencia de pago</span><select value={inputs.frequency} onChange={(e: any) => setInput('frequency', e.target.value as PaymentFrequency)}>{Object.entries(freqLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div></section>
      <section className="results"><ResultCard label="Monto real del nuevo préstamo" value={formatCad(results.amountFinanced, locale)} /><ResultCard label="Pago estimado" value={formatCad(results.payment, locale)} note={freqLabels[inputs.frequency]} /><ResultCard label="Intereses totales" value={formatCad(results.totalInterest, locale)} tone={results.totalInterest > inputs.vehiclePrice * .2 ? 'bad' : 'neutral'} /><ResultCard label="Total pagado al final" value={formatCad(results.totalPaid, locale)} /><ResultCard label="Negative equity agregado" value={formatCad(results.negativeEquity, locale)} tone={results.negativeEquity ? 'bad' : 'good'} /><ResultCard label="Costo real vs precio anunciado" value={formatCad(results.realCostVsAdvertised, locale)} tone="bad" /></section>

      <section className="panel breakdown">
        <h2>{t.breakdown}</h2>
        <p className="auditTip">{t.auditTip}</p>
        <div className="breakdownList">
          <div><span>{t.advertised}</span><strong>{formatCad(inputs.vehiclePrice, locale)}</strong></div>
          <div><span>{t.tax}</span><strong>+ {formatCad(results.taxAmount, locale)}</strong></div>
          <div className={inputs.fees > 0 ? 'watch' : ''}><span>{t.dealerFees}</span><strong>+ {formatCad(inputs.fees, locale)}</strong></div>
          <div className={inputs.extras > 0 ? 'watch' : ''}><span>{t.financedExtras}</span><strong>+ {formatCad(inputs.extras, locale)}</strong></div>
          <div><span>{t.beforeTrade}</span><strong>{formatCad(results.amountBeforeTradeAndDownPayment, locale)}</strong></div>
          <div><span>{t.downPayment}</span><strong>- {formatCad(inputs.downPayment, locale)}</strong></div>
          <div className="goodRow"><span>{t.positiveTrade}</span><strong>- {formatCad(results.positiveEquity, locale)}</strong></div>
          <div className={results.negativeEquity > 0 ? 'watch' : ''}><span>{t.negativeTrade}</span><strong>+ {formatCad(results.negativeEquity, locale)}</strong></div>
          <div className="totalRow"><span>{t.financed}</span><strong>{formatCad(results.amountFinanced, locale)}</strong></div>
        </div>
        <div className="auditCards">
          <ResultCard label={t.dealerAddOns} value={formatCad(results.dealerAddedCharges, locale)} tone={results.dealerAddedCharges > 0 ? 'bad' : 'good'} />
          <ResultCard label={t.aboveVehicle} value={formatCad(results.amountAboveVehiclePriceBeforeInterest, locale)} tone={results.amountAboveVehiclePriceBeforeInterest > 0 ? 'bad' : 'good'} />
        </div>
      </section>
      <section className="warnings">{results.positiveEquity > 0 && <p className="goodText">Positive equity aplicado: {formatCad(results.positiveEquity, locale)}</p>}{results.negativeEquity > 0 && <p>Estás agregando deuda de tu vehículo anterior al nuevo préstamo. Esto aumenta el monto financiado y los intereses.</p>}{inputs.termMonths > 72 && <p>Un plazo largo puede reducir el pago periódico, pero normalmente aumenta mucho el costo total del préstamo.</p>}{inputs.annualRate > 8 && <p>Esta tasa puede generar un costo alto de financiamiento. Compara con otras opciones antes de firmar.</p>}{results.dealerAddedCharges > 0 && <p>Revisa cargos administrativos, garantías, seguros y extras. Pide el desglose por escrito para detectar cobros ocultos o productos opcionales.</p>}{inputs.extras > 0 && <p>Los extras financiados también generan intereses durante todo el plazo.</p>}{results.totalPaid > inputs.vehiclePrice * 1.2 && <p>El costo final es significativamente mayor que el precio anunciado del vehículo.</p>}</section>
      <div className="actions"><button onClick={() => setInputs(initialInputs)}>{t.clear}</button><button onClick={copySummary}>{copied ? t.copied : t.copy}</button></div>

      <section className="panel dealerCheck">
        <h2>{t.dealerOffer}</h2>
        <p className="auditTip">{t.dealerOfferTip}</p>
        <div className="grid">
          <Field label={t.offeredPayment} value={dealerOffer.offeredPayment} onChange={(v) => setOffer('offeredPayment', v)} />
          <Field label="Tasa anual ofrecida / Offered annual rate" suffix="%" step={0.1} value={dealerOffer.annualRate} onChange={(v) => setOffer('annualRate', v)} />
          <Field label="Plazo ofrecido / Offered term" suffix="meses" step={1} value={dealerOffer.termMonths} onChange={(v) => setOffer('termMonths', v)} />
          <label className="field"><span>Frecuencia ofrecida</span><select value={dealerOffer.frequency} onChange={(e: any) => setOffer('frequency', e.target.value as PaymentFrequency)}>{Object.entries(freqLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        </div>
        <div className="auditCards">
          <ResultCard label={t.impliedFinanced} value={formatCad(dealerMatch.impliedAmountFinanced, locale)} tone={dealerMatch.matches ? 'good' : 'bad'} />
          <ResultCard label={t.offerDifference} value={formatCad(dealerMatch.absoluteDifference, locale)} tone={dealerMatch.matches ? 'good' : 'bad'} note={`${dealerMatch.percentageDifference.toFixed(1)}%`} />
        </div>
        <p className={dealerMatch.matches ? 'matchNotice goodText' : 'matchNotice'}>{dealerMatch.matches ? t.offerMatches : t.offerMismatch}</p>
        <div className="actions"><button onClick={addCurrentToComparison} disabled={scenarios.length >= 4}>{t.addCurrent}</button><button onClick={addDealerOfferToComparison} disabled={scenarios.length >= 4 || dealerOffer.offeredPayment <= 0}>{t.addDealerOffer}</button></div>
      </section>
      <section className="panel"><h2>{t.compare}</h2><div className="scenarioGrid">{scenarios.map((s) => <article key={s.id} className="scenario"><input aria-label="Scenario name" value={s.name} onChange={(e: any) => updateScenario(s.id, { name: e.target.value })} /><Field label="Monto financiado" value={s.principal} onChange={(v) => updateScenario(s.id, { principal: v })} /><Field label="Tasa anual" suffix="%" step={0.1} value={s.annualRate} onChange={(v) => updateScenario(s.id, { annualRate: v })} /><Field label="Plazo" suffix="meses" step={1} value={s.termMonths} onChange={(v) => updateScenario(s.id, { termMonths: v })} /><select value={s.frequency} onChange={(e: any) => updateScenario(s.id, { frequency: e.target.value as PaymentFrequency })}>{Object.entries(freqLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></article>)}</div>{scenarios.length < 4 && <button onClick={() => setScenarios([...scenarios, { id: crypto.randomUUID(), name: `Opción ${scenarios.length + 1}`, principal: results.amountFinanced, annualRate: inputs.annualRate, termMonths: inputs.termMonths, frequency: inputs.frequency }])}>+ Add option</button>}<div className="tableWrap"><table><thead><tr><th>Escenario</th><th>Pago estimado</th><th>Total intereses</th><th>Total pagado</th><th>Diferencia</th><th></th></tr></thead><tbody>{compared.map((s) => <tr key={s.id}><td>{s.name}</td><td>{formatCad(s.payment, locale)}</td><td>{formatCad(s.totalInterest, locale)}</td><td>{formatCad(s.totalPaid, locale)}</td><td>{formatCad(s.differenceFromCheapest, locale)}</td><td>{s.isCheapest && <span className="badge">{t.best}</span>}</td></tr>)}</tbody></table></div><p className="recommendation">{t.recommendation} <strong>{cheapest?.name}</strong>. {t.lowest}</p></section>
    </main><footer>{t.disclaimer}</footer>
  </div>;
}
