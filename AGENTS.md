<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Storefront architecture
- Preserve TanStack Start routing and keep the initial storefront at `/`; secondary pages are deferred until requested.
- Store mock catalog data in a browser-safe module and reuse product cards across homepage sections to keep category assignments and shopping actions consistent.
- Use a shared React storefront context with hydration-safe localStorage for demo cart, wishlist and recent searches; this project intentionally has no backend.
- Define all visual roles and responsive component styles in `src/styles.css`, using semantic OKLCH tokens and the shared Button for commands.
