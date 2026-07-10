export type Language = 'es' | 'en';
export type PaymentFrequency = 'weekly' | 'biweekly' | 'monthly';

export interface CalculatorInputs {
  vehiclePrice: number;
  taxRate: number;
  fees: number;
  extras: number;
  downPayment: number;
  tradeInValue: number;
  currentLoanBalance: number;
  currentInterestRate?: number;
  currentPayment?: number;
  remainingTerm?: number;
  annualRate: number;
  termMonths: number;
  frequency: PaymentFrequency;
}

export interface LoanResults {
  taxAmount: number;
  baseCost: number;
  dealerAddedCharges: number;
  amountBeforeTradeAndDownPayment: number;
  amountAboveVehiclePriceBeforeInterest: number;
  equity: number;
  negativeEquity: number;
  positiveEquity: number;
  amountFinanced: number;
  payment: number;
  numberOfPayments: number;
  totalPaid: number;
  totalInterest: number;
  realCostVsAdvertised: number;
}

export interface DealerOfferInputs {
  offeredPayment: number;
  annualRate: number;
  termMonths: number;
  frequency: PaymentFrequency;
}

export interface DealerOfferMatch {
  impliedAmountFinanced: number;
  differenceFromCalculated: number;
  absoluteDifference: number;
  percentageDifference: number;
  matches: boolean;
}

export interface ScenarioInput {
  id: string;
  name: string;
  principal: number;
  annualRate: number;
  termMonths: number;
  frequency: PaymentFrequency;
}

export interface ScenarioResult extends ScenarioInput {
  payment: number;
  numberOfPayments: number;
  totalInterest: number;
  totalPaid: number;
  differenceFromCheapest: number;
  isCheapest: boolean;
}
