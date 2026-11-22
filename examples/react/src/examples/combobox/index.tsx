import { Combobox } from "@fragiola/primitives-react/combobox";
import { styles } from "./styles.ts";

interface Fruit {
    value: string;
    label: string;
}

const FRUITS: Fruit[] = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "blueberry", label: "Blueberry" },
    { value: "cherry", label: "Cherry" },
    { value: "grape", label: "Grape" },
    { value: "mango", label: "Mango" },
];

// Fruit tags: typing filters the list, Enter adds the highlighted fruit as a chip, Backspace in
// the empty input removes the last one, and Escape resets the text (spec/combobox.md, D10).
export default function FruitTags() {
    return (
        <div className={styles.stack}>
            <label htmlFor="fruits" className={styles.label}>
                Fruits
            </label>
            <Combobox.Root
                multiple
                items={FRUITS}
                defaultValue={[FRUITS[0] as Fruit]}
                name="fruits"
            >
                <Combobox.Chips className={styles.chips}>
                    <Combobox.Value>
                        {(values: Fruit[]) => (
                            <>
                                {values.map((fruit) => (
                                    <Combobox.Chip
                                        key={fruit.value}
                                        className={styles.chip}
                                    >
                                        {fruit.label}
                                        <Combobox.ChipRemove
                                            aria-label={`Remove ${fruit.label}`}
                                            className={styles.chipRemove}
                                        >
                                            ×
                                        </Combobox.ChipRemove>
                                    </Combobox.Chip>
                                ))}
                                <Combobox.Input
                                    id="fruits"
                                    className={styles.input}
                                />
                            </>
                        )}
                    </Combobox.Value>
                </Combobox.Chips>
                <Combobox.Portal>
                    <Combobox.Positioner
                        sideOffset={4}
                        className={styles.positioner}
                    >
                        <Combobox.Popup className={styles.popup}>
                            <Combobox.Empty className={styles.empty}>
                                No fruit found.
                            </Combobox.Empty>
                            <Combobox.List className={styles.list}>
                                {(fruit: Fruit) => (
                                    <Combobox.Item
                                        key={fruit.value}
                                        value={fruit}
                                        className={styles.item}
                                    >
                                        {fruit.label}
                                        <Combobox.ItemIndicator
                                            className={styles.itemIndicator}
                                        >
                                            ✓
                                        </Combobox.ItemIndicator>
                                    </Combobox.Item>
                                )}
                            </Combobox.List>
                        </Combobox.Popup>
                    </Combobox.Positioner>
                </Combobox.Portal>
            </Combobox.Root>
        </div>
    );
}
