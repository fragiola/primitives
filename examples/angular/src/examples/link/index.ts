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
import { Link } from "@fragiola/primitives-angular/link";
import { styles } from "./styles.ts";

const FIRST = { path: "/getting-started", title: "Getting started" };
const PAGES = [
    FIRST,
    { path: "/guides", title: "Guides" },
    { path: "/api", title: "API reference" },
];

/** A route's page: the sidebar reads the router's url itself. */
@Component({ selector: "example-docs-page", template: "" })
class DocsPage {}

// A docs sidebar (spec/link.md): each Link sits on the router's own anchor (`routerLink`), which
// navigates; the Link adds the current page (`aria-current="page"`) and a disabled page that
// navigates nowhere (its click stops before the router's listener).
@Component({
    selector: "example-docs",
    imports: [Link, RouterLink],
    template: `
        <div [class]="styles.layout">
            <nav aria-label="Docs" [class]="styles.nav">
                <ul [class]="styles.links">
                    @for (entry of pages; track entry.path) {
                        <li>
                            <a [routerLink]="entry.path" link [current]="entry.path === page().path" [class]="styles.root">{{ entry.title }}</a>
                        </li>
                    }
                    <li>
                        <a routerLink="/changelog" link disabled [class]="styles.root">Changelog</a>
                    </li>
                </ul>
            </nav>
            <div [class]="styles.page">
                <h2 [class]="styles.heading">{{ page().title }}</h2>
                <p [class]="styles.text">The router went to {{ path() }}.</p>
            </div>
        </div>
    `,
})
class Docs {
    protected readonly styles = styles;
    protected readonly pages = PAGES;
    /** The router's url, as a signal: it follows each navigation. */
    protected readonly path = signal(inject(Router).url);
    protected readonly page = computed(
        () => PAGES.find((entry) => entry.path === this.path()) ?? FIRST,
    );

    constructor() {
        const subscription = inject(Router).events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.path.set(event.urlAfterRedirects);
            }
        });
        inject(DestroyRef).onDestroy(() => subscription.unsubscribe());
    }
}

// The app's router. An app puts `provideRouter(routes)` in its `bootstrapApplication`; this
// example sits in a page that has no router, so it starts its own small application for its
// subtree, with a hash location (the page keeps its address).
@Component({
    selector: "example-docs-navigation",
    template: "<div #outlet></div>",
})
export default class DocsNavigation {
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
                            ...PAGES.map(({ path }) => ({
                                path: path.slice(1),
                                component: DocsPage,
                            })),
                            { path: "changelog", component: DocsPage },
                            { path: "**", redirectTo: "getting-started" },
                        ],
                        withHashLocation(),
                    ),
                ],
            });
            if (destroyed) {
                app.destroy();
                return;
            }
            app.bootstrap(Docs, this.outlet().nativeElement);
        });
        inject(DestroyRef).onDestroy(() => {
            destroyed = true;
            app?.destroy();
        });
    }
}
