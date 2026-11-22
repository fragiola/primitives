// @fragiola/primitives-angular: the primitives for Angular 22 (standalone directives, signals,
// zoneless; spec/, AGENTS.md). Each component is its own secondary entry point
// (`@fragiola/primitives-angular/<component>`); the root entry only re-exports them, so importing
// from it tree-shakes to the same output. There is no NgModule of every directive.

export * from "@fragiola/primitives-angular/dialog";
export * from "@fragiola/primitives-angular/menu";
export * from "@fragiola/primitives-angular/popover";
export * from "@fragiola/primitives-angular/tabs";
export * from "@fragiola/primitives-angular/tooltip";
