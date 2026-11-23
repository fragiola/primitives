import { Link } from "@fragiola/primitives-react/link";
import { MemoryRouter, Link as RouterLink, useLocation } from "react-router";
import { styles } from "./styles.ts";

const PAGES = [
    { path: "/getting-started", title: "Getting started" },
    { path: "/guides", title: "Guides" },
    { path: "/api", title: "API reference" },
];

// A docs sidebar (spec/link.md): each Link renders the router's own link, which navigates; the
// Link adds the current page (`aria-current="page"`) and a disabled page that navigates nowhere.
function Docs() {
    const { pathname } = useLocation();
    const page = PAGES.find((entry) => entry.path === pathname) ?? PAGES[0];
    return (
        <div className={styles.layout}>
            <nav aria-label="Docs" className={styles.nav}>
                <ul className={styles.links}>
                    {PAGES.map((entry) => (
                        <li key={entry.path}>
                            <Link
                                render={<RouterLink to={entry.path} />}
                                current={entry.path === page?.path}
                                className={styles.root}
                            >
                                {entry.title}
                            </Link>
                        </li>
                    ))}
                    <li>
                        <Link
                            render={<RouterLink to="/changelog" />}
                            disabled
                            className={styles.root}
                        >
                            Changelog
                        </Link>
                    </li>
                </ul>
            </nav>
            <div className={styles.page}>
                <h2 className={styles.heading}>{page?.title}</h2>
                <p className={styles.text}>The router went to {pathname}.</p>
            </div>
        </div>
    );
}

// The app's router: a memory router here, so the example keeps the page's own address.
export default function DocsNavigation() {
    return (
        <MemoryRouter initialEntries={["/getting-started"]}>
            <Docs />
        </MemoryRouter>
    );
}
