import { getTabbables } from "@fragiola/primitives/focus";
import { computed, defineComponent, h, provide, Teleport, watch } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { usePresence } from "../../composables/use-presence.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    NavigationMenuContentKey,
    NavigationMenuItemKey,
    NavigationMenuKey,
} from "./navigation-menu-context.ts";

/**
 * Its item's panel (spec/navigation-menu.md), rendered into the Viewport while its item is open
 * (and while the popup exits after it): its size is the popup's size variables.
 */
export interface NavigationMenuContentState {
    open: boolean;
    activationDirection: string;
}

export const NavigationMenuContent: PartComponent<
    Record<never, never>,
    NavigationMenuContentState
> = publicComponent(
    defineComponent({
        name: "NavigationMenuContent",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                NavigationMenuKey,
                "NavigationMenu.Content",
            );
            const item = useRequiredContext(
                NavigationMenuItemKey,
                "NavigationMenu.Content",
            );
            provide(NavigationMenuContentKey, true);
            const element = item.content;
            const setElement = elementSetter(element);
            // the last open Content stays open while the popup closes; a switch closes the
            // previous one
            const open = computed(
                () =>
                    context.value.value === item.value() ||
                    (context.value.value === null &&
                        context.lastValue.value === item.value()),
            );
            const presence = usePresence(open, () => element.value);
            const active = computed(() => context.value.value === item.value());
            // the open Content's size is the popup's (its border box)
            watch(
                () => [active.value, element.value] as const,
                ([isActive, node], _, onCleanup) => {
                    if (!isActive || node === null) {
                        return;
                    }
                    const measure = () =>
                        context.setSize({
                            width: node.offsetWidth,
                            height: node.offsetHeight,
                        });
                    measure();
                    const View = node.ownerDocument.defaultView?.ResizeObserver;
                    if (View === undefined) {
                        return;
                    }
                    const observer = new View(measure);
                    observer.observe(node);
                    onCleanup(() => observer.disconnect());
                },
                { flush: "post", immediate: true },
            );
            // the open key's focus, once the popup's layer is open: a parent level's focus-out
            // accepts its child layers only
            watch(
                () =>
                    [
                        active.value,
                        element.value,
                        context.layered.value,
                    ] as const,
                ([isActive, node, layered]) => {
                    if (
                        isActive &&
                        node !== null &&
                        layered &&
                        context.pendingFocus.current === item.value()
                    ) {
                        context.pendingFocus.current = null;
                        getTabbables(node)[0]?.focus();
                    }
                },
                { flush: "post", immediate: true },
            );
            return () => {
                const viewport = context.viewport.value;
                if (!presence.mounted.value || viewport === null) {
                    return null;
                }
                const status = presence.status.value;
                const direction = context.activationDirection.value;
                return h(Teleport, { to: viewport }, [
                    renderPart(
                        "div",
                        { attrs, slots },
                        props.as,
                        { open: open.value, activationDirection: direction },
                        {
                            id: item.contentId,
                            "data-primitives-part": "navigation-menu-content",
                            ...stateAttributes({
                                open: open.value,
                                closed: !open.value,
                                "activation-direction": direction,
                                "starting-style": status === "starting",
                                "ending-style": status === "ending",
                            }),
                            ref: setElement,
                        },
                    ),
                ]);
            };
        },
    }),
);
