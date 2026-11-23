import { getDirection } from "@fragiola/primitives/direction";
import { interceptEscape } from "@fragiola/primitives/layers";
import { defineComponent, shallowRef, watch } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import { useProvidedDirection } from "../../direction/direction-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { MonthCalendarKey } from "./month-calendar-context.ts";

export type MonthCalendarGridProps = Record<never, never>;

/** The page, as an ARIA grid with the calendar's keys mapped to items (spec/month-calendar.md). */
export const MonthCalendarGrid: PartComponent<
    MonthCalendarGridProps,
    Record<string, never>
> = publicComponent(
    defineComponent({
        name: "MonthCalendarGrid",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const direction = useProvidedDirection();
            const context = useRequiredContext(
                MonthCalendarKey,
                "MonthCalendar.Grid",
            );
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            // a started range takes Escape before an enclosing overlay's layer (a picker) closes
            // it; the started range is read when the key comes, never after a render
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
                    context.select(context.focused.value);
                    return;
                }
                const target = context
                    .units()
                    .keyTarget(event.key, context.focused.value, {
                        rtl:
                            getDirection(
                                event.currentTarget as Element,
                                direction(),
                            ) === "rtl",
                        columns: context.columns(),
                    });
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
                        id: context.gridId,
                        "aria-labelledby": context.headingId,
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
