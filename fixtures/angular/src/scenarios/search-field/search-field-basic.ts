import {
    Component,
    DestroyRef,
    DOCUMENT,
    inject,
    signal,
    ViewEncapsulation,
} from "@angular/core";
import type { ValueChangeEvent } from "@fragiola/primitives-angular/search-field";
import { searchField } from "examples-shared/recipes/search-field";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";
import {
    clearButton,
    SEARCH_FIELD_PARTS,
    SEARCH_ICON,
} from "./search-field-parts.ts";

/** A search form (spec/search-field.md, `/search-field/basic`). */
@Component({
    selector: "[scenario-search-field-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [SEARCH_FIELD_PARTS, Output],
    template: `
        <search aria-label="Products">
            <form class="flex flex-col items-start gap-4" (submit)="submit($event)">
                <label for="search" class="text-sm font-medium">Search</label>
                <div searchFieldRoot [id]="'search'" [name]="'q'" (valueChangeDetails)="changed($event)" (valueSubmit)="submitted.set($event)" class="${searchField.root}">${SEARCH_ICON}<input searchFieldInput placeholder="Lamps, desks…" class="${searchField.input}" />${clearButton("Clear search")}</div>
                <button type="submit">Go</button>
            </form>
        </search>
        <pre fixtureOutput [values]="{ value: value(), reason: reason(), submitted: submitted(), 'page-escape': escapes(), form: form() }"></pre>
    `,
})
export class SearchFieldBasic {
    protected readonly value = signal<string | undefined>(undefined);
    protected readonly reason = signal<string | undefined>(undefined);
    protected readonly submitted = signal<string | undefined>(undefined);
    protected readonly escapes = signal(0);
    protected readonly form = signal<string | undefined>(undefined);

    constructor() {
        // the Escape key downs that reach the page with their default not prevented
        const document = inject(DOCUMENT);
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !event.defaultPrevented) {
                this.escapes.update((count) => count + 1);
            }
        };
        document.addEventListener("keydown", onKeyDown);
        inject(DestroyRef).onDestroy(() =>
            document.removeEventListener("keydown", onKeyDown),
        );
    }

    protected changed(event: ValueChangeEvent<string>): void {
        this.value.set(event.value);
        this.reason.set(event.details.reason);
    }

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
