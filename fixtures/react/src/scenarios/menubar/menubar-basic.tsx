import type { ChangeDetails } from "@fragiola/primitives-react/menu";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Menu } from "../../kit/ui/menu.tsx";
import { Menubar, MenubarTrigger } from "../../kit/ui/menubar.tsx";
import { useMenubarOutput } from "./use-menubar-output.ts";

/** spec/menubar.md, `/menubar/basic` (and `?dir=rtl`) */
export function MenubarBasic() {
    const output = useMenubarOutput();
    const [toolbar, setToolbar] = useState(true);
    const [statusBar, setStatusBar] = useState(false);
    const [theme, setTheme] = useState<string | null>("light");
    return (
        <>
            <div className="flex flex-wrap items-center gap-2">
                <button type="button">Before</button>
                <Menubar aria-label="Application">
                    <Menu.Root onOpenChange={output.onOpenChange("File")}>
                        <MenubarTrigger>File</MenubarTrigger>
                        <Menu.Portal>
                            <Menu.Positioner sideOffset={4}>
                                <Menu.Popup>
                                    <Menu.Item onClick={output.select("New")}>
                                        New
                                    </Menu.Item>
                                    <Menu.Item onClick={output.select("Open")}>
                                        Open
                                    </Menu.Item>
                                    <Menu.SubmenuRoot>
                                        <Menu.SubmenuTrigger>
                                            Share
                                        </Menu.SubmenuTrigger>
                                        <Menu.Portal>
                                            <Menu.Positioner>
                                                <Menu.Popup>
                                                    <Menu.Item
                                                        onClick={output.select(
                                                            "Email",
                                                        )}
                                                    >
                                                        Email
                                                    </Menu.Item>
                                                    <Menu.Item
                                                        onClick={output.select(
                                                            "Link",
                                                        )}
                                                    >
                                                        Link
                                                    </Menu.Item>
                                                </Menu.Popup>
                                            </Menu.Positioner>
                                        </Menu.Portal>
                                    </Menu.SubmenuRoot>
                                    <Menu.Separator />
                                    <Menu.Item onClick={output.select("Print")}>
                                        Print
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
                                    <Menu.Item
                                        disabled
                                        onClick={output.select("Redo")}
                                    >
                                        Redo
                                    </Menu.Item>
                                    <Menu.Item onClick={output.select("Cut")}>
                                        Cut
                                    </Menu.Item>
                                    <Menu.Item onClick={output.select("Copy")}>
                                        Copy
                                    </Menu.Item>
                                </Menu.Popup>
                            </Menu.Positioner>
                        </Menu.Portal>
                    </Menu.Root>
                    <Menu.Root onOpenChange={output.onOpenChange("View")}>
                        <MenubarTrigger>View</MenubarTrigger>
                        <Menu.Portal>
                            <Menu.Positioner sideOffset={4}>
                                <Menu.Popup>
                                    <Menu.CheckboxItem
                                        defaultChecked
                                        onCheckedChange={(checked: boolean) =>
                                            setToolbar(checked)
                                        }
                                    >
                                        <Menu.CheckboxItemIndicator>
                                            ✓
                                        </Menu.CheckboxItemIndicator>
                                        Show toolbar
                                    </Menu.CheckboxItem>
                                    <Menu.CheckboxItem
                                        onCheckedChange={(checked: boolean) =>
                                            setStatusBar(checked)
                                        }
                                    >
                                        <Menu.CheckboxItemIndicator>
                                            ✓
                                        </Menu.CheckboxItemIndicator>
                                        Show status bar
                                    </Menu.CheckboxItem>
                                    <Menu.Separator />
                                    <Menu.Group>
                                        <Menu.GroupLabel>Theme</Menu.GroupLabel>
                                        <Menu.RadioGroup
                                            defaultValue="light"
                                            onValueChange={(
                                                value: string | null,
                                                _details: ChangeDetails,
                                            ) => setTheme(value)}
                                        >
                                            <Menu.RadioItem value="light">
                                                <Menu.RadioItemIndicator>
                                                    •
                                                </Menu.RadioItemIndicator>
                                                Light
                                            </Menu.RadioItem>
                                            <Menu.RadioItem value="dark">
                                                <Menu.RadioItemIndicator>
                                                    •
                                                </Menu.RadioItemIndicator>
                                                Dark
                                            </Menu.RadioItem>
                                        </Menu.RadioGroup>
                                    </Menu.Group>
                                </Menu.Popup>
                            </Menu.Positioner>
                        </Menu.Portal>
                    </Menu.Root>
                    <Menu.Root onOpenChange={output.onOpenChange("Help")}>
                        <MenubarTrigger disabled>Help</MenubarTrigger>
                        <Menu.Portal>
                            <Menu.Positioner sideOffset={4}>
                                <Menu.Popup>
                                    <Menu.Item onClick={output.select("About")}>
                                        About
                                    </Menu.Item>
                                </Menu.Popup>
                            </Menu.Positioner>
                        </Menu.Portal>
                    </Menu.Root>
                </Menubar>
                <button type="button">After</button>
            </div>
            <Output
                values={{
                    ...output.values,
                    toolbar,
                    "status bar": statusBar,
                    theme,
                }}
            />
        </>
    );
}
