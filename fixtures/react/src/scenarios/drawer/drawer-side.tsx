import type { OpenChangeDetails } from "@fragiola/primitives-react/drawer";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Drawer } from "../../kit/ui/drawer.tsx";

/** spec/drawer.md: a side panel at the right edge, swiped right to close. */
export function DrawerSide() {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState<string>();
    return (
        <>
            <Drawer.Root
                swipeDirection="right"
                onOpenChange={(next: boolean, details: OpenChangeDetails) => {
                    setOpen(next);
                    setReason(details.reason);
                }}
            >
                <Drawer.Trigger>Open settings</Drawer.Trigger>
                <Drawer.Portal>
                    <Drawer.Backdrop />
                    <Drawer.Popup>
                        <Drawer.Title>Settings</Drawer.Title>
                        <Drawer.Description>
                            Choose what you see.
                        </Drawer.Description>
                        <Drawer.Close>Done</Drawer.Close>
                    </Drawer.Popup>
                </Drawer.Portal>
            </Drawer.Root>
            <Output values={{ open, reason }} />
        </>
    );
}
