import { Menu } from "@fragiola/primitives-react/menu";
import { useState } from "react";
import { styles } from "./styles.ts";

const SORTS = [
    { value: "name", label: "Name" },
    { value: "date", label: "Date modified" },
    { value: "size", label: "Size" },
];

// A "View" menu of options: Space toggles a checkbox item or checks a radio item and keeps the
// menu open, Enter does it and closes the menu, and a click keeps it open (spec/menu.md).
export default function ViewOptions() {
    const [toolbar, setToolbar] = useState(true);
    const [statusBar, setStatusBar] = useState(false);
    const [sort, setSort] = useState<string | null>("name");
    const sortLabel = SORTS.find((entry) => entry.value === sort)?.label;
    return (
        <div className={styles.stack}>
            <Menu.Root>
                <Menu.Trigger className={styles.trigger}>View</Menu.Trigger>
                <Menu.Portal>
                    <Menu.Positioner
                        sideOffset={4}
                        className={styles.positioner}
                    >
                        <Menu.Popup className={styles.popup}>
                            <Menu.CheckboxItem
                                checked={toolbar}
                                onCheckedChange={setToolbar}
                                className={styles.checkboxItem}
                            >
                                <Menu.CheckboxItemIndicator
                                    className={styles.checkboxItemIndicator}
                                >
                                    ✓
                                </Menu.CheckboxItemIndicator>
                                Show toolbar
                            </Menu.CheckboxItem>
                            <Menu.CheckboxItem
                                checked={statusBar}
                                onCheckedChange={setStatusBar}
                                className={styles.checkboxItem}
                            >
                                <Menu.CheckboxItemIndicator
                                    className={styles.checkboxItemIndicator}
                                >
                                    ✓
                                </Menu.CheckboxItemIndicator>
                                Show status bar
                            </Menu.CheckboxItem>
                            <Menu.Separator className={styles.separator} />
                            <Menu.Group className={styles.group}>
                                <Menu.GroupLabel className={styles.groupLabel}>
                                    Sort by
                                </Menu.GroupLabel>
                                <Menu.RadioGroup
                                    value={sort}
                                    onValueChange={setSort}
                                    className={styles.radioGroup}
                                >
                                    {SORTS.map((entry) => (
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
            <dl className={styles.summary}>
                <dt>Toolbar</dt>
                <dd>{toolbar ? "shown" : "hidden"}</dd>
                <dt>Status bar</dt>
                <dd>{statusBar ? "shown" : "hidden"}</dd>
                <dt>Sorted by</dt>
                <dd>{sortLabel}</dd>
            </dl>
        </div>
    );
}
