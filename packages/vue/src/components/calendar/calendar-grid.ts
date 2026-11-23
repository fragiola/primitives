import { addMonths, calendarKeyTarget } from "@fragiola/primitives/date";
import { getDirection } from "@fragiola/primitives/direction";
import { interceptEscape } from "@fragiola/primitives/layers";
import { computed, defineComponent, provide, shallowRef, watch } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import { useProvidedDirection } from "../../direction/direction-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { CalendarGridKey, CalendarKey } from "./calendar-context.ts";

export interface CalendarGridProps {
    /** Which visible month it shows (default 0). */
    offset?: number;
}

/** One month, as an ARIA grid with the APG date grid keyboard (spec/calendar.md, "Keyboard"). */
export const CalendarGrid: PartComponent<
    CalendarGridProps,
    Record<string, never>
> = publicComponent(
    defineComponent({
        name: "CalendarGrid",
        inheritAttrs: false,
        props: { ...asProp, offset: { type: Number, default: 0 } },
        setup(props, { attrs, slots }) {
            const direction = useProvidedDirection();
            const context = useRequiredContext(CalendarKey, "Calendar.Grid");
            const month = computed(() =>
                addMonths(context.visibleStart.value, props.offset),
            );
            provide(CalendarGridKey, month);
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            // a started range takes Escape before an enclosing overlay's layer (a picker, a
            // dialog, a popover) closes it: the next Escape closes (spec/calendar.md, "Keyboard")
            // the started range is read when the key comes, never after a render
            watch(
                element,
                (grid, _, onCleanup) => {
                    if (grid === null) {
                        return;
                    }
                    onCleanup(
                        interceptEscape(
                            grid.ownerDocument,
                            () => context.cancelRange(),
                            {
                                when: (event) =>
                                    context.anchor.value !== null &&
                                    event.target instanceof Node &&
                                    grid.contains(event.target),
                            },
                        ),
                    );
                },
                { immediate: true },
            );
            const onKeydown = (event: KeyboardEvent) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    context.select(context.focusedDate.value);
                    return;
                }
                const target = calendarKeyTarget(
                    event.key,
                    context.focusedDate.value,
                    {
                        rtl:
                            getDirection(
                                event.currentTarget as Element,
                                direction(),
                            ) === "rtl",
                        firstDayOfWeek: context.firstDay(),
                        shiftKey: event.shiftKey,
                    },
                );
                if (target === null) {
                    return;
                }
                event.preventDefault();
                if (context.moveFocus(target)) {
                    context.requestFocus();
                }
            };
            return () =>
                renderPart(
                    "table",
                    { attrs, slots },
                    props.as,
                    {},
                    {
                        role: "grid",
                        id: context.gridId(props.offset),
                        "aria-labelledby": context.headingId(props.offset),
                        "aria-multiselectable":
                            context.mode === "range" ? "true" : undefined,
                        "aria-readonly": context.readOnly()
                            ? "true"
                            : undefined,
                        "aria-disabled": context.disabled()
                            ? "true"
                            : undefined,
                        "data-primitives-part": `${context.component}-grid`,
                        ref: setElement,
                        onKeydown,
                    },
                );
        },
    }),
);
