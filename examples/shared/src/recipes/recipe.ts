// Adapted from the POC (@poc/styles, src/recipes/recipe.ts).

/** A component's classes, one string per part of its spec (`data-primitives-part`). */
export type Recipe<Part extends string> = Readonly<Record<Part, string>>;

/** Joins class strings, dropping empty ones. */
export function classes(
    ...values: readonly (string | false | null | undefined)[]
): string {
    return values.filter(Boolean).join(" ");
}
