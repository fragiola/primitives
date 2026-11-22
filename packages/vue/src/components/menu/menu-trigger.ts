import { defineComponent, type PropType } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import {
    type OverlayTriggerProps,
    overlayTriggerProps,
    useOverlayTrigger,
} from "../../composables/use-overlay-trigger.ts";
import type { ChangeReason } from "../../utils/change-details.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { MenuKey } from "./menu-context.ts";
import type { MenuHandle } from "./menu-handle.ts";

/**
 * Opens the root menu (spec/menu.md, "Keyboard": on the Trigger); with a `handle`, from anywhere
 * in the page.
 */
export interface MenuTriggerState {
    open: boolean;
    disabled: boolean;
}

export interface MenuTriggerProps
    extends OverlayTriggerProps<MenuHandle, unknown> {
    disabled?: boolean;
}

export const MenuTrigger: PartComponent<MenuTriggerProps, MenuTriggerState> =
    publicComponent(
        defineComponent({
            name: "MenuTrigger",
            inheritAttrs: false,
            props: {
                ...asProp,
                ...overlayTriggerProps,
                handle: {
                    type: Object as PropType<MenuHandle>,
                    default: undefined,
                },
                disabled: { type: Boolean, default: false },
            },
            setup(props, { attrs, slots }) {
                const trigger = useOverlayTrigger(
                    MenuKey,
                    "Menu.Trigger",
                    props,
                );
                const setTrigger = elementSetter(trigger.element);
                const openWith = (
                    highlight: "first" | "last",
                    reason: ChangeReason,
                    event: KeyboardEvent,
                ) => {
                    const root = trigger.root.value;
                    // already open from this trigger: nothing to open, and no highlight left for a
                    // later open (spec/menu.md)
                    if (root === null || trigger.active.value) {
                        return;
                    }
                    root.pendingHighlight.current = highlight;
                    if (
                        !root.setOpen(
                            true,
                            reason,
                            event,
                            event.currentTarget as HTMLElement,
                        )
                    ) {
                        root.pendingHighlight.current = null;
                    }
                };
                return () => {
                    const root = trigger.root.value;
                    const active = trigger.active.value;
                    return renderPart(
                        "button",
                        { attrs, slots },
                        props.as,
                        { open: active, disabled: props.disabled },
                        {
                            type: "button",
                            id: trigger.id.value,
                            disabled: props.disabled,
                            "aria-haspopup": "menu",
                            "aria-expanded": active ? "true" : "false",
                            "aria-controls": active ? root?.popupId : undefined,
                            "data-primitives-part": "menu-trigger",
                            // a modal menu blocks the pointer outside; its triggers still toggle
                            style:
                                root?.modal() && root.open.value
                                    ? { pointerEvents: "auto" }
                                    : undefined,
                            ...stateAttributes({
                                "popup-open": active,
                                disabled: props.disabled,
                            }),
                            onClick: (event: MouseEvent) => {
                                if (root === null) {
                                    return;
                                }
                                root.pendingHighlight.current = null;
                                root.setOpen(
                                    !active,
                                    "trigger-press",
                                    event,
                                    event.currentTarget as HTMLElement,
                                );
                            },
                            onKeydown: (event: KeyboardEvent) => {
                                if (event.key === "ArrowDown") {
                                    event.preventDefault();
                                    openWith("first", "list-navigation", event);
                                } else if (event.key === "ArrowUp") {
                                    event.preventDefault();
                                    openWith("last", "list-navigation", event);
                                } else if (
                                    event.key === "Enter" ||
                                    event.key === " "
                                ) {
                                    event.preventDefault();
                                    openWith("first", "trigger-press", event);
                                }
                            },
                            onKeyup: (event: KeyboardEvent) => {
                                if (event.key === " ") {
                                    event.preventDefault();
                                }
                            },
                            ref: setTrigger,
                        },
                    );
                };
            },
        }),
    );
