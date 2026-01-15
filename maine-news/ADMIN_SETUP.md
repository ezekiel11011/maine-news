# Maine News Today: Admin & Content Management Guide

This document summarizes the changes made to the "Exclusive" content system and provides instructions for managing the site.

## 1. Authentication & Login
The Admin area is now secured using **GitHub OAuth**. There are no "passwords" to remember; the system uses your GitHub identity.

*   **Login URL**: `/admin/login`
*   **Credentials**: Your registered GitHub account (the same one used for Keystatic/GitHub contributions).
*   **Permissions**: Any authorized GitHub user in the repository can access the admin panel.

## 2. Content Storage Locations
We now use a "Hybrid" approach to content:
*   **Manual/Authored Posts ("Exclusives")**: Stored in the **Neon PostgreSQL Database**. Use the new Admin Panel (`/admin`) to manage these.
*   **Scraped/Automated Posts**: Stored as **Markdown files** (`.mdoc`) in `src/content/scraped/`. These are managed via the **Keystatic Admin** (`/keystatic`).

## 3. The New Admin Panel (`/admin`)
Use this for high-quality, original site content.
*   **Dashboard**: Overview of post counts and recent activity.
*   **Exclusives List**: View and manage all database-backed stories.
*   **Rich Text Editor**: A professional TipTap editor with formatting options (Bold, Headings, Quotes, Links, Images).

## 4. Crucial Environmental Variables
For the Admin area to function in your production environment (Vercel), you **must** ensure these variables are set:

| Variable | Description |
| :--- | :--- |
| `DATABASE_URL` | Your Neon PostgreSQL connection string. |
| `AUTH_SECRET` | A random long string (e.g., `openssl rand -base64 32`). |
| `KEYSTATIC_GITHUB_CLIENT_ID` | Your GitHub OAuth App Client ID. |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | Your GitHub OAuth App Client Secret. |

## 5. Next Implementation Steps (Optional)
The system is currently stable and fully integrated. If you wish to expand further:
*   **Edit/Delete UI**: While API routes exist, the UI for "Edit" and "Delete" of posts can be fully fleshed out in the `/admin/posts` list.
*   **Authors & Videos Management**: You can create dedicated admin pages for the `authors` and `videos` tables in the database.
*   **Newsletter Integration**: The custom editor content can be tied into the Resend newsletter system for automatic broadcasts.

---
**Maine News Today Implementation Team**
*Unbiased. Unafraid. Unfiltered.*
