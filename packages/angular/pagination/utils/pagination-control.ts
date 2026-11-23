import { computed, inject, type Signal } from "@angular/core";
import type { ChangeReason } from "@fragiola/primitives-angular/internal";
import { PaginationRoot } from "../directives/pagination-root.directive.ts";

/** What a Previous, Next, First or Last renders with. */
export interface PaginationControlState {
    /** The page it moves to. */
    page: number;
    disabled: boolean;
}

export type PaginationControlKind = "previous" | "next" | "first" | "last";

/** The attributes of a pressable part: a native button's, or a link's (`nativeButton` false). */
export function controlAttributes(
    nativeButton: boolean,
    disabled: boolean,
): {
    type: string | null;
    disabled: string | null;
    ariaDisabled: string | null;
} {
    return nativeButton
        ? { type: "button", disabled: disabled ? "" : null, ariaDisabled: null }
        : {
              type: null,
              disabled: null,
              ariaDisabled: disabled ? "true" : null,
          };
}

/**
 * The shared code of Previous, Next, First and Last (spec/pagination.md), in the directive's
 * injection context (`nativeButton` its input): its target page, disabled at its edge, and its press.
 */
export function paginationControl(
    kind: PaginationControlKind,
    nativeButton: Signal<boolean>,
): {
    state: Signal<PaginationControlState>;
    attributes: Signal<ReturnType<typeof controlAttributes>>;
    press: (event: Event) => void;
} {
    const root = inject(PaginationRoot);
    const target = computed(() => {
        const page = root.currentPage();
        return kind === "previous"
            ? page - 1
            : kind === "next"
              ? page + 1
              : kind === "first"
                ? 1
                : root.pageCount();
    });
    const state = computed<PaginationControlState>(() => {
        const page = root.currentPage();
        const count = root.pageCount();
        const atEdge =
            kind === "previous" || kind === "first" ? page <= 1 : page >= count;
        return {
            page: Math.min(count, Math.max(1, target())),
            disabled: root.disabled() || atEdge,
        };
    });
    const attributes = computed(() =>
        controlAttributes(nativeButton(), state().disabled),
    );
    return {
        state,
        attributes,
        press: (event) => {
            if (state().disabled) {
                event.preventDefault();
                return;
            }
            root.setPage(target(), {
                reason: `${kind}-press` as ChangeReason,
                event,
            });
        },
    };
}
