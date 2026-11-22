// Adapted from Tree (fragiola/tree, examples/shared/src/meta-types.ts), same author and licence.
//
// The shape of an example's metadata (src/meta/<id>.ts, one file per example, shared by every
// framework). Site-internal: the copyable example files never import it. The fields map onto an
// entry of the site export's manifest.json (scripts/manifest.ts).
//
// The gallery groups examples by category: the family of components they show. The site export
// contract calls a category a `level`: site/examples.json lists CATEGORIES as its `levels` (a site
// test keeps the two equal), and each manifest entry's `level` is its category's id.

/** The gallery's groups, in the order the sidebar lists them. */
export const CATEGORIES = ["overlays", "navigation", "forms"] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_TITLES: Record<Category, string> = {
    overlays: "Overlays",
    navigation: "Navigation",
    forms: "Forms and selection",
};

export const LAYOUTS = ["fill", "flow"] as const;

export type ExampleLayout = (typeof LAYOUTS)[number];

export interface ExampleMeta {
    /** the example's name in the gallery and the page title */
    title: string;
    /** one or two sentences: what it shows */
    description: string;
    /** the family it belongs to: its group in the gallery */
    category: Category;
    /** position inside its category, ascending */
    order: number;
    /** the parts and props it shows, as short tags */
    features: string[];
    /** the docs page it belongs to, base-free, e.g. "/docs/api/dialog" */
    docs?: string;
    /**
     * How the site sizes its frame. `"fill"` (the default): the example fills a frame of
     * `height`. `"flow"`: the frame grows with the content, `height` is its floor.
     */
    layout?: ExampleLayout;
    /** the frame height in pixels (default: {@link DEFAULT_HEIGHT} for its category) */
    height?: number;
}

/** The frame height of an example that names none. */
export const DEFAULT_HEIGHT: Record<Category, number> = {
    overlays: 360,
    navigation: 320,
    forms: 360,
};
