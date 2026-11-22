import { useLifecycle } from "../../kit/lifecycle.ts";
import { Output } from "../../kit/output.tsx";
import { Menu } from "../../kit/ui/menu.tsx";

/** spec/README.md, "The lifecycle scenarios". */
export function MenuLifecycle({ cancel }: { cancel?: boolean }) {
    const lifecycle = useLifecycle(cancel);
    return (
        <>
            <Menu.Root
                onOpenChange={lifecycle.onOpenChange}
                onOpenChangeComplete={lifecycle.onOpenChangeComplete}
            >
                <Menu.Trigger>Actions</Menu.Trigger>
                <Menu.Portal keepMounted>
                    <Menu.Positioner sideOffset={4}>
                        <Menu.Popup>
                            <Menu.Item>Edit</Menu.Item>
                            <Menu.Item>Delete</Menu.Item>
                        </Menu.Popup>
                    </Menu.Positioner>
                </Menu.Portal>
            </Menu.Root>
            <Output values={lifecycle.values} />
        </>
    );
}
