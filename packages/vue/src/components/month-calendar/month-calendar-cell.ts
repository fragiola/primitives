import {
    formatMonthName,
    formatYear,
    formatYearMonth,
    type PlainYearMonth,
} from "@fragiola/primitives/month-year";
import {
    defineComponent,
    mergeProps,
    type PropType,
    shallowRef,
    watch,
} from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    type MonthCalendarCellState,
    MonthCalendarKey,
} from "./month-calendar-context.ts";
import { itemIndex, type MonthCalendarItem } from "./month-calendar-value.ts";

export interface MonthCalendarCellProps {
    /** The month or year. */
    value: MonthCalendarItem;
}

/** One month or year. Its name and content come from `Intl` (the locale exception). */
export const MonthCalendarCell: PartComponent<
    MonthCalendarCellProps,
    MonthCalendarCellState
> = publicComponent(
    defineComponent({
        name: "MonthCalendarCell",
        inheritAttrs: false,
        props: {
            ...asProp,
            value: {
                type: Object as PropType<MonthCalendarItem>,
                required: true,
            },
        },
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                MonthCalendarKey,
                "MonthCalendar.Cell",
            );
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            const index = () => itemIndex(context.kind, props.value);
            const state = () => context.cellState(index());
            watch(
                () => [element.value, index(), state().focused] as const,
                ([node, key, focused], _, onCleanup) => {
                    if (node === null) {
                        return;
                    }
                    context.cells.set(key, node);
                    // a cell of a page just shown mounts after the keyboard moved the focus to it
                    if (context.focusPending.current && focused) {
                        context.focusPending.current = false;
                        node.focus({ preventScroll: true });
                    }
                    onCleanup(() => {
                        if (context.cells.get(key) === node) {
                            context.cells.delete(key);
                        }
                    });
                },
                { flush: "post", immediate: true },
            );
            return () => {
                const cell = state();
                const key = index();
                const locale = context.locale();
                const month = context.kind === "month";
                const consumer = mergeProps(
                    {
                        "aria-label": month
                            ? formatYearMonth(
                                  locale,
                                  props.value as PlainYearMonth,
                              )
                            : formatYear(locale, props.value.year),
                    },
                    attrs,
                );
                return renderPart(
                    "td",
                    { attrs: consumer, slots },
                    props.as,
                    cell,
                    {
                        role: "gridcell",
                        tabindex: cell.focused && !cell.disabled ? 0 : -1,
                        "aria-selected": cell.selected ? "true" : undefined,
                        "aria-disabled":
                            cell.disabled || cell.unavailable
                                ? "true"
                                : undefined,
                        "aria-current": cell.today ? "date" : undefined,
                        "data-primitives-part": `${context.component}-cell`,
                        ...stateAttributes({
                            today: cell.today,
                            selected: cell.selected,
                            disabled: cell.disabled,
                            unavailable: cell.unavailable,
                            "range-start": cell.rangeStart,
                            "range-end": cell.rangeEnd,
                            "in-range": cell.inRange,
                            "range-preview": cell.rangePreview,
                        }),
                        // a disabled item never takes the focus, not even from a press
                        onMousedown: (event: MouseEvent) => {
                            if (cell.disabled) {
                                event.preventDefault();
                            }
                        },
                        onClick: () => {
                            if (!cell.disabled) {
                                context.select(key);
                                context.requestFocus();
                            }
                        },
                        onPointerenter: () => {
                            if (context.anchor.value !== null) {
                                context.setHovered(key);
                            }
                        },
                        onFocus: () => {
                            if (!cell.focused) {
                                context.moveFocus(key);
                            }
                        },
                        ref: setElement,
                    },
                    () =>
                        slots.default?.({ state: cell }) ??
                        (month
                            ? formatMonthName(
                                  locale,
                                  props.value as PlainYearMonth,
                                  "long",
                              )
                            : formatYear(locale, props.value.year)),
                );
            };
        },
    }),
);
