import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Popover } from "../../kit/ui/popover.tsx";

/** spec/popover.md, `/popover/controlled`: the page opens and closes it through `open`. */
export function PopoverControlled() {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button
                type="button"
                className="me-2"
                onClick={() => setOpen(true)}
            >
                Show settings
            </button>
            <Popover.Root open={open} onOpenChange={setOpen}>
                <Popover.Trigger>Settings</Popover.Trigger>
                <Popover.Portal>
                    <Popover.Positioner sideOffset={4}>
                        <Popover.Popup>
                            <Popover.Title>Quick settings</Popover.Title>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                            >
                                Done
                            </button>
                        </Popover.Popup>
                    </Popover.Positioner>
                </Popover.Portal>
            </Popover.Root>
            <Output values={{ open }} />
        </>
    );
}
