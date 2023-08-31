let tap_chart;
let tap_labels = [];
let tap_data = [];
let expected_values;

let max_expected = 1000; // how many expected is the max for the graph

document.addEventListener("DOMContentLoaded", function() {
    const ctx = document.getElementById('histogram');

    tap_chart = new Chart(ctx, {
        plugins: [ChartDataLabels],
        type: 'bar',
        data: {
            labels: tap_labels,
            datasets: [{
                    label: 'Number of Egg Types Tapped',
                    data: tap_data,
                    borderWidth: 1,
                    datalabels: {
                        align: 'end',
                        anchor: 'end'
                    }
                },
                {
                    label: 'Expected',
                    data: [],
                    borderWidth: 1
                },
            ]
        },
        options: {
            plugins: {
                datalabels: {
                    formatter: function(value, context) {
                        return value.toLocaleString();
                    }
                }
            },
            animation: {
                duration: 1,
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
});

async function multi_tap_sim(sauce, amount) {
    let simulator = new Simulator();
    await simulator.initialize();

    reset_list();
    sauce = get_number_from_text(sauce);

    let num_updates = sauce / 1000000;
    if (num_updates < 1) {
        num_updates = 1;
    }
    num_updates = Math.floor(num_updates);
    let sauce_per_update = sauce / num_updates;
    // let total_updates = num_updates * amount;

    // console.log(`Updates: ${num_updates}`);
    // console.log(`Update Sauce: ${sauce_per_update}`);
    // console.log(`Leftover Sauce: ${leftover_sauce}`);

    var values_found = {};
    let i = 0;
    let amount_loop = setInterval(function() {
        if (i < amount) {
            update_expected(sauce, simulator.rarity_list);
            let updates = 0;
            let update_loop = setInterval(function() {
                if (updates < num_updates) {
                    let simulation_result = simulator.tap_simulation(sauce_per_update);
                    values_found = update_values_found(values_found, reduce_values_found(simulation_result));

                    let superior_values = purgeWeaklings(sauce, values_found);

                    update_list(superior_values, simulator.rarity_list);

                    updates++;
                    document.getElementById("taps-remaining").innerHTML = `Taps Done: ${formatNumberWithSuffix(sauce_per_update * updates)} (${((sauce_per_update * updates * 100) / sauce).toFixed(2)}%)`;
                    if (updates == num_updates) {
                        let luck_score = calculateLuckScore(values_found, sauce, simulator.rarity_list);
                        document.getElementById("luck-score").innerHTML = `Luck Score: ${luck_score}x`;
                    }
                } else {
                    clearInterval(update_loop);
                }
            })
        } else {
            clearInterval(amount_loop);
        }
        i++;
    }, 0);

}

function calculateLuckScore(values_found, sauce, rarities) {
    let luck_score;
    let score = calculateCompeteScore(values_found, rarities);
    let expected_score = 0;
    rarities.forEach(element => {
        expected_score += (1 - ((1 - (1 / element)) ** sauce));
    });
    expected_score *= sauce;
    luck_score = score / expected_score;
    if (luck_score < 1)
        luck_score = -(1 / luck_score);
    return luck_score.toFixed(2);
}

function calculateCompeteScore(values_found, rarities) {
    let compete_score = 0;
    let i = 0;
    for (const key in values_found) {
        compete_score += Number(key) * values_found[key];
        i++;
    }
    return compete_score;
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

function update_list(values_found, labels) {
    let first_value;
    let last_value;
    let chart_values = {};
    for (const key in expected_values) {
        if (!first_value && expected_values[key] <= max_expected) {
            first_value = Number(key);
        }
        if (expected_values[key]) {
            last_value = Number(key);
        }
    }
    for (const rarity of labels) {
        if (values_found[rarity.toString()]) {
            if (rarity > last_value) {
                last_value = rarity;
            }
        }
    }
    let first_value_index = labels.indexOf(first_value, 0);
    let last_value_index = labels.indexOf(last_value, 0);
    // console.log(`${first_value} | ${last_value}`);
    // console.log(`${first_value_index} -> ${last_value_index}`);
    let label_keys = [];
    for (let i = 0; i < labels.length; i++) {
        label_keys[i] = labels[i].toString();
    }
    for (let i = first_value_index; i <= last_value_index; i++) {
        if (values_found[label_keys[i]]) {
            chart_values[label_keys[i]] = values_found[label_keys[i]];
        } else if (expected_values[label_keys[i]] > 0) {
            chart_values[label_keys[i]] = 0;
        }
    }
    tap_chart.data.datasets[0].data = Object.values(chart_values);
    tap_chart.data.labels = Object.keys(chart_values).map(formatNumberWithSuffix);
    tap_chart.update();
}

function update_expected(total_taps, labels) {
    expected_values = calculateExpected(total_taps, labels);
    const subset = Object.keys(expected_values).reduce((acc, key) => {
        for (const key in expected_values) {
            if (expected_values[key] <= max_expected) {
                acc[key] = expected_values[key];
            }
        }
        return acc;
    }, {});

    tap_chart.data.datasets[1].data = Object.values(subset);
    tap_chart.update();
}

function reset_list() {
    let divs = document.getElementsByName("power");
    for (let i = 0; i < divs.length; i++)
        divs[i].innerHTML = "";
}

function calculateExpected(taps, labels) {
    const result = labels.map((label) => Math.floor(taps / label));

    // Creating a dictionary with labels as keys
    const dictionary = labels.reduce((acc, label, index) => {
        acc[label] = result[index];
        return acc;
    }, {});

    return dictionary;
}

function purgeWeaklings(total_taps, values_found) {
    let superior_values = {};
    let weaklings_cutoff = total_taps / max_expected;
    for (const key in values_found) {
        if (Number(key) >= weaklings_cutoff) {
            superior_values[key] = values_found[key];
        }
    }
    return superior_values;

function setOptionsDefaults() {
    let text_fields = document.getElementsByClassName("options-input");
    text_fields.namedItem("max-sauce-input").value = "100m";
}

function moreOptions() {
    document.getElementById("more-options-content").classList.toggle("show");
}

function openHelp() {
    document.getElementById("help-menu-content").classList.toggle("show-menu");
}

function setup() {
    // This is for anything we want to run when the page loads
    setOptionsDefaults();
}