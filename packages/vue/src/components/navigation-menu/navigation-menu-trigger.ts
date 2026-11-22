import { getDirection } from "@fragiola/primitives/direction";
import { getTabbables } from "@fragiola/primitives/focus";
import { defineComponent, onBeforeUnmount, shallowRef, watch } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import { useProvidedDirection } from "../../direction/direction-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    NavigationMenuItemKey,
    NavigationMenuKey,
} from "./navigation-menu-context.ts";

/** A press within this many ms of a hover opening keeps it open (Base UI's patient click). */
const PATIENT_CLICK = 500;

/**
 * Discloses its item's Content (spec/navigation-menu.md): a hover after the delay, a press, Enter
 * or Space toggle it; the open key opens it with focus inside; Tab from it enters the Content.
 */
export interface NavigationMenuTriggerState {
    open: boolean;
    disabled: boolean;
}

export interface NavigationMenuTriggerProps {
    disabled?: boolean;
}

export const NavigationMenuTrigger: PartComponent<
    NavigationMenuTriggerProps,
    NavigationMenuTriggerState
> = publicComponent(
    defineComponent({
        name: "NavigationMenuTrigger",
        inheritAttrs: false,
        props: { ...asProp, disabled: { type: Boolean, default: false } },
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                NavigationMenuKey,
                "NavigationMenu.Trigger",
            );
            const item = useRequiredContext(
                NavigationMenuItemKey,
                "NavigationMenu.Trigger",
            );
            const provided = useProvidedDirection();
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            let unregister: (() => void) | null = null;
            watch(
                () => [element.value, item.value()] as const,
                ([current, value]) => {
                    unregister?.();
                    unregister = current
                        ? context.registerTrigger(value, current)
                        : null;
                },
                { flush: "post", immediate: true },
            );
            onBeforeUnmount(() => unregister?.());
            const isOpen = () => context.value.value === item.value();

            const onPointerenter = (event: PointerEvent) => {
                if (props.disabled || event.pointerType === "touch") {
                    return;
                }
                if (context.value.value !== null) {
                    // another Content is open: this one opens at once
                    context.hover.cancel();
                    if (!isOpen()) {
                        context.setValue(
                            item.value(),
                            "trigger-hover",
                            event,
                            "hover",
                        );
                    }
                    return;
                }
                context.pendingHover.current = item.value();
                context.hover.enter(context.delay());
            };
            const onPointerleave = (event: PointerEvent) => {
                if (event.pointerType === "touch") {
                    return;
                }
                if (
                    context.value.value === null &&
                    context.pendingHover.current === item.value()
                ) {
                    context.pendingHover.current = null;
                    context.hover.cancel();
                }
            };
            const onClick = (event: MouseEvent) => {
                if (props.disabled) {
                    return;
                }
                context.hover.cancel();
                const opened = context.openedBy;
                if (isOpen()) {
                    if (performance.now() - opened.hoveredAt < PATIENT_CLICK) {
                        // the user aimed for it: it stays open, and the pointer leaving keeps it
                        opened.by = "press";
                        return;
                    }
                    context.setValue(null, "trigger-press", event);
                    return;
                }
                context.setValue(item.value(), "trigger-press", event, "press");
            };
            const onKeydown = (event: KeyboardEvent) => {
                if (props.disabled) {
                    return;
                }
                const rtl =
                    getDirection(
                        event.currentTarget as HTMLElement,
                        provided(),
                    ) === "rtl";
                const openKey =
                    context.orientation() === "horizontal"
                        ? "ArrowDown"
                        : rtl
                          ? "ArrowLeft"
                          : "ArrowRight";
                const content = item.content.value;
                if (event.key === openKey) {
                    event.preventDefault();
                    event.stopPropagation();
                    context.hover.cancel();
                    if (isOpen() && content) {
                        getTabbables(content)[0]?.focus();
                        return;
                    }
                    context.pendingFocus.current = item.value();
                    context.setValue(
                        item.value(),
                        "list-navigation",
                        event,
                        "press",
                    );
                    return;
                }
                if (
                    event.key === "Tab" &&
                    !event.shiftKey &&
                    isOpen() &&
                    content
                ) {
                    // in the tab order, the Content comes right after its Trigger
                    const first = getTabbables(content)[0];
                    if (first) {
                        event.preventDefault();
                        first.focus();
                    }
                }
            };
            return () => {
                const open = isOpen();
                const disabled = props.disabled;
                return renderPart(
                    "button",
                    { attrs, slots },
                    props.as,
                    { open, disabled },
                    {
                        type: "button",
                        disabled,
                        "aria-expanded": open ? "true" : "false",
                        "aria-controls": open ? item.contentId : undefined,
                        "data-primitives-part": "navigation-menu-trigger",
                        ...stateAttributes({ "popup-open": open, disabled }),
                        onPointerenter,
                        onPointerleave,
                        onClick,
                        onKeydown,
                        ref: setElement,
                    },
                );
            };
        },
    }),
);
