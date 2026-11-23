import { Autocomplete } from "@fragiola/primitives-react/autocomplete";
import { useState } from "react";
import { styles } from "./styles.ts";

const FRAMEWORKS = [
    "Angular",
    "Astro",
    "Ember",
    "Lit",
    "Next.js",
    "Nuxt",
    "Preact",
    "Qwik",
    "React",
    "Remix",
    "Solid",
    "Svelte",
    "Vue",
];

// A search with suggestions: the list follows the text, the arrows highlight a suggestion, Enter
// or a click fills it in, any other text is searched as typed, and Escape closes the list, then
// clears the text (spec/autocomplete.md).
export default function SearchSuggestions() {
    const [searched, setSearched] = useState<string>();
    return (
        <form
            className={styles.stack}
            onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                setSearched(String(data.get("q") ?? ""));
            }}
        >
            <label htmlFor="search" className={styles.label}>
                Search frameworks
            </label>
            <Autocomplete.Root items={FRAMEWORKS} name="q">
                <Autocomplete.InputGroup className={styles.inputGroup}>
                    <Autocomplete.Input id="search" className={styles.input} />
                    <Autocomplete.Clear
                        aria-label="Clear search"
                        className={styles.clear}
                    >
                        ×
                    </Autocomplete.Clear>
                </Autocomplete.InputGroup>
                <Autocomplete.Portal>
                    <Autocomplete.Positioner
                        sideOffset={4}
                        className={styles.positioner}
                    >
                        <Autocomplete.Popup className={styles.popup}>
                            <Autocomplete.Empty className={styles.empty}>
                                No suggestion.
                            </Autocomplete.Empty>
                            <Autocomplete.List className={styles.list}>
                                {(name: string) => (
                                    <Autocomplete.Item
                                        key={name}
                                        value={name}
                                        className={styles.item}
                                    >
                                        {name}
                                    </Autocomplete.Item>
                                )}
                            </Autocomplete.List>
                        </Autocomplete.Popup>
                    </Autocomplete.Positioner>
                </Autocomplete.Portal>
            </Autocomplete.Root>
            <p className={styles.result}>
                {searched === undefined
                    ? "Press Enter to search."
                    : `Results for “${searched}”`}
            </p>
        </form>
    );
}
