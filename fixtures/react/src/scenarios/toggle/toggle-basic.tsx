import type { ChangeDetails } from "@fragiola/primitives-react/toggle";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Toggle } from "../../kit/ui/toggle.tsx";

/** spec/toggle.md, `/toggle/basic` */
export function ToggleBasic() {
    const [last, setLast] = useState<{
        toggle: string;
        pressed: boolean;
        reason: string;
    }>();
    const report =
        (toggle: string) => (pressed: boolean, details: ChangeDetails) =>
            setLast({ toggle, pressed, reason: details.reason });
    return (
        <>
            <div className="flex flex-wrap items-center gap-2">
                <Toggle onPressedChange={report("Bold")}>Bold</Toggle>
                <Toggle defaultPressed onPressedChange={report("Italic")}>
                    Italic
                </Toggle>
                <Toggle disabled onPressedChange={report("Underline")}>
                    Underline
                </Toggle>
                <Toggle
                    nativeButton={false}
                    render={<span />}
                    onPressedChange={report("Strike")}
                >
                    Strike
                </Toggle>
            </div>
            <Output
                values={{
                    toggle: last?.toggle,
                    pressed: last?.pressed,
                    reason: last?.reason,
                }}
            />
        </>
    );
}
