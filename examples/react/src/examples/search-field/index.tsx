import { SearchField } from "@fragiola/primitives-react/search-field";
import { useState } from "react";
import { styles } from "./styles.ts";

const PRODUCTS = ["Desk lamp", "Floor lamp", "Standing desk", "Desk chair"];

// A product search (spec/search-field.md): typing filters the list, Escape or the clear button
// empties the field (the button is out of the tab order: Escape clears from the keyboard), and
// Enter searches for the query.
export default function ProductSearch() {
    const [query, setQuery] = useState("");
    const [searched, setSearched] = useState("");
    const matches = PRODUCTS.filter((name) =>
        name.toLowerCase().includes(query.trim().toLowerCase()),
    );
    return (
        <search className={styles.stack}>
            <label htmlFor="product-search" className={styles.label}>
                Search products
            </label>
            <SearchField.Root
                id="product-search"
                value={query}
                onValueChange={setQuery}
                onSubmit={(value) => setSearched(`Searched for “${value}”.`)}
                className={styles.root}
            >
                <svg
                    className={styles.icon}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                >
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-4-4" />
                </svg>
                <SearchField.Input
                    placeholder="Lamps, desks…"
                    className={styles.input}
                />
                <SearchField.ClearButton
                    aria-label="Clear search"
                    className={styles.clearButton}
                >
                    <svg
                        className={styles.icon}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                    >
                        <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                </SearchField.ClearButton>
            </SearchField.Root>
            <ul aria-label="Results" className={styles.list}>
                {matches.map((name) => (
                    <li key={name}>{name}</li>
                ))}
            </ul>
            <p role="status" className={styles.status}>
                {searched}
            </p>
        </search>
    );
}
