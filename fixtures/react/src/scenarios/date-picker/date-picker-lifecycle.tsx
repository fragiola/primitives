import {
    type PlainDate,
    DatePicker as Primitive,
} from "@fragiola/primitives-react/date-picker";
import { useState } from "react";
import { iso } from "../../kit/iso.ts";
import { useLifecycle } from "../../kit/lifecycle.ts";
import { Output } from "../../kit/output.tsx";
import { Calendar, MonthView } from "../../kit/ui/calendar.tsx";
import { DatePicker } from "../../kit/ui/date-picker.tsx";

/** spec/README.md, "The lifecycle scenarios". */
export function DatePickerLifecycle({
    locale,
    cancel,
}: {
    locale?: string;
    cancel?: boolean;
}) {
    const lifecycle = useLifecycle(cancel);
    const [value, setValue] = useState<PlainDate | null>(null);
    return (
        <>
            <Primitive.Root
                value={value}
                onValueChange={setValue}
                onOpenChange={lifecycle.onOpenChange}
                onOpenChangeComplete={lifecycle.onOpenChangeComplete}
                locale={locale}
            >
                <DatePicker.Trigger>
                    Choose date: {iso(value) ?? "none"}
                </DatePicker.Trigger>
                <DatePicker.Portal keepMounted>
                    <DatePicker.Positioner sideOffset={4}>
                        <DatePicker.Popup aria-label="Choose date">
                            <Calendar.Root>
                                <MonthView />
                            </Calendar.Root>
                        </DatePicker.Popup>
                    </DatePicker.Positioner>
                </DatePicker.Portal>
            </Primitive.Root>
            <Output values={lifecycle.values} />
        </>
    );
}
