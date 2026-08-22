declare const moneyBrand: unique symbol;

export type Money = Readonly<{
  minorUnits: number;
  currency: string;
  [moneyBrand]: true;
}>;

export function moneyIsValid(value: Pick<Money, "minorUnits" | "currency">): boolean {
  return Number.isSafeInteger(value.minorUnits) && value.minorUnits >= 0 && value.currency.trim().length > 0;
}

export function createMoney(minorUnits: number, currency: string): Money | null {
  const normalizedCurrency = currency.trim().toUpperCase();
  return moneyIsValid({ minorUnits, currency: normalizedCurrency } as Money)
    ? Object.freeze({ minorUnits, currency: normalizedCurrency }) as Money
    : null;
}

export function addMoney(left: Money | null, right: Money | null): Money | null {
  if (!left || !right || !moneyIsValid(left) || !moneyIsValid(right) || left.currency !== right.currency) {
    return null;
  }
  return createMoney(left.minorUnits + right.minorUnits, left.currency);
}

export function formatMoney(value: Money, locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: value.currency,
    currencyDisplay: "symbol",
  }).format(value.minorUnits / 100);
}
