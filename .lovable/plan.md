

## Problem

Two issues preventing TikTok posting:

**1. Invalid API payload** — The `post_info` object contains fields TikTok doesn't accept for photo posts: `description` and `auto_add_music`. TikTok's Content Posting API only accepts `title`, `privacy_level`, `disable_comment`, `brand_content_toggle`, and `brand_organic_toggle` in `post_info`. This causes the "The request post info is empty or incorrect" error.

**2. Domain verification required** — TikTok's Content Posting API requires verifying your domain. The second screenshot shows TikTok wants you to upload a verification `.txt` file to `https://preview--film-flavor-forge.lovable.app/`. We need to serve this file from the app.

## Plan

### Step 1: Fix the TikTok API payload (`supabase/functions/post-to-tiktok/index.ts`)

Remove invalid fields from `post_info`:
- Remove `description`
- Remove `auto_add_music`
- Keep only `title`, `privacy_level`, `disable_comment`

Also add `photo_cover_index: 0` to `source_info` (required field).

### Step 2: Serve TikTok verification file

You need to download that verification `.txt` file from the TikTok Developer Portal and provide it to me. I will then place it in the `public/` directory so it's served at the root of your domain (e.g., `https://preview--film-flavor-forge.lovable.app/tiktokuVvQ0MvryWmq754APVBHTHkDmXYE2tdL.txt`).

After the file is deployed, click "Verify" in the TikTok Developer Portal.

### Technical details

The corrected payload will be:
```text
{
  post_info: {
    title: caption (max 150 chars),
    privacy_level: "SELF_ONLY",
    disable_comment: false
  },
  source_info: {
    source: "PULL_FROM_URL",
    photo_images: [...urls],
    photo_cover_index: 0
  },
  post_mode: "DIRECT_POST",
  media_type: "PHOTO"
}
```

### Action needed from you
Please download the TikTok verification file (`tiktokuVvQ0MvryWmq754APVBHTHkDmXYE2tdL.txt`) and upload it here so I can add it to the project.

