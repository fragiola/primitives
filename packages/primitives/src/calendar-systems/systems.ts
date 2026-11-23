import { createCalendarSystem } from "./calendar-system.ts";
import { toEpochDay } from "./epoch-day.ts";
import { intlEngine } from "./intl-engine.ts";
import { isoEngine } from "./iso-engine.ts";
import { japaneseEras } from "./japanese-eras.ts";

// One export per system (spec/calendar-systems.md, "Systems"), each a pure call: an app bundles
// only the systems it imports.

const AD = () => [
    { start: toEpochDay({ year: 1, month: 1, day: 1 }), year: 1 },
];

/** The Gregorian calendar (`gregory`): eras BC and AD. */
export const gregory = /* @__PURE__ */ createCalendarSystem(
    /* @__PURE__ */ isoEngine("gregory", 0, AD, true),
);

/** The Thai Buddhist calendar (`buddhist`): the ISO year + 543, era BE. */
export const buddhist = /* @__PURE__ */ createCalendarSystem(
    /* @__PURE__ */ isoEngine(
        "buddhist",
        543,
        () => [{ start: Number.NEGATIVE_INFINITY, year: 1 }],
        false,
    ),
);

/** The Republic of China calendar (`roc`): the ISO year − 1911, eras before R.O.C. and Minguo. */
export const roc = /* @__PURE__ */ createCalendarSystem(
    /* @__PURE__ */ isoEngine(
        "roc",
        -1911,
        () => [
            { start: toEpochDay({ year: 1912, month: 1, day: 1 }), year: 1 },
        ],
        true,
    ),
);

/** The Japanese imperial calendar (`japanese`): the ISO year in eras from Meiji on. */
export const japanese = /* @__PURE__ */ createCalendarSystem(
    /* @__PURE__ */ isoEngine("japanese", 0, japaneseEras, false),
);

/** The Persian (Solar Hijri) calendar (`persian`). */
export const persian = /* @__PURE__ */ createCalendarSystem(
    /* @__PURE__ */ intlEngine("persian", 12),
);

/** The Indian national (Saka) calendar (`indian`). */
export const indian = /* @__PURE__ */ createCalendarSystem(
    /* @__PURE__ */ intlEngine("indian", 12),
);

/** The tabular Islamic calendar, civil epoch (`islamic-civil`). */
export const islamicCivil = /* @__PURE__ */ createCalendarSystem(
    /* @__PURE__ */ intlEngine("islamic-civil", 12),
);

/** The tabular Islamic calendar, astronomical epoch (`islamic-tbla`). */
export const islamicTbla = /* @__PURE__ */ createCalendarSystem(
    /* @__PURE__ */ intlEngine("islamic-tbla", 12),
);

/** The Islamic Umm al-Qura calendar of Saudi Arabia (`islamic-umalqura`). */
export const islamicUmalqura = /* @__PURE__ */ createCalendarSystem(
    /* @__PURE__ */ intlEngine("islamic-umalqura", 12),
);

/** The Hebrew calendar (`hebrew`): 12 or 13 months, Adar I the leap month (6). */
export const hebrew = /* @__PURE__ */ createCalendarSystem(
    /* @__PURE__ */ intlEngine("hebrew", "hebrew", 6),
);

/** The Coptic calendar (`coptic`): 13 months. */
export const coptic = /* @__PURE__ */ createCalendarSystem(
    /* @__PURE__ */ intlEngine("coptic", 13),
);

/** The Ethiopic calendar, Amete Mihret (`ethiopic`): 13 months. */
export const ethiopic = /* @__PURE__ */ createCalendarSystem(
    /* @__PURE__ */ intlEngine("ethiopic", 13),
);

/** The Ethiopic calendar, Amete Alem (`ethioaa`): 13 months. */
export const ethioaa = /* @__PURE__ */ createCalendarSystem(
    /* @__PURE__ */ intlEngine("ethioaa", 13),
);
