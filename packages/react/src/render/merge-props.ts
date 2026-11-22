import { mergeProps as mergeTwo } from "../utils/merge-props.ts";

/**
 * Merges props left to right, as every part merges its own with the consumer's (spec/README.md,
 * "Render utilities"): event handlers compose (the earlier first), `className` joins, `style`
 * merges (the later wins), any other later prop wins (`undefined` leaves the earlier).
 */
export function mergeProps<Props extends object = Record<string, unknown>>(
    ...props: readonly (Partial<Props> | null | undefined)[]
): Props {
    let merged: Record<string, unknown> = {};
    for (const entry of props) {
        if (entry != null) {
            merged = mergeTwo(merged, entry as Record<string, unknown>);
        }
    }
    return merged as Props;
}
