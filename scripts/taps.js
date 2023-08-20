let tap_chart;
let tap_labels = [];
let tap_data = [];

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

function shorten_number_by_magnitude(number) {
    let magnitudes = ['', 'k', 'm', 'b', 't'];
    let i = 0;
    while (number >= 1000) {
        number /= 1000;
        i++;
    }
    return (number + magnitudes[i]);
}

function get_number_from_text(number) {
    // This returns the number corresponding to the value entered (4t, 2.89b, etc)
    let magnitudes = ['', 'k', 'm', 'b', 't'];
    //let numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    let index = -1;
    for (let i = 0; i < number.length; i++) {
        if (magnitudes.includes(number[i])) {
            index = i;
        }
    }
    if (index == -1)
        return (+number);
    let value = number.slice(0, index);
    for (let i = 1; i < magnitudes.length; i++) {
        if (magnitudes[i] == number[index])
            return (value * 1000);
        value *= 1000;
    }
}

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
            let updates = 0;
            let update_loop = setInterval(function() {
                if (updates < num_updates) {
                    let simulation_result = simulator.tap_simulation(sauce_per_update);
                    values_found = update_values_found(values_found, reduce_values_found(simulation_result));

                    update_list(values_found);
                    update_expected(((updates + 1) * sauce_per_update), simulator.rarity_list, values_found);

                    updates++;
                    document.getElementById("taps-remaining").innerHTML = `Taps Done: ${formatNumberWithSuffix(sauce_per_update * updates)} (${((sauce_per_update * updates * 100) / sauce).toFixed(2)}%)`;
                    console.log(`Taps Done: ${formatNumberWithSuffix(sauce_per_update * updates)} (${((sauce_per_update * updates * 100) / sauce).toFixed(2)}%)`);
                    if (updates == num_updates) {
                        let luck_score = calculateLuckScore(values_found, sauce, simulator.rarity_list);
                        console.log(values_found);
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

function update_list(values_found) {
    tap_chart.data.datasets[0].data = Object.values(values_found);
    tap_chart.data.labels = Object.keys(values_found).map(formatNumberWithSuffix);
    tap_chart.update();
}

function update_expected(current_sauce, labels, values_found) {
    expected_dict = calculateExpected(current_sauce, labels);
    const subset = Object.keys(expected_dict).reduce((acc, key) => {
        if (values_found.hasOwnProperty(key)) {
            acc[key] = expected_dict[key];
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

function formatNumberWithSuffix(number) {
    if (number >= 1000000000000) {
        return (Math.round((number / 1000000000000) * 100) / 100 + 't');
    } else if (number >= 1000000000) {
        return (Math.round((number / 1000000000) * 100) / 100 + 'b');
    } else if (number >= 1000000) {
        return (Math.round((number / 1000000) * 100) / 100 + 'm');
    } else if (number >= 1000) {
        return (Math.round((number / 1000) * 100) / 100 + 'k');
    } else {
        return number.toString();
    }
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