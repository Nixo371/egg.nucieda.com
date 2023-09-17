let ready_for_click = false;
let scramble_values;
let revealed_eggs;
let cells = document.getElementsByClassName("scramble-cell-text");

async function multi_scramble_sim(sauce, amount) {
    let simulator = new Simulator();
    await simulator.initialize();

    sauce = get_number_from_text(sauce);
    revealed_eggs = 0;

    let values_found = {};
    let i = 0;
    let amount_loop = setInterval(function() {
        if (i < amount) {
            let simulation_result = simulator.scramble_simulation(sauce);
            values_found = update_values_found(values_found, reduce_values_found(simulation_result));

            scramble_values = update_grid(values_found, simulator.reversed_rarities);
            setTimeout(hide_scramble, 1500);
            scramble(scramble_values);
            ready_for_click = true;
            i++;
        } else {
            clearInterval(amount_loop);
        }
    }, 0);
}

function update_grid(values_found, reversed_rarities) {
    let best_9 = [];
    for (let i = 0; i < reversed_rarities.length; i++) {
        let rarity_str = String(reversed_rarities[i]);

        while (best_9.length < 9 && values_found[rarity_str] > 0) {
            best_9.push(reversed_rarities[i]);
            values_found[rarity_str]--;
        }
    }
    while (best_9.length < 9) {
        best_9.push(0);
    }

    for (let i = 0; i < cells.length; i++) {
        cells[i].innerHTML = formatNumberWithSuffix(String(best_9[i]));
    }

    return (best_9);
}

function hide_scramble() {
    for (let i = 0; i < cells.length; i++) {
        cells[i].innerHTML = "?";
    }
}

function scramble(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function click_scramble(cell) {

    if (!ready_for_click || revealed_eggs >= 3 || cells[cell - 1].innerHTML != "?") {
        return;
    }

    cells[cell - 1].innerHTML = formatNumberWithSuffix(String(scramble_values[cell - 1]));
    revealed_eggs++;

    if (revealed_eggs == 3) {
        setTimeout(reveal_all_eggs, 1000);
    }
}

function reveal_all_eggs() {
    for (let i = 0; i < cells.length; i++) {
        cells[i].innerHTML = formatNumberWithSuffix(String(scramble_values[i]));
    }
}

function update_values_found(previous, current) {
    let sum_object = {};
    for (const key in previous) {
        sum_object[key] = previous[key];
    }

    for (const key in current) {
        if (sum_object.hasOwnProperty(key)) {
            sum_object[key] += current[key];
        } else {
            sum_object[key] = current[key];
        }
    }

    return sum_object;
}

// Reduces a list of values found into a concise form.
// Ex: [250, 500, 250, 5000, 250] -> {250: 2, 500: 1, 5000: 1}
function reduce_values_found(values_found) {
    const counts = values_found.reduce((counts, number) => {
        counts[number] = (counts[number] || 0) + 1;
        return counts;
    }, {});

    const sortedArray = Object.entries(counts).sort(([keyA], [keyB]) => {
        // Use localeCompare for sorting keys as strings
        return keyA.localeCompare(keyB);
    });

    // Step 2: Convert the sorted array back to an object
    const sorted_counts = Object.fromEntries(sortedArray);

    return sorted_counts;
}