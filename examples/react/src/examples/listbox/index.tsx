import { Listbox } from "@fragiola/primitives-react/listbox";
import { useState } from "react";
import { styles } from "./styles.ts";

const TOPPINGS = [
    { value: "cheese", label: "Cheese" },
    { value: "mushrooms", label: "Mushrooms" },
    { value: "olives", label: "Olives" },
    { value: "onions", label: "Onions" },
    { value: "peppers", label: "Peppers" },
    { value: "pineapple", label: "Pineapple" },
    { value: "spinach", label: "Spinach" },
];

// A transfer list: select toppings in one list (Space toggles, Shift with the arrows or a press
// selects a range, Ctrl+A selects them all) and move them to the other (spec/listbox.md).
export default function TransferList() {
    const [chosen, setChosen] = useState<string[]>(["cheese"]);
    const [toAdd, setToAdd] = useState<string[]>([]);
    const [toRemove, setToRemove] = useState<string[]>([]);
    const available = TOPPINGS.filter((item) => !chosen.includes(item.value));
    const picked = TOPPINGS.filter((item) => chosen.includes(item.value));
    const add = () => {
        setChosen([...chosen, ...toAdd]);
        setToAdd([]);
    };
    const remove = () => {
        setChosen(chosen.filter((value) => !toRemove.includes(value)));
        setToRemove([]);
    };
    return (
        <div className={styles.row}>
            <div className={styles.column}>
                <span id="available" className={styles.heading}>
                    Available
                </span>
                <Listbox.Root
                    aria-labelledby="available"
                    multiple
                    value={toAdd}
                    onValueChange={setToAdd}
                    className={styles.list}
                >
                    {available.map((item) => (
                        <Listbox.Item
                            key={item.value}
                            value={item.value}
                            className={styles.item}
                        >
                            {item.label}
                            <Listbox.ItemIndicator
                                className={styles.itemIndicator}
                            >
                                ✓
                            </Listbox.ItemIndicator>
                        </Listbox.Item>
                    ))}
                </Listbox.Root>
            </div>
            <div className={styles.buttons}>
                <button
                    type="button"
                    className={styles.button}
                    disabled={toAdd.length === 0}
                    onClick={add}
                >
                    Add
                </button>
                <button
                    type="button"
                    className={styles.button}
                    disabled={toRemove.length === 0}
                    onClick={remove}
                >
                    Remove
                </button>
            </div>
            <div className={styles.column}>
                <span id="chosen" className={styles.heading}>
                    Chosen
                </span>
                <Listbox.Root
                    aria-labelledby="chosen"
                    multiple
                    name="toppings"
                    value={toRemove}
                    onValueChange={setToRemove}
                    className={styles.list}
                >
                    {picked.map((item) => (
                        <Listbox.Item
                            key={item.value}
                            value={item.value}
                            className={styles.item}
                        >
                            {item.label}
                            <Listbox.ItemIndicator
                                className={styles.itemIndicator}
                            >
                                ✓
                            </Listbox.ItemIndicator>
                        </Listbox.Item>
                    ))}
                </Listbox.Root>
            </div>
        </div>
    );
}
