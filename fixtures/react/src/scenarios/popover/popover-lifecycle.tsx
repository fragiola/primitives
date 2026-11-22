import type { OverlayActions } from "@fragiola/primitives-react/popover";
import { useRef } from "react";
import { useLifecycle } from "../../kit/lifecycle.ts";
import { Output } from "../../kit/output.tsx";
import { Popover } from "../../kit/ui/popover.tsx";

/** spec/README.md, "The lifecycle scenarios". */
export function PopoverLifecycle({ cancel }: { cancel?: boolean }) {
    const lifecycle = useLifecycle(cancel);
    const actions = useRef<OverlayActions>(null);
    return (
        <>
            <Popover.Root
                actionsRef={actions}
                onOpenChange={lifecycle.onOpenChange}
                onOpenChangeComplete={lifecycle.onOpenChangeComplete}
            >
                <Popover.Trigger>Open popover</Popover.Trigger>
                <Popover.Portal keepMounted>
                    <Popover.Positioner sideOffset={4}>
                        <Popover.Popup>
                            <Popover.Title>Lifecycle</Popover.Title>
                            <button
                                type="button"
                                onClick={() => actions.current?.close()}
                            >
                                Close with actions
                            </button>
                            <Popover.Close>Close</Popover.Close>
                        </Popover.Popup>
                    </Popover.Positioner>
                </Popover.Portal>
            </Popover.Root>
            <Output values={lifecycle.values} />
        </>
    );
}
