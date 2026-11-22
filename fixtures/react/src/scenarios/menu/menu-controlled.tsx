import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Menu } from "../../kit/ui/menu.tsx";

/** spec/menu.md, `/menu/controlled`: the page also opens it through `open`. */
export function MenuControlled() {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Menu.Root open={open} onOpenChange={setOpen}>
                <Menu.Trigger>Actions</Menu.Trigger>
                <Menu.Portal>
                    <Menu.Positioner sideOffset={4}>
                        <Menu.Popup>
                            <Menu.Item>Edit</Menu.Item>
                            <Menu.Item>Delete</Menu.Item>
                        </Menu.Popup>
                    </Menu.Positioner>
                </Menu.Portal>
            </Menu.Root>
            <button
                type="button"
                className="ms-2"
                onClick={() => setOpen(true)}
            >
                Open from outside
            </button>
            <Output values={{ open }} />
        </>
    );
}
