import { useEffect } from "react";
import { readQuery } from "../kit/query.ts";
import { routes } from "./routes.tsx";

/**
 * The fixture's page for `path` and `search` (spec/README.md, "Scenarios and fixtures"). It reads
 * no `window`: the server renders it too (`src/server/entry-server.tsx`).
 */
export function App({ path, search }: { path: string; search: string }) {
    // the page is rendered (or hydrated): conformance's ssr layer waits for it. Here, not in a
    // sibling, so the server and the client render the same tree (and `useId` the same ids)
    useEffect(() => {
        document.documentElement.setAttribute("data-fixture-ready", "");
    }, []);
    const query = readQuery(search);
    const Scenario = routes[path];
    if (Scenario === undefined) {
        return (
            <main className="p-6">
                <h1 className="text-lg font-semibold">React fixture</h1>
                <ul>
                    {Object.keys(routes).map((route) => (
                        <li key={route}>
                            <a href={route}>{route}</a>
                        </li>
                    ))}
                </ul>
            </main>
        );
    }
    return (
        <main className="p-6">
            <Scenario locale={query.locale} />
        </main>
    );
}
