import { Toggle } from "@fragiola/primitives-react/toggle";
import { ToggleGroup } from "@fragiola/primitives-react/toggle-group";
import { Toolbar } from "@fragiola/primitives-react/toolbar";
import { type ChangeEvent, useState } from "react";
import { styles } from "./styles.ts";

const STYLES = [
    { value: "bold", label: "Bold" },
    { value: "italic", label: "Italic" },
    { value: "underline", label: "Underline" },
];

const ALIGNMENTS = [
    { value: "left", label: "Left" },
    { value: "center", label: "Center" },
    { value: "right", label: "Right" },
];

// A text-format toolbar: the text styles (several pressed) and the alignment (one pressed) are
// ToggleGroups whose toggles join the toolbar, which stays one tab stop; the arrow keys, Home and
// End move through every item, and the font size field keeps its caret keys until the caret
// reaches an end (spec/toolbar.md).
export default function TextFormatToolbar() {
    const [textStyle, setTextStyle] = useState<string[]>([]);
    const [align, setAlign] = useState<string[]>(["left"]);
    const [size, setSize] = useState("16");
    const fontSize = Math.min(Math.max(Number(size) || 16, 10), 32);
    const clear = () => {
        setTextStyle([]);
        setAlign(["left"]);
        setSize("16");
    };
    return (
        <div className={styles.stack}>
            <Toolbar.Root aria-label="Text formatting" className={styles.root}>
                <ToggleGroup
                    aria-label="Text style"
                    multiple
                    value={textStyle}
                    onValueChange={setTextStyle}
                    className={styles.toggleGroup}
                >
                    {STYLES.map((entry) => (
                        <Toggle
                            key={entry.value}
                            value={entry.value}
                            className={styles.toggle}
                        >
                            {entry.label}
                        </Toggle>
                    ))}
                </ToggleGroup>
                <Toolbar.Separator className={styles.separator} />
                <ToggleGroup
                    aria-label="Alignment"
                    value={align}
                    onValueChange={setAlign}
                    className={styles.toggleGroup}
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
                <Toolbar.Separator className={styles.separator} />
                <Toolbar.Button onClick={clear} className={styles.button}>
                    Clear
                </Toolbar.Button>
                <Toolbar.Input
                    aria-label="Font size"
                    inputMode="numeric"
                    value={size}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        setSize(event.currentTarget.value)
                    }
                    className={styles.input}
                />
            </Toolbar.Root>
            <p
                data-bold={textStyle.includes("bold") || undefined}
                data-italic={textStyle.includes("italic") || undefined}
                data-underline={textStyle.includes("underline") || undefined}
                data-align={align[0] ?? "start"}
                style={{ fontSize: `${fontSize}px` }}
                className={styles.preview}
            >
                Toolbars group the controls of a task in one tab stop.
            </p>
        </div>
    );
}
