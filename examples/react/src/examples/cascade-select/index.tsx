import {
    type CascadeItem,
    CascadeSelect,
} from "@fragiola/primitives-react/cascade-select";
import { Field } from "@fragiola/primitives-react/field";
import { useState } from "react";
import { styles } from "./styles.ts";

const city = (label: string): CascadeItem => ({
    value: label.toLowerCase(),
    label,
});

const PLACES: readonly CascadeItem[] = [
    {
        value: "americas",
        label: "Americas",
        children: [
            {
                value: "brazil",
                label: "Brazil",
                children: [city("Recife"), city("Rio")],
            },
            {
                value: "canada",
                label: "Canada",
                children: [city("Ottawa"), city("Toronto")],
            },
        ],
    },
    {
        value: "asia",
        label: "Asia",
        children: [
            {
                value: "japan",
                label: "Japan",
                children: [city("Osaka"), city("Tokyo")],
            },
        ],
    },
    {
        value: "europe",
        label: "Europe",
        children: [
            {
                value: "france",
                label: "France",
                children: [city("Lyon"), city("Paris")],
            },
            {
                value: "portugal",
                label: "Portugal",
                children: [city("Lisbon"), city("Porto")],
            },
        ],
    },
];

const DEPTHS = [0, 1, 2];

// A city chosen through its region and country: one listbox per open level, Right, Enter or a
// hover opens the next one, Left goes back (mirrored in RTL), typing jumps within a level, and
// Enter on a city chooses it. The Field shows an error when nothing is chosen, and the form
// submits the path of values (spec/cascade-select.md).
export default function PlacePicker() {
    const [saved, setSaved] = useState<string | null>(null);
    return (
        <form
            className={styles.form}
            onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                setSaved(String(data.get("city")));
            }}
        >
            <Field.Root name="city" className={styles.field.root}>
                <Field.Label className={styles.field.label}>City</Field.Label>
                <CascadeSelect.Root items={PLACES} required>
                    <CascadeSelect.Trigger className={styles.trigger}>
                        <CascadeSelect.Value
                            placeholder="Choose a city"
                            separator=" / "
                            className={styles.value}
                        />
                    </CascadeSelect.Trigger>
                    <CascadeSelect.Portal>
                        <CascadeSelect.Positioner className={styles.positioner}>
                            <CascadeSelect.Popup className={styles.popup}>
                                {DEPTHS.map((depth) => (
                                    <CascadeSelect.Level
                                        key={depth}
                                        depth={depth}
                                        className={styles.level}
                                    >
                                        {(items: readonly CascadeItem[]) =>
                                            items.map((item) => (
                                                <CascadeSelect.Item
                                                    key={item.value}
                                                    value={item.value}
                                                    className={styles.item}
                                                >
                                                    {item.label}
                                                    <CascadeSelect.ItemIndicator
                                                        className={
                                                            styles.itemIndicator
                                                        }
                                                    >
                                                        ✓
                                                    </CascadeSelect.ItemIndicator>
                                                </CascadeSelect.Item>
                                            ))
                                        }
                                    </CascadeSelect.Level>
                                ))}
                            </CascadeSelect.Popup>
                        </CascadeSelect.Positioner>
                    </CascadeSelect.Portal>
                </CascadeSelect.Root>
                <Field.Description className={styles.field.description}>
                    Region, country, then city.
                </Field.Description>
                <Field.Error
                    match="valueMissing"
                    className={styles.field.error}
                >
                    Choose a city.
                </Field.Error>
            </Field.Root>
            <button type="submit" className={styles.submit}>
                Save
            </button>
            <p role="status" className={styles.status}>
                {saved === null ? "" : `Saved: ${saved}`}
            </p>
        </form>
    );
}
