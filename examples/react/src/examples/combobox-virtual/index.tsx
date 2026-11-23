import { useAsyncList } from "@fragiola/primitives-react/async-list";
import {
    Combobox,
    ComboboxVirtual,
} from "@fragiola/primitives-react/combobox-virtual";
import { useState } from "react";
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
export default function UserSearch() {
    const users = useAsyncList({ load: searchUsers });
    const [assignee, setAssignee] = useState<User | null>(null);
    return (
        <div className={styles.stack}>
            <label htmlFor="assignee" className={styles.label}>
                Assign to
            </label>
            <Combobox.Root
                items={users.items}
                filter={null}
                value={assignee}
                onValueChange={(user: User | null) => setAssignee(user)}
                onInputValueChange={(text: string) => users.setFilterText(text)}
                name="assignee"
            >
                <Combobox.InputGroup className={styles.inputGroup}>
                    <Combobox.Input id="assignee" className={styles.input} />
                </Combobox.InputGroup>
                <Combobox.Status className={styles.status}>
                    {users.loading ? "Loading users…" : ""}
                </Combobox.Status>
                <Combobox.Portal>
                    <Combobox.Positioner
                        sideOffset={4}
                        className={styles.positioner}
                    >
                        <Combobox.Popup className={styles.popup}>
                            <Combobox.Empty className={styles.empty}>
                                {users.loading
                                    ? "Searching…"
                                    : "No user found."}
                            </Combobox.Empty>
                            <ComboboxVirtual.List
                                loading={users.loading}
                                onLoadMore={users.loadMore}
                                className={styles.list}
                            >
                                {(user: User) => (
                                    <Combobox.Item
                                        value={user}
                                        className={styles.item}
                                    >
                                        {user.label}
                                        <span className={styles.team}>
                                            {user.team}
                                        </span>
                                    </Combobox.Item>
                                )}
                            </ComboboxVirtual.List>
                        </Combobox.Popup>
                    </Combobox.Positioner>
                </Combobox.Portal>
            </Combobox.Root>
            <p className={styles.result}>
                {assignee === null
                    ? "Nobody assigned."
                    : `Assigned to ${assignee.label}`}
            </p>
        </div>
    );
}
