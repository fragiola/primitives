import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Menu } from "../../kit/ui/menu.tsx";
import { Menubar, MenubarTrigger } from "../../kit/ui/menubar.tsx";
import { useMenubarOutput } from "./use-menubar-output.ts";

/** spec/menubar.md, `/menubar/modal` */
export function MenubarModal() {
    const output = useMenubarOutput();
    const [outside, setOutside] = useState<string>();
    return (
        <div className="h-[200vh]">
            <Menubar aria-label="Document" modal>
                <Menu.Root onOpenChange={output.onOpenChange("File")}>
                    <MenubarTrigger>File</MenubarTrigger>
                    <Menu.Portal>
                        <Menu.Positioner sideOffset={4}>
                            <Menu.Popup>
                                <Menu.Item onClick={output.select("Save")}>
                                    Save
                                </Menu.Item>
                                <Menu.Item onClick={output.select("Close")}>
                                    Close
                                </Menu.Item>
                            </Menu.Popup>
                        </Menu.Positioner>
                    </Menu.Portal>
                </Menu.Root>
                <Menu.Root onOpenChange={output.onOpenChange("Edit")}>
                    <MenubarTrigger>Edit</MenubarTrigger>
                    <Menu.Portal>
                        <Menu.Positioner sideOffset={4}>
                            <Menu.Popup>
                                <Menu.Item onClick={output.select("Undo")}>
                                    Undo
                                </Menu.Item>
                            </Menu.Popup>
                        </Menu.Positioner>
                    </Menu.Portal>
                </Menu.Root>
            </Menubar>
            <button
                type="button"
                className="ms-2"
                onClick={() => setOutside("pressed")}
            >
                Outside button
            </button>
            <Output values={{ ...output.values, outside }} />
        </div>
    );
}
