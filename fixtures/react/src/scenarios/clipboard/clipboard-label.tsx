import {
    type ClipboardStatus,
    Clipboard as Primitive,
} from "@fragiola/primitives-react/clipboard";
import { clipboard } from "examples-shared/recipes/clipboard";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Clipboard, ClipboardIcons } from "../../kit/ui/clipboard.tsx";

/** A share link whose Trigger's visible label follows the status (spec/clipboard.md, `/clipboard/label`). */
export function ClipboardLabel() {
    const [status, setStatus] = useState<string>();
    return (
        <>
            <Clipboard.Root
                value="https://fragiola.com/primitives"
                timeout={1000}
                onStatusChange={(next: ClipboardStatus) => setStatus(next)}
            >
                <Primitive.Trigger className={clipboard["labelled-trigger"]}>
                    {(state) => (
                        <>
                            <ClipboardIcons />
                            {state.copied ? "Copied" : "Copy link"}
                        </>
                    )}
                </Primitive.Trigger>
            </Clipboard.Root>
            <Output values={{ status }} />
        </>
    );
}
