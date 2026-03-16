// deno-lint-ignore-file valibot-project/require-name-suffix
/**
 * Common valibot schemas for primitive types used across the API.
 * @module
 */
import * as v from "valibot";
// ============================================================
// Number
// ============================================================
/** Unsigned decimal number as a string (e.g., "123.45"). */
export const UnsignedDecimal = /* @__PURE__ */ (() => {
    return v.pipe(v.union([v.string(), v.number()]), v.toString(), v.string(), // HACK: for correct JSONSchema generation
    v.transform((value) => formatDecimalString(value)), v.regex(/^[0-9]+(\.[0-9]+)?$/));
})();
/** Decimal number as a string, can be negative (e.g., "-123.45"). */
export const Decimal = /* @__PURE__ */ (() => {
    return v.pipe(v.union([v.string(), v.number()]), v.toString(), v.string(), // HACK: for correct JSONSchema generation
    v.transform((value) => formatDecimalString(value)), v.regex(/^-?[0-9]+(\.[0-9]+)?$/));
})();
/** Safe integer number. */
export const Integer = /* @__PURE__ */ (() => {
    return v.pipe(v.union([v.string(), v.number()]), v.toNumber(), v.number(), // HACK: for correct JSONSchema generation
    v.safeInteger());
})();
/** Unsigned safe integer number (>= 0). */
export const UnsignedInteger = /* @__PURE__ */ (() => {
    return v.pipe(v.union([v.string(), v.number()]), v.toNumber(), v.number(), // HACK: for correct JSONSchema generation
    v.safeInteger(), v.minValue(0));
})();
function formatDecimalString(value) {
    return value
        // remove leading/trailing whitespace
        .trim() // "  123.45  " → "123.45"
        // remove leading zeros
        .replace(/^(-?)0+(?=\d)/, "$1") // "00123" → "123", "-00.5" → "-0.5"
        // remove trailing zeros
        .replace(/\.0*$|(\.\d+?)0+$/, "$1") // "1.2000" → "1.2", "5.0" → "5"
        // add leading zero if starts with decimal point
        .replace(/^(-?)\./, "$10.") // ".5" → "0.5", "-.5" → "-0.5"
        // add "0" if string is empty after trimming
        .replace(/^-?$/, "0") // "" → "0", "-" → "0"
        // normalize negative zero
        .replace(/^-0$/, "0"); // "-0" → "0"
}
// ============================================================
// Hex
// ============================================================
/** Hexadecimal string starting with "0x". */
export const Hex = /* @__PURE__ */ (() => {
    return v.pipe(v.string(), v.regex(/^0[xX][0-9a-fA-F]+$/), v.transform((value) => value.toLowerCase()));
})();
/** Ethereum address (42 characters hex string). */
export const Address = /* @__PURE__ */ (() => {
    return v.pipe(Hex, v.length(42));
})();
/** Client order ID (34 characters hex string). */
export const Cloid = /* @__PURE__ */ (() => {
    return v.pipe(Hex, v.length(34));
})();
// ============================================================
// Other
// ============================================================
/** Percentage string (e.g., "50%"). */
export const Percent = /* @__PURE__ */ (() => {
    return v.pipe(v.string(), v.regex(/^[0-9]+(\.[0-9]+)?%$/), v.transform((value) => value));
})();
//# sourceMappingURL=_schemas.js.map