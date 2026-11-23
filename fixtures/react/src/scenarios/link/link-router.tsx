import { link } from "examples-shared/recipes/link";
import {
    type ComponentProps,
    createContext,
    type MouseEvent,
    useContext,
    useState,
} from "react";
import { Output } from "../../kit/output.tsx";
import { Link } from "../../kit/ui/link.tsx";

const Navigate = createContext<(route: string) => void>(() => {});

/**
 * The fixture's router link (spec/link.md, `/link/router`): an anchor whose plain click the router
 * takes over, as a router's link does.
 */
function RouterLink({
    to,
    onClick,
    ...props
}: ComponentProps<"a"> & { to: string }) {
    const navigate = useContext(Navigate);
    return (
        <a
            {...props}
            href={to}
            onClick={(event: MouseEvent<HTMLAnchorElement>) => {
                onClick?.(event);
                if (event.defaultPrevented) {
                    return;
                }
                event.preventDefault();
                navigate(to);
            }}
        />
    );
}

/** spec/link.md, `/link/router` */
export function LinkRouter() {
    const [route, setRoute] = useState("/");
    return (
        <Navigate.Provider value={setRoute}>
            <div className={link.list}>
                <Link render={<RouterLink to="/settings" />}>Settings</Link>
                <Link render={<RouterLink to="/billing" />} disabled>
                    Billing
                </Link>
            </div>
            <Output values={{ route }} />
        </Navigate.Provider>
    );
}
