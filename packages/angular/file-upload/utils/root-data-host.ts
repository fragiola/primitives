/**
 * The host bindings of the Root's state attributes, for a part whose directive holds the Root as
 * `root` (spec/file-upload.md, "State attributes and ARIA"): every part carries the Field's state
 * and the Root's own, as React's.
 */
export const ROOT_DATA_HOST = {
    "[attr.data-invalid]": "root.data().invalid",
    "[attr.data-valid]": "root.data().valid",
    "[attr.data-dirty]": "root.data().dirty",
    "[attr.data-touched]": "root.data().touched",
    "[attr.data-filled]": "root.data().filled",
    "[attr.data-focused]": "root.data().focused",
    "[attr.data-disabled]": "root.data().disabled",
    "[attr.data-empty]": "root.data().empty",
    "[attr.data-drop-target]": "root.data().dropTarget",
} as const;
