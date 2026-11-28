// The date rows' size budgets (Epic #88, Issue #87), read by `pnpm size` (scripts/size-report.ts),
// which fails when an entry's "min + gzip" (the toolkit bundled) is over its budget, and writes
// them in docs/size.md ("Date budgets"). Every date entry is budgeted for an app that passes no
// `calendar` and no `timeZone` (the size report's own measure: neither `/calendar-systems` nor
// `/time-zone` is in any entry): its size at 8072819 (before Epic #82's calendar systems and time
// zones) plus `DATE_ALLOWANCE`, or, where that cannot be met, the best size measured and the
// reason (docs/decisions.md, "Date family size"). A change that grows a budgeted entry past its
// budget is a decision to record here, with its reason, not a number to bump.

/** One entry's budget, in bytes of the report's "min + gzip". */
export interface SizeBudget {
    /** Its size at 8072819. */
    readonly before: number;
    /** The most it may be (`pnpm size` allows zlib's slack, `GZIP_TOLERANCE.bytes`, over it). */
    readonly budget: number;
    /** Why it is over `before + DATE_ALLOWANCE`, when it is. */
    readonly reason?: string;
}

/** What a date entry may grow by over its size at 8072819 (Epic #88). */
export const DATE_ALLOWANCE = 100;

const SEGMENTS =
    "the calls of the calendar's and the zone's hooks (one per concern: format, range, sample, values, dates; Intl options, zone text) and the era and zone segment types";
const FIELD =
    "`/segments` (above) and the field's `calendar`, `timeZone`, `hideTimeZone` and `disambiguation` props";
const FIELD_ANGULAR =
    "`/segments` (above) and the Ivy input metadata of DateField's four system inputs, in the date-field entry every field is built on";
const PICKER_INPUT =
    "`/segments` (above), the field's system props and the day calendar it opens (below)";
const PICKER_INPUT_ANGULAR =
    "`/segments` (above), the date field, date picker and day calendar entries it is built on (below) and its three zone inputs' Ivy metadata";
const DAY =
    "the ISO month math a `calendar` replaces (one object of eight `/date` functions) and the `calendar` prop";
const DAY_ANGULAR = `${DAY}, with its input's Ivy metadata`;
const DATE_PICKER_ANGULAR =
    "the day calendar entry it is built on (above) and its `calendar` input's Ivy metadata";
const MONTH =
    "the ISO months or years a `calendar`'s units replace (one object per kind: paging, names, today) and the `calendar` prop";
const MONTH_ANGULAR = `${MONTH}, with its input's Ivy metadata`;
const MONTH_PICKER_ANGULAR =
    "the month calendar, date picker and day calendar entries it is built on (above)";
const VIEW =
    "the day and month calendars it is built on (above) and its calendar system branch";

const FOCUS_GATE =
    "since Epic #128, the focus gate of a calendar in a picker (the binding's `layered`, the context's `focusReady`): its focus waits for the popup to be a layer, so a picker inside a Dialog keeps it";
