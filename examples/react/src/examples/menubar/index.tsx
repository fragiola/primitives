import { Menu } from "@fragiola/primitives-react/menu";
import { Menubar } from "@fragiola/primitives-react/menubar";
import { useState } from "react";
import { styles } from "./styles.ts";

const RECENT = ["notes.md", "budget.csv", "plan.txt"];

const ZOOMS = [
    { value: "75", label: "75%" },
    { value: "100", label: "100%" },
    { value: "150", label: "150%" },
];

// An app menu bar: File, Edit and View are Menus whose Triggers are the bar's items, one tab
// stop. The arrow keys move between them, ArrowDown opens a menu, and while one is open the
// arrows and the pointer move from menu to menu; "Open recent" is a submenu, and View holds
// checkbox and radio items (spec/menubar.md).
export default function AppMenubar() {
    const [last, setLast] = useState("none");
    const [ruler, setRuler] = useState(true);
    const [wrap, setWrap] = useState(false);
    const [zoom, setZoom] = useState<string | null>("100");
    const run = (command: string) => () => setLast(command);
    return (
        <div className={styles.stack}>
            <Menubar aria-label="Application" className={styles.bar}>
                <Menu.Root>
                    <Menu.Trigger className={styles.trigger}>File</Menu.Trigger>
                    <Menu.Portal>
                        <Menu.Positioner
                            sideOffset={4}
                            className={styles.positioner}
                        >
                            <Menu.Popup className={styles.popup}>
                                <Menu.Item
                                    onClick={run("New file")}
                                    className={styles.item}
                                >
                                    New file
                                </Menu.Item>
                                <Menu.SubmenuRoot>
                                    <Menu.SubmenuTrigger
                                        className={styles.submenuTrigger}
                                    >
                                        Open recent
                                    </Menu.SubmenuTrigger>
                                    <Menu.Portal>
                                        <Menu.Positioner
                                            className={styles.positioner}
                                        >
                                            <Menu.Popup
                                                className={styles.popup}
                                            >
                                                {RECENT.map((file) => (
                                                    <Menu.Item
                                                        key={file}
                                                        onClick={run(
                                                            `Open ${file}`,
                                                        )}
                                                        className={styles.item}
                                                    >
                                                        {file}
                                                    </Menu.Item>
                                                ))}
                                            </Menu.Popup>
                                        </Menu.Positioner>
                                    </Menu.Portal>
                                </Menu.SubmenuRoot>
                                <Menu.Separator className={styles.separator} />
                                <Menu.Item
                                    onClick={run("Save")}
                                    className={styles.item}
                                >
                                    Save
                                </Menu.Item>
                                <Menu.Item disabled className={styles.item}>
                                    Export
                                </Menu.Item>
                            </Menu.Popup>
                        </Menu.Positioner>
                    </Menu.Portal>
                </Menu.Root>
                <Menu.Root>
                    <Menu.Trigger className={styles.trigger}>Edit</Menu.Trigger>
                    <Menu.Portal>
                        <Menu.Positioner
                            sideOffset={4}
                            className={styles.positioner}
                        >
                            <Menu.Popup className={styles.popup}>
                                <Menu.Item
                                    onClick={run("Undo")}
                                    className={styles.item}
                                >
                                    Undo
                                </Menu.Item>
                                <Menu.Item
                                    onClick={run("Redo")}
                                    className={styles.item}
                                >
                                    Redo
                                </Menu.Item>
                                <Menu.Separator className={styles.separator} />
                                <Menu.Item
                                    onClick={run("Cut")}
                                    className={styles.item}
                                >
                                    Cut
                                </Menu.Item>
                                <Menu.Item
                                    onClick={run("Copy")}
                                    className={styles.item}
                                >
                                    Copy
                                </Menu.Item>
                                <Menu.Item
                                    onClick={run("Paste")}
                                    className={styles.item}
                                >
                                    Paste
                                </Menu.Item>
                            </Menu.Popup>
                        </Menu.Positioner>
                    </Menu.Portal>
                </Menu.Root>
                <Menu.Root>
                    <Menu.Trigger className={styles.trigger}>View</Menu.Trigger>
                    <Menu.Portal>
                        <Menu.Positioner
                            sideOffset={4}
                            className={styles.positioner}
                        >
                            <Menu.Popup className={styles.popup}>
                                <Menu.CheckboxItem
                                    checked={ruler}
                                    onCheckedChange={setRuler}
                                    className={styles.checkboxItem}
                                >
                                    <Menu.CheckboxItemIndicator
                                        className={styles.checkboxItemIndicator}
                                    >
                                        ✓
                                    </Menu.CheckboxItemIndicator>
                                    Show ruler
                                </Menu.CheckboxItem>
                                <Menu.CheckboxItem
                                    checked={wrap}
                                    onCheckedChange={setWrap}
                                    className={styles.checkboxItem}
                                >
                                    <Menu.CheckboxItemIndicator
                                        className={styles.checkboxItemIndicator}
                                    >
                                        ✓
                                    </Menu.CheckboxItemIndicator>
                                    Word wrap
                                </Menu.CheckboxItem>
                                <Menu.Separator className={styles.separator} />
                                <Menu.Group className={styles.group}>
                                    <Menu.GroupLabel
                                        className={styles.groupLabel}
                                    >
                                        Zoom
                                    </Menu.GroupLabel>
                                    <Menu.RadioGroup
                                        value={zoom}
                                        onValueChange={setZoom}
                                        className={styles.radioGroup}
                                    >
                                        {ZOOMS.map((entry) => (
                                            <Menu.RadioItem
                                                key={entry.value}
                                                value={entry.value}
                                                className={styles.radioItem}
                                            >
                                                <Menu.RadioItemIndicator
                                                    className={
                                                        styles.radioItemIndicator
                                                    }
                                                >
                                                    •
                                                </Menu.RadioItemIndicator>
                                                {entry.label}
                                            </Menu.RadioItem>
                                        ))}
                                    </Menu.RadioGroup>
                                </Menu.Group>
                            </Menu.Popup>
                        </Menu.Positioner>
                    </Menu.Portal>
                </Menu.Root>
            </Menubar>
            <dl className={styles.summary}>
                <dt>Last command</dt>
                <dd>{last}</dd>
                <dt>Ruler</dt>
                <dd>{ruler ? "shown" : "hidden"}</dd>
                <dt>Word wrap</dt>
                <dd>{wrap ? "on" : "off"}</dd>
                <dt>Zoom</dt>
                <dd>{zoom}%</dd>
            </dl>
        </div>
    );
}
