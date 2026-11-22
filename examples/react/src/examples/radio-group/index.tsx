import { Button } from "@fragiola/primitives-react/button";
import { Field } from "@fragiola/primitives-react/field";
import { Form } from "@fragiola/primitives-react/form";
import { Radio } from "@fragiola/primitives-react/radio";
import { RadioGroup } from "@fragiola/primitives-react/radio-group";
import { Switch } from "@fragiola/primitives-react/switch";
import { useState } from "react";
import { styles } from "./styles.ts";

const CHANNELS = [
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "post", label: "Post" },
];

// Contact settings: a Form with a required RadioGroup and a Switch, each in a Field. The arrows
// move through the radios, Space toggles the switch; saving with no channel chosen focuses the
// first radio and shows the field's error (spec/radio-group.md, spec/switch.md, spec/field.md).
export default function ContactSettings() {
    const [status, setStatus] = useState("");
    return (
        <Form
            aria-label="Contact settings"
            onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                setStatus(
                    `Saved: ${String(data.get("contact"))}, alerts ${String(data.get("alerts"))}.`,
                );
            }}
            className={styles.form}
        >
            <Field.Root name="contact" className={styles.field.root}>
                <Field.Label className={styles.field.label}>
                    Contact by
                </Field.Label>
                <RadioGroup required className={styles.group}>
                    {CHANNELS.map((channel) => (
                        <div key={channel.value} className={styles.row}>
                            <Radio.Root
                                id={channel.value}
                                value={channel.value}
                                className={styles.radio.root}
                            >
                                <Radio.Indicator
                                    className={styles.radio.indicator}
                                />
                            </Radio.Root>
                            <label htmlFor={channel.value}>
                                {channel.label}
                            </label>
                        </div>
                    ))}
                </RadioGroup>
                <Field.Description className={styles.field.description}>
                    How we reach you.
                </Field.Description>
                <Field.Error
                    match="valueMissing"
                    className={styles.field.error}
                >
                    Choose how we reach you.
                </Field.Error>
            </Field.Root>
            <Field.Root name="alerts" className={styles.field.root}>
                <div className={styles.row}>
                    <Switch.Root
                        uncheckedValue="off"
                        className={styles.switch.root}
                    >
                        <Switch.Thumb className={styles.switch.thumb} />
                    </Switch.Root>
                    <Field.Label className={styles.field.label}>
                        Email alerts
                    </Field.Label>
                </div>
                <Field.Description className={styles.field.description}>
                    A weekly digest.
                </Field.Description>
            </Field.Root>
            <Button type="submit" className={styles.submit}>
                Save
            </Button>
            <p role="status" className={styles.status}>
                {status}
            </p>
        </Form>
    );
}
