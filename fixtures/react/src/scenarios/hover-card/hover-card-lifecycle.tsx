import { useLifecycle } from "../../kit/lifecycle.ts";
import { Output } from "../../kit/output.tsx";
import { HoverCard } from "../../kit/ui/hover-card.tsx";

/** spec/README.md, "The lifecycle scenarios". */
export function HoverCardLifecycle({ cancel }: { cancel?: boolean }) {
    const lifecycle = useLifecycle(cancel);
    return (
        <>
            <p>
                <HoverCard.Root
                    delay={0}
                    closeDelay={0}
                    onOpenChange={lifecycle.onOpenChange}
                    onOpenChangeComplete={lifecycle.onOpenChangeComplete}
                >
                    <HoverCard.Trigger href="#ada">@ada</HoverCard.Trigger>
                    <HoverCard.Portal keepMounted>
                        <HoverCard.Positioner sideOffset={8}>
                            <HoverCard.Popup>Ada Lovelace</HoverCard.Popup>
                        </HoverCard.Positioner>
                    </HoverCard.Portal>
                </HoverCard.Root>
            </p>
            <Output values={lifecycle.values} />
        </>
    );
}
