import { Menu } from "@fragiola/primitives-react/menu";
import { styles } from "./styles.ts";

// A "File" menu button: the arrow keys move through the items (a disabled one stays focusable),
// ArrowRight opens the "Share" submenu, Escape closes one level and an item closes them all.
export default function FileMenu() {
    return (
        <Menu.Root>
            <Menu.Trigger className={styles.trigger}>File</Menu.Trigger>
            <Menu.Portal>
                <Menu.Positioner sideOffset={4} className={styles.positioner}>
                    <Menu.Popup className={styles.popup}>
                        <Menu.Item className={styles.item}>New file</Menu.Item>
                        <Menu.Item className={styles.item}>Open…</Menu.Item>
                        <Menu.SubmenuRoot>
                            <Menu.SubmenuTrigger
                                className={styles.submenuTrigger}
                            >
                                Share
                            </Menu.SubmenuTrigger>
                            <Menu.Portal>
                                <Menu.Positioner className={styles.positioner}>
                                    <Menu.Popup className={styles.popup}>
                                        <Menu.Item className={styles.item}>
                                            Email
                                        </Menu.Item>
                                        <Menu.Item className={styles.item}>
                                            Copy link
                                        </Menu.Item>
                                    </Menu.Popup>
                                </Menu.Positioner>
                            </Menu.Portal>
                        </Menu.SubmenuRoot>
                        <Menu.Separator className={styles.separator} />
                        <Menu.Item disabled className={styles.item}>
                            Export
                        </Menu.Item>
                        <Menu.Item className={styles.item}>Rename</Menu.Item>
                    </Menu.Popup>
                </Menu.Positioner>
            </Menu.Portal>
        </Menu.Root>
    );
}
