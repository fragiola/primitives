import { Fragment, useId, useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Autocomplete } from "../../kit/ui/autocomplete.tsx";
import { PRODUCE, type ProduceGroup } from "./suggestions.ts";

export function AutocompleteGroups() {
    const id = useId();
    const [value, setValue] = useState("");
    return (
        <>
            <Autocomplete.Root
                items={PRODUCE}
                limit={3}
                value={value}
                onValueChange={(next: string) => setValue(next)}
            >
                <div className="flex flex-col gap-1">
                    <label htmlFor={id} className="text-sm font-medium">
                        Produce
                    </label>
                    <Autocomplete.InputGroup>
                        <Autocomplete.Input id={id} />
                    </Autocomplete.InputGroup>
                </div>
                <Autocomplete.Portal>
                    <Autocomplete.Positioner sideOffset={4}>
                        <Autocomplete.Popup>
                            <Autocomplete.Empty>
                                Nothing found.
                            </Autocomplete.Empty>
                            <Autocomplete.List>
                                {(group: ProduceGroup, index: number) => (
                                    <Fragment key={group.label}>
                                        {index > 0 ? (
                                            <Autocomplete.Separator />
                                        ) : null}
                                        <Autocomplete.Group>
                                            <Autocomplete.GroupLabel>
                                                {group.label}
                                            </Autocomplete.GroupLabel>
                                            {group.items.map((item) => (
                                                <Autocomplete.Item
                                                    key={item.value}
                                                    value={item}
                                                >
                                                    {item.label}
                                                </Autocomplete.Item>
                                            ))}
                                        </Autocomplete.Group>
                                    </Fragment>
                                )}
                            </Autocomplete.List>
                        </Autocomplete.Popup>
                    </Autocomplete.Positioner>
                </Autocomplete.Portal>
            </Autocomplete.Root>
            <Output values={{ value }} />
        </>
    );
}
