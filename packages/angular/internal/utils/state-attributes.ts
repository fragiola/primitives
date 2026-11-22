/**
 * A `data-*` value for a host binding (spec/README.md, "State attributes"): `true` gives an empty
 * attribute, `false`, `null` and `undefined` give none (`null` removes it, never `"false"`),
 * strings are values.
 */
export function dataValue(
    value: boolean | string | null | undefined,
): string | null {
    if (value === true) {
        return "";
    }
    return typeof value === "string" ? value : null;
}

/** The same for a whole state record: `[attr.data-open]="data().open"`. */
export function dataValues<K extends string>(
    state: Record<K, boolean | string | null | undefined>,
): Record<K, string | null> {
    const values = {} as Record<K, string | null>;
    for (const key of Object.keys(state) as K[]) {
        values[key] = dataValue(state[key]);
    }
    return values;
}

/**
 * The same as attributes, for a part a structural directive renders (it writes them on the element,
 * with no host binding): `{ open: true }` gives `{ "data-open": "" }`.
 */
export function dataAttributes(
    state: Record<string, boolean | string | null | undefined>,
): Record<string, string | null> {
    const attributes: Record<string, string | null> = {};
    for (const [key, value] of Object.entries(state)) {
        attributes[`data-${key}`] = dataValue(value);
    }
    return attributes;
}
