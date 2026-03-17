# Orda Games Studio Website

This is a multi-page static studio website built for GitHub Pages.

## Included pages

- `index.html` — home page with hero, news slider, featured games, and stats
- `about.html` — studio overview, values, and workflow
- `games.html` — searchable and filterable games page
- `game.html?slug=...` — game detail page template
- `history.html` — timeline / studio history page
- `staff.html` — team page with profile modal
- `contact.html` — contact page with working static-hosting mail draft form

## Main editing file

Most content is controlled from:

- `data/site-data.json`

You can edit:

- studio name and logos
- navigation
- homepage stats
- values
- workflow
- games
- news
- milestones
- staff
- contact info
- FAQ

## Logo files

The site currently expects these files in `./images/`:

- `Orda Games White.png`
- `Orda Games Black.png`

I included placeholder versions with those exact names so the site works immediately.
You can replace them with your real logos using the same file names.

## Contact form note

Because GitHub Pages is static hosting, it cannot directly send email from a backend by itself.

This version uses a `mailto:` workflow:
- visitor fills the form
- the browser opens the default mail app
- an email draft is prepared to `ordagamesofficial@gmail.com`

If you want true direct form submission later, you can replace the current handler in `js/app.js` with:
- EmailJS
- Formspree
- FormSubmit
- Netlify Forms
- your own backend / serverless function

## Publish to GitHub Pages

1. Create a GitHub repository, for example `ordagames.github.io`
2. Upload all files from this folder to the repository root
3. Commit and push
4. In GitHub, go to **Settings → Pages**
5. Set source to **Deploy from a branch**
6. Choose the `main` branch and `/root`
7. Save

Your site will then be available at:
`https://ordagames.github.io`

## Customize the games

Each game entry in `data/site-data.json` supports fields like:

- `poster`
- `name`
- `tagline`
- `shortDescription`
- `description`
- `releaseDate`
- `status`
- `genre`
- `platforms`
- `engine`
- `tags`
- `featured`
- `slug`

## Notes

- The current game and staff content is polished demo content so the site looks complete immediately.
- Replace the placeholder posters and staff images whenever you want.
- All links use relative paths, so the project is ready for GitHub Pages.
