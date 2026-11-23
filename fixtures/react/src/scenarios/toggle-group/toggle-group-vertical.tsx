import type { ChangeDetails } from "@fragiola/primitives-react/toggle-group";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Toggle } from "../../kit/ui/toggle.tsx";
import { ToggleGroup } from "../../kit/ui/toggle-group.tsx";

/** spec/toggle-group.md, `/toggle-group/vertical` */
export function ToggleGroupVertical() {
    const [value, setValue] = useState(["bold"]);
    const [changed, setChanged] = useState<string[]>();
    const [reason, setReason] = useState<string>();
    return (
        <>
            <ToggleGroup
                aria-label="Text style"
                multiple
                orientation="vertical"
                loopFocus={false}
                value={value}
                onValueChange={(next: string[], details: ChangeDetails) => {
                    setValue(next);
                    setChanged(next);
                    setReason(details.reason);
                }}
            >
                <Toggle value="bold">Bold</Toggle>
                <Toggle value="italic">Italic</Toggle>
                <Toggle value="underline">Underline</Toggle>
            </ToggleGroup>
            <Output values={{ value: changed?.join(","), reason }} />
        </>
    );
}
