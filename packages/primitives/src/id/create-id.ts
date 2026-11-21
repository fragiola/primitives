let counter = 0;

/**
 * A document-unique id for frameworks without one of their own (React, Vue and Angular have
 * theirs: `useId`, `useId`, the injector). Ids look like `primitives-dialog-3`.
 */
export function createId(prefix = "primitives"): string {
    counter += 1;
    return `${prefix}-${counter}`;
}
