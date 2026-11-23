---
"@fragiola/primitives": patch
"@fragiola/primitives-react": patch
"@fragiola/primitives-vue": patch
"@fragiola/primitives-angular": patch
---

Stage 1 follow-ups. A Checkbox writes its rendered state back onto its hidden input after a form reset, so a controlled checkbox that refuses the reset keeps a matching input. The Tabs Indicator takes a `nonce` for its `renderBeforeHydration` script (Angular: `*tabsIndicator="true; nonce: cspNonce"`, else Angular's `CSP_NONCE`), so it runs under a Content Security Policy. An async `validate` in a mode that does not validate on change hides a shown error at once on a change. In a native form that mixes a picker and native controls, the browser no longer moves the focus on to a later invalid native control after the picker's trigger took it (the toolkit's form bridge). A calendar with no `locale` follows a later change of the document's `lang` (the toolkit's `watchDocumentLanguage`). A hover-opened Tooltip and NavigationMenu panel close when the pointer leaves the window or the iframe at once (the toolkit's `watchPointerExit`).
