// The entry of @fragiola/primitives-angular/internal: what the components' entries share (state
// attributes, controllable inputs, the overlay root, presence, the portal, host registration,
// ids and label ids, change details, the handles and triggers of detached triggers, the hidden form inputs, structural views, own attributes, the
// provided direction, a disclosure panel's transitions, a button's behaviour, a disabled link's press, the roving-focus scope and a
// ToggleGroup's context, the virtual lists' rows).
// ng-packagr builds each entry point from its own folder, and an entry imports another only
// through its public API: the components' entries import these from here.
// Not an app's API: it may change in any release.

export * from "./utils/button-behaviour.ts";
export * from "./utils/change-details.ts";
export * from "./utils/conditional-view.ts";
export * from "./utils/controllable.ts";
export * from "./utils/flush.ts";
export * from "./utils/hidden-input.ts";
export * from "./utils/host-element.ts";
export * from "./utils/inject-enclosing.ts";
export * from "./utils/inject-id.ts";
export * from "./utils/label-id.ts";
export * from "./utils/link-press.ts";
export * from "./utils/overlay-handle.ts";
export * from "./utils/overlay-root.ts";
export * from "./utils/overlay-trigger.ts";
export * from "./utils/own-attribute.ts";
export * from "./utils/panel-transition.ts";
export * from "./utils/portal.ts";
export * from "./utils/positioner.ts";
export * from "./utils/presence.ts";
export * from "./utils/provided-direction.ts";
export * from "./utils/roving-composite.ts";
export * from "./utils/roving-item.ts";
export * from "./utils/roving-scope.ts";
export * from "./utils/state-attributes.ts";
export * from "./utils/toggle-group-context.ts";
export * from "./utils/virtual-rows.ts";
