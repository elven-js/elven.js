import BigNumber from 'bignumber.js';

BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_FLOOR });

type AmountArgs = {
  amount: string;
  decimals: number;
  rounding?: number;
};

/**
 * Parses the amount from string
 * @param amount
 * @param decimals
 * @returns bigInt
 */
export const parseAmount = ({
  amount,
  decimals,
}: Omit<AmountArgs, 'rounding'>) => {
  if (decimals < 0)
    throw new Error("Decimal places shouldn't be negative number!");

  return BigInt(new BigNumber(amount).shiftedBy(decimals).toFixed());
};

/**
 * Formats the amount from string (bigInt)
 * @param amount
 * @param decimals
 * @param rounding
 * @returns string
 */
export const formatAmount = ({
  amount,
  decimals,
  rounding = decimals,
}: AmountArgs) => {
  if (decimals < 0)
    throw new Error("Decimal places shouldn't be negative number!");

  return new BigNumber(amount)
    .shiftedBy(-decimals)
    .decimalPlaces(rounding)
    .toFixed();
};
