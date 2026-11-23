import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Toggle } from "../../kit/ui/toggle.tsx";

/** spec/toggle.md, `/toggle/controlled`: while "Locked" is checked, the fixture refuses every change. */
export function ToggleControlled() {
    const [pressed, setPressed] = useState(true);
    const [requested, setRequested] = useState<boolean>();
    const [locked, setLocked] = useState(false);
    return (
        <>
            <div className="flex flex-wrap items-center gap-4">
                <Toggle
                    pressed={pressed}
                    onPressedChange={(next: boolean) => {
                        setRequested(next);
                        if (!locked) {
                            setPressed(next);
                        }
                    }}
                >
                    Mute
                </Toggle>
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={locked}
                        onChange={(event) => setLocked(event.target.checked)}
                    />
                    Locked
                </label>
            </div>
            <Output values={{ pressed, requested }} />
        </>
    );
}
