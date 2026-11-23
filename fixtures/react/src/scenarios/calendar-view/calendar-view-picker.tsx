import {
    type ChangeDetails,
    type PlainDate,
    DatePicker as Primitive,
} from "@fragiola/primitives-react/date-picker";
import { useState } from "react";
import { iso } from "../../kit/iso.ts";
import { Output } from "../../kit/output.tsx";
import { Calendar } from "../../kit/ui/calendar.tsx";
import { CalendarPreset, PresetList } from "../../kit/ui/calendar-preset.tsx";
import { CalendarViews } from "../../kit/ui/calendar-view.tsx";
import { DatePicker } from "../../kit/ui/date-picker.tsx";
import { todayPreset } from "../calendar-preset/presets.ts";

const MIN: PlainDate = { year: 2025, month: 6, day: 15 };
const MAX: PlainDate = { year: 2028, month: 2, day: 10 };

/** spec/month-calendar.md, `/calendar-view/picker` */
export function CalendarViewPicker() {
    const [value, setValue] = useState<PlainDate | null>(null);
    const [reason, setReason] = useState<string>();
    return (
        <>
            <Primitive.Root
                value={value}
                onValueChange={setValue}
                onOpenChange={(_open: boolean, details: ChangeDetails) =>
                    setReason(details.reason)
                }
                min={MIN}
                max={MAX}
                locale="en-US"
            >
                <DatePicker.Trigger>
                    Choose date: {iso(value) ?? "none"}
                </DatePicker.Trigger>
                <DatePicker.Portal>
                    <DatePicker.Positioner sideOffset={4}>
                        <DatePicker.Popup aria-label="Choose date">
                            <Calendar.Root>
                                <CalendarViews
                                    footer={
                                        <PresetList>
                                            <CalendarPreset value={todayPreset}>
                                                Today
                                            </CalendarPreset>
                                        </PresetList>
                                    }
                                />
                            </Calendar.Root>
                        </DatePicker.Popup>
                    </DatePicker.Positioner>
                </DatePicker.Portal>
            </Primitive.Root>
            <Output values={{ value: iso(value), reason }} />
        </>
    );
}
