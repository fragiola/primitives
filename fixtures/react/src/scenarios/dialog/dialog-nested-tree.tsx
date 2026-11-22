import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Dialog } from "../../kit/ui/dialog.tsx";
import { Menu } from "../../kit/ui/menu.tsx";
import { Popover } from "../../kit/ui/popover.tsx";

/** A Dialog, a Popover opened from it, a Menu opened from the popover, a submenu of the menu. */
export function DialogNestedTree() {
    const [dialog, setDialog] = useState(false);
    const [popover, setPopover] = useState(false);
    const [menu, setMenu] = useState(false);
    const [submenu, setSubmenu] = useState(false);
    return (
        <>
            <Dialog.Root onOpenChange={setDialog}>
                <Dialog.Trigger>Open settings</Dialog.Trigger>
                <Dialog.Portal>
                    <Dialog.Backdrop />
                    <Dialog.Popup>
                        <Dialog.Title>Settings</Dialog.Title>
                        <Popover.Root onOpenChange={setPopover}>
                            <Popover.Trigger>Theme options</Popover.Trigger>
                            <Popover.Portal keepMounted>
                                <Popover.Positioner sideOffset={4}>
                                    <Popover.Popup>
                                        <Popover.Title>Theme</Popover.Title>
                                        <Menu.Root onOpenChange={setMenu}>
                                            <Menu.Trigger>
                                                Pick theme
                                            </Menu.Trigger>
                                            <Menu.Portal>
                                                <Menu.Positioner sideOffset={4}>
                                                    <Menu.Popup>
                                                        <Menu.Item>
                                                            Light
                                                        </Menu.Item>
                                                        <Menu.Item>
                                                            Dark
                                                        </Menu.Item>
                                                        <Menu.SubmenuRoot
                                                            onOpenChange={
                                                                setSubmenu
                                                            }
                                                        >
                                                            <Menu.SubmenuTrigger>
                                                                More themes
                                                            </Menu.SubmenuTrigger>
                                                            <Menu.Portal>
                                                                <Menu.Positioner>
                                                                    <Menu.Popup>
                                                                        <Menu.Item>
                                                                            Solarized
                                                                        </Menu.Item>
                                                                        <Menu.Item>
                                                                            Nord
                                                                        </Menu.Item>
                                                                    </Menu.Popup>
                                                                </Menu.Positioner>
                                                            </Menu.Portal>
                                                        </Menu.SubmenuRoot>
                                                    </Menu.Popup>
                                                </Menu.Positioner>
                                            </Menu.Portal>
                                        </Menu.Root>
                                    </Popover.Popup>
                                </Popover.Positioner>
                            </Popover.Portal>
                        </Popover.Root>
                        <Dialog.Close>Close</Dialog.Close>
                    </Dialog.Popup>
                </Dialog.Portal>
            </Dialog.Root>
            <Output values={{ dialog, popover, menu, submenu }} />
        </>
    );
}
