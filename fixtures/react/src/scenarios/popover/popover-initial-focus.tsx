import { useRef } from "react";
import { Popover } from "../../kit/ui/popover.tsx";

export function PopoverInitialFocus() {
    const copy = useRef<HTMLButtonElement>(null);
    return (
        <Popover.Root>
            <Popover.Trigger>Share</Popover.Trigger>
            <Popover.Portal>
                <Popover.Positioner sideOffset={4}>
                    <Popover.Popup initialFocus={copy}>
                        <Popover.Title>Share link</Popover.Title>
                        <label className="flex flex-col gap-1">
                            Link
                            <input
                                type="text"
                                className="h-9 rounded-md border border-palette-line px-2"
                            />
                        </label>
                        <button ref={copy} type="button">
                            Copy
                        </button>
                    </Popover.Popup>
                </Popover.Positioner>
            </Popover.Portal>
        </Popover.Root>
    );
}
