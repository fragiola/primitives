import {
    type Component,
    Fragment,
    h,
    mergeProps,
    type Slots,
    type VNode,
} from "vue";
import type { AsProp } from "./render-part.ts";

/**
 * A list's element setter whose current setter can change between renders, behind one stable
 * function (Vue calls a new ref function with `null`, then the element, on every render).
 */
export function chainedRef(own: (element: unknown) => void) {
    let inner: unknown;
    const ref = (element: unknown, refs?: unknown) => {
        if (typeof inner === "function") {
            inner(element, refs);
        }
        own(element);
    };
    return {
        ref,
        /** The base part's own ref, read from its props on each render. */
        set(next: unknown) {
            inner = next;
        },
    };
}

/**
 * Renders a component's List (Select's, Combobox's, Autocomplete's) with the virtual rows as its
 * options (spec/virtual-lists.md): through the List's `render` slot, so the List keeps its
 * element, attributes and behaviour while the rows replace its own children; the consumer's
 * `render` slot, if any, receives them as `children`.
 */
export function renderVirtualList(
    base: Component,
    context: { attrs: Record<string, unknown>; slots: Slots },
    as: AsProp | undefined,
    loading: boolean,
    rows: VNode[],
    ref: ReturnType<typeof chainedRef>,
): VNode {
    return h(
        base,
        mergeProps(context.attrs, {
            "aria-busy": loading ? "true" : undefined,
            "data-loading": loading ? "" : undefined,
        }),
        {
            render: (scope: {
                props: Record<string, unknown>;
                state: unknown;
            }) => {
                ref.set(scope.props.ref);
                const props = { ...scope.props, ref: ref.ref };
                const render = context.slots.render;
                if (render) {
                    return render({
                        props,
                        state: scope.state,
                        children: h(Fragment, rows),
                    });
                }
                const tag = as ?? "div";
                // a component's children are its default slot
                return [
                    typeof tag === "string"
                        ? h(tag, props, rows)
                        : h(tag, props, { default: () => rows }),
                ];
            },
        },
    );
}
