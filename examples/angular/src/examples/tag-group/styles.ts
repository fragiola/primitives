import { tagGroup } from "examples-shared/recipes/tag-group";

// The example's classes: the TagGroup recipe (one string per part), its multi-word parts under
// names the markup can read without a string, the empty message, the articles and their count.
export const styles = {
    ...tagGroup,
    tagCell: tagGroup["tag-cell"],
    removeButton: tagGroup["remove-button"],
    stack: "flex w-full max-w-md flex-col items-start gap-3 font-primitives text-(length:--pr-size) text-palette-contrast",
    empty: "text-palette-accent/85",
    articles:
        "flex w-full flex-col divide-y divide-palette-line rounded-control border border-palette-line",
    article: "flex items-center justify-between gap-3 px-3 py-2",
    topic: "text-xs text-palette-accent/85",
    status: "text-palette-accent/85",
};
