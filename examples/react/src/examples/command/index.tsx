import { Command } from "@fragiola/primitives-react/command";
import { Dialog } from "@fragiola/primitives-react/dialog";
import { useEffect, useState } from "react";
import { styles } from "./styles.ts";

const THEMES = ["Light", "Dark", "System"];

// An app's command menu: a Command inside a modal Dialog that Ctrl+K (⌘K) toggles, the app's own
// shortcut (spec/command.md, "The Command dialog"). Typing filters the commands by their names
// and keywords, the arrows move the highlight while focus stays in the input, Enter runs one,
// "Change theme…" opens a nested page that Backspace on the empty input leaves.
export default function CommandMenu() {
    const [open, setOpen] = useState(false);
    const [pages, setPages] = useState<string[]>([]);
    const [ran, setRan] = useState<string | null>(null);
    const page = pages[pages.length - 1];
    useEffect(() => {
        const toggle = (event: KeyboardEvent) => {
            if (
                event.key.toLowerCase() === "k" &&
                (event.metaKey || event.ctrlKey)
            ) {
                event.preventDefault();
                setOpen((current) => !current);
            }
        };
        document.addEventListener("keydown", toggle);
        return () => document.removeEventListener("keydown", toggle);
    }, []);
    const run = (value: string) => {
        setRan(value);
        setOpen(false);
    };
    return (
        <div className={styles.stack}>
            <Dialog.Root
                open={open}
                onOpenChange={(next: boolean) => {
                    setOpen(next);
                    if (!next) setPages([]);
                }}
            >
                <Dialog.Trigger className={styles.trigger}>
                    Open command menu
                </Dialog.Trigger>
                <Dialog.Portal>
                    <Dialog.Backdrop className={styles.backdrop} />
                    <Dialog.Popup
                        aria-label="Command menu"
                        className={styles.popup}
                    >
                        <Command.Root
                            pages={pages}
                            onPagesChange={setPages}
                            className={styles.root}
                        >
                            <Command.Input
                                aria-label="Command"
                                placeholder="Type a command or search…"
                                className={styles.input}
                            />
                            <Command.Empty className={styles.empty}>
                                No results.
                            </Command.Empty>
                            <Command.List className={styles.list}>
                                {page === undefined && (
                                    <>
                                        <Command.Group className={styles.group}>
                                            <Command.GroupLabel
                                                className={styles.groupLabel}
                                            >
                                                Navigation
                                            </Command.GroupLabel>
                                            <Command.Item
                                                value="Home"
                                                onSelect={run}
                                                className={styles.item}
                                            >
                                                Home
                                            </Command.Item>
                                            <Command.Item
                                                value="Settings"
                                                keywords={["preferences"]}
                                                onSelect={run}
                                                className={styles.item}
                                            >
                                                Settings
                                            </Command.Item>
                                            <Command.Item
                                                value="Profile"
                                                keywords={["account"]}
                                                onSelect={run}
                                                className={styles.item}
                                            >
                                                Profile
                                            </Command.Item>
                                        </Command.Group>
                                        <Command.Separator
                                            className={styles.separator}
                                        />
                                        <Command.Group className={styles.group}>
                                            <Command.GroupLabel
                                                className={styles.groupLabel}
                                            >
                                                Actions
                                            </Command.GroupLabel>
                                            <Command.Item
                                                value="Change theme…"
                                                onSelect={() =>
                                                    setPages(["theme"])
                                                }
                                                className={styles.item}
                                            >
                                                Change theme…
                                            </Command.Item>
                                            <Command.Item
                                                value="Copy link"
                                                keywords={["share", "url"]}
                                                onSelect={run}
                                                className={styles.item}
                                            >
                                                Copy link
                                            </Command.Item>
                                            <Command.Item
                                                value="Delete project"
                                                disabled
                                                onSelect={run}
                                                className={styles.item}
                                            >
                                                Delete project
                                            </Command.Item>
                                        </Command.Group>
                                    </>
                                )}
                                {page === "theme" &&
                                    THEMES.map((theme) => (
                                        <Command.Item
                                            key={theme}
                                            value={theme}
                                            onSelect={run}
                                            className={styles.item}
                                        >
                                            {theme}
                                        </Command.Item>
                                    ))}
                            </Command.List>
                        </Command.Root>
                    </Dialog.Popup>
                </Dialog.Portal>
            </Dialog.Root>
            <p className={styles.shortcut}>Or press Ctrl K (⌘K on a Mac).</p>
            <p role="status" className={styles.status}>
                {ran === null ? "" : `Ran: ${ran}`}
            </p>
        </div>
    );
}
