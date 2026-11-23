/** A fruit suggestion of the autocomplete scenarios (spec/autocomplete.md, "Scenarios"). */
export interface Fruit {
    value: string;
    label: string;
    disabled?: boolean;
}

export const FRUITS: readonly Fruit[] = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "blueberry", label: "Blueberry" },
    { value: "cherry", label: "Cherry" },
    { value: "grape", label: "Grape" },
    { value: "mango", label: "Mango" },
    { value: "orange", label: "Orange", disabled: true },
];

export const CITIES: readonly string[] = [
    "Bogotá",
    "Brasília",
    "Kraków",
    "Málaga",
    "Montréal",
    "São Paulo",
    "Zürich",
];

export interface ProduceGroup {
    label: string;
    items: readonly Fruit[];
}

export const PRODUCE: readonly ProduceGroup[] = [
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
