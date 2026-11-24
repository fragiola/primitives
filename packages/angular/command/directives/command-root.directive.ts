import {
    afterRenderEffect,
    booleanAttribute,
    computed,
    Directive,
    input,
    output,
    type Signal,
    signal,
    untracked,
} from "@angular/core";
import {
    bestMatch,
    type CommandFilter,
    commandItemScore,
    commandScore,
} from "@fragiola/primitives/command";
import {
    type ChangeDetails,
    controllable,
    injectFlush,
    injectHost,
    injectId,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";

/** What `(itemSelect)` emits: the Item's value and the event that ran it. */
export interface CommandSelectEvent {
    value: string;
    event: Event;
}

/** A rendered Item, as the Root knows it: its inputs, read when needed. */
export interface CommandItemInfo {
    value: Signal<string>;
    keywords: Signal<readonly string[]>;
    disabled: Signal<boolean>;
    forceMount: Signal<boolean>;
    id: string;
    /** Runs the action (`itemSelect`). */
    run: (event: Event) => void;
}

export interface CommandRootState {
    loading: boolean;
    /** The current page (the last of `pages`), `null` on the root page. */
    page: string | null;
}

const NO_PAGES: readonly string[] = [];

/**
 * A command palette (spec/command.md): the text, the highlight and the pages, on the consumer's
 * element: `<div commandRoot [(inputValue)]="text" [(pages)]="pages">`.
 */
@Directive({
    selector: "[commandRoot]",
    exportAs: "commandRoot",
    host: { "data-primitives-part": "command-root" },
})
export class CommandRoot {
    /** The bound text (`[(inputValue)]`); `search()` is the current one. */
    readonly boundInputValue = input<string | undefined>(undefined, {
        alias: "inputValue",
    });
    readonly inputValueChange = output<string>();
    /** The text at first (default `""`). */
    readonly defaultInputValue = input<string | undefined>(undefined);
    readonly inputValueChangeDetails = output<ValueChangeEvent<string>>();
    /** An Item's score for the text (default `commandScore`); `null` turns filtering off. */
    readonly filter = input<CommandFilter | null | undefined>(undefined);
    /** The bound stack of page keys (`[(pages)]`), the last the current page. */
    readonly boundPages = input<readonly string[] | undefined>(undefined, {
        alias: "pages",
    });
    readonly pagesChange = output<string[]>();
    /** The pages at first (default `[]`). */
    readonly defaultPages = input<readonly string[] | undefined>(undefined);
    readonly pagesChangeDetails = output<ValueChangeEvent<string[]>>();
    /** Results are loading (default `false`). */
    readonly loading = input(false, { transform: booleanAttribute });
    /** The arrow keys wrap (default `true`). */
    readonly loopFocus = input(true, { transform: booleanAttribute });

    private readonly text = controllable<string, ChangeDetails>(
        this.boundInputValue,
        this.inputValueChange,
        () => this.defaultInputValue() ?? "",
        (value, details) =>
            this.inputValueChangeDetails.emit({ value, details }),
    );
    /** The text. */
    readonly search = this.text.value;
    private readonly stack = controllable<readonly string[], ChangeDetails>(
        this.boundPages,
        { emit: (pages) => this.pagesChange.emit([...pages]) },
        () => this.defaultPages() ?? NO_PAGES,
        (pages, details) =>
            this.pagesChangeDetails.emit({ value: [...pages], details }),
    );
    /** The stack of page keys. */
    readonly pages = this.stack.value;
    /** The filter in use: `commandScore` unless the consumer's, `null` for none. */
    readonly resolvedFilter = computed<CommandFilter | null>(() => {
        const filter = this.filter();
        return filter === undefined ? commandScore : filter;
    });
    /** The highlighted Item's value. */
    readonly highlighted = signal<string | null>(null);
    /** The shown Items, `null` before the Root rendered in the browser. */
    readonly shownCount = signal<number | null>(null);
    private readonly registered = new Map<HTMLElement, CommandItemInfo>();
    /** Counts the Items' mounts and unmounts. */
    readonly version = signal(0);
    readonly list = signal<HTMLElement | null>(null);
    readonly listId = `${injectId("primitives-command")}-list`;
    readonly host = injectHost();
    private readonly flush = injectFlush();
    private readonly pageKey = computed(() => this.pages().join("\u0000"));

    readonly state = computed<CommandRootState>(() => {
        const pages = this.pages();
        return {
            loading: this.loading(),
            page: pages.length > 0 ? (pages[pages.length - 1] ?? null) : null,
        };
    });

    constructor() {
        // the highlight follows the shown Items (spec/command.md, "Keyboard"): a new text or page
        // highlights the best match, a highlight whose Item is gone the best one left
        let seen: { search: string; pageKey: string } | null = null;
        afterRenderEffect(() => {
            const search = this.search();
            const pageKey = this.pageKey();
            const highlighted = this.highlighted();
            const filter = this.resolvedFilter();
            this.version();
            this.list();
            untracked(() => {
                const previous = seen;
                seen = { search, pageKey };
                if (
                    previous !== null &&
                    previous.pageKey !== pageKey &&
                    search !== ""
                ) {
                    // a new page starts with no text; the next render highlights its best Item
                    this.text.set("", { reason: "page-change" });
                    return;
                }
                const shown = this.shownItems();
                this.shownCount.set(shown.length);
                const changed =
                    previous === null ||
                    previous.search !== search ||
                    previous.pageKey !== pageKey;
                if (
                    !changed &&
                    shown.some((info) => info.value() === highlighted)
                ) {
                    return;
                }
                const scores = shown.map((info) =>
                    commandItemScore(
                        info.value(),
                        search,
                        info.keywords(),
                        filter,
                        info.forceMount(),
                    ),
                );
                const best = bestMatch(
                    scores,
                    (index) => shown[index]?.disabled() ?? true,
                );
                this.highlighted.set(
                    best === -1 ? null : (shown[best]?.value() ?? null),
                );
            });
        });
    }

    /** The shown Items, in the list's order. */
    shownItems(): CommandItemInfo[] {
        const list = this.list();
        if (list === null) {
            return [];
        }
        return [
            ...list.querySelectorAll<HTMLElement>(
                '[role="option"]:not([hidden])',
            ),
        ].flatMap((element) => {
            const info = this.registered.get(element);
            return info === undefined ? [] : [info];
        });
    }

    /** Every registered Item (the Input's `aria-activedescendant`). */
    items(): IterableIterator<CommandItemInfo> {
        return this.registered.values();
    }

    registerItem(element: HTMLElement, info: CommandItemInfo): () => void {
        this.registered.set(element, info);
        this.version.update((count) => count + 1);
        return () => {
            this.registered.delete(element);
            this.version.update((count) => count + 1);
        };
    }

    /** Types `text` (spec/command.md, "Keyboard": typing), rendered at once. */
    type(text: string, event: Event): void {
        this.text.set(text, { reason: "input-change", event });
        this.flush();
    }

    /** Highlights an Item (or none), rendered at once. */
    highlight(value: string | null): void {
        this.highlighted.set(value);
        this.flush();
    }

    /** Back to the previous page (Backspace on an empty Input). */
    back(event: Event): void {
        this.stack.set(untracked(this.pages).slice(0, -1), {
            reason: "backspace-key",
            event,
        });
        this.flush();
    }
}
