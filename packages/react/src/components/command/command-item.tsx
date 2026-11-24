import { scrollIntoViewWithin } from "@fragiola/primitives/collection";
import { commandItemScore } from "@fragiola/primitives/command";
import { type MouseEvent, useId, useLayoutEffect, useRef } from "react";
import { useElement } from "../../hooks/use-element.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { CommandContext, type CommandItemInfo } from "./command-context.ts";

export interface CommandItemState {
    highlighted: boolean;
    disabled: boolean;
    /** It does not match the text: rendered `hidden`. */
    hidden: boolean;
}

export interface CommandItemProps extends PartProps<CommandItemState> {
    /** The text the filter scores, and the Item's identity in the Command. */
    value: string;
    /** More texts the filter scores. */
    keywords?: readonly string[];
    /** Highlighted by the arrows, never run. */
    disabled?: boolean;
    /** Always shown, whatever the text. */
    forceMount?: boolean;
    /** Runs the action (Enter, a press). */
    onSelect?: (value: string, event: Event) => void;
}

const NO_KEYWORDS: readonly string[] = [];

/** An `option`: an action, hidden while it does not match the text (spec/command.md). */
export function CommandItem({
    value,
    keywords = NO_KEYWORDS,
    disabled = false,
    forceMount = false,
    onSelect,
    ...props
}: CommandItemProps) {
    const context = useRequiredContext(CommandContext, "Command.Item");
    const [element, ref] = useElement<HTMLElement>();
    const id = useId();
    // the Root reads the Item's latest props; it is told only when the Item mounts or unmounts
    const info = useRef<CommandItemInfo>({
        value,
        keywords,
        disabled,
        forceMount,
        id,
        onSelect,
    });
    Object.assign(info.current, {
        value,
        keywords,
        disabled,
        forceMount,
        id,
        onSelect,
    });
    const { items, registered } = context;
    useLayoutEffect(() => {
        if (element === null) {
            return undefined;
        }
        items.set(element, info.current);
        registered();
        return () => {
            items.delete(element);
            registered();
        };
    }, [element, items, registered]);

    const hidden =
        commandItemScore(
            value,
            context.search,
            keywords,
            context.filter,
            forceMount,
        ) === 0;
    const highlighted = !hidden && context.highlighted === value;
    const { root } = context;
    useLayoutEffect(() => {
        if (highlighted && element !== null) {
            scrollIntoViewWithin(element, root);
        }
    }, [highlighted, element, root]);

    const state = { highlighted, disabled, hidden };
    return renderElement(
        "div",
        props,
        state,
        {
            role: "option",
            id,
            hidden: hidden || undefined,
            "aria-selected": highlighted ? "true" : "false",
            "aria-disabled": disabled ? "true" : undefined,
            "data-primitives-part": "command-item",
            ...stateAttributes({ highlighted, disabled }),
            onPointerMove: () => {
                if (!highlighted) {
                    context.highlight(value);
                }
            },
            onPointerDown: (event: PointerEvent) => event.preventDefault(),
            onClick: (event: MouseEvent) => {
                if (!disabled) {
                    onSelect?.(value, event.nativeEvent);
                }
            },
        },
        ref,
    );
}
