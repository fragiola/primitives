import type { OpenChangeDetails } from "@fragiola/primitives-react/menu";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Menu } from "../../kit/ui/menu.tsx";

const PEOPLE = ["Ada", "Grace", "Alan"];

/** One Menu opened from three rows, each Trigger with the row's name as its payload. */
export function MenuDetached() {
    const [handle] = useState(() => Menu.createHandle<string>());
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState<string>();
    const [trigger, setTrigger] = useState<string>();
    const [chosen, setChosen] = useState<string>();
    return (
        <>
            <ul className="flex flex-col gap-28">
                {PEOPLE.map((name) => (
                    <li key={name} className="flex items-center gap-2">
                        <span className="w-16">{name}</span>
                        <Menu.Trigger
                            handle={handle}
                            payload={name}
                            id={`actions-${name.toLowerCase()}`}
                        >
                            {`Actions for ${name}`}
                        </Menu.Trigger>
                    </li>
                ))}
            </ul>
            <Menu.Root
                handle={handle}
                onOpenChange={(next: boolean, details: OpenChangeDetails) => {
                    setOpen(next);
                    setReason(details.reason);
                    setTrigger(details.trigger?.id);
                }}
            >
                {({ payload }: { payload: string | undefined }) => (
                    <Menu.Portal>
                        <Menu.Positioner sideOffset={4}>
                            <Menu.Popup>
                                <Menu.Item
                                    onClick={() =>
                                        setChosen(`Rename ${payload}`)
                                    }
                                >
                                    {`Rename ${payload}`}
                                </Menu.Item>
                                <Menu.Item
                                    onClick={() =>
                                        setChosen(`Delete ${payload}`)
                                    }
                                >
                                    {`Delete ${payload}`}
                                </Menu.Item>
                            </Menu.Popup>
                        </Menu.Positioner>
                    </Menu.Portal>
                )}
            </Menu.Root>
            <Output values={{ open, reason, trigger, chosen }} />
        </>
    );
}
