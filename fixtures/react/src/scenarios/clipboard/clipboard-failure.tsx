import type {
    ClipboardStatus,
    ClipboardStatusDetails,
} from "@fragiola/primitives-react/clipboard";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Clipboard } from "../../kit/ui/clipboard.tsx";

/** A copy the browser refuses (spec/clipboard.md, `/clipboard/failure`). */
export function ClipboardFailure() {
    const [status, setStatus] = useState<string>();
    const [error, setError] = useState<string>();
    return (
        <>
            <div className="flex flex-col items-start gap-2">
                <label htmlFor="install" className="text-sm font-medium">
                    Install command
                </label>
                <Clipboard.Root
                    value="pnpm add @fragiola/primitives"
                    timeout={1000}
                    announcement="Copied to clipboard"
                    failedAnnouncement="Copy failed: select the text and copy it"
                    onStatusChange={(
                        next: ClipboardStatus,
                        details: ClipboardStatusDetails,
                    ) => {
                        setStatus(next);
                        if (details.error instanceof Error) {
                            setError(details.error.message);
                        }
                    }}
                >
                    <Clipboard.Input id="install" />
                    <Clipboard.Trigger aria-label="Copy install command" />
                </Clipboard.Root>
            </div>
            <Output values={{ status, error }} />
        </>
    );
}
