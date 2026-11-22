import { Select } from "@fragiola/primitives-react/select";
import { styles } from "./styles.ts";

const FRUITS = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "blueberry", label: "Blueberry" },
    { value: "cherry", label: "Cherry" },
    { value: "grape", label: "Grape" },
    { value: "mango", label: "Mango" },
    { value: "orange", label: "Orange", disabled: true },
];

// A fruit picker: focus stays on the trigger while the list is open, typing on it opens the list
// on the matching fruit, Enter or Tab chooses, and a disabled fruit cannot be chosen
// (spec/select.md).
export default function FruitPicker() {
    return (
        <div className={styles.stack}>
            <label htmlFor="fruit" className={styles.label}>
                Fruit
            </label>
            <Select.Root items={FRUITS} name="fruit">
                <Select.Trigger id="fruit" className={styles.trigger}>
                    <Select.Value
                        placeholder="Choose a fruit"
                        className={styles.value}
                    />
                </Select.Trigger>
                <Select.Portal>
                    <Select.Positioner className={styles.positioner}>
                        <Select.Popup className={styles.popup}>
                            <Select.List className={styles.list}>
                                {FRUITS.map((fruit) => (
                                    <Select.Item
                                        key={fruit.value}
                                        value={fruit.value}
                                        className={styles.item}
                                    >
                                        {fruit.label}
                                        <Select.ItemIndicator
                                            className={styles.itemIndicator}
                                        >
                                            ✓
                                        </Select.ItemIndicator>
                                    </Select.Item>
                                ))}
                            </Select.List>
                        </Select.Popup>
                    </Select.Positioner>
                </Select.Portal>
            </Select.Root>
        </div>
    );
}
