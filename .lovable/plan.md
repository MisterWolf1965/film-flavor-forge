

## Show Full Skit in Gallery Post

The `skit` field is already generated and stored on each `GeneratedContent` item, but it's not displayed in the gallery card. 

### Changes

**`src/components/GalleryCard.tsx`** — Add the skit text prominently in the post, between the image and the action buttons:
- Display the skit in a styled block with a film/quote aesthetic (italic mono text, subtle background)
- Show the full skit without truncation
- Format: film icon + skit text as a quote block

**`src/components/GalleryCard.tsx`** — Also remove `line-clamp-3` from the social description so the full caption is visible too.

This is a small, single-file change.

