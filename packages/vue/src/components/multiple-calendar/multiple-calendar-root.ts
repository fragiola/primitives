import {
    compareDates,
    isSameDate,
    type PlainDate,
    toIsoDate,
} from "@fragiola/primitives/date";
import {
    defineComponent,
    h,
    nextTick,
    onBeforeUnmount,
    type PropType,
    provide,
    shallowRef,
    watch,
} from "vue";
import { useControllable } from "../../composables/use-controllable.ts";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    type CalendarContext,
    CalendarKey,
} from "../calendar/calendar-context.ts";
import {
    type CalendarRootSharedProps,
    type CalendarRootState,
    calendarOptionProps,
} from "../calendar/calendar-root-base.ts";
import { useCalendar } from "../calendar/use-calendar.ts";

export interface MultipleCalendarRootProps extends CalendarRootSharedProps {
    /** The chosen dates, sorted from the earliest (controlled; `v-model:value`). */
    value?: PlainDate[];
    /** The chosen dates at first (uncontrolled; default none). */
    defaultValue?: PlainDate[];
    /** How many dates can be chosen at most (default: no limit). */
    maxSelected?: number;
    /** The form name: one hidden input per chosen date (ISO 8601). */
    name?: string;
}

export type MultipleCalendarRootEmits = {
    "update:value": (value: PlainDate[]) => true;
    valueChange: (value: PlainDate[], details: ChangeDetails) => true;
};

const NONE: PlainDate[] = [];

/**
 * Several dates (spec/calendar.md, "Multiple dates", `v-model:value`): a press, Enter or Space
 * toggles a date. Its state is the Calendar's, with the dates on top; its parts are the
 * Calendar's, named `multiple-calendar-*`.
 */
export const MultipleCalendarRoot: PartComponent<
    MultipleCalendarRootProps,
    CalendarRootState,
    MultipleCalendarRootEmits
> = publicComponent(
    defineComponent({
        name: "MultipleCalendarRoot",
        inheritAttrs: false,
        props: {
            ...asProp,
            value: {
                type: Array as PropType<PlainDate[]>,
                default: undefined,
            },
            defaultValue: {
                type: Array as PropType<PlainDate[]>,
                default: undefined,
            },
            ...calendarOptionProps,
            disabled: { type: Boolean, default: undefined },
            readOnly: { type: Boolean, default: undefined },
            maxSelected: { type: Number, default: undefined },
            name: { type: String, default: undefined },
        },
        emits: {
            "update:value": (_value: PlainDate[]) => true,
            valueChange: (_value: PlainDate[], _details: ChangeDetails) => true,
        },
        setup(props, { attrs, slots, emit }) {
            const dates = useControllable<PlainDate[], ChangeDetails>(
                () => props.value,
                props.defaultValue ?? NONE,
                (next, details) => {
                    emit("update:value", next);
                    emit("valueChange", next, details);
                },
            );
            // the Calendar's state, held at the earliest date (its focused date starts there) and
            // never bound to a picker (it has a value of its own)
            const { context: state } = useCalendar(
                "multiple-calendar",
                "single",
                {
                    get value() {
                        return dates.value.value[0] ?? null;
                    },
                    get min() {
                        return props.min;
                    },
                    get max() {
                        return props.max;
                    },
                    get isDateUnavailable() {
                        return props.isDateUnavailable;
                    },
                    get locale() {
                        return props.locale;
                    },
                    get firstDayOfWeek() {
                        return props.firstDayOfWeek;
                    },
                    get visibleMonths() {
                        return props.visibleMonths;
                    },
                    get disabled() {
                        return props.disabled;
                    },
                    get readOnly() {
                        return props.readOnly;
                    },
                },
                () => {},
            );
            const chosen = (date: PlainDate) =>
                dates.value.value.some((other: PlainDate) =>
                    isSameDate(other, date),
                );
            const focusPending = { current: false };
            const context: CalendarContext = {
                ...state,
                // the Grid's `aria-multiselectable` (the only use of the mode by the parts)
                mode: "range",
                cellState: (date, month) => ({
                    ...state.cellState(date, month),
                    selected: chosen(date),
                }),
                select: (date) => {
                    const cell = state.cellState(date, date);
                    if (cell.disabled || cell.unavailable || state.readOnly()) {
                        return;
                    }
                    state.moveFocus(date);
                    const current = dates.value.value;
                    if (chosen(date)) {
                        dates.set(
                            current.filter(
                                (other: PlainDate) => !isSameDate(other, date),
                            ),
                            { reason: "item-press" },
                        );
                    } else if (
                        props.maxSelected === undefined ||
                        current.length < props.maxSelected
                    ) {
                        dates.set([...current, date].sort(compareDates), {
                            reason: "item-press",
                        });
                    }
                },
                requestFocus: () => {
                    focusPending.current = true;
                },
                focusPending,
            };
            provide(CalendarKey, context);
            const focusPendingCell = () => {
                if (!focusPending.current) {
                    return;
                }
                const cell = context.cells.get(
                    toIsoDate(context.focusedDate.value),
                );
                if (cell) {
                    focusPending.current = false;
                    cell.focus({ preventScroll: true });
                }
            };
            // after a render while a focus is pending: the focused date's cell may have mounted
            // in it (a new month; AGENTS.md "Porting", 5)
            watch(
                () =>
                    [
                        context.focusedDate.value,
                        context.visibleStart.value,
                    ] as const,
                () => {
                    void nextTick().then(focusPendingCell);
                },
                { flush: "post" },
            );

            // a form reset returns the dates to their default (the reset event fires before the
            // reset)
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            let timer: ReturnType<typeof setTimeout> | undefined;
            const onReset = () => {
                timer = setTimeout(() => {
                    dates.set(props.defaultValue ?? NONE, { reason: "none" });
                });
            };
            watch(
                () =>
                    props.name === undefined
                        ? null
                        : (element.value?.closest("form") ?? null),
                (form, _, onCleanup) => {
                    if (form === null) {
                        return;
                    }
                    form.addEventListener("reset", onReset);
                    onCleanup(() => form.removeEventListener("reset", onReset));
                },
                { immediate: true },
            );
            onBeforeUnmount(() => clearTimeout(timer));

            return () => {
                const disabled = state.disabled();
                const readOnly = state.readOnly();
                const rootState = { disabled, readOnly };
                const name = props.name;
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    rootState,
                    {
                        "data-primitives-part": "multiple-calendar-root",
                        ...stateAttributes({ disabled, readonly: readOnly }),
                        ref: setElement,
                    },
                    () => [
                        slots.default?.({ state: rootState }),
                        name === undefined
                            ? null
                            : dates.value.value.map((date: PlainDate) =>
                                  h("input", {
                                      key: toIsoDate(date),
                                      type: "hidden",
                                      name,
                                      value: toIsoDate(date),
                                      disabled,
                                      "data-primitives-part":
                                          "multiple-calendar-input",
                                  }),
                              ),
                    ],
                );
            };
        },
    }),
);
