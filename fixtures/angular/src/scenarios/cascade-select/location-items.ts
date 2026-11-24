import type { CascadeItem } from "@fragiola/primitives-angular/cascade-select";

const leaf = (label: string, disabled?: boolean): CascadeItem => ({
    value: label.toLowerCase(),
    label,
    ...(disabled ? { disabled } : {}),
});

const parent = (
    label: string,
    children: readonly CascadeItem[],
    disabled?: boolean,
): CascadeItem => ({ ...leaf(label, disabled), children });

/** spec/cascade-select.md, "Scenarios": the tree of every scenario. */
export const LOCATION_ITEMS: readonly CascadeItem[] = [
    parent("Africa", [
        parent("Kenya", [leaf("Mombasa"), leaf("Nairobi")]),
        parent("Nigeria", [leaf("Abuja"), leaf("Lagos")]),
    ]),
    parent("Americas", [
        parent("Brazil", [leaf("Recife"), leaf("Rio")]),
        parent("Canada", [leaf("Ottawa"), leaf("Toronto")]),
    ]),
    leaf("Antarctica"),
    parent("Europe", [
        parent("France", [leaf("Lyon"), leaf("Paris")]),
        parent("Germany", [leaf("Berlin"), leaf("Munich", true)]),
        parent("Portugal", [leaf("Lisbon"), leaf("Porto")]),
    ]),
    parent("Oceania", [parent("Fiji", [leaf("Suva")])], true),
];

/** The output of a path: its values joined by `/`, `undefined` (none) when empty. */
export function pathText(path: readonly string[]): string | undefined {
    return path.length === 0 ? undefined : path.join("/");
}
