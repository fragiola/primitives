import { useLifecycle } from "../../kit/lifecycle.ts";
import { Output } from "../../kit/output.tsx";
import { Select } from "../../kit/ui/select.tsx";
import { FRUIT_ITEMS } from "./fruit-items.ts";

/** spec/README.md, "The lifecycle scenarios". */
export function SelectLifecycle({ cancel }: { cancel?: boolean }) {
    const lifecycle = useLifecycle(cancel);
    return (
        <>
            <div className="flex flex-col items-start gap-2">
                <label htmlFor="fruit" className="text-sm font-medium">
                    Fruit
                </label>
                <Select.Root
                    items={FRUIT_ITEMS}
                    onOpenChange={lifecycle.onOpenChange}
                    onOpenChangeComplete={lifecycle.onOpenChangeComplete}
                >
                    <Select.Trigger id="fruit">
                        <Select.Value placeholder="Choose a fruit" />
                    </Select.Trigger>
                    <Select.Portal keepMounted>
                        <Select.Positioner>
                            <Select.Popup>
                                <Select.List>
                                    {FRUIT_ITEMS.map((item) => (
                                        <Select.Item
                                            key={item.value}
                                            value={item.value}
                                        >
                                            {item.label}
                                        </Select.Item>
                                    ))}
                                </Select.List>
                            </Select.Popup>
                        </Select.Positioner>
                    </Select.Portal>
                </Select.Root>
            </div>
            <Output values={lifecycle.values} />
        </>
    );
}
