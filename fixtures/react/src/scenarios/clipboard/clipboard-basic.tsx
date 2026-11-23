import type {
    ClipboardStatus,
    ClipboardStatusDetails,
} from "@fragiola/primitives-react/clipboard";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Clipboard } from "../../kit/ui/clipboard.tsx";

/** An install command to copy (spec/clipboard.md, `/clipboard/basic`). */
export function ClipboardBasic() {
    const [status, setStatus] = useState<string>();
    const [reason, setReason] = useState<string>();
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
                    onStatusChange={(
                        next: ClipboardStatus,
                        details: ClipboardStatusDetails,
                    ) => {
                        setStatus(next);
                        setReason(details.reason);
                    }}
                >
                    <Clipboard.Input id="install" />
                    <Clipboard.Trigger aria-label="Copy install command" />
                </Clipboard.Root>
            </div>
            <Output values={{ status, reason }} />
        </>
    );
}
