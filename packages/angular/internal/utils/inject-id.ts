import { APP_ID, Injectable, inject } from "@angular/core";

/** The application's id counter: one per application, so a server render starts where the browser does. */
@Injectable({ providedIn: "root" })
export class IdCounter {
    private readonly appId = inject(APP_ID);
    private count = 0;

    /** The next id: `primitives-dialog-1`, then `-2`, ... (`primitives-dialog-<app>-1` in an app given its own `APP_ID`). */
    next(prefix: string): string {
        this.count += 1;
        return this.appId === "ng"
            ? `${prefix}-${this.count}`
            : `${prefix}-${this.appId}-${this.count}`;
    }
}

/**
 * A document-unique id from the application's own counter (Epic #22), in an injection context.
 * The toolkit's `createId` counts for the whole JavaScript realm: on a server that renders many
 * pages, its ids would never be the browser's, and a hydrated page would change them all.
 */
export function injectId(prefix = "primitives"): string {
    return inject(IdCounter).next(prefix);
}
