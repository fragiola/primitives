import { useLifecycle } from "../../kit/lifecycle.ts";
import { Output } from "../../kit/output.tsx";
import { Tooltip } from "../../kit/ui/tooltip.tsx";

/** spec/README.md, "The lifecycle scenarios". */
export function TooltipLifecycle({ cancel }: { cancel?: boolean }) {
    const lifecycle = useLifecycle(cancel);
    return (
        <>
            <div className="mt-12">
                <Tooltip.Root
                    delay={0}
                    onOpenChange={lifecycle.onOpenChange}
                    onOpenChangeComplete={lifecycle.onOpenChangeComplete}
                >
                    <Tooltip.Trigger>Save</Tooltip.Trigger>
                    <Tooltip.Portal keepMounted>
                        <Tooltip.Positioner sideOffset={6}>
                            <Tooltip.Popup>Save the document</Tooltip.Popup>
                        </Tooltip.Positioner>
                    </Tooltip.Portal>
                </Tooltip.Root>
            </div>
            <Output values={lifecycle.values} />
        </>
    );
}
