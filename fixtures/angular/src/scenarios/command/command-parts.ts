import {
    CommandEmpty,
    CommandGroup,
    CommandGroupLabel,
    CommandInput,
    CommandItem,
    CommandList,
    CommandLoading,
    CommandRoot,
    CommandSeparator,
} from "@fragiola/primitives-angular/command";

/** Every Command directive, for a scenario's `imports`. */
export const COMMAND_PARTS = [
    CommandRoot,
    CommandInput,
    CommandList,
    CommandGroup,
    CommandGroupLabel,
    CommandSeparator,
    CommandItem,
    CommandEmpty,
    CommandLoading,
] as const;

/**
 * The items of the Command scenarios (spec/command.md, "Scenarios"): two groups and a separator,
 * in a template whose component has `styles` (the recipe) and `run(value)`.
 */
export const COMMAND_ITEMS = `
    <div commandGroup [class]="styles.group">
        <div commandGroupLabel [class]="styles['group-label']">Suggestions</div>
        <div commandItem [value]="'Calendar'" (itemSelect)="run($event.value)" [class]="styles.item">Calendar</div>
        <div commandItem [value]="'Search Emoji'" (itemSelect)="run($event.value)" [class]="styles.item">Search Emoji</div>
        <div commandItem [value]="'Calculator'" [disabled]="true" (itemSelect)="run($event.value)" [class]="styles.item">Calculator</div>
    </div>
    <div commandSeparator [class]="styles.separator"></div>
    <div commandGroup [class]="styles.group">
        <div commandGroupLabel [class]="styles['group-label']">Settings</div>
        <div commandItem [value]="'Profile'" [keywords]="['account']" (itemSelect)="run($event.value)" [class]="styles.item">Profile</div>
        <div commandItem [value]="'Billing'" (itemSelect)="run($event.value)" [class]="styles.item">Billing</div>
        <div commandItem [value]="'Archive'" (itemSelect)="run($event.value)" [class]="styles.item">Archive</div>
    </div>
`;
