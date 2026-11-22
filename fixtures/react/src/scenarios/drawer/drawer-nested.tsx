import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Drawer } from "../../kit/ui/drawer.tsx";

/** spec/drawer.md, "Nested drawers": a drawer opened from inside another one. */
export function DrawerNested() {
    const [open, setOpen] = useState(false);
    const [nested, setNested] = useState(false);
    return (
        <>
            <Drawer.Root onOpenChange={setOpen}>
                <Drawer.Trigger>Open order</Drawer.Trigger>
                <Drawer.Portal>
                    <Drawer.Backdrop />
                    <Drawer.Popup>
                        <Drawer.Title>Order</Drawer.Title>
                        <Drawer.Root onOpenChange={setNested}>
                            <Drawer.Trigger>Edit address</Drawer.Trigger>
                            <Drawer.Portal>
                                <Drawer.Backdrop />
                                <Drawer.Popup>
                                    <Drawer.Title>Address</Drawer.Title>
                                    <Drawer.Close>Save address</Drawer.Close>
                                </Drawer.Popup>
                            </Drawer.Portal>
                        </Drawer.Root>
                        <Drawer.Close>Close order</Drawer.Close>
                    </Drawer.Popup>
                </Drawer.Portal>
            </Drawer.Root>
            <Output values={{ open, nested }} />
        </>
    );
}
