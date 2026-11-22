import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Radio, RadioGroup } from "../../kit/ui/radio-group.tsx";

const SIZES = [
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
];

/** The consumer refuses `large`: the value stays. */
export function RadioGroupControlled() {
    const [value, setValue] = useState("medium");
    const [requested, setRequested] = useState<string | null>();
    return (
        <>
            <h2 id="size" className="text-sm font-semibold">
                Size
            </h2>
            <RadioGroup
                aria-labelledby="size"
                orientation="horizontal"
                loopFocus={false}
                value={value}
                onValueChange={(next: string | null) => {
                    setRequested(next);
                    if (next !== null && next !== "large") {
                        setValue(next);
                    }
                }}
            >
                {SIZES.map((size) => (
                    <label
                        key={size.value}
                        className="flex items-center gap-2 text-sm"
                    >
                        <Radio.Root value={size.value} />
                        {size.label}
                    </label>
                ))}
            </RadioGroup>
            <Output values={{ value, requested }} />
        </>
    );
}
