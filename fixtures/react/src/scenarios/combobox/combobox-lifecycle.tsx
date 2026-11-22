import { useId } from "react";
import { useLifecycle } from "../../kit/lifecycle.ts";
import { Output } from "../../kit/output.tsx";
import { Combobox } from "../../kit/ui/combobox.tsx";
import { FRUITS, type Fruit } from "./fruits.ts";

/** spec/README.md, "The lifecycle scenarios". */
export function ComboboxLifecycle({ cancel }: { cancel?: boolean }) {
    const lifecycle = useLifecycle(cancel);
    const id = useId();
    return (
        <>
            <Combobox.Root
                items={FRUITS}
                onOpenChange={lifecycle.onOpenChange}
                onOpenChangeComplete={lifecycle.onOpenChangeComplete}
            >
                <div className="flex flex-col gap-1">
                    <label htmlFor={id} className="text-sm font-medium">
                        Fruit
                    </label>
                    <Combobox.InputGroup>
                        <Combobox.Input id={id} />
                        <Combobox.Trigger aria-label="Show fruits">
                            ▾
                        </Combobox.Trigger>
                    </Combobox.InputGroup>
                </div>
                <Combobox.Portal keepMounted>
                    <Combobox.Positioner sideOffset={4}>
                        <Combobox.Popup>
                            <Combobox.Empty>No fruit found.</Combobox.Empty>
                            <Combobox.List>
                                {(fruit: Fruit) => (
                                    <Combobox.Item
                                        key={fruit.value}
                                        value={fruit}
                                        disabled={fruit.disabled}
                                    >
                                        {fruit.label}
                                    </Combobox.Item>
                                )}
                            </Combobox.List>
                        </Combobox.Popup>
                    </Combobox.Positioner>
                </Combobox.Portal>
            </Combobox.Root>
            <Output values={lifecycle.values} />
        </>
    );
}
