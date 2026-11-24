import {
    Component,
    computed,
    DestroyRef,
    DOCUMENT,
    effect,
    inject,
    signal,
} from "@angular/core";
import {
    CommandEmpty,
    CommandGroup,
    CommandGroupLabel,
    CommandInput,
    CommandItem,
    CommandList,
    CommandRoot,
    CommandSeparator,
} from "@fragiola/primitives-angular/command";
import {
    DialogBackdrop,
    DialogPopup,
    DialogPortal,
    DialogRoot,
    DialogTrigger,
} from "@fragiola/primitives-angular/dialog";
import { styles } from "./styles.ts";

// An app's command menu: a Command inside a modal Dialog that Ctrl+K (⌘K) toggles, the app's own
// shortcut (spec/command.md, "The Command dialog"). Typing filters the commands by their names
// and keywords, the arrows move the highlight while focus stays in the input, Enter runs one,
// "Change theme…" opens a nested page that Backspace on the empty input leaves.
@Component({
    selector: "example-command-menu",
    imports: [
        DialogRoot,
        DialogTrigger,
        DialogPortal,
        DialogBackdrop,
        DialogPopup,
        CommandRoot,
        CommandInput,
        CommandList,
        CommandGroup,
        CommandGroupLabel,
        CommandSeparator,
        CommandItem,
        CommandEmpty,
    ],
    template: `
        <div [class]="styles.stack">
            <ng-container dialogRoot [(open)]="open">
                <button dialogTrigger [class]="styles.trigger">Open command menu</button>
                <ng-container *dialogPortal>
                    <div dialogBackdrop [class]="styles.backdrop"></div>
                    <div dialogPopup aria-label="Command menu" [class]="styles.popup">
                        <div commandRoot [(pages)]="pages" [class]="styles.root">
                            <input commandInput aria-label="Command" placeholder="Type a command or search…" [class]="styles.input" />
                            <div commandEmpty [class]="styles.empty">No results.</div>
                            <div commandList [class]="styles.list">
                                @if (page() === undefined) {
                                    <div commandGroup [class]="styles.group">
                                        <div commandGroupLabel [class]="styles.groupLabel">Navigation</div>
                                        <div commandItem [value]="'Home'" (itemSelect)="run($event.value)" [class]="styles.item">Home</div>
                                        <div commandItem [value]="'Settings'" [keywords]="['preferences']" (itemSelect)="run($event.value)" [class]="styles.item">Settings</div>
                                        <div commandItem [value]="'Profile'" [keywords]="['account']" (itemSelect)="run($event.value)" [class]="styles.item">Profile</div>
                                    </div>
                                    <div commandSeparator [class]="styles.separator"></div>
                                    <div commandGroup [class]="styles.group">
                                        <div commandGroupLabel [class]="styles.groupLabel">Actions</div>
                                        <div commandItem [value]="'Change theme…'" (itemSelect)="pages.set(['theme'])" [class]="styles.item">Change theme…</div>
                                        <div commandItem [value]="'Copy link'" [keywords]="['share', 'url']" (itemSelect)="run($event.value)" [class]="styles.item">Copy link</div>
                                        <div commandItem [value]="'Delete project'" [disabled]="true" (itemSelect)="run($event.value)" [class]="styles.item">Delete project</div>
                                    </div>
                                }
                                @if (page() === "theme") {
                                    @for (theme of themes; track theme) {
                                        <div commandItem [value]="theme" (itemSelect)="run($event.value)" [class]="styles.item">{{ theme }}</div>
                                    }
                                }
                            </div>
                        </div>
                    </div>
                </ng-container>
            </ng-container>
            <p [class]="styles.shortcut">Or press Ctrl K (⌘K on a Mac).</p>
            <p role="status" [class]="styles.status">{{ ran() === null ? "" : "Ran: " + ran() }}</p>
        </div>
    `,
})
export default class CommandMenu {
    protected readonly styles = styles;
    protected readonly themes = ["Light", "Dark", "System"];
    protected readonly open = signal(false);
    protected readonly pages = signal<string[]>([]);
    protected readonly page = computed(() => this.pages().at(-1));
    protected readonly ran = signal<string | null>(null);

    constructor() {
        const document = inject(DOCUMENT);
        const toggle = (event: KeyboardEvent) => {
            if (
                event.key.toLowerCase() === "k" &&
                (event.metaKey || event.ctrlKey)
            ) {
                event.preventDefault();
                this.open.update((current) => !current);
            }
        };
        document.addEventListener("keydown", toggle);
        inject(DestroyRef).onDestroy(() =>
            document.removeEventListener("keydown", toggle),
        );
        effect(() => {
            if (!this.open()) this.pages.set([]);
        });
    }

    protected run(value: string): void {
        this.ran.set(value);
        this.open.set(false);
    }
}
