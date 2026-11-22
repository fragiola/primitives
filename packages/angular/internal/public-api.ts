// The entry of @fragiola/primitives-angular/internal: what the components' entries share (state
// attributes, controllable inputs, the overlay root, presence, the portal, host registration,
// ids and label ids, change details, the hidden form inputs, structural views, own attributes, the
// provided direction, a disclosure panel's transitions).
// ng-packagr builds each entry point from its own folder, and an entry imports another only
// through its public API: the components' entries import these from here.
// Not an app's API: it may change in any release.

export * from "./utils/change-details.ts";
export * from "./utils/conditional-view.ts";
export * from "./utils/controllable.ts";
export * from "./utils/flush.ts";
export * from "./utils/hidden-input.ts";
export * from "./utils/host-element.ts";
export * from "./utils/inject-enclosing.ts";
export * from "./utils/inject-id.ts";
export * from "./utils/label-id.ts";
export * from "./utils/overlay-root.ts";
export * from "./utils/own-attribute.ts";
export * from "./utils/panel-transition.ts";
export * from "./utils/portal.ts";
export * from "./utils/positioner.ts";
export * from "./utils/presence.ts";
export * from "./utils/provided-direction.ts";
export * from "./utils/state-attributes.ts";
