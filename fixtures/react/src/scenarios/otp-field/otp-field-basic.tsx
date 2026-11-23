import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { Label } from "../../kit/ui/label.tsx";
import { OTPField } from "../../kit/ui/otp-field.tsx";
import { useOtpOutput } from "./use-otp-output.ts";

const SIX = [1, 2, 3, 4, 5, 6];
const FOUR = [1, 2, 3, 4];

/** spec/otp-field.md, `/otp-field/basic` (and `?dir=rtl`) */
export function OtpFieldBasic() {
    const output = useOtpOutput();
    const [form, setForm] = useState<string>();
    return (
        <>
            <form
                className="flex flex-col items-start gap-2"
                onSubmit={(event) => {
                    event.preventDefault();
                    setForm(formEntries(event.currentTarget));
                }}
            >
                <Label id="code-label" htmlFor="code">
                    Verification code
                </Label>
                <OTPField.Root
                    id="code"
                    name="code"
                    length={6}
                    aria-labelledby="code-label"
                    {...output.handlers}
                >
                    {SIX.map((slot) => (
                        <OTPField.Input
                            key={slot}
                            aria-label={`Digit ${slot} of 6`}
                        />
                    ))}
                </OTPField.Root>
                <div className="flex gap-2">
                    <button type="submit">Submit</button>
                    <button type="reset">Reset</button>
                </div>
            </form>
            <div className="mt-4 flex flex-col items-start gap-2">
                <OTPField.Root
                    aria-label="Backup code"
                    length={4}
                    readOnly
                    defaultValue="2468"
                >
                    {FOUR.map((slot) => (
                        <OTPField.Input
                            key={slot}
                            aria-label={`Backup digit ${slot} of 4`}
                        />
                    ))}
                </OTPField.Root>
                <OTPField.Root aria-label="Old code" length={4} disabled>
                    {FOUR.map((slot) => (
                        <OTPField.Input
                            key={slot}
                            aria-label={`Old digit ${slot} of 4`}
                        />
                    ))}
                </OTPField.Root>
            </div>
            <Output values={{ ...output.values, form }} />
        </>
    );
}