export const SIZE_BUDGETS: Readonly<Record<string, SizeBudget>> = {
    "@fragiola/primitives/date": { before: 1624, budget: 1724 },
    "@fragiola/primitives/month-year": { before: 772, budget: 872 },
    "@fragiola/primitives/segments": {
        before: 3277,
        budget: 3447,
        reason: SEGMENTS,
    },
    "@fragiola/primitives/time": { before: 1230, budget: 1330 },
    "@fragiola/primitives-react/calendar": {
        before: 4973,
        budget: 5159,
        reason: `${DAY}; ${FOCUS_GATE}`,
    },
    "@fragiola/primitives-react/calendar-preset": {
        before: 5240,
        budget: 5429,
        reason: `${DAY}; ${FOCUS_GATE}`,
    },
    "@fragiola/primitives-react/calendar-view": {
        before: 7653,
        budget: 8094,
        reason: `${VIEW}; ${FOCUS_GATE}`,
    },
    "@fragiola/primitives-react/date-field": {
        before: 8280,
        budget: 8538,
        reason: FIELD,
    },
    "@fragiola/primitives-react/date-picker": { before: 14235, budget: 14335 },
    "@fragiola/primitives-react/date-picker-input": {
        before: 20388,
        budget: 20730,
        reason: `${PICKER_INPUT}; ${FOCUS_GATE}`,
    },
    "@fragiola/primitives-react/date-range-field": {
        before: 8787,
        budget: 9039,
        reason: FIELD,
    },
    "@fragiola/primitives-react/date-range-picker": {
        before: 14242,
        budget: 14342,
    },
    "@fragiola/primitives-react/date-range-picker-input": {
        before: 20509,
        budget: 20850,
        reason: `${PICKER_INPUT}; ${FOCUS_GATE}`,
    },
    "@fragiola/primitives-react/month-calendar": {
        before: 4489,
        budget: 4664,
        reason: `${MONTH}; ${FOCUS_GATE}`,
    },
    "@fragiola/primitives-react/month-picker": { before: 14524, budget: 14624 },
    "@fragiola/primitives-react/month-range-calendar": {
        before: 4520,
        budget: 4697,
        reason: `${MONTH}; ${FOCUS_GATE}`,
    },
    "@fragiola/primitives-react/month-range-picker": {
        before: 14534,
        budget: 14634,
    },
    "@fragiola/primitives-react/multiple-calendar": {
        before: 5514,
        budget: 5709,
        reason: `${DAY}; ${FOCUS_GATE}`,
    },
    "@fragiola/primitives-react/range-calendar": {
        before: 4978,
        budget: 5164,
        reason: `${DAY}; ${FOCUS_GATE}`,
    },
    "@fragiola/primitives-react/time-field": {
        before: 8243,
        budget: 8508,
        reason: FIELD,
    },
    "@fragiola/primitives-react/time-range-field": {
        before: 8754,
        budget: 9010,
        reason: FIELD,
    },
    "@fragiola/primitives-react/year-calendar": {
        before: 4520,
        budget: 4696,
        reason: `${MONTH}; ${FOCUS_GATE}`,
    },
    "@fragiola/primitives-react/year-picker": { before: 14524, budget: 14624 },
    "@fragiola/primitives-react/year-range-calendar": {
        before: 4529,
        budget: 4705,
        reason: `${MONTH}; ${FOCUS_GATE}`,
    },
    "@fragiola/primitives-react/year-range-picker": {
        before: 14534,
        budget: 14634,
    },
    "@fragiola/primitives-vue/calendar": {
        before: 5036,
        budget: 5212,
        reason: `${DAY}; ${FOCUS_GATE}`,
    },
    "@fragiola/primitives-vue/calendar-preset": {
        before: 5292,
        budget: 5473,
        reason: `${DAY}; ${FOCUS_GATE}`,
    },
    "@fragiola/primitives-vue/calendar-view": {
        before: 7751,
        budget: 8117,
        reason: `${VIEW}; ${FOCUS_GATE}`,
    },
    "@fragiola/primitives-vue/date-field": {
        before: 8137,
        budget: 8407,
        reason: FIELD,
    },
    "@fragiola/primitives-vue/date-picker": { before: 13969, budget: 14069 },
    "@fragiola/primitives-vue/date-picker-input": {
        before: 19802,
        budget: 20140,
        reason: `${PICKER_INPUT}; ${FOCUS_GATE}`,
    },
    "@fragiola/primitives-vue/date-range-field": {
        before: 8807,
        budget: 9089,
        reason: FIELD,
    },
    "@fragiola/primitives-vue/date-range-picker": {
        before: 13975,
        budget: 14075,
    },
    "@fragiola/primitives-vue/date-range-picker-input": {
        before: 20068,
        budget: 20415,
        reason: `${PICKER_INPUT}; ${FOCUS_GATE}`,
    },
    "@fragiola/primitives-vue/month-calendar": {
        before: 4476,
        budget: 4657,
        reason: `${MONTH}; ${FOCUS_GATE}`,
    },
    "@fragiola/primitives-vue/month-picker": { before: 14363, budget: 14463 },
    "@fragiola/primitives-vue/month-range-calendar": {
        before: 4503,
        budget: 4684,
        reason: `${MONTH}; ${FOCUS_GATE}`,
    },
    "@fragiola/primitives-vue/month-range-picker": {
        before: 14372,
        budget: 14472,
    },
    "@fragiola/primitives-vue/multiple-calendar": {
        before: 5624,
        budget: 5816,
        reason: `${DAY}; ${FOCUS_GATE}`,
    },
    "@fragiola/primitives-vue/range-calendar": {
        before: 5041,
        budget: 5218,
        reason: `${DAY}; ${FOCUS_GATE}`,
    },
    "@fragiola/primitives-vue/time-field": {
        before: 8098,
        budget: 8340,
        reason: FIELD,
    },
    "@fragiola/primitives-vue/time-range-field": {
        before: 8769,
        budget: 9005,
        reason: FIELD,
    },
    "@fragiola/primitives-vue/year-calendar": {
        before: 4501,
        budget: 4683,
        reason: `${MONTH}; ${FOCUS_GATE}`,
    },
    "@fragiola/primitives-vue/year-picker": { before: 14365, budget: 14465 },
    "@fragiola/primitives-vue/year-range-calendar": {
        before: 4510,
        budget: 4691,
        reason: `${MONTH}; ${FOCUS_GATE}`,
    },
    "@fragiola/primitives-vue/year-range-picker": {
        before: 14374,
        budget: 14474,
    },
    "@fragiola/primitives-angular/calendar": {
        before: 6972,
        budget: 7177,
        reason: DAY_ANGULAR,
    },
    "@fragiola/primitives-angular/calendar-preset": {
        before: 7139,
        budget: 7339,
        reason: DAY_ANGULAR,
    },
    "@fragiola/primitives-angular/calendar-view": {
        before: 9796,
        budget: 10233,
        reason: VIEW,
    },
    "@fragiola/primitives-angular/date-field": {
        before: 13962,
        budget: 14497,
        reason: FIELD_ANGULAR,
    },
    "@fragiola/primitives-angular/date-picker": {
        before: 24564,
        budget: 24801,
        reason: DATE_PICKER_ANGULAR,
    },
    "@fragiola/primitives-angular/date-picker-input": {
        before: 35333,
        budget: 36344,
        reason: PICKER_INPUT_ANGULAR,
    },
    "@fragiola/primitives-angular/date-range-field": {
        before: 15616,
        budget: 16179,
        reason: FIELD_ANGULAR,
    },
    "@fragiola/primitives-angular/date-range-picker": {
        before: 24608,
        budget: 24843,
        reason: DATE_PICKER_ANGULAR,
    },
    "@fragiola/primitives-angular/date-range-picker-input": {
        before: 34761,
        budget: 35775,
        reason: PICKER_INPUT_ANGULAR,
    },
    "@fragiola/primitives-angular/month-calendar": {
        before: 6207,
        budget: 6405,
        reason: MONTH_ANGULAR,
    },
    "@fragiola/primitives-angular/month-picker": {
        before: 29458,
        budget: 29968,
        reason: MONTH_PICKER_ANGULAR,
    },
    "@fragiola/primitives-angular/month-range-calendar": {
        before: 6227,
        budget: 6431,
        reason: MONTH_ANGULAR,
    },
    "@fragiola/primitives-angular/month-range-picker": {
        before: 29512,
        budget: 30020,
        reason: MONTH_PICKER_ANGULAR,
    },
    "@fragiola/primitives-angular/multiple-calendar": {
        before: 7570,
        budget: 7773,
        reason: DAY_ANGULAR,
    },
    "@fragiola/primitives-angular/range-calendar": {
        before: 7007,
        budget: 7212,
        reason: DAY_ANGULAR,
    },
    "@fragiola/primitives-angular/time-field": {
        before: 13985,
        budget: 14493,
        reason: FIELD_ANGULAR,
    },
    "@fragiola/primitives-angular/time-range-field": {
        before: 15673,
        budget: 16237,
        reason: FIELD_ANGULAR,
    },
    "@fragiola/primitives-angular/year-calendar": {
        before: 6225,
        budget: 6428,
        reason: MONTH_ANGULAR,
    },
    "@fragiola/primitives-angular/year-picker": {
        before: 29511,
        budget: 30019,
        reason: MONTH_PICKER_ANGULAR,
    },
    "@fragiola/primitives-angular/year-range-calendar": {
        before: 6236,
        budget: 6440,
        reason: MONTH_ANGULAR,
    },
    "@fragiola/primitives-angular/year-range-picker": {
        before: 29522,
        budget: 30030,
        reason: MONTH_PICKER_ANGULAR,
    },
};
