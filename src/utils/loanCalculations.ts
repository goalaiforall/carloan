import type { CalculatorInputs, DealerOfferInputs, DealerOfferMatch, LoanResults, PaymentFrequency, ScenarioInput, ScenarioResult } from '../types';

const paymentsPerYear: Record<PaymentFrequency, number> = {
  weekly: 52,
  biweekly: 26,
  monthly: 12,
};

export function clampMoney(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

export function calculatePayment(principal: number, annualRatePercent: number, termMonths: number, frequency: PaymentFrequency) {
  const safePrincipal = clampMoney(principal);
  const safeTerm = Math.max(1, Number.isFinite(termMonths) ? termMonths : 1);
  const periodsPerYear = paymentsPerYear[frequency];
  const numberOfPayments = Math.ceil((safeTerm / 12) * periodsPerYear);
  const annualRate = Math.max(0, annualRatePercent) / 100;
  const ratePerPeriod = annualRate / periodsPerYear;

  const payment = ratePerPeriod === 0
    ? safePrincipal / numberOfPayments
    : safePrincipal * ratePerPeriod / (1 - Math.pow(1 + ratePerPeriod, -numberOfPayments));

  const totalPaid = payment * numberOfPayments;

  return {
    payment,
    numberOfPayments,
    totalPaid,
    totalInterest: Math.max(0, totalPaid - safePrincipal),
  };
}


export function calculatePrincipalFromPayment(payment: number, annualRatePercent: number, termMonths: number, frequency: PaymentFrequency) {
  const safePayment = clampMoney(payment);
  const safeTerm = Math.max(1, Number.isFinite(termMonths) ? termMonths : 1);
  const periodsPerYear = paymentsPerYear[frequency];
  const numberOfPayments = Math.ceil((safeTerm / 12) * periodsPerYear);
  const annualRate = Math.max(0, annualRatePercent) / 100;
  const ratePerPeriod = annualRate / periodsPerYear;

  if (ratePerPeriod === 0) {
    return safePayment * numberOfPayments;
  }

  return safePayment * (1 - Math.pow(1 + ratePerPeriod, -numberOfPayments)) / ratePerPeriod;
}

export function compareDealerOffer(offer: DealerOfferInputs, calculatedAmountFinanced: number): DealerOfferMatch {
  const impliedAmountFinanced = calculatePrincipalFromPayment(offer.offeredPayment, offer.annualRate, offer.termMonths, offer.frequency);
  const differenceFromCalculated = impliedAmountFinanced - clampMoney(calculatedAmountFinanced);
  const absoluteDifference = Math.abs(differenceFromCalculated);
  const percentageDifference = calculatedAmountFinanced > 0 ? absoluteDifference / calculatedAmountFinanced * 100 : 0;

  return {
    impliedAmountFinanced,
    differenceFromCalculated,
    absoluteDifference,
    percentageDifference,
    matches: absoluteDifference <= Math.max(250, calculatedAmountFinanced * 0.005),
  };
}

export function calculateLoan(inputs: CalculatorInputs): LoanResults {
  const taxAmount = clampMoney(inputs.vehiclePrice) * Math.max(0, inputs.taxRate) / 100;
  const equity = clampMoney(inputs.tradeInValue) - clampMoney(inputs.currentLoanBalance);
  const negativeEquity = equity < 0 ? Math.abs(equity) : 0;
  const positiveEquity = equity > 0 ? equity : 0;
  const dealerAddedCharges = clampMoney(inputs.fees) + clampMoney(inputs.extras);
  const amountBeforeTradeAndDownPayment = clampMoney(inputs.vehiclePrice) + taxAmount + dealerAddedCharges;
  const baseCost = amountBeforeTradeAndDownPayment - clampMoney(inputs.downPayment);
  const amountFinanced = Math.max(0, baseCost + negativeEquity - positiveEquity);
  const amountAboveVehiclePriceBeforeInterest = Math.max(0, amountFinanced - clampMoney(inputs.vehiclePrice));
  const paymentDetails = calculatePayment(amountFinanced, inputs.annualRate, inputs.termMonths, inputs.frequency);

  return {
    taxAmount,
    baseCost,
    dealerAddedCharges,
    amountBeforeTradeAndDownPayment,
    amountAboveVehiclePriceBeforeInterest,
    equity,
    negativeEquity,
    positiveEquity,
    amountFinanced,
    realCostVsAdvertised: Math.max(0, paymentDetails.totalPaid - clampMoney(inputs.vehiclePrice)),
    ...paymentDetails,
  };
}

export function compareScenarios(scenarios: ScenarioInput[]): ScenarioResult[] {
  const calculated = scenarios.map((scenario) => {
    const details = calculatePayment(scenario.principal, scenario.annualRate, scenario.termMonths, scenario.frequency);
    return { ...scenario, ...details };
  });
  const cheapest = Math.min(...calculated.map((scenario) => scenario.totalPaid));
  return calculated.map((scenario) => ({
    ...scenario,
    differenceFromCheapest: scenario.totalPaid - cheapest,
    isCheapest: Math.abs(scenario.totalPaid - cheapest) < 0.01,
  }));
}

export function formatCad(value: number, locale = 'en-CA'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(Number.isFinite(value) ? value : 0);
}
