import { Popover } from "@fragiola/primitives-react/popover";
import { popover } from "examples-shared/recipes/popover";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Toggle } from "../../kit/ui/toggle.tsx";
import { ToggleGroup } from "../../kit/ui/toggle-group.tsx";
import { Toolbar } from "../../kit/ui/toolbar.tsx";

/** spec/toolbar.md, `/toolbar/overlay` */
export function ToolbarOverlay() {
    const [align, setAlign] = useState<string[]>();
    return (
        <>
            <div className="flex flex-wrap items-center gap-2">
                <Toolbar.Root aria-label="Formatting">
                    <Toolbar.Button>Undo</Toolbar.Button>
                    <Popover.Root>
                        <Popover.Trigger render={<Toolbar.Button />}>
                            More
                        </Popover.Trigger>
                        <Popover.Portal>
                            <Popover.Positioner
                                sideOffset={4}
                                className={popover.positioner}
                            >
                                <Popover.Popup className={popover.popup}>
                                    <ToggleGroup
                                        aria-label="Alignment"
                                        onValueChange={(next: string[]) =>
                                            setAlign(next)
                                        }
                                    >
                                        <Toggle value="left">Left</Toggle>
                                        <Toggle value="center">Center</Toggle>
                                    </ToggleGroup>
                                    <Toggle>Wrap</Toggle>
                                </Popover.Popup>
                            </Popover.Positioner>
                        </Popover.Portal>
                    </Popover.Root>
                </Toolbar.Root>
                <button type="button">After</button>
            </div>
            <Output values={{ align: align?.join(",") }} />
        </>
    );
}
