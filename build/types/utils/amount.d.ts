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
export declare const parseAmount: ({ amount, decimals, }: Omit<AmountArgs, 'rounding'>) => bigint;
/**
 * Formats the amount from string (bigInt)
 * @param amount
 * @param decimals
 * @param rounding
 * @returns string
 */
export declare const formatAmount: ({ amount, decimals, rounding, }: AmountArgs) => string;
export {};
