import type {
    ChangeDetails,
    OpenChangeDetails,
} from "@fragiola/primitives-react/menu";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Menu } from "../../kit/ui/menu.tsx";

/** spec/menu.md: a view-options menu with checkbox and radio items. */
export function MenuCheckboxRadio() {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState<string>();
    const [toolbar, setToolbar] = useState(true);
    const [statusBar, setStatusBar] = useState(false);
    const [sort, setSort] = useState<string | null>("name");
    return (
        <>
            <Menu.Root
                onOpenChange={(next: boolean, details: OpenChangeDetails) => {
                    setOpen(next);
                    setReason(details.reason);
                }}
            >
                <Menu.Trigger>View</Menu.Trigger>
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
                                <Menu.GroupLabel>Sort by</Menu.GroupLabel>
                                <Menu.RadioGroup
                                    defaultValue="name"
                                    onValueChange={(
                                        value: string | null,
                                        _details: ChangeDetails,
                                    ) => setSort(value)}
                                >
                                    <Menu.RadioItem value="name">
                                        <Menu.RadioItemIndicator>
                                            •
                                        </Menu.RadioItemIndicator>
                                        Name
                                    </Menu.RadioItem>
                                    <Menu.RadioItem value="date">
                                        <Menu.RadioItemIndicator>
                                            •
                                        </Menu.RadioItemIndicator>
                                        Date
                                    </Menu.RadioItem>
                                    <Menu.RadioItem value="size" disabled>
                                        <Menu.RadioItemIndicator>
                                            •
                                        </Menu.RadioItemIndicator>
                                        Size
                                    </Menu.RadioItem>
                                </Menu.RadioGroup>
                            </Menu.Group>
                        </Menu.Popup>
                    </Menu.Positioner>
                </Menu.Portal>
            </Menu.Root>
            <Output
                values={{
                    open,
                    reason,
                    toolbar,
                    "status bar": statusBar,
                    sort,
                }}
            />
        </>
    );
}
