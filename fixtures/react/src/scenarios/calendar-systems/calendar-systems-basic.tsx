import { useState } from "react";
import { systemOf } from "../../kit/calendar-system.ts";
import { iso, isoMonth } from "../../kit/iso.ts";
import { Output } from "../../kit/output.tsx";
import { Calendar, MonthView } from "../../kit/ui/calendar.tsx";
import { DateField } from "../../kit/ui/date-field.tsx";
import { Field } from "../../kit/ui/field.tsx";
import { MonthCalendar, PageView } from "../../kit/ui/month-calendar.tsx";

const TODAY = { year: 2026, month: 11, day: 20 };

/** spec/calendar-systems.md, `/calendar-systems/basic` */
export function CalendarSystemsBasic({ locale }: { locale?: string }) {
    const calendar = systemOf(locale);
    const [date, setDate] = useState<string>();
    const [field, setField] = useState<string>();
    const [month, setMonth] = useState<string>();
    return (
        <>
            <div className="flex flex-wrap items-start gap-6">
                <Calendar.Root
                    calendar={calendar}
                    locale={locale}
                    defaultValue={TODAY}
                    onValueChange={(value) =>
                        setDate(
                            value !== null && !("start" in value)
                                ? iso(value)
                                : undefined,
                        )
                    }
                >
                    <MonthView />
                </Calendar.Root>
                <div className="flex flex-col gap-4">
                    <Field.Root>
                        <Field.Label>Date</Field.Label>
                        <DateField.Root
                            calendar={calendar}
                            locale={locale}
                            defaultValue={TODAY}
                            onValueChange={(value) =>
                                setField(value === null ? "none" : iso(value))
                            }
                        >
                            <DateField.Input>
                                {(segment) => (
                                    <DateField.Segment
                                        key={segment.index}
                                        segment={segment}
                                    />
                                )}
                            </DateField.Input>
                        </DateField.Root>
                    </Field.Root>
                    <MonthCalendar.Root
                        calendar={calendar}
                        locale={locale}
                        defaultValue={calendar.yearMonthOf(TODAY)}
                        onValueChange={(value) =>
                            setMonth(
                                value !== null && !("start" in value)
                                    ? isoMonth(
                                          value as {
                                              year: number;
                                              month: number;
                                          },
                                      )
                                    : undefined,
                            )
                        }
                    >
                        <PageView prev="Previous year" next="Next year" />
                    </MonthCalendar.Root>
                </div>
            </div>
            <Output values={{ date, field, month }} />
        </>
    );
}
