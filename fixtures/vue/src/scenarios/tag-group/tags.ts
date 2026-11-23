/** A tag of the TagGroup scenarios (spec/tag-group.md, "Scenarios"). */
export interface Tag {
    value: string;
    label: string;
}

export const CATEGORIES: readonly Tag[] = [
    { value: "news", label: "News" },
    { value: "travel", label: "Travel" },
    { value: "gaming", label: "Gaming" },
    { value: "shopping", label: "Shopping" },
    { value: "sports", label: "Sports" },
];

export const SORTS: readonly Tag[] = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "popular", label: "Popular" },
];

export const SKILLS: readonly Tag[] = [
    { value: "design", label: "Design" },
    { value: "writing", label: "Writing" },
    { value: "research", label: "Research" },
];

/** A list as its values joined with `,`, `none` when empty. */
export function printList(values: readonly string[]): string {
    return values.length === 0 ? "none" : values.join(",");
}

/** /tag-group/form: at least one skill. */
export function validateSkills(value: unknown): string | null {
    return Array.isArray(value) && value.length === 0
        ? "Choose a skill."
        : null;
}
