import { Label } from "@fragiola/primitives-react/label";
import { NumberField } from "@fragiola/primitives-react/number-field";
import { styles } from "./styles.ts";

const PERCENT = { style: "percent" } as const;

// A cart line: a quantity from 1 to 10, stepped by its buttons (held, they repeat), the arrows,
// Page Up and Down, or typed; and a discount written as a percentage, whose label is a scrub
// area: drag it sideways to change the value (spec/number-field.md).
export default function QuantityField() {
    return (
        <div className={styles.stack}>
            <Label htmlFor="quantity" className={styles.label}>
                Quantity
            </Label>
            <NumberField.Root
                id="quantity"
                defaultValue={1}
                min={1}
                max={10}
                className={styles.root}
            >
                <NumberField.Group className={styles.group}>
                    <NumberField.Decrement
                        aria-label="Decrease"
                        className={styles.decrement}
                    >
                        −
                    </NumberField.Decrement>
                    <NumberField.Input className={styles.input} />
                    <NumberField.Increment
                        aria-label="Increase"
                        className={styles.increment}
                    >
                        +
                    </NumberField.Increment>
                </NumberField.Group>
            </NumberField.Root>
            <NumberField.Root
                id="discount"
                defaultValue={0.1}
                min={0}
                max={1}
                step={0.01}
                format={PERCENT}
                className={styles.root}
            >
                <NumberField.ScrubArea className={styles.scrubArea}>
                    <Label htmlFor="discount" className={styles.label}>
                        Discount
                    </Label>
                    <NumberField.ScrubAreaCursor
                        className={styles.scrubAreaCursor}
                    />
                </NumberField.ScrubArea>
                <NumberField.Group className={styles.group}>
                    <NumberField.Input className={styles.input} />
                </NumberField.Group>
            </NumberField.Root>
        </div>
    );
}
