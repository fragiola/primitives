import { Toggle } from "@fragiola/primitives-react/toggle";
import { ToggleGroup } from "@fragiola/primitives-react/toggle-group";
import { useState } from "react";
import { styles } from "./styles.ts";

const ALIGNMENTS = [
    { value: "left", label: "Left" },
    { value: "center", label: "Center" },
    { value: "right", label: "Right" },
    { value: "justify", label: "Justify" },
];

// Text alignment: one toggle pressed at a time, and pressing the pressed one releases it (the
// paragraph falls back to the start). The group is one tab stop; the arrow keys, Home and End
// move the focus between the toggles, never the value (spec/toggle-group.md).
export default function TextAlignment() {
    const [value, setValue] = useState<string[]>(["left"]);
    const align = value[0] ?? "start";
    return (
        <div className={styles.stack}>
            <ToggleGroup
                aria-label="Text alignment"
                value={value}
                onValueChange={setValue}
                className={styles.root}
            >
                {ALIGNMENTS.map((entry) => (
                    <Toggle
                        key={entry.value}
                        value={entry.value}
                        className={styles.toggle}
                    >
                        {entry.label}
                    </Toggle>
                ))}
            </ToggleGroup>
            <p data-align={align} className={styles.preview}>
                The quick brown fox jumps over the lazy dog, then naps in the
                sun while the dog wonders what just happened.
            </p>
        </div>
    );
}
