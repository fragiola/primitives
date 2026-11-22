// The entry of @fragiola/primitives-angular/direction: the reading direction of a part of the app
// (spec/direction.md), a global provider in its own entry (D8). It references no component: the
// components read the direction through a token of the shared internals, not this entry.

export type { Direction } from "@fragiola/primitives/direction";
export { DirectionProvider } from "./directives/direction-provider.directive.ts";
export { injectDirection } from "./inject/inject-direction.ts";
export { provideDirection } from "./utils/provide-direction.ts";
