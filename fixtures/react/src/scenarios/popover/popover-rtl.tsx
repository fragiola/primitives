import { PlacedPopover } from "./placed-popover.tsx";

export function PopoverRtl() {
    return (
        <>
            <p className="my-4">
                <PlacedPopover label="Inline end" side="inline-end" />
            </p>
            <p className="my-4">
                <PlacedPopover label="Left" side="left" />
            </p>
        </>
    );
}
