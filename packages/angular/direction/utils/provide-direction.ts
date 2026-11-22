import { type Provider, signal } from "@angular/core";
import type { Direction } from "@fragiola/primitives/direction";
import { DIRECTION } from "@fragiola/primitives-angular/internal";

/**
 * The direction as an injector's provider (spec/direction.md): `providers: [provideDirection("rtl")]`
 * on an application, a route or a component, for everything it renders.
 */
export function provideDirection(direction: Direction): Provider {
    return { provide: DIRECTION, useValue: signal(direction).asReadonly() };
}
