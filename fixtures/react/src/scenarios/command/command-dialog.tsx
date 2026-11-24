import type { ChangeDetails } from "@fragiola/primitives-react/dialog";
import { useEffect, useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Command } from "../../kit/ui/command.tsx";
import { Dialog } from "../../kit/ui/dialog.tsx";
import { CommandItems } from "./command-items.tsx";

/**
 * spec/command.md, `/command/dialog`: the Command dialog is a composition, a Command inside a
 * Dialog opened by the app's own Cmd/Ctrl+K.
 */
export function CommandDialog() {
    const [open, setOpen] = useState(false);
    const [ran, setRan] = useState<string>();
    useEffect(() => {
        const toggle = (event: KeyboardEvent) => {
            if (
                event.key.toLowerCase() === "k" &&
                (event.metaKey || event.ctrlKey)
            ) {
                event.preventDefault();
                setOpen((current) => !current);
            }
        };
        document.addEventListener("keydown", toggle);
        return () => document.removeEventListener("keydown", toggle);
    }, []);
    return (
        <>
            <Dialog.Root
                open={open}
                onOpenChange={(next: boolean, _details: ChangeDetails) =>
                    setOpen(next)
                }
            >
                <Dialog.Trigger>Open command menu</Dialog.Trigger>
                <Dialog.Portal>
                    <Dialog.Backdrop />
                    <Dialog.Popup aria-label="Command menu">
                        <Command.Root>
                            <Command.Input aria-label="Command" />
                            <Command.Empty>No results.</Command.Empty>
                            <Command.List>
                                <CommandItems
                                    onRun={(value) => {
                                        setRan(value);
                                        setOpen(false);
                                    }}
                                />
                            </Command.List>
                        </Command.Root>
                    </Dialog.Popup>
                </Dialog.Portal>
            </Dialog.Root>
            <Output values={{ open, ran }} />
        </>
    );
}
