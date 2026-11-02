var cuisineData = [];
var recipeData = [];
var photoData = [];

var mealTypes = ["Breakfast", "Lunch", "Dinner"];
var tagTypes = ["learned", "created", "try"];
var tagLabels = { learned: "Learned", created: "Created", try: "Need to Try" };
var tagColors = { learned: "#4a7c3f", created: "#d9822b", try: "#2a78d6" };

// Load the three CSV files, then build the page
Promise.all([
    d3.csv("data/cuisines.csv"),
    d3.csv("data/recipes.csv"),
    d3.csv("data/photos.csv")
]).then(function(files) {
    cuisineData = files[0];
    recipeData = files[1];
    photoData = files[2];

    addCuisineLinksToPage("cuisine-links");
    addWeeksToPage("weeks");
    modularAddD3VisToPage("chart");
    addTableToPage("chart-data");
});


// Cuisine weeks

function addCuisineLinksToPage(elementID) {
    // Adds one link per cuisine that jumps down to that cuisine's week.
    //
    // Parameters:
    //     elementID (string): ID of the list to fill, e.g. "cuisine-links"
    // Returns:
    //     nothing (adds the links to the page)

    var list = document.getElementById(elementID);

    for (var index = 0; index < cuisineData.length; index++) {
        var cuisine = cuisineData[index];
        var item = document.createElement("li");
        item.innerHTML = '<a href="#' + cuisine.id + '">' + cuisine.country + '</a>';
        list.appendChild(item);
    }
}

function addWeeksToPage(elementID) {
    // Adds a section for each cuisine with its shopping list, meal cards, and photos.
    //
    // Parameters:
    //     elementID (string): ID of the element to add the weeks to, e.g. "weeks"
    // Returns:
    //     nothing (adds the weeks to the page)

    var weeksContainer = document.getElementById(elementID);

    for (var index = 0; index < cuisineData.length; index++) {
        var cuisine = cuisineData[index];

        var section = document.createElement("section");
        section.className = "cuisine-week";
        section.id = cuisine.id;

        var heading = document.createElement("h3");
        heading.innerHTML = cuisine.name + " Week";
        section.appendChild(heading);

        var shopping = document.createElement("p");
        shopping.className = "shopping-list";
        shopping.innerHTML = "<strong>Shopping list:</strong> " + cuisine.shopping;
        section.appendChild(shopping);

        section.appendChild(createMealCards(cuisine.id));
        section.appendChild(createPhotoRow(cuisine.id));

        weeksContainer.appendChild(section);
    }
}

function createMealCards(cuisineID) {
    // Builds the Breakfast, Lunch, and Dinner cards for one cuisine.
    //
    // Parameters:
    //     cuisineID (string): ID of the cuisine, e.g. "italy"
    // Returns:
    //     div: the meal cards, each listing that cuisine's recipes with their tags

    var meals = document.createElement("div");
    meals.className = "meal-cards";

    for (var mealIndex = 0; mealIndex < mealTypes.length; mealIndex++) {
        var mealType = mealTypes[mealIndex];

        var card = document.createElement("div");
        card.className = "meal-card";
        card.innerHTML = "<h4>" + mealType + "</h4>";

        var list = document.createElement("ul");
        for (var recipeIndex = 0; recipeIndex < recipeData.length; recipeIndex++) {
            var recipe = recipeData[recipeIndex];
            if (recipe.cuisine == cuisineID && recipe.meal == mealType) {
                var item = document.createElement("li");
                item.innerHTML = recipe.name + ' <span class="recipe-tag tag-' + recipe.tag + '">' + tagLabels[recipe.tag] + '</span>';
                list.appendChild(item);
            }
        }

        card.appendChild(list);
        meals.appendChild(card);
    }

    return meals;
}

function createPhotoRow(cuisineID) {
    // Builds the row of photos for one cuisine.
    //
    // Parameters:
    //     cuisineID (string): ID of the cuisine, e.g. "italy"
    // Returns:
    //     div: that cuisine's photos

    var photoRow = document.createElement("div");
    photoRow.className = "photo-row";

    for (var index = 0; index < photoData.length; index++) {
        var photo = photoData[index];
        if (photo.cuisine == cuisineID) {
            var image = document.createElement("img");
            image.src = photo.src;
            image.alt = photo.alt;
            photoRow.appendChild(image);
        }
    }

    return photoRow;
}


// D3 chart

