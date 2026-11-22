import { Button } from "@fragiola/primitives-vue/button";
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { h } from "vue";

// spec/button.md: while disabled, the consumer's listeners do not run
describe("Button", () => {
    it("runs the consumer's click listener only while enabled", async () => {
        const onClick = vi.fn();
        const wrapper = mount(Button, {
            props: { disabled: true, focusableWhenDisabled: true },
            attrs: { onClick },
            slots: { default: () => "Publish" },
        });
        await wrapper.get("button").trigger("click");
        expect(onClick).not.toHaveBeenCalled();
        await wrapper.setProps({ disabled: false });
        await wrapper.get("button").trigger("click");
        expect(onClick).toHaveBeenCalledOnce();
        wrapper.unmount();
    });

    it("prevents every key but Tab while disabled and focusable", () => {
        const onKeydown = vi.fn();
        const wrapper = mount(Button, {
            props: { disabled: true, focusableWhenDisabled: true },
            attrs: { onKeydown },
            slots: { default: () => "Publish" },
        });
        const button = wrapper.get("button").element;
        const key = (name: string) =>
            button.dispatchEvent(
                new KeyboardEvent("keydown", {
                    key: name,
                    bubbles: true,
                    cancelable: true,
                }),
            );
        expect(key("Enter")).toBe(false);
        expect(key("Tab")).toBe(true);
        expect(onKeydown).not.toHaveBeenCalled();
        wrapper.unmount();
    });

    it("clicks a non-native button on Enter's key down and on Space's key up", () => {
        const onClick = vi.fn();
        const wrapper = mount(
            () =>
                h(
                    Button,
                    { nativeButton: false, as: "span", onClick },
                    () => "Archive",
                ),
            { attachTo: document.body },
        );
        const button = wrapper.get('[role="button"]').element;
        expect(button.tagName).toBe("SPAN");
        const key = (type: string, name: string) =>
            button.dispatchEvent(
                new KeyboardEvent(type, {
                    key: name,
                    bubbles: true,
                    cancelable: true,
                }),
            );
        key("keydown", "Enter");
        expect(onClick).toHaveBeenCalledTimes(1);
        // Space's key down does not scroll and does not click yet
        expect(key("keydown", " ")).toBe(false);
        expect(onClick).toHaveBeenCalledTimes(1);
        key("keyup", " ");
        expect(onClick).toHaveBeenCalledTimes(2);
        wrapper.unmount();
    });
});
