import { Dialog } from "../../kit/ui/dialog.tsx";
import { HoverCard } from "../../kit/ui/hover-card.tsx";

export function HoverCardInDialog() {
    return (
        <Dialog.Root>
            <Dialog.Trigger>Open dialog</Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Backdrop />
                <Dialog.Popup>
                    <Dialog.Title>Credits</Dialog.Title>
                    <HoverCard.Root delay={0}>
                        <HoverCard.Trigger href="#ada">@ada</HoverCard.Trigger>
                        <HoverCard.Portal>
                            <HoverCard.Positioner sideOffset={8}>
                                <HoverCard.Popup>Ada Lovelace</HoverCard.Popup>
                            </HoverCard.Positioner>
                        </HoverCard.Portal>
                    </HoverCard.Root>
                    <Dialog.Close>Close</Dialog.Close>
                </Dialog.Popup>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
