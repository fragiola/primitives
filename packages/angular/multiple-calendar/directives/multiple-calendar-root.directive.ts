import {
    afterNextRender,
    afterRenderEffect,
    computed,
    DestroyRef,
    Directive,
    forwardRef,
    inject,
    input,
    numberAttribute,
    output,
    signal,
    untracked,
} from "@angular/core";
import { type PlainDate, toIsoDate } from "@fragiola/primitives/date";
import {
    CALENDAR,
    CalendarRootBase,
} from "@fragiola/primitives-angular/calendar";
import {
    type ChangeDetails,
    controllable,
    injectHost,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
import { MultipleCalendarState } from "../utils/multiple-calendar-state.ts";

const NONE: PlainDate[] = [];

/**
 * Several dates (spec/calendar.md, "Multiple dates"): `<div multipleCalendarRoot
 * [(value)]="dates">`, with the Calendar's part directives inside (named `multiple-calendar-*`). A
 * press, Enter or Space toggles a date. With a `name`, one hidden input per chosen date follows its
 * children.
 */
@Directive({
    selector: "[multipleCalendarRoot]",
    exportAs: "multipleCalendarRoot",
    providers: [
        {
            provide: CALENDAR,
            useFactory: () =>
                inject(forwardRef(() => MultipleCalendarRoot)).calendar,
        },
    ],
})
export class MultipleCalendarRoot extends CalendarRootBase {
    /** The chosen dates, sorted from the earliest (controlled). */
    readonly value = input<PlainDate[] | undefined>(undefined);
    readonly valueChange = output<PlainDate[]>();
    /** The chosen dates at first (uncontrolled; default none). */
    readonly defaultValue = input<PlainDate[] | undefined>(undefined);
    readonly valueChangeDetails = output<ValueChangeEvent<PlainDate[]>>();
    /** How many dates can be chosen at most (default: no limit). */
    readonly maxSelected = input<number | undefined, unknown>(undefined, {
        transform: (value: unknown) =>
            value === undefined || value === null
                ? undefined
                : numberAttribute(value),
    });
    /** The form name: one hidden input per chosen date (ISO 8601). */
    readonly name = input<string | undefined>(undefined);
    private readonly dates = controllable<PlainDate[], ChangeDetails>(
        this.value,
        this.valueChange,
        () => this.defaultValue() ?? NONE,
        (value, details) => this.valueChangeDetails.emit({ value, details }),
    );
    readonly calendar = new MultipleCalendarState(
        this.stateInputs(
            computed(() => this.dates.value()[0] ?? null),
            { emit: () => {} },
            signal(undefined),
        ),
        {
            value: this.dates.value,
            set: this.dates.set,
            maxSelected: this.maxSelected,
        },
    );

    constructor() {
        super();
        const host = injectHost();
        const doc = host.ownerDocument;
        // the hidden inputs, the last children of the root, as React renders them; written after
        // the render (a hydration walks the server's DOM as its template has it), so a server
        // renders none
        let inputs: HTMLInputElement[] = [];
        afterRenderEffect({
            write: () => {
                const name = this.name();
                const dates = name === undefined ? NONE : this.dates.value();
                const disabled = this.disabled();
                for (const old of inputs) {
                    old.remove();
                }
                inputs = dates.map((date) => {
                    const element = doc.createElement("input");
                    element.type = "hidden";
                    element.name = name ?? "";
                    element.value = toIsoDate(date);
                    element.disabled = disabled;
                    element.setAttribute(
                        "data-primitives-part",
                        "multiple-calendar-input",
                    );
                    host.appendChild(element);
                    return element;
                });
            },
        });
        // a form reset returns the dates to their default (the reset event fires before the reset)
        let stop = () => {};
        afterNextRender(() => {
            const form = host.closest("form");
            if (form === null) {
                return;
            }
            let timer: ReturnType<typeof setTimeout> | undefined;
            const onReset = () => {
                if (untracked(this.name) === undefined) {
                    return;
                }
                timer = setTimeout(() =>
                    this.dates.set(untracked(this.defaultValue) ?? NONE, {
                        reason: "none",
                    }),
                );
            };
            form.addEventListener("reset", onReset);
            stop = () => {
                clearTimeout(timer);
                form.removeEventListener("reset", onReset);
            };
        });
        inject(DestroyRef).onDestroy(() => {
            stop();
            for (const old of inputs) {
                old.remove();
            }
        });
    }
}
