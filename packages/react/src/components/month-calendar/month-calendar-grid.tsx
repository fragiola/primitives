import { getDirection } from "@fragiola/primitives/direction";
import { interceptEscape } from "@fragiola/primitives/layers";
import { unitKeyTarget } from "@fragiola/primitives/month-year";
import {
    type KeyboardEvent,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { DirectionContext } from "../../direction/direction-context.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { MonthCalendarContext } from "./month-calendar-context.ts";

export interface MonthCalendarGridProps
    extends PartProps<Record<string, never>> {}

/** The page, as an ARIA grid with the calendar's keys mapped to items (spec/month-calendar.md). */
export function MonthCalendarGrid(props: MonthCalendarGridProps) {
    const context = useRequiredContext(
        MonthCalendarContext,
        "MonthCalendar.Grid",
    );
    const direction = useContext(DirectionContext);
    const [element, setElement] = useState<HTMLElement | null>(null);
    // read when the key comes, so the interception never waits for a render
    const range = useRef({ started: false, cancel: context.cancelRange });
    range.current = {
        started: context.anchor !== null,
        cancel: context.cancelRange,
    };

    // a started range takes Escape before an enclosing overlay's layer (a picker) closes it
    useEffect(() => {
        if (element === null) {
            return undefined;
        }
        return interceptEscape(
            element.ownerDocument,
            () => range.current.cancel(),
            {
                when: (event) =>
                    range.current.started &&
                    event.target instanceof Node &&
                    element.contains(event.target),
            },
        );
    }, [element]);

    const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            context.select(context.focused);
            return;
        }
        const target = unitKeyTarget(event.key, context.focused, {
            rtl: getDirection(event.currentTarget, direction) === "rtl",
            columns: context.columns,
        });
        if (target === null) {
            return;
        }
        event.preventDefault();
        if (context.moveFocus(target)) {
            context.requestFocus();
        }
    };

    return renderElement(
        "table",
        props,
        {},
        {
            role: "grid",
            id: context.gridId,
            "aria-labelledby": context.headingId,
            "aria-multiselectable":
                context.mode === "range" ? "true" : undefined,
            "aria-readonly": context.readOnly ? "true" : undefined,
            "aria-disabled": context.disabled ? "true" : undefined,
            "data-primitives-part": `${context.component}-grid`,
            onKeyDown,
        },
        setElement,
    );
}
