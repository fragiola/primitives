import { Label } from "@fragiola/primitives-react/label";
import { OTPField } from "@fragiola/primitives-react/otp-field";
import { useState } from "react";
import { styles } from "./styles.ts";

const SLOTS = [1, 2, 3, 4, 5, 6];

// A sign-in code: six slots, one digit each, named by their position. Typing moves forward,
// Backspace moves back, a paste fills every slot, and the browser's one-time-code autofill
// reaches the first one; the complete code is reported (spec/otp-field.md).
export default function SignInCode() {
    const [code, setCode] = useState<string | null>(null);
    return (
        <div className={styles.stack}>
            <Label
                id="sign-in-label"
                htmlFor="sign-in"
                className={styles.label}
            >
                Sign-in code
            </Label>
            <OTPField.Root
                id="sign-in"
                length={6}
                aria-labelledby="sign-in-label"
                onValueChange={() => setCode(null)}
                onValueComplete={setCode}
                className={styles.root}
            >
                {SLOTS.map((slot) => (
                    <OTPField.Input
                        key={slot}
                        aria-label={`Digit ${slot} of 6`}
                        className={styles.input}
                    />
                ))}
            </OTPField.Root>
            <p className={styles.status} aria-live="polite">
                {code === null
                    ? "Enter the code we sent you."
                    : `Code ${code} entered.`}
            </p>
        </div>
    );
}
