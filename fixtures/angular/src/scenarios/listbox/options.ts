/** An option of the listbox scenarios (spec/listbox.md, "Scenarios"). */
export interface Option {
    value: string;
    label: string;
    disabled?: boolean;
}

export const FRUITS: readonly Option[] = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "blueberry", label: "Blueberry" },
    { value: "cherry", label: "Cherry" },
    { value: "grape", label: "Grape" },
    { value: "mango", label: "Mango" },
    { value: "orange", label: "Orange", disabled: true },
];

export const TOPPINGS: readonly Option[] = [
    { value: "cheese", label: "Cheese" },
    { value: "mushrooms", label: "Mushrooms" },
    { value: "olives", label: "Olives", disabled: true },
    { value: "onions", label: "Onions" },
    { value: "peppers", label: "Peppers" },
    { value: "pineapple", label: "Pineapple" },
    { value: "spinach", label: "Spinach" },
    { value: "tomatoes", label: "Tomatoes" },
];

export const PRODUCE: readonly { label: string; items: readonly Option[] }[] = [
    {
        label: "Fruits",
        items: [
            { value: "apple", label: "Apple" },
            { value: "banana", label: "Banana" },
            { value: "cherry", label: "Cherry" },
        ],
    },
    {
        label: "Vegetables",
        items: [
            { value: "carrot", label: "Carrot" },
            { value: "celery", label: "Celery" },
            { value: "potato", label: "Potato" },
        ],
    },
];

export const SIZES: readonly Option[] = [
    { value: "s", label: "S" },
    { value: "m", label: "M" },
    { value: "l", label: "L" },
    { value: "xl", label: "XL" },
];

/** A value as the output prints it: a list joined with `,`, `none` for `null` or `[]`. */
export function printValue(
    value: string | readonly string[] | null | undefined,
): string {
    if (value === null || value === undefined) {
        return "none";
    }
    if (typeof value === "string") {
        return value;
    }
    return value.length === 0 ? "none" : value.join(",");
}
