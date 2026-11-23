/** A list as its values joined with `,`, `none` when empty. */
export function printList(values: readonly string[] | undefined): string {
    return values === undefined || values.length === 0
        ? "none"
        : values.join(",");
}
