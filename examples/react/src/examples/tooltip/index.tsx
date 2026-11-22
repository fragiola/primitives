import { Tooltip } from "@fragiola/primitives-react/tooltip";
import { styles } from "./styles.ts";

const TOOLS = [
    { label: "Bold", hint: "Bold (Ctrl+B)" },
    { label: "Italic", hint: "Italic (Ctrl+I)" },
    { label: "Underline", hint: "Underline (Ctrl+U)" },
];

// A row of toolbar buttons described by tooltips: the first one waits for the delay, moving to
// the next opens it at once, keyboard focus opens it with no delay and Escape closes it.
export default function ToolbarHints() {
    return (
        <Tooltip.Provider delay={500}>
            <div className={styles.toolbar}>
                {TOOLS.map((tool) => (
                    <Tooltip.Root key={tool.label}>
                        <Tooltip.Trigger className={styles.trigger}>
                            {tool.label}
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                            <Tooltip.Positioner
                                sideOffset={8}
                                className={styles.positioner}
                            >
                                <Tooltip.Popup className={styles.popup}>
                                    <Tooltip.Arrow className={styles.arrow} />
                                    {tool.hint}
                                </Tooltip.Popup>
                            </Tooltip.Positioner>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                ))}
            </div>
        </Tooltip.Provider>
    );
}
