import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Toggle } from "../../kit/ui/toggle.tsx";
import { ToggleGroup } from "../../kit/ui/toggle-group.tsx";
import { Toolbar } from "../../kit/ui/toolbar.tsx";

/** spec/toolbar.md, `/toolbar/vertical` */
export function ToolbarVertical() {
    const [snap, setSnap] = useState<boolean>();
    const [zoom, setZoom] = useState<string[]>();
    return (
        <>
            <div className="flex items-start gap-2">
                <Toolbar.Root
                    aria-label="Tools"
                    orientation="vertical"
                    loopFocus={false}
                >
                    <Toolbar.Button>Select</Toolbar.Button>
                    <Toolbar.Button>Draw</Toolbar.Button>
                    <Toolbar.Separator />
                    <Toggle onPressedChange={(next: boolean) => setSnap(next)}>
                        Snap
                    </Toggle>
                    <ToggleGroup
                        aria-label="Zoom"
                        onValueChange={(next: string[]) => setZoom(next)}
                    >
                        <Toggle value="fit">Fit</Toggle>
                        <Toggle value="fill">Fill</Toggle>
                    </ToggleGroup>
                </Toolbar.Root>
                <button type="button">After</button>
            </div>
            <Output values={{ snap, zoom: zoom?.join(",") }} />
        </>
    );
}
