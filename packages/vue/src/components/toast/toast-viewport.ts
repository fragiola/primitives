import {
    type ToastViewportWatch,
    watchToastViewport,
} from "@fragiola/primitives/toast";
import { defineComponent, provide, ref, shallowRef, watch } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { ToastProviderKey, ToastViewportKey } from "./toast-context.ts";

/**
 * The `region` landmark of the toasts (spec/toast.md, "Viewport"): F6 reaches it, the pointer and
 * the keyboard in it pause the queue, and its live regions announce the toasts.
 */
export interface ToastViewportState {
    expanded: boolean;
}

export const ToastViewport: PartComponent<
    Record<never, never>,
    ToastViewportState
> = publicComponent(
    defineComponent({
        name: "ToastViewport",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const provider = useRequiredContext(
                ToastProviderKey,
                "Toast.Viewport",
            );
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            const expanded = ref(false);
            let watched: ToastViewportWatch | null = null;
            watch(
                () => [element.value, provider.manager()] as const,
                ([viewport, manager], _, onCleanup) => {
                    if (viewport === null) {
                        return;
                    }
                    const current = watchToastViewport(viewport, manager, {
                        onExpandedChange: (value) => {
                            expanded.value = value;
                        },
                    });
                    watched = current;
                    onCleanup(() => {
                        current.stop();
                        watched = null;
                        expanded.value = false;
                    });
                },
                { flush: "post" },
            );
            provide(ToastViewportKey, {
                expanded,
                focusAfterClose: (root) => watched?.focusAfterClose(root),
            });
            return () => {
                const frontmost =
                    provider.toasts.value.find((toast) => !toast.closing)
                        ?.height ?? 0;
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    { expanded: expanded.value },
                    {
                        role: "region",
                        tabindex: -1,
                        "data-primitives-part": "toast-viewport",
                        ...stateAttributes({ expanded: expanded.value }),
                        style: {
                            "--toast-frontmost-height":
                                frontmost > 0 ? `${frontmost}px` : undefined,
                        },
                        ref: setElement,
                    },
                );
            };
        },
    }),
);
