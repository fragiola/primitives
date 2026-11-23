import { Output } from "../../kit/output.tsx";
import { Menu } from "../../kit/ui/menu.tsx";
import { Menubar, MenubarTrigger } from "../../kit/ui/menubar.tsx";
import { useMenubarOutput } from "./use-menubar-output.ts";

/** spec/menubar.md, `/menubar/vertical` */
export function MenubarVertical() {
    const output = useMenubarOutput();
    return (
        <>
            <div className="flex items-start gap-2">
                <Menubar
                    aria-label="Tools"
                    orientation="vertical"
                    loopFocus={false}
                >
                    <Menu.Root onOpenChange={output.onOpenChange("Shapes")}>
                        <MenubarTrigger>Shapes</MenubarTrigger>
                        <Menu.Portal>
                            <Menu.Positioner sideOffset={4}>
                                <Menu.Popup>
                                    <Menu.Item
                                        onClick={output.select("Rectangle")}
                                    >
                                        Rectangle
                                    </Menu.Item>
                                    <Menu.Item
                                        onClick={output.select("Ellipse")}
                                    >
                                        Ellipse
                                    </Menu.Item>
                                </Menu.Popup>
                            </Menu.Positioner>
                        </Menu.Portal>
                    </Menu.Root>
                    <Menu.Root onOpenChange={output.onOpenChange("Arrange")}>
                        <MenubarTrigger>Arrange</MenubarTrigger>
                        <Menu.Portal>
                            <Menu.Positioner sideOffset={4}>
                                <Menu.Popup>
                                    <Menu.Item
                                        onClick={output.select("Bring forward")}
                                    >
                                        Bring forward
                                    </Menu.Item>
                                    <Menu.Item
                                        onClick={output.select("Send backward")}
                                    >
                                        Send backward
                                    </Menu.Item>
                                </Menu.Popup>
                            </Menu.Positioner>
                        </Menu.Portal>
                    </Menu.Root>
                </Menubar>
                <button type="button">After</button>
            </div>
            <Output values={output.values} />
        </>
    );
}
