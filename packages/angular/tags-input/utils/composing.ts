/** A key of a text composition (an IME), which the TagsInput leaves alone. */
export function composing(event: KeyboardEvent): boolean {
    return event.isComposing || event.keyCode === 229;
}
