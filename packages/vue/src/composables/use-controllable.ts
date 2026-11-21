import { computed, shallowRef } from "vue";

/**
 * Controlled when `get()` gives a value (it only reports changes), uncontrolled otherwise, seeded
 * by `initial` (spec/README.md, "Normalized API names").
 */
export function useControllable<T, Details>(
    get: () => T | undefined,
    initial: T,
    onChange: (value: T, details: Details) => void,
) {
    const own = shallowRef(initial);
    const value = computed(() => {
        const controlled = get();
        return controlled !== undefined ? controlled : own.value;
    });
    // the value just reported, until the update it causes: a second report of the same change in
    // the same task (a popover's Tab-out, then its focus watch) is not repeated
    let pending: { value: T } | null = null;
    function set(next: T, details: Details) {
        if (Object.is(next, pending ? pending.value : value.value)) {
            return;
        }
        pending = { value: next };
        queueMicrotask(() => {
            pending = null;
        });
        if (get() === undefined) {
            own.value = next;
        }
        onChange(next, details);
    }
    return { value, set };
}
