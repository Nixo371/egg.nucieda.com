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
    let values_found = {};
    let num_updates = 1000;
    let i = 0;
    let looping_moment = setInterval(function() {
        if (i < amount) {
            let simulation_result = simulator.tap_simulation(sauce);
            values_found = update_values_found(values_found, reduce_values_found(simulation_result));

            if (i % (amount / num_updates) == 0) {
                update_list(values_found);
                update_expected(((i + 1) * sauce), simulator.rarity_list, values_found);
            }
        } else
            clearInterval(looping_moment);
        i++;
    }, 0);
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
        return (number / 1000000000000).toFixed() + 't';
    } else if (number >= 1000000000) {
        return (number / 1000000000).toFixed() + 'b';
    } else if (number >= 1000000) {
        return (number / 1000000).toFixed() + 'm';
    } else if (number >= 1000) {
        return (number / 1000).toFixed() + 'k';
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