/** The host bindings of an Item's state attributes, for a part holding its Item as `item`. */
export const ITEM_DATA_HOST = {
    "[attr.data-invalid]": "item.data().invalid",
    "[attr.data-valid]": "item.data().valid",
    "[attr.data-dirty]": "item.data().dirty",
    "[attr.data-touched]": "item.data().touched",
    "[attr.data-filled]": "item.data().filled",
    "[attr.data-focused]": "item.data().focused",
    "[attr.data-disabled]": "item.data().disabled",
    "[attr.data-empty]": "item.data().empty",
    "[attr.data-drop-target]": "item.data().dropTarget",
    "[attr.data-rejected]": "item.data().rejected",
} as const;
