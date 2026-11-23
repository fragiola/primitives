import { defineComponent, h, type InjectionKey, inject } from "vue";

/** Where the fixture router goes (spec/link.md, `/link/router`). */
export const NavigateKey: InjectionKey<(route: string) => void> =
    Symbol("Navigate");

/**
 * The fixture's router link (spec/link.md, `/link/router`): an anchor whose plain click the router
 * takes over, as a router's link does; its attributes fall through to the anchor.
 */
export const RouterLink = defineComponent({
    name: "FixtureRouterLink",
    props: { to: { type: String, required: true } },
    setup(props, { slots }) {
        const navigate = inject(NavigateKey, () => {});
        return () =>
            h(
                "a",
                {
                    href: props.to,
                    onClick: (event: MouseEvent) => {
                        if (event.defaultPrevented) {
                            return;
                        }
                        event.preventDefault();
                        navigate(props.to);
                    },
                },
                slots.default?.(),
            );
    },
});
