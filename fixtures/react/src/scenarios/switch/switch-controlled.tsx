import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Switch } from "../../kit/ui/switch.tsx";

/** The consumer refuses to turn the switch off: it stays on. */
export function SwitchControlled() {
    const [checked, setChecked] = useState(true);
    const [requested, setRequested] = useState<boolean>();
    return (
        <>
            <label className="flex items-center gap-2 text-sm">
                <Switch.Root
                    checked={checked}
                    onCheckedChange={(next: boolean) => {
                        setRequested(next);
                        if (next) {
                            setChecked(true);
                        }
                    }}
                />
                Dark mode
            </label>
            <Output values={{ checked, requested }} />
        </>
    );
}
