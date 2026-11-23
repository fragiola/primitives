import type { ChangeDetails } from "@fragiola/primitives-react/editable";

/** A value as the fixtures print it: a line break as `\n` (spec/editable.md, "Scenarios"). */
export function printText(value: string): string {
    return value.replaceAll("\n", "\\n");
}

/** A commit or a revert as the fixtures print it: `<value> (<reason>)`. */
export function printEnd(value: string, details: ChangeDetails): string {
    return `${printText(value)} (${details.reason})`;
}
