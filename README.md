# Cooking Personal Website

A personal website about cooking for one in college through **cuisine weeks**: picking one cuisine each week and planning breakfasts, lunches, and dinners around a single shared shopping list, so ingredients get used up before they go bad.

## Live site

https://eavonkirchbach.github.io/cooking_personal_website/

## Pages

- **Home** (`index.html`): an introduction about me, why I started cuisine weeks, links to the other pages, and contact links (email, Instagram, LinkedIn).
- **Cuisines** (`cuisines.html`): six cuisine weeks (Italian, American, Greek, Japanese, Mexican, Spanish). Each week has a shopping list, Breakfast / Lunch / Dinner cards with every recipe tagged as _Learned_, _Created_, or _Need to Try_, and a row of food photos. The page ends with a D3 stacked bar chart of how many recipes in each cuisine have each tag, with a hover tooltip and a "Show as a table" view of the same numbers.
- **Meal Mate** (`meal-mate.html`): an embedded meal-planning tool I built to help other students plan their own cuisine weeks.

## Files

```
index.html, cuisines.html, meal-mate.html   the three pages
styles.css                                  all styling (fonts, colors, layout)
interactivity.js                            builds the cuisine weeks, chart, and table from the CSVs
data/cuisines.csv                           one row per cuisine week (id, name, country, shopping list)
data/recipes.csv                            one row per recipe (cuisine, meal, name, tag)
data/photos.csv                             one row per photo (cuisine, image file, description)
images/                                     all photos
```

## Editing the Cuisines page

Everything on the Cuisines page below the intro comes from the CSV files in `data/`. The weeks, chart, and table update automatically.

- **Change a tag:** edit the `tag` column in `recipes.csv`. Use `learned`, `created`, or `try`.
- **Add a recipe:** add a row to `recipes.csv`. The `cuisine` column must match an `id` in `cuisines.csv`, and `meal` must be `Breakfast`, `Lunch`, or `Dinner`.
- **Add a photo:** put the image in `images/` and add a row to `photos.csv`.
- **Add a cuisine:** add a row to `cuisines.csv`, then its recipes and photos.

Wrap any value that contains a comma in double quotes, e.g. `"Bacon, egg & cheddar breakfast sandwich"`.

## Running it locally

The Cuisines page loads its data with `d3.csv`, so it needs to run through a local server rather than being opened as a file. In VS Code, right-click `index.html` and choose **Open with Live Server**. GitHub Pages works the same way, so the live site needs no extra setup.

## Built with

HTML, CSS, JavaScript, and [D3.js](https://d3js.org/) v7. Fonts are Playfair Display and Lora from Google Fonts.
