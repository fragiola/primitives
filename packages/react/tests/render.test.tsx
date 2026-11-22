import { mergeProps, useRender } from "@fragiola/primitives-react/render";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef, type ReactNode, type RefObject } from "react";
import { afterEach, describe, expect, it } from "vitest";

afterEach(cleanup);

// spec/README.md, "Render utilities": the public entry, as an app writes its own part with it.
interface BadgeState {
    active: boolean;
    disabled: boolean;
    tone: string;
}

function Badge({
    render: renderProp,
    ...props
}: {
    render?: Parameters<typeof useRender<BadgeState>>[0]["render"];
    className?: string | ((state: BadgeState) => string | undefined);
    children?: ReactNode;
    [key: string]: unknown;
}) {
    return useRender<BadgeState>({
        render: renderProp,
        props: { ...props, "data-part": "badge" },
        state: { active: true, disabled: false, tone: "info" },
        defaultTagName: "span",
    });
}

function RefPart({
    own,
    consumer,
}: {
    own: RefObject<HTMLElement | null>;
    consumer: RefObject<HTMLElement | null>;
}) {
    return useRender({ props: { ref: consumer, children: "x" }, ref: own });
}

describe("useRender", () => {
    it("renders the default tag with the props and the state's data attributes", () => {
        render(<Badge>New</Badge>);
        const badge = screen.getByText("New");
        expect(badge.tagName).toBe("SPAN");
        expect(badge.getAttribute("data-part")).toBe("badge");
        expect(badge.getAttribute("data-active")).toBe("");
        expect(badge.hasAttribute("data-disabled")).toBe(false);
        expect(badge.getAttribute("data-tone")).toBe("info");
    });

    it("merges into the consumer's element and resolves className from the state", () => {
        render(
            <Badge
                render={<a href="/new" />}
                className={(state: BadgeState) => (state.active ? "on" : "off")}
            >
                New
            </Badge>,
        );
        const link = screen.getByRole("link", { name: "New" });
        expect(link.getAttribute("href")).toBe("/new");
        expect(link.className).toBe("on");
        expect(link.getAttribute("data-active")).toBe("");
    });

    it("gives a render function the props and the state", () => {
        render(
            <Badge render={(props, state) => <b {...props}>{state.tone}</b>} />,
        );
        expect(screen.getByText("info").tagName).toBe("B");
    });

    it("sets the part's ref and the consumer's", () => {
        const own = createRef<HTMLElement>();
        const consumer = createRef<HTMLElement>();
        render(<RefPart own={own} consumer={consumer} />);
        expect(own.current?.tagName).toBe("DIV");
        expect(consumer.current).toBe(own.current);
    });
});

describe("mergeProps", () => {
    it("merges left to right: handlers compose, classes join, styles merge, later wins", () => {
        const calls: string[] = [];
        const merged = mergeProps<Record<string, unknown>>(
            {
                onClick: () => calls.push("a"),
                className: "a",
                style: { top: 0, left: 0 },
                title: "a",
            },
            {
                onClick: () => calls.push("b"),
                className: "b",
                title: undefined,
            },
            {
                onClick: () => calls.push("c"),
                className: "c",
                style: { left: 4 },
                title: "c",
            },
        );
        (merged.onClick as () => void)();
        expect(calls).toEqual(["a", "b", "c"]);
        expect(merged.className).toBe("a b c");
        expect(merged.style).toEqual({ top: 0, left: 4 });
        expect(merged.title).toBe("c");
    });

    it("keeps the earlier value for an undefined later one", () => {
        expect(mergeProps({ id: "a" }, { id: undefined }, undefined)).toEqual({
            id: "a",
        });
    });
});
