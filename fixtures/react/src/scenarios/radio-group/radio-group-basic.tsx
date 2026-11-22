import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { Radio, RadioGroup } from "../../kit/ui/radio-group.tsx";
import { PLANS } from "./plans.ts";

export function RadioGroupBasic() {
    const [value, setValue] = useState<string | null>();
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
                <h2 id="plan" className="text-sm font-semibold">
                    Plan
                </h2>
                <RadioGroup
                    aria-labelledby="plan"
                    name="plan"
                    required
                    onValueChange={(next: string | null) => setValue(next)}
                >
                    {PLANS.map((plan) => (
                        <label
                            key={plan.value}
                            className="flex items-center gap-2 text-sm"
                        >
                            <Radio.Root
                                value={plan.value}
                                disabled={plan.disabled}
                            />
                            {plan.label}
                        </label>
                    ))}
                </RadioGroup>
                <div className="flex gap-2">
                    <button type="submit">Submit</button>
                    <button type="reset">Reset</button>
                </div>
            </form>
            <Output values={{ value, form }} />
        </>
    );
}
