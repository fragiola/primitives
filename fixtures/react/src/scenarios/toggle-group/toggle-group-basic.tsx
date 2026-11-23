import type { ChangeDetails } from "@fragiola/primitives-react/toggle-group";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Toggle } from "../../kit/ui/toggle.tsx";
import { ToggleGroup } from "../../kit/ui/toggle-group.tsx";

/** spec/toggle-group.md, `/toggle-group/basic` (and `?dir=rtl`) */
export function ToggleGroupBasic() {
    const [value, setValue] = useState<string[]>();
    const [reason, setReason] = useState<string>();
    return (
        <>
            <div className="flex flex-wrap items-center gap-2">
                <button type="button">Before</button>
                <ToggleGroup
                    aria-label="Alignment"
                    defaultValue={["left"]}
                    onValueChange={(next: string[], details: ChangeDetails) => {
                        setValue(next);
                        setReason(details.reason);
                    }}
                >
                    <Toggle value="left">Left</Toggle>
                    <Toggle value="center">Center</Toggle>
                    <Toggle value="right">Right</Toggle>
                    <Toggle value="justify" disabled>
                        Justify
                    </Toggle>
                </ToggleGroup>
                <button type="button">After</button>
            </div>
            <Output values={{ value: value?.join(","), reason }} />
        </>
    );
}
