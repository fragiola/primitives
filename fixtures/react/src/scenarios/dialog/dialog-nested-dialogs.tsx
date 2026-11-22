import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Dialog } from "../../kit/ui/dialog.tsx";

/** Three dialogs nested in each other, each with a Backdrop and a Viewport (spec/dialog.md). */
export function DialogNestedDialogs() {
    const [first, setFirst] = useState(false);
    const [second, setSecond] = useState(false);
    const [third, setThird] = useState(false);
    return (
        <>
            <Dialog.Root onOpenChange={setFirst}>
                <Dialog.Trigger>Open first</Dialog.Trigger>
                <Dialog.Portal>
                    <Dialog.Backdrop />
                    <Dialog.Viewport>
                        <Dialog.Popup>
                            <Dialog.Title>First dialog</Dialog.Title>
                            <Dialog.Root onOpenChange={setSecond}>
                                <Dialog.Trigger>Open second</Dialog.Trigger>
                                <Dialog.Portal>
                                    <Dialog.Backdrop />
                                    <Dialog.Viewport>
                                        <Dialog.Popup>
                                            <Dialog.Title>
                                                Second dialog
                                            </Dialog.Title>
                                            <Dialog.Root
                                                onOpenChange={setThird}
                                            >
                                                <Dialog.Trigger>
                                                    Open third
                                                </Dialog.Trigger>
                                                <Dialog.Portal>
                                                    <Dialog.Backdrop />
                                                    <Dialog.Viewport>
                                                        <Dialog.Popup>
                                                            <Dialog.Title>
                                                                Third dialog
                                                            </Dialog.Title>
                                                            <Dialog.Close>
                                                                Close third
                                                            </Dialog.Close>
                                                        </Dialog.Popup>
                                                    </Dialog.Viewport>
                                                </Dialog.Portal>
                                            </Dialog.Root>
                                            <Dialog.Close>
                                                Close second
                                            </Dialog.Close>
                                        </Dialog.Popup>
                                    </Dialog.Viewport>
                                </Dialog.Portal>
                            </Dialog.Root>
                            <Dialog.Close>Close first</Dialog.Close>
                        </Dialog.Popup>
                    </Dialog.Viewport>
                </Dialog.Portal>
            </Dialog.Root>
            <Output values={{ first, second, third }} />
        </>
    );
}
