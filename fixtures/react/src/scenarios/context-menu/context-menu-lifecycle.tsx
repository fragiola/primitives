import { useLifecycle } from "../../kit/lifecycle.ts";
import { Output } from "../../kit/output.tsx";
import { ContextMenu } from "../../kit/ui/context-menu.tsx";

/** spec/README.md, "The lifecycle scenarios". */
export function ContextMenuLifecycle({ cancel }: { cancel?: boolean }) {
    const lifecycle = useLifecycle(cancel);
    return (
        <>
            <ContextMenu.Root
                onOpenChange={lifecycle.onOpenChange}
                onOpenChangeComplete={lifecycle.onOpenChangeComplete}
            >
                <ContextMenu.Trigger className="h-32 w-64">
                    Right-click here
                </ContextMenu.Trigger>
                <ContextMenu.Portal keepMounted>
                    <ContextMenu.Positioner>
                        <ContextMenu.Popup aria-label="Actions">
                            <ContextMenu.Item>Edit</ContextMenu.Item>
                            <ContextMenu.Item>Delete</ContextMenu.Item>
                        </ContextMenu.Popup>
                    </ContextMenu.Positioner>
                </ContextMenu.Portal>
            </ContextMenu.Root>
            <Output values={lifecycle.values} />
        </>
    );
}
