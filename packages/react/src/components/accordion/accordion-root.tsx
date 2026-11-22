import { accordionKeyTarget } from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import {
    type KeyboardEvent,
    useCallback,
    useContext,
    useId,
    useMemo,
} from "react";
import { DirectionContext } from "../../direction/direction-context.ts";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    AccordionContext,
    type AccordionOrientation,
    type AccordionRootState,
} from "./accordion-context.ts";

export interface AccordionRootProps extends PartProps<AccordionRootState> {
    /** The values of the open items. */
    value?: string[];
    defaultValue?: string[];
    onValueChange?: (value: string[], details: ChangeDetails) => void;
    /** Several items may be open (default `false`). */
    multiple?: boolean;
    disabled?: boolean;
    orientation?: AccordionOrientation;
    /** Whether the arrow keys wrap from the last trigger to the first and back (default `true`). */
    loopFocus?: boolean;
}

const NONE: string[] = [];

/** spec/accordion.md (the APG accordion) */
export function AccordionRoot({
    value: valueProp,
    defaultValue = NONE,
    onValueChange,
    multiple = false,
    disabled = false,
    orientation = "vertical",
    loopFocus = true,
    ...props
}: AccordionRootProps) {
    const [value, setValue] = useControllableState(
        valueProp,
        defaultValue,
        onValueChange,
    );
    const direction = useContext(DirectionContext);
    const baseId = useId();
    const toggle = useCallback(
        (item: string, open: boolean, reason: ChangeReason) => {
            const next = open
                ? multiple
                    ? [...value.filter((entry) => entry !== item), item]
                    : [item]
                : value.filter((entry) => entry !== item);
            setValue(next, { reason });
        },
        [value, multiple, setValue],
    );

    // the arrows, Home and End move among the enabled triggers (spec/accordion.md, "Keyboard")
    const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        const root = event.currentTarget;
        const triggers = [
            ...root.querySelectorAll<HTMLButtonElement>(
                '[data-primitives-part="accordion-trigger"]',
            ),
        ].filter(
            (trigger) =>
                !trigger.disabled &&
                trigger.closest('[data-primitives-part="accordion-root"]') ===
                    root,
        );
        const current = triggers.indexOf(event.target as HTMLButtonElement);
        if (current === -1) {
            return;
        }
        const index = accordionKeyTarget(event.key, current, triggers.length, {
            orientation,
            rtl: getDirection(root, direction) === "rtl",
            loop: loopFocus,
        });
        if (index === null) {
            return;
        }
        event.preventDefault();
        triggers[index]?.focus();
    };

    const context = useMemo(
        () => ({ value, toggle, disabled, orientation, baseId }),
        [value, toggle, disabled, orientation, baseId],
    );
    const state = { value, disabled, orientation };
    return (
        <AccordionContext.Provider value={context}>
            {renderElement("div", props, state, {
                "data-primitives-part": "accordion-root",
                ...stateAttributes({ orientation, disabled }),
                onKeyDown,
            })}
        </AccordionContext.Provider>
    );
}
