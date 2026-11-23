<script setup lang="ts">
import { useAsyncList } from "@fragiola/primitives-vue/async-list";
import {
    Combobox,
    ComboboxVirtual,
} from "@fragiola/primitives-vue/combobox-virtual";
import { ref } from "vue";
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
const users = useAsyncList({ load: searchUsers });
const assignee = ref<User | null>(null);
</script>

<template>
    <div :class="styles.stack">
        <label for="assignee" :class="styles.label">Assign to</label>
        <Combobox.Root :items="users.items" :filter="null" v-model:value="assignee" name="assignee" @input-value-change="(text: string) => users.setFilterText(text)">
            <Combobox.InputGroup :class="styles.inputGroup">
                <Combobox.Input id="assignee" :class="styles.input" />
            </Combobox.InputGroup>
            <Combobox.Status :class="styles.status">{{ users.loading ? "Loading users…" : "" }}</Combobox.Status>
            <Combobox.Portal>
                <Combobox.Positioner :side-offset="4" :class="styles.positioner">
                    <Combobox.Popup :class="styles.popup">
                        <Combobox.Empty :class="styles.empty">{{ users.loading ? "Searching…" : "No user found." }}</Combobox.Empty>
                        <ComboboxVirtual.List v-slot="{ entry: user }: { entry: User }" :loading="users.loading" :class="styles.list" @load-more="users.loadMore">
                            <Combobox.Item :value="user" :class="styles.item">{{ user.label }}<span :class="styles.team">{{ user.team }}</span></Combobox.Item>
                        </ComboboxVirtual.List>
                    </Combobox.Popup>
                </Combobox.Positioner>
            </Combobox.Portal>
        </Combobox.Root>
        <p :class="styles.result">{{ assignee === null ? "Nobody assigned." : `Assigned to ${assignee.label}` }}</p>
    </div>
</template>
