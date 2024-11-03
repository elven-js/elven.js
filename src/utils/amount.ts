// TODO: review, generated based on bignumber version

type AmountArgs = {
  amount: string | bigint;
  decimals: number;
  rounding?: number;
};

/**
 * Parses the amount from a string to a BigInt
 * @param amount
 * @param decimals
 * @returns BigInt
 */
export const parseAmount = ({
  amount,
  decimals,
}: Omit<AmountArgs, 'rounding'>): bigint => {
  if (decimals < 0)
    throw new Error("Decimal places shouldn't be negative number!");

  // Ensure amount is a string and remove any commas
  const amountStr = amount.toString().replace(/,/g, '');

  // Split the amount into integer and fractional parts
  const [integerPart, fractionalPart = ''] = amountStr.split('.');

  // Combine integer and fractional parts into a single string of digits
  let combined = integerPart + fractionalPart.padEnd(decimals, '0');

  // Remove extra digits beyond the specified decimals
  combined = combined.substring(0, integerPart.length + decimals);

  // Convert to BigInt
  const amountInt = BigInt(combined);

  return amountInt;
};

/**
 * Formats the amount from BigInt to a string with the specified decimals and rounding
 * @param amount
 * @param decimals
 * @param rounding
 * @returns string
 */
export const formatAmount = ({
  amount,
  decimals,
  rounding = decimals,
}: AmountArgs): string => {
  if (decimals < 0)
    throw new Error("Decimal places shouldn't be negative number!");

  const isNegative = BigInt(amount) < 0n;
  let amountStr = BigInt(amount).toString();

  if (isNegative) {
    amountStr = amountStr.slice(1); // Remove the negative sign
  }

  // Pad the amount with leading zeros if necessary
  amountStr = amountStr.padStart(decimals + 1, '0');

  // Insert the decimal point
  const integerPart = amountStr.slice(0, -decimals);
  let fractionalPart = amountStr.slice(-decimals);

  // Apply rounding if necessary
  if (rounding < decimals) {
    const roundDigit = parseInt(fractionalPart.charAt(rounding), 10);
    fractionalPart = fractionalPart.slice(0, rounding);

    if (roundDigit >= 5) {
      // Round up
      const increment = BigInt('1' + '0'.repeat(decimals - rounding));
      let newAmount = BigInt(amount) + increment;
      if (isNegative) newAmount = -newAmount;

      return formatAmount({ amount: newAmount, decimals, rounding });
    }
  }

  // Construct the final result
  let result = `${integerPart}.${fractionalPart.padEnd(rounding, '0')}`;

  // Remove trailing zeros and decimal point if not needed
  result = result.replace(/\.?0+$/, '');

  if (isNegative) {
    result = `-${result}`;
  }

  return result;
};
