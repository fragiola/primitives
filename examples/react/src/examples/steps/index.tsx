import { Steps } from "@fragiola/primitives-react/steps";
import { useState } from "react";
import { styles } from "./styles.ts";

const STEPS = ["Shipping", "Payment", "Review"];

// A linear checkout (spec/steps.md): Continue, and the steps after Shipping, wait until the
// shipping name is filled in (`isStepValid`); the last Continue reaches the completed state.
export default function CheckoutStepper() {
    const [name, setName] = useState("");
    return (
        <Steps.Root
            count={STEPS.length}
            linear
            isStepValid={(index) => index !== 0 || name.trim() !== ""}
            className={styles.root}
        >
            <Steps.List aria-label="Checkout" className={styles.list}>
                {STEPS.map((title, index) => (
                    <Steps.Item
                        key={title}
                        index={index}
                        className={styles.item}
                    >
                        <Steps.Trigger className={styles.trigger}>
                            <Steps.Indicator className={styles.indicator}>
                                {index + 1}
                            </Steps.Indicator>
                            {title}
                        </Steps.Trigger>
                        {index < STEPS.length - 1 ? (
                            <Steps.Separator className={styles.separator} />
                        ) : null}
                    </Steps.Item>
                ))}
            </Steps.List>
            <Steps.Content index={0} className={styles.content}>
                <label className={styles.label}>
                    Full name
                    <input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        autoComplete="name"
                        className={styles.input}
                    />
                </label>
            </Steps.Content>
            <Steps.Content index={1} className={styles.content}>
                <p className={styles.text}>Pay by card on delivery.</p>
            </Steps.Content>
            <Steps.Content index={2} className={styles.content}>
                <p className={styles.text}>Ship to {name}, pay on delivery.</p>
            </Steps.Content>
            <Steps.CompletedContent className={styles.content}>
                <p>Order placed</p>
            </Steps.CompletedContent>
            <div className={styles.controls}>
                <Steps.PrevTrigger className={styles.control}>
                    Back
                </Steps.PrevTrigger>
                <Steps.NextTrigger className={styles.control}>
                    Continue
                </Steps.NextTrigger>
            </div>
        </Steps.Root>
    );
}
