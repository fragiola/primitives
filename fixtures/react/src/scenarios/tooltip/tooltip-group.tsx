import { useState } from "react";
import { Tooltip } from "../../kit/ui/tooltip.tsx";

const TOOLS = [
    { label: "Bold", hint: "Bold (Ctrl+B)" },
    { label: "Italic", hint: "Italic (Ctrl+I)" },
    { label: "Underline", hint: "Underline (Ctrl+U)" },
];

export function TooltipGroup() {
    const [timeout, setGroupTimeout] = useState(400);
    return (
        <Tooltip.Provider delay={800} timeout={timeout}>
            <div className="flex gap-2">
                {TOOLS.map((tool) => (
                    <Tooltip.Root key={tool.label}>
                        <Tooltip.Trigger>{tool.label}</Tooltip.Trigger>
                        <Tooltip.Portal>
                            <Tooltip.Positioner sideOffset={6}>
                                <Tooltip.Popup>{tool.hint}</Tooltip.Popup>
                            </Tooltip.Positioner>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                ))}
            </div>
            <div className="mt-30">
                <button type="button">Elsewhere</button>{" "}
                <button type="button" onClick={() => setGroupTimeout(0)}>
                    No hand-off
                </button>
            </div>
        </Tooltip.Provider>
    );
}
