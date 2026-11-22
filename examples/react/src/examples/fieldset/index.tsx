import { Checkbox } from "@fragiola/primitives-react/checkbox";
import { Field } from "@fragiola/primitives-react/field";
import { Fieldset } from "@fragiola/primitives-react/fieldset";
import { useState } from "react";
import { styles } from "./styles.ts";

/** `street=Main St&city=Lisbon`: the form's entries, as the status prints them. */
const entries = (form: HTMLFormElement) =>
    [...new FormData(form)]
        .map(([key, value]) => `${key}=${String(value)}`)
        .join("&");

// Shipping and billing addresses: each fieldset is a group named by its legend, and the billing
// one, with every field inside it, stays disabled while billing is the same as shipping
// (spec/fieldset.md).
export default function ShippingAndBilling() {
    const [same, setSame] = useState(true);
    const [saved, setSaved] = useState<string | null>(null);
    return (
        <form
            className={styles.form}
            onSubmit={(event) => {
                event.preventDefault();
                setSaved(entries(event.currentTarget));
            }}
        >
            <Fieldset.Root className={styles.fieldset.root}>
                <Fieldset.Legend className={styles.fieldset.legend}>
                    Shipping address
                </Fieldset.Legend>
                <Field.Root name="street" className={styles.field.root}>
                    <Field.Label className={styles.field.label}>
                        Street
                    </Field.Label>
                    <Field.Control className={styles.field.control} />
                </Field.Root>
                <Field.Root name="city" className={styles.field.root}>
                    <Field.Label className={styles.field.label}>
                        City
                    </Field.Label>
                    <Field.Control className={styles.field.control} />
                </Field.Root>
            </Fieldset.Root>
            <div className={styles.row}>
                <Checkbox.Root
                    id="same"
                    name="same"
                    checked={same}
                    onCheckedChange={setSame}
                    className={styles.checkbox.root}
                >
                    <Checkbox.Indicator className={styles.checkbox.indicator} />
                </Checkbox.Root>
                <label htmlFor="same">Billing same as shipping</label>
            </div>
            <Fieldset.Root disabled={same} className={styles.fieldset.root}>
                <Fieldset.Legend className={styles.fieldset.legend}>
                    Billing address
                </Fieldset.Legend>
                <Field.Root name="billing-street" className={styles.field.root}>
                    <Field.Label className={styles.field.label}>
                        Billing street
                    </Field.Label>
                    <Field.Control className={styles.field.control} />
                </Field.Root>
                <Field.Root name="billing-city" className={styles.field.root}>
                    <Field.Label className={styles.field.label}>
                        Billing city
                    </Field.Label>
                    <Field.Control className={styles.field.control} />
                </Field.Root>
            </Fieldset.Root>
            <button type="submit" className={styles.submit}>
                Save
            </button>
            <p role="status" className={styles.status}>
                {saved === null ? "" : `Saved: ${saved}`}
            </p>
        </form>
    );
}
