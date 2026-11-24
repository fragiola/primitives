/**
 * A template ref setter keeping a part's element (a component's `$el` too) in `target`: the
 * overlay root's `elementSetter`, written again here so an inline picker's entry bundles none of
 * the overlay code (spec/color-picker.md, "Two entries").
 */
export function colorPickerElement(target: { value: HTMLElement | null }) {
    return (value: unknown) => {
        const element =
            value instanceof HTMLElement
                ? value
                : ((value as { $el?: HTMLElement } | null)?.$el ?? null);
        if (target.value !== element) {
            target.value = element;
        }
    };
}
