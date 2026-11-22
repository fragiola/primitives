import type { CSSProperties, ReactNode, Ref } from "react";
import { type RenderProp, renderElement } from "../utils/render-element.tsx";
import { stateAttributes } from "../utils/state-attributes.ts";

/** The props a part written with {@link useRender} renders: `className` and `style` may be functions of the state. */
export interface UseRenderProps<State> {
    className?: string | ((state: State) => string | undefined);
    style?: CSSProperties | ((state: State) => CSSProperties | undefined);
    ref?: Ref<HTMLElement>;
    children?: ReactNode;
    [key: string]: unknown;
}

export interface UseRenderOptions<State> {
    /** The consumer's `render`: an element its props merge into, or a function of the props and the state. */
    render?: RenderProp<State> | undefined;
    /** The part's props (the consumer's included), merged into the element. */
    props?: UseRenderProps<State>;
    /** The part's state: its booleans and strings become `data-*` attributes, and `render` receives it. */
    state?: State;
    /** The part's own ref to its element (merged with the consumer's). */
    ref?: Ref<HTMLElement>;
    /** The element rendered without `render` (default `"div"`). */
    defaultTagName?: string;
}

/** The state's `data-*` attributes: booleans and strings only (spec/README.md, "State attributes"). */
function attributesOf(state: object): Record<`data-${string}`, string> {
    const attributable: Record<string, boolean | string> = {};
    for (const [key, value] of Object.entries(state)) {
        if (typeof value === "boolean" || typeof value === "string") {
            attributable[key] = value;
        }
    }
    return stateAttributes(attributable);
}

/**
 * Renders a part with the primitive contract (spec/README.md, "Render utilities"): the default
 * element, or the consumer's `render`, with the props merged in and the state's `data-*`
 * attributes (`true` an empty attribute, `false` none, a string its value).
 */
export function useRender<State extends object = Record<string, never>>({
    render,
    props = {},
    state = {} as State,
    ref,
    defaultTagName = "div",
}: UseRenderOptions<State>): ReactNode {
    const { className, style, ref: consumerRef, ...rest } = props;
    return renderElement(
        defaultTagName,
        { render, className, style, ref: consumerRef },
        state,
        { ...attributesOf(state), ...rest },
        ref,
    );
}
