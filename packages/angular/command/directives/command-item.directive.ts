import {
    afterRenderEffect,
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    inject,
    input,
    type OnInit,
    output,
} from "@angular/core";
import { scrollIntoViewWithin } from "@fragiola/primitives/collection";
import { commandItemScore } from "@fragiola/primitives/command";
import {
    dataValues,
    injectHost,
    injectId,
} from "@fragiola/primitives-angular/internal";
import { CommandGroup } from "./command-group.directive.ts";
import {
    CommandRoot,
    type CommandSelectEvent,
} from "./command-root.directive.ts";

export interface CommandItemState {
    highlighted: boolean;
    disabled: boolean;
    /** It does not match the text: rendered `hidden`. */
    hidden: boolean;
}

const NO_KEYWORDS: readonly string[] = [];

/**
 * An `option`: an action, hidden while it does not match the text (spec/command.md):
 * `<div commandItem value="Calendar" (itemSelect)="run($event.value)">`.
 */
@Directive({
    selector: "[commandItem]",
    exportAs: "commandItem",
    host: {
        role: "option",
        "data-primitives-part": "command-item",
        "[attr.id]": "id",
        "[attr.hidden]": "state().hidden ? '' : null",
        "[attr.aria-selected]": "state().highlighted ? 'true' : 'false'",
        "[attr.aria-disabled]": "state().disabled ? 'true' : null",
        "[attr.data-highlighted]": "data().highlighted",
        "[attr.data-disabled]": "data().disabled",
        "(pointermove)": "onPointerMove()",
        "(pointerdown)": "$event.preventDefault()",
        "(click)": "onClick($event)",
    },
})
export class CommandItem implements OnInit {
    private readonly root = inject(CommandRoot);
    /** The text the filter scores, and the Item's identity in the Command. */
    readonly value = input.required<string>();
    /** More texts the filter scores. */
    readonly keywords = input<readonly string[]>(NO_KEYWORDS);
    /** Highlighted by the arrows, never run. */
    readonly disabled = input(false, { transform: booleanAttribute });
    /** Always shown, whatever the text. */
    readonly forceMount = input(false, { transform: booleanAttribute });
    /** Runs the action (Enter, a press). */
    readonly itemSelect = output<CommandSelectEvent>();
    protected readonly id = injectId("primitives-command-item");
    /** It does not match the text. */
    readonly hidden = computed(
        () =>
            commandItemScore(
                this.value(),
                this.root.search(),
                this.keywords(),
                this.root.resolvedFilter(),
                this.forceMount(),
            ) === 0,
    );
    readonly state = computed<CommandItemState>(() => {
        const hidden = this.hidden();
        return {
            highlighted: !hidden && this.root.highlighted() === this.value(),
            disabled: this.disabled(),
            hidden,
        };
    });
    protected readonly data = computed(() =>
        dataValues({
            highlighted: this.state().highlighted,
            disabled: this.state().disabled,
        }),
    );

    private readonly host = injectHost();
    private readonly group = inject(CommandGroup, { optional: true });
    private readonly destroyRef = inject(DestroyRef);

    constructor() {
        const host = this.host;
        const root = this.root;
        afterRenderEffect(() => {
            if (this.state().highlighted) {
                scrollIntoViewWithin(host, root.host);
            }
        });
    }

    // once its inputs are set: the Root and the Group read them
    ngOnInit(): void {
        const unregister = this.root.registerItem(this.host, {
            value: this.value,
            keywords: this.keywords,
            disabled: this.disabled,
            forceMount: this.forceMount,
            id: this.id,
            run: (event) =>
                this.itemSelect.emit({ value: this.value(), event }),
        });
        const leave = this.group?.register(this.hidden);
        this.destroyRef.onDestroy(() => {
            unregister();
            leave?.();
        });
    }

    protected onPointerMove(): void {
        if (!this.state().highlighted) {
            this.root.highlight(this.value());
        }
    }

    protected onClick(event: MouseEvent): void {
        if (!this.disabled()) {
            this.itemSelect.emit({ value: this.value(), event });
        }
    }
}
