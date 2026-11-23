import {
    buddhist,
    type CalendarSystem,
    coptic,
    ethioaa,
    ethiopic,
    gregory,
    hebrew,
    indian,
    islamicCivil,
    islamicTbla,
    islamicUmalqura,
    japanese,
    persian,
    roc,
} from "@fragiola/primitives/calendar-systems";

const SYSTEMS: readonly CalendarSystem[] = [
    gregory,
    buddhist,
    japanese,
    roc,
    persian,
    indian,
    islamicCivil,
    islamicTbla,
    islamicUmalqura,
    hebrew,
    coptic,
    ethiopic,
    ethioaa,
];

/**
 * The system of a scenario's locale (its `-u-ca-` keyword; spec/calendar-systems.md, "Scenarios"):
 * the fixture maps it, a component never does. Gregorian with none.
 */
export function systemOf(locale: string | undefined): CalendarSystem {
    const id =
        locale === undefined ? undefined : new Intl.Locale(locale).calendar;
    return SYSTEMS.find((system) => system.id === id) ?? gregory;
}
