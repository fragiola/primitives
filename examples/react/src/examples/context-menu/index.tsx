import { ContextMenu } from "@fragiola/primitives-react/context-menu";
import { useState } from "react";
import { styles } from "./styles.ts";

const FILES = ["report.pdf", "notes.txt", "photo.png"];

// A file manager: right-click a file (or long-press it, or focus it and press Shift+F10) to open
// its menu at the pointer; "Share" opens a submenu, and the last action shows below
// (spec/context-menu.md).
export default function FileManager() {
    const [file, setFile] = useState("report.pdf");
    const [status, setStatus] = useState("Right-click a file");
    const act = (action: string) => () => setStatus(`${action}: ${file}`);
    return (
        <div className={styles.stack}>
            <ContextMenu.Root>
                <ContextMenu.Trigger className={styles.trigger}>
                    <span className={styles.heading}>Documents</span>
                    <ul className={styles.files}>
                        {FILES.map((name) => (
                            <li key={name}>
                                <button
                                    type="button"
                                    className={styles.file}
                                    onFocus={() => setFile(name)}
                                    onPointerDown={() => setFile(name)}
                                >
                                    {name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </ContextMenu.Trigger>
                <ContextMenu.Portal>
                    <ContextMenu.Positioner className={styles.positioner}>
                        <ContextMenu.Popup
                            aria-label="File actions"
                            className={styles.popup}
                        >
                            <ContextMenu.Item
                                className={styles.item}
                                onClick={act("Opened")}
                            >
                                Open
                            </ContextMenu.Item>
                            <ContextMenu.Item
                                className={styles.item}
                                onClick={act("Renamed")}
                            >
                                Rename
                            </ContextMenu.Item>
                            <ContextMenu.SubmenuRoot>
                                <ContextMenu.SubmenuTrigger
                                    className={styles.submenuTrigger}
                                >
                                    Share
                                </ContextMenu.SubmenuTrigger>
                                <ContextMenu.Portal>
                                    <ContextMenu.Positioner
                                        className={styles.positioner}
                                    >
                                        <ContextMenu.Popup
                                            className={styles.popup}
                                        >
                                            <ContextMenu.Item
                                                className={styles.item}
                                                onClick={act("Emailed")}
                                            >
                                                Email
                                            </ContextMenu.Item>
                                            <ContextMenu.Item
                                                className={styles.item}
                                                onClick={act("Link copied")}
                                            >
                                                Copy link
                                            </ContextMenu.Item>
                                        </ContextMenu.Popup>
                                    </ContextMenu.Positioner>
                                </ContextMenu.Portal>
                            </ContextMenu.SubmenuRoot>
                            <ContextMenu.Separator
                                className={styles.separator}
                            />
                            <ContextMenu.Item
                                className={styles.item}
                                onClick={act("Deleted")}
                            >
                                Delete
                            </ContextMenu.Item>
                        </ContextMenu.Popup>
                    </ContextMenu.Positioner>
                </ContextMenu.Portal>
            </ContextMenu.Root>
            <p className={styles.status}>{status}</p>
        </div>
    );
}
