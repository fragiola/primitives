import { defineComponent, type PropType, watch } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import {
    type OverlayTriggerProps,
    overlayTriggerProps,
    useOverlayTrigger,
} from "../../composables/use-overlay-trigger.ts";
import { useRovingItem } from "../../composables/use-roving-item.ts";
import type { ChangeReason } from "../../utils/change-details.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import type { MenuBarEntry } from "./menu-bar-context.ts";
import { MenuKey } from "./menu-context.ts";
import type { MenuHandle } from "./menu-handle.ts";

/**
 * Opens the root menu (spec/menu.md, "Keyboard": on the Trigger); with a `handle`, from anywhere
 * in the page. In a Menubar, an item of the bar that hands its keys, press and hover to it
 * (spec/menu.md, "In a Menubar").
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
                // in a bar: the bar's item (its roving tab stop, its menu registered with it); the
                // bar of the Root it is in when it sets up (a bar's menus are not detached)
                const initial = trigger.root.value;
                const bar = initial?.parent === null ? initial.bar : null;
                const disabled = () =>
                    props.disabled || (bar?.disabled() ?? false);
                const roving = bar
                    ? useRovingItem(() => true, bar.scope)
                    : null;
                if (bar) {
                    watch(
                        () =>
                            [
                                trigger.root.value,
                                trigger.element.value,
                            ] as const,
                        ([root, element], _, onCleanup) => {
                            if (root === null || element === null) {
                                return;
                            }
                            const entry: MenuBarEntry = {
                                menu: root,
                                disabled,
                            };
                            onCleanup(bar.register(element, entry));
                        },
                        { immediate: true, flush: "sync" },
                    );
                }
                const setElement = roving
                    ? (value: unknown) => {
                          setTrigger(value);
                          roving.ref(value);
                      }
                    : setTrigger;
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
                    const disabledNow = disabled();
                    const own = {
                        disabled: props.disabled,
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
                    };
                    // in a bar: a focusable disabled item; its keys reach the bar's element, its
                    // press and its hover go to the bar, the consumer's click listener does not
                    // run while disabled
                    const inBar = bar && {
                        role: "menuitem",
                        tabindex: roving?.tabIndex(),
                        "aria-disabled": disabledNow ? "true" : undefined,
                        onFocus: () => roving?.onFocus(),
                        onClick: (event: MouseEvent) =>
                            bar.press(
                                event.currentTarget as HTMLElement,
                                event,
                            ),
                        onPointerenter: (event: PointerEvent) =>
                            bar.hover(
                                event.currentTarget as HTMLElement,
                                event,
                            ),
                    };
                    let consumer = attrs;
                    if (inBar && disabledNow) {
                        const { onClick: _skipped, ...rest } = attrs;
                        consumer = rest;
                    }
                    return renderPart(
                        "button",
                        { attrs: consumer, slots },
                        props.as,
                        { open: active, disabled: disabledNow },
                        {
                            type: "button",
                            id: trigger.id.value,
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
                                disabled: disabledNow,
                            }),
                            ...(inBar || own),
                            onKeyup: (event: KeyboardEvent) => {
                                if (event.key === " ") {
                                    event.preventDefault();
                                }
                            },
                            ref: setElement,
                        },
                    );
                };
            },
        }),
    );