function countTags() {
    // Counts how many recipes in each cuisine are learned, created, or need to try.
    //
    // Parameters:
    //     none
    // Returns:
    //     array: one row per cuisine, e.g. { cuisine: "Italian", learned: 4, created: 2, 
    //            try: 2, total: 8 }

    var counts = [];

    for (var cuisineIndex = 0; cuisineIndex < cuisineData.length; cuisineIndex++) {
        var cuisine = cuisineData[cuisineIndex];
        var row = { cuisine: cuisine.name, learned: 0, created: 0, try: 0, total: 0 };

        for (var recipeIndex = 0; recipeIndex < recipeData.length; recipeIndex++) {
            var recipe = recipeData[recipeIndex];
            if (recipe.cuisine == cuisine.id) {
                row[recipe.tag] += 1;
                row.total += 1;
            }
        }

        counts.push(row);
    }

    return counts;
}

function modularAddD3VisToPage(elementID) {
    // Draws a D3 stacked bar chart of recipe tags per cuisine, with a hover tooltip.
    //
    // Parameters:
    //     elementID (string): ID of the element to add the chart to, e.g. "chart"
    // Returns:
    //     nothing (adds the chart to the page)

    var counts = countTags();
    var width = 760;
    var height = 300;
    var left = 90;
    var bottom = 30;

    var svg = d3.select("#" + elementID)
        .append("svg")
        .attr("viewBox", "0 0 " + width + " " + height);

    // Scales: cuisines down the side, recipe counts across
    var yScale = d3.scaleBand()
        .domain(counts.map(function(row) { return row.cuisine; }))
        .range([0, height - bottom])
        .padding(0.3);

    var xScale = d3.scaleLinear()
        .domain([0, d3.max(counts, function(row) { return row.total; })])
        .range([left, width - 40]);

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + left + ",0)")
        .call(d3.axisLeft(yScale).tickSize(0));

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (height - bottom) + ")")
        .call(d3.axisBottom(xScale).ticks(5));

    // Bars: one stacked layer per tag, with a hover tooltip
    var tooltip = d3.select("#tooltip");
    var layers = d3.stack().keys(tagTypes)(counts);

    layers.forEach(function(layer) {
        svg.selectAll(null)
            .data(layer)
            .join("rect")
            .attr("class", "bar")
            .attr("fill", tagColors[layer.key])
            .attr("x", function(segment) { return xScale(segment[0]); })
            .attr("y", function(segment) { return yScale(segment.data.cuisine); })
            .attr("width", function(segment) { return xScale(segment[1]) - xScale(segment[0]); })
            .attr("height", yScale.bandwidth())
            .on("mousemove", function(event, segment) {
                tooltip
                    .attr("hidden", null)
                    .html("<strong>" + segment.data.cuisine + "</strong><br>" + tagLabels[layer.key] + ": " + segment.data[layer.key])
                    .style("left", event.clientX + 12 + "px")
                    .style("top", event.clientY + 12 + "px");
            })
            .on("mouseleave", function() {
                tooltip.attr("hidden", true);
            });
    });

    // Total at the end of each bar
    svg.selectAll(null)
        .data(counts)
        .join("text")
        .attr("class", "bar-total")
        .attr("x", function(row) { return xScale(row.total) + 6; })
        .attr("y", function(row) { return yScale(row.cuisine) + yScale.bandwidth() / 2 + 5; })
        .text(function(row) { return row.total; });
}

function addTableToPage(elementID) {
    // Fills the "Show as a table" view with the same numbers as the chart.
    //
    // Parameters:
    //     elementID (string): ID of the table to fill, e.g. "chart-data"
    // Returns:
    //     nothing (adds the rows to the table)

    var table = document.getElementById(elementID);
    var counts = countTags();

    table.innerHTML = "<tr><th>Cuisine</th><th>Learned</th><th>Created</th><th>Need to Try</th><th>Total</th></tr>";

    for (var index = 0; index < counts.length; index++) {
        var row = document.createElement("tr");
        var cell1 = document.createElement("td");
        var cell2 = document.createElement("td");
        var cell3 = document.createElement("td");
        var cell4 = document.createElement("td");
        var cell5 = document.createElement("td");
        cell1.innerHTML = counts[index].cuisine;
        cell2.innerHTML = counts[index].learned;
        cell3.innerHTML = counts[index].created;
        cell4.innerHTML = counts[index].try;
        cell5.innerHTML = counts[index].total;
        row.appendChild(cell1);
        row.appendChild(cell2);
        row.appendChild(cell3);
        row.appendChild(cell4);
        row.appendChild(cell5);
        table.appendChild(row);
    }
}
