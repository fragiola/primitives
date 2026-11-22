import type { OpenChangeDetails } from "@fragiola/primitives-react/context-menu";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { ContextMenu } from "../../kit/ui/context-menu.tsx";

/** spec/context-menu.md: a file area's menu, at the pointer or from the keyboard. */
export function ContextMenuBasic() {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState<string>();
    const [action, setAction] = useState<string>();
    const select = (label: string) => () => setAction(label);
    return (
        <>
            <ContextMenu.Root
                onOpenChange={(next: boolean, details: OpenChangeDetails) => {
                    setOpen(next);
                    setReason(details.reason);
                }}
            >
                <ContextMenu.Trigger className="h-48 w-96">
                    <span>Files</span>
                    <div className="flex gap-2">
                        <button type="button">report.pdf</button>
                        <button type="button">notes.txt</button>
                    </div>
                </ContextMenu.Trigger>
                <ContextMenu.Portal>
                    <ContextMenu.Positioner>
                        <ContextMenu.Popup aria-label="File actions">
                            <ContextMenu.Item onClick={select("Open")}>
                                Open
                            </ContextMenu.Item>
                            <ContextMenu.Item onClick={select("Rename")}>
                                Rename
                            </ContextMenu.Item>
                            <ContextMenu.Separator />
                            <ContextMenu.Item onClick={select("Delete")}>
                                Delete
                            </ContextMenu.Item>
                            <ContextMenu.SubmenuRoot>
                                <ContextMenu.SubmenuTrigger>
                                    Share
                                </ContextMenu.SubmenuTrigger>
                                <ContextMenu.Portal>
                                    <ContextMenu.Positioner>
                                        <ContextMenu.Popup>
                                            <ContextMenu.Item
                                                onClick={select("Email")}
                                            >
                                                Email
                                            </ContextMenu.Item>
                                            <ContextMenu.Item
                                                onClick={select("Link")}
                                            >
                                                Link
                                            </ContextMenu.Item>
                                        </ContextMenu.Popup>
                                    </ContextMenu.Positioner>
                                </ContextMenu.Portal>
                            </ContextMenu.SubmenuRoot>
                        </ContextMenu.Popup>
                    </ContextMenu.Positioner>
                </ContextMenu.Portal>
            </ContextMenu.Root>
            <button type="button" className="mt-2">
                After area
            </button>
            <Output values={{ open, reason, action }} />
        </>
    );
}
