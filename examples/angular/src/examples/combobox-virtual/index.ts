import { Component, signal } from "@angular/core";
import { injectAsyncList } from "@fragiola/primitives-angular/async-list";
import {
    ComboboxEmpty,
    ComboboxInput,
    ComboboxInputGroup,
    ComboboxItem,
    ComboboxPopup,
    ComboboxPortal,
    ComboboxPositioner,
    ComboboxRoot,
    ComboboxStatus,
    ComboboxVirtualList,
    ComboboxVirtualRow,
} from "@fragiola/primitives-angular/combobox-virtual";
import { styles } from "./styles.ts";

interface User {
    value: string;
    label: string;
    team: string;
}

// A made-up directory of 2 000 users, the same on every load, in alphabetical order.
const FIRST =
    "Ada Alan Alice Ben Bruno Carla Chen Dara David Elena Emil Farah Felix Grace Hana Hugo Ines Ivan Jade Jonas Kai Kenji Lara Leo Maya Milo Nadia Noah Olga Omar Paula Priya Rafael Rosa Sami Sofia Tomas Uma Vera Yusuf";
const LAST =
    "Abbott Akers Barros Becker Bianchi Carver Costa Dahl Diaz Duarte Ellis Evans Fischer Fontaine Garcia Greene Haas Hale Ito Jensen Kaur Keller Kim Larsen Lopes Mendes Moreau Moss Nakamura Novak Okafor Olsen Park Patel Quinn Reyes Rossi Santos Schmidt Silva Tanaka Torres Ueda Varga Vogel Wagner Weber Yilmaz Zhang Zimmer";
const TEAMS = [
    "Design",
    "Engineering",
    "Finance",
    "Marketing",
    "Sales",
    "Support",
];
const USERS: User[] = FIRST.split(" ").flatMap((first, row) =>
    LAST.split(" ").map((last, column) => ({
        value: `${first}.${last}`.toLowerCase(),
        label: `${first} ${last}`,
        team: TEAMS[(row + column) % TEAMS.length] as string,
    })),
);

/**
 * The directory's search, as a server would answer it: the next 20 users whose name contains the
 * text, after 400 ms. An aborted search (a newer one replaced it) never answers.
 */
function searchUsers({
    signal,
    filterText,
    cursor = 0,
}: {
    signal: AbortSignal;
    filterText: string;
    cursor: number | undefined;
}): Promise<{ items: User[]; cursor: number | null }> {
    const query = filterText.trim().toLowerCase();
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            const found = USERS.filter((user) =>
                user.label.toLowerCase().includes(query),
            );
            const end = cursor + 20;
            resolve({
                items: found.slice(cursor, end),
                cursor: end < found.length ? end : null,
            });
        }, 400);
        signal.addEventListener("abort", () => {
            clearTimeout(timer);
            reject(signal.reason);
        });
    });
}

// An async user search: the text is sent to the search as it changes, a newer search replaces a
// slower one, and scrolling to the end of the list loads the next page (spec/virtual-lists.md).
@Component({
    selector: "example-user-search",
    imports: [
        ComboboxRoot,
        ComboboxInputGroup,
        ComboboxInput,
        ComboboxStatus,
        ComboboxPortal,
        ComboboxPositioner,
        ComboboxPopup,
        ComboboxEmpty,
        ComboboxVirtualList,
        ComboboxVirtualRow,
        ComboboxItem,
    ],
    template: `
        <div [class]="styles.stack">
            <label for="assignee" [class]="styles.label">Assign to</label>
            <ng-container comboboxRoot [items]="users.items()" [filter]="null" [value]="assignee()" (valueChange)="assignee.set(asUserOrNone($event))" (inputValueChange)="users.setFilterText($event)" name="assignee">
                <div comboboxInputGroup [class]="styles.inputGroup">
                    <input comboboxInput id="assignee" [class]="styles.input" />
                </div>
                <div comboboxStatus [class]="styles.status">{{ users.loading() ? "Loading users…" : "" }}</div>
                <ng-container *comboboxPortal>
                    <div comboboxPositioner [sideOffset]="4" [class]="styles.positioner">
                        <div comboboxPopup [class]="styles.popup">
                            <div comboboxEmpty [class]="styles.empty">{{ users.loading() ? "Searching…" : "No user found." }}</div>
                            <div comboboxVirtualList #list="comboboxVirtualList" [loading]="users.loading()" (loadMore)="users.loadMore()" [class]="styles.list">
                                @for (row of list.rows(); track row.index) {
                                    <div comboboxItem [comboboxVirtualRow]="row" [value]="row.item" [class]="styles.item">{{ asUser(row.item).label }}<span [class]="styles.team">{{ asUser(row.item).team }}</span></div>
                                }
                            </div>
                        </div>
                    </div>
                </ng-container>
            </ng-container>
            <p [class]="styles.result">{{ assignee() === null ? "Nobody assigned." : "Assigned to " + assignee()?.label }}</p>
        </div>
    `,
})
export default class UserSearch {
    protected readonly styles = styles;
    protected readonly users = injectAsyncList({ load: searchUsers });
    protected readonly assignee = signal<User | null>(null);

    /** A row's item as a user: the Combobox API types an item as `unknown`. */
    protected asUser(item: unknown): User {
        return item as User;
    }

    /** The chosen user, or none: the Combobox API types a value as `unknown`. */
    protected asUserOrNone(value: unknown): User | null {
        return (value ?? null) as User | null;
    }
}
