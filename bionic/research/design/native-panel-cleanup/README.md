# Native Panel Cleanup: the designer's gallery (visual reference for the Native App components)

- `Native-Panel-Cleanup.dc.html`: the gallery (open in a browser). Boards 1a, 1c, 1d, 1e are the ones that matter.
- `board-1a.png` toolbar states, `board-1c.png` merging "Manual" into capture and the caret menus, `board-1d.png` panels in
  three states, `board-1e.png` footer. 2x crops. Board 1b (Zoom-style) is ignored and 1f is dropped by the owner.
- `brief-T-M-F.md`: the written requirements T1-T9, M1-M11, F1-F6, verbatim. Behaviour and shortcuts never change; only
  layout, visuals and where state is shown.
- The boards draw shortcuts as `⌘⇧S`, `⌥⇧U`...; the app's real bindings differ, so components take shortcuts as props and
  never hard-code them.
