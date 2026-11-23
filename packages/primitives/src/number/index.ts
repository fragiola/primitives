// The entry of @fragiola/primitives/number: a number field's formatting and parsing of localized
// text, its stepping, the press-and-hold auto repeat of its buttons and the scrub of its scrub
// area (spec/number-field.md). Only NumberField imports it.

export { type AutoRepeatOptions, watchAutoRepeat } from "./auto-repeat.ts";
export {
    formatNumber,
    type NumberFormatOptions,
    numberFormatOptions,
} from "./number-format.ts";
export { isNumberText, parseNumber } from "./number-parse.ts";
export {
    clampNumber,
    type NumberStepOptions,
    stepNumber,
} from "./number-step.ts";
export { type ScrubOptions, type ScrubPoint, watchScrub } from "./scrub.ts";
