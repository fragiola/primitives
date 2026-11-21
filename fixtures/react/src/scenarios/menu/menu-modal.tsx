import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Menu } from "../../kit/ui/menu.tsx";
import { useMenuOutput } from "./use-menu-output.ts";

export function MenuModal() {
    const menu = useMenuOutput();
    const [outside, setOutside] = useState<string>();
    return (
        <div className="h-[200vh]">
            <Menu.Root
                modal
                open={menu.values.open}
                onOpenChange={menu.onOpenChange}
            >
                <Menu.Trigger>Options</Menu.Trigger>
                <Menu.Portal>
                    <Menu.Positioner sideOffset={4}>
                        <Menu.Popup>
                            <Menu.Item onClick={menu.select("Rename")}>
                                Rename
                            </Menu.Item>
                            <Menu.Item onClick={menu.select("Remove")}>
                                Remove
                            </Menu.Item>
                        </Menu.Popup>
                    </Menu.Positioner>
                </Menu.Portal>
            </Menu.Root>
            <button
                type="button"
                className="ms-2"
                onClick={() => setOutside("pressed")}
            >
                Outside button
            </button>
            <Output values={{ ...menu.values, outside }} />
        </div>
    );
}
