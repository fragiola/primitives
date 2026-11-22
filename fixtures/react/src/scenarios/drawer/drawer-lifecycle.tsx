import type { OverlayActions } from "@fragiola/primitives-react/drawer";
import { useRef } from "react";
import { useLifecycle } from "../../kit/lifecycle.ts";
import { Output } from "../../kit/output.tsx";
import { Drawer } from "../../kit/ui/drawer.tsx";

/** spec/README.md, "The lifecycle scenarios". */
export function DrawerLifecycle({ cancel }: { cancel?: boolean }) {
    const lifecycle = useLifecycle(cancel);
    const actions = useRef<OverlayActions>(null);
    return (
        <>
            <Drawer.Root
                actionsRef={actions}
                onOpenChange={lifecycle.onOpenChange}
                onOpenChangeComplete={lifecycle.onOpenChangeComplete}
            >
                <Drawer.Trigger>Open drawer</Drawer.Trigger>
                <Drawer.Portal keepMounted>
                    <Drawer.Backdrop />
                    <Drawer.Popup>
                        <Drawer.Title>Lifecycle</Drawer.Title>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => actions.current?.close()}
                            >
                                Close with actions
                            </button>
                            <Drawer.Close>Close</Drawer.Close>
                        </div>
                    </Drawer.Popup>
                </Drawer.Portal>
            </Drawer.Root>
            <Output values={lifecycle.values} />
        </>
    );
}
