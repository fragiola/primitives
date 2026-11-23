import type {
    ChangeDetails,
    DateRange,
    PlainDate,
} from "@fragiola/primitives-react/calendar";
import { useState } from "react";
import { iso, isoRange } from "../../kit/iso.ts";
import { Output } from "../../kit/output.tsx";
import { Calendar, MonthView, RangeCalendar } from "../../kit/ui/calendar.tsx";
import { CalendarPreset, PresetList } from "../../kit/ui/calendar-preset.tsx";
import { lastSevenDays, todayPreset } from "./presets.ts";

const MAX: PlainDate = { year: 2026, month: 12, day: 31 };
const CHRISTMAS: PlainDate = { year: 2026, month: 12, day: 25 };
const NEW_YEAR: PlainDate = { year: 2027, month: 1, day: 1 };
const NEXT_WEEK: DateRange = {
    start: { year: 2026, month: 11, day: 23 },
    end: { year: 2026, month: 11, day: 29 },
};

/** spec/calendar.md, `/calendar-preset/basic` */
export function CalendarPresetBasic() {
    const [date, setDate] = useState<PlainDate | null>(null);
    const [reason, setReason] = useState<string>();
    const [range, setRange] = useState<DateRange | null>(null);
    return (
        <>
            <div className="flex flex-wrap gap-8">
                <section aria-label="Date">
                    <Calendar.Root
                        value={date}
                        onValueChange={(
                            next: PlainDate | null,
                            details: ChangeDetails,
                        ) => {
                            setDate(next);
                            setReason(details.reason);
                        }}
                        max={MAX}
                        locale="en-US"
                    >
                        <MonthView />
                        <PresetList>
                            <CalendarPreset value={todayPreset}>
                                Today
                            </CalendarPreset>
                            <CalendarPreset value={CHRISTMAS}>
                                Christmas
                            </CalendarPreset>
                            <CalendarPreset value={NEW_YEAR}>
                                New Year
                            </CalendarPreset>
                        </PresetList>
                    </Calendar.Root>
                </section>
                <section aria-label="Range">
                    <RangeCalendar.Root
                        value={range}
                        onValueChange={setRange}
                        locale="en-US"
                    >
                        <MonthView />
                        <PresetList>
                            <CalendarPreset value={lastSevenDays}>
                                Last 7 days
                            </CalendarPreset>
                            <CalendarPreset value={NEXT_WEEK}>
                                Next week
                            </CalendarPreset>
                        </PresetList>
                    </RangeCalendar.Root>
                </section>
            </div>
            <Output
                values={{ date: iso(date), reason, range: isoRange(range) }}
            />
        </>
    );
}
