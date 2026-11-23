import {
    type ApplicationRef,
    afterNextRender,
    Component,
    computed,
    DestroyRef,
    type ElementRef,
    inject,
    provideZonelessChangeDetection,
    signal,
    viewChild,
} from "@angular/core";
import { createApplication } from "@angular/platform-browser";
import {
    NavigationEnd,
    provideRouter,
    Router,
    RouterLink,
    withHashLocation,
} from "@angular/router";
import {
    BreadcrumbsCurrent,
    BreadcrumbsItem,
    BreadcrumbsLink,
    BreadcrumbsList,
    BreadcrumbsRoot,
    BreadcrumbsSeparator,
} from "@fragiola/primitives-angular/breadcrumbs";
import { styles } from "./styles.ts";

const TITLES: Record<string, string> = {
    "/": "Home",
    "/docs": "Docs",
    "/docs/components": "Components",
    "/docs/components/breadcrumbs": "Breadcrumbs",
};

/** The pages from the root to `path`: `/`, `/docs`, `/docs/components`, ... */
function trailOf(path: string): string[] {
    const segments = path.split("/").filter(Boolean);
    return [
        "/",
        ...segments.map(
            (_, index) => `/${segments.slice(0, index + 1).join("/")}`,
        ),
    ];
}

/** A route's page: the trail reads the router's url itself. */
@Component({ selector: "example-docs-page", template: "" })
class DocsPage {}

// A trail built from the router's path (spec/breadcrumbs.md): each parent page a Link on the
// router's own anchor (`routerLink`), the current page a Current; the slashes are hidden list items.
@Component({
    selector: "example-breadcrumb-page",
    imports: [
        RouterLink,
        BreadcrumbsRoot,
        BreadcrumbsList,
        BreadcrumbsItem,
        BreadcrumbsLink,
        BreadcrumbsCurrent,
        BreadcrumbsSeparator,
    ],
    template: `
        <div [class]="styles.stack">
            <nav breadcrumbsRoot aria-label="Breadcrumb" [class]="styles.root">
                <ol breadcrumbsList [class]="styles.list">
                    @for (path of trail(); track path; let first = $first) {
                        @if (!first) {
                            <li breadcrumbsSeparator [class]="styles.separator">/</li>
                        }
                        <li breadcrumbsItem [class]="styles.item">
                            @if (path === current()) {
                                <span breadcrumbsCurrent [class]="styles.current">{{ titles[path] }}</span>
                            } @else {
                                <a [routerLink]="path" breadcrumbsLink [class]="styles.link">{{ titles[path] }}</a>
                            }
                        </li>
                    }
                </ol>
            </nav>
            <h2 [class]="styles.heading">{{ titles[current()] }}</h2>
            <ul aria-label="Child pages" [class]="styles.children">
                @for (path of children(); track path) {
                    <li><a [routerLink]="path" [class]="styles.child">{{ titles[path] }}</a></li>
                }
            </ul>
        </div>
    `,
})
class Page {
    protected readonly styles = styles;
    protected readonly titles = TITLES;
    /** The router's url, as a signal: it follows each navigation. */
    protected readonly current = signal(inject(Router).url);
    protected readonly trail = computed(() => trailOf(this.current()));
    protected readonly children = computed(() =>
        Object.keys(TITLES).filter(
            (path) =>
                path !== this.current() &&
                trailOf(path).length === this.trail().length + 1 &&
                path.startsWith(this.current()),
        ),
    );

    constructor() {
        const subscription = inject(Router).events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.current.set(event.urlAfterRedirects);
            }
        });
        inject(DestroyRef).onDestroy(() => subscription.unsubscribe());
    }
}

// The app's router. An app puts `provideRouter(routes)` in its `bootstrapApplication`; this
// example sits in a page that has no router, so it starts its own small application for its
// subtree, with a hash location (the page keeps its address).
@Component({
    selector: "example-router-breadcrumbs",
    template: "<div #outlet></div>",
})
export default class RouterBreadcrumbs {
    private readonly outlet =
        viewChild.required<ElementRef<HTMLElement>>("outlet");

    constructor() {
        let app: ApplicationRef | undefined;
        let destroyed = false;
        afterNextRender(async () => {
            app = await createApplication({
                providers: [
                    provideZonelessChangeDetection(),
                    provideRouter(
                        [
                            ...Object.keys(TITLES).map((path) => ({
                                path: path.slice(1),
                                component: DocsPage,
                            })),
                            { path: "**", redirectTo: "" },
                        ],
                        withHashLocation(),
                    ),
                ],
            });
            if (destroyed) {
                app.destroy();
                return;
            }
            app.bootstrap(Page, this.outlet().nativeElement);
            // the page the example starts on
            void app.injector
                .get(Router)
                .navigateByUrl("/docs/components/breadcrumbs");
        });
        inject(DestroyRef).onDestroy(() => {
            destroyed = true;
            app?.destroy();
        });
    }
}
