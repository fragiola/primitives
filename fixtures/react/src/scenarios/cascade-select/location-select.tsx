import type {
    CascadeItem,
    ChangeDetails,
} from "@fragiola/primitives-react/cascade-select";
import { CascadeSelect } from "../../kit/ui/cascade-select.tsx";
import { LOCATION_ITEMS } from "./location-items.ts";

export interface LocationSelectProps {
    id?: string;
    name?: string;
    required?: boolean;
    changeOnSelect?: boolean;
    defaultValue?: readonly string[];
    separator?: string;
    onValueChange: (value: readonly string[]) => void;
    onOpenChange?: (open: boolean, reason: string) => void;
}

const DEPTHS = [0, 1, 2];

/** The CascadeSelect of the cascade-select scenarios: three Levels side by side. */
export function LocationSelect(props: LocationSelectProps) {
    return (
        <CascadeSelect.Root
            items={LOCATION_ITEMS}
            name={props.name}
            required={props.required}
            changeOnSelect={props.changeOnSelect}
            defaultValue={props.defaultValue}
            onValueChange={(next: readonly string[]) =>
                props.onValueChange(next)
            }
            onOpenChange={(open: boolean, details: ChangeDetails) =>
                props.onOpenChange?.(open, details.reason)
            }
        >
            <CascadeSelect.Trigger id={props.id}>
                <CascadeSelect.Value
                    placeholder="Choose a place"
                    separator={props.separator}
                />
            </CascadeSelect.Trigger>
            <CascadeSelect.Portal>
                <CascadeSelect.Positioner>
                    <CascadeSelect.Popup>
                        {DEPTHS.map((depth) => (
                            <CascadeSelect.Level key={depth} depth={depth}>
                                {(items: readonly CascadeItem[]) =>
                                    items.map((item) => (
                                        <CascadeSelect.Item
                                            key={item.value}
                                            value={item.value}
                                        >
                                            {item.label}
                                            <CascadeSelect.ItemIndicator>
                                                ✓
                                            </CascadeSelect.ItemIndicator>
                                        </CascadeSelect.Item>
                                    ))
                                }
                            </CascadeSelect.Level>
                        ))}
                    </CascadeSelect.Popup>
                </CascadeSelect.Positioner>
            </CascadeSelect.Portal>
        </CascadeSelect.Root>
    );
}
