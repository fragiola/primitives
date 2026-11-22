import type {
    OpenChangeDetails,
    SnapPoint,
} from "@fragiola/primitives-react/drawer";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Drawer } from "../../kit/ui/drawer.tsx";

const SNAP_POINTS: SnapPoint[] = ["200px", 1];

/** spec/drawer.md: a bottom sheet resting at 200 px or all of its 560 px. */
export function DrawerSnapPoints() {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState<string>();
    const [snap, setSnap] = useState<SnapPoint | null>("200px");
    return (
        <>
            <Drawer.Root
                snapPoints={SNAP_POINTS}
                snapPoint={snap}
                onSnapPointChange={setSnap}
                onOpenChange={(next: boolean, details: OpenChangeDetails) => {
                    setOpen(next);
                    setReason(details.reason);
                }}
            >
                <Drawer.Trigger>Open map</Drawer.Trigger>
                <Drawer.Portal>
                    <Drawer.Backdrop />
                    <Drawer.Popup style={{ height: "560px" }}>
                        <Drawer.Title>Map</Drawer.Title>
                        <Drawer.Description>
                            Drag to see more.
                        </Drawer.Description>
                        <Drawer.Close>Close</Drawer.Close>
                    </Drawer.Popup>
                </Drawer.Portal>
            </Drawer.Root>
            <Output values={{ open, reason, snap }} />
        </>
    );
}
