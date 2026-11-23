import { Breadcrumbs } from "@fragiola/primitives-react/breadcrumbs";
import { Fragment } from "react";
import { MemoryRouter, Link as RouterLink, useLocation } from "react-router";
import { styles } from "./styles.ts";

const TITLES: Record<string, string> = {
    "/": "Home",
    "/docs": "Docs",
    "/docs/components": "Components",
    "/docs/components/breadcrumbs": "Breadcrumbs",
};

/** The pages from the root to `pathname`: `/`, `/docs`, `/docs/components`, ... */
function trailOf(pathname: string): string[] {
    const segments = pathname.split("/").filter(Boolean);
    return [
        "/",
        ...segments.map(
            (_, index) => `/${segments.slice(0, index + 1).join("/")}`,
        ),
    ];
}

// A trail built from the router's path (spec/breadcrumbs.md): each parent page a Link rendered
// through the router, the current page a Current; the slashes are hidden list items.
function Page() {
    const { pathname } = useLocation();
    const trail = trailOf(pathname);
    const children = Object.keys(TITLES).filter(
        (path) =>
            path !== pathname &&
            trailOf(path).length === trail.length + 1 &&
            path.startsWith(pathname),
    );
    return (
        <div className={styles.stack}>
            <Breadcrumbs.Root aria-label="Breadcrumb" className={styles.root}>
                <Breadcrumbs.List className={styles.list}>
                    {trail.map((path, index) => (
                        <Fragment key={path}>
                            {index > 0 ? (
                                <Breadcrumbs.Separator
                                    className={styles.separator}
                                >
                                    /
                                </Breadcrumbs.Separator>
                            ) : null}
                            <Breadcrumbs.Item className={styles.item}>
                                {path === pathname ? (
                                    <Breadcrumbs.Current
                                        className={styles.current}
                                    >
                                        {TITLES[path]}
                                    </Breadcrumbs.Current>
                                ) : (
                                    <Breadcrumbs.Link
                                        render={<RouterLink to={path} />}
                                        className={styles.link}
                                    >
                                        {TITLES[path]}
                                    </Breadcrumbs.Link>
                                )}
                            </Breadcrumbs.Item>
                        </Fragment>
                    ))}
                </Breadcrumbs.List>
            </Breadcrumbs.Root>
            <h2 className={styles.heading}>{TITLES[pathname]}</h2>
            <ul aria-label="Child pages" className={styles.children}>
                {children.map((path) => (
                    <li key={path}>
                        <RouterLink to={path} className={styles.child}>
                            {TITLES[path]}
                        </RouterLink>
                    </li>
                ))}
            </ul>
        </div>
    );
}

// The app's router: a memory router here, so the example keeps the page's own address.
export default function RouterBreadcrumbs() {
    return (
        <MemoryRouter initialEntries={["/docs/components/breadcrumbs"]}>
            <Page />
        </MemoryRouter>
    );
}
