import type { OpenChangeDetails } from "@fragiola/primitives-react/drawer";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Drawer } from "../../kit/ui/drawer.tsx";

const ROWS = Array.from({ length: 12 }, (_, index) => index + 1);

/** spec/drawer.md: a bottom sheet, swiped down to close, with a scrollable list. */
export function DrawerBasic() {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState<string>();
    return (
        <>
            <Drawer.Root
                onOpenChange={(next: boolean, details: OpenChangeDetails) => {
                    setOpen(next);
                    setReason(details.reason);
                }}
            >
                <Drawer.Trigger>Open drawer</Drawer.Trigger>
                <Drawer.Portal>
                    <Drawer.Backdrop />
                    <Drawer.Viewport>
                        <Drawer.Popup>
                            <Drawer.Handle />
                            <Drawer.Content>
                                <Drawer.Title>Notifications</Drawer.Title>
                                <Drawer.Description>
                                    You are all caught up.
                                </Drawer.Description>
                                <ul
                                    aria-label="Recent"
                                    // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable region the keyboard reaches
                                    tabIndex={0}
                                    className="h-40 overflow-y-auto rounded-control border border-palette-line"
                                >
                                    {ROWS.map((row) => (
                                        <li key={row} className="px-2 py-1">
                                            {`Notification ${row}`}
                                        </li>
                                    ))}
                                </ul>
                                <Drawer.Close>Close</Drawer.Close>
                            </Drawer.Content>
                        </Drawer.Popup>
                    </Drawer.Viewport>
                </Drawer.Portal>
            </Drawer.Root>
            <button type="button" className="ms-2">
                Outside button
            </button>
            <Output values={{ open, reason }} />
        </>
    );
}
