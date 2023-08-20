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

async function multi_power_sim(sauce, amount) {
    let simulator = new Simulator();
    await simulator.initialize();

    reset_list();
    sauce = get_number_from_text(sauce);
    let total_sauce = sauce * amount;

    // console.log(`Num Updates: ${num_updates}`);
    // console.log(`Update Sauce: ${sauce_per_update}`);

    let values_found = {};
    let i = 0;
    let amount_loop = setInterval(function() {
        if (i < amount) {
            let simulation_result = simulator.power_simulation(sauce);
            values_found = update_values_found(values_found, reduce_values_found(simulation_result));

            update_list(values_found);
            update_expected(amount, sauce, simulator.rarity_list, values_found);
            // update_expected(((updates + 1) * sauce_per_update), simulator.rarity_list, values_found);
            i++;
            document.getElementById("sauce-remaining").innerHTML = `Sauce Done: ${formatNumberWithSuffix(sauce * i)} (${(sauce * i * 100 / total_sauce).toFixed(2)}%)`;
        } else {
            clearInterval(amount_loop);
        }
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

function update_expected(amount, sauce, labels, values_found) {
    expected_dict = calculateExpected(amount, sauce, labels);
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

function calculateExpected(amount, sauce, labels) {
    const result = labels.map((label) => Math.floor(sauce / label));

    // Creating a dictionary with labels as keys
    const dictionary = labels.reduce((acc, label, index) => {
        acc[label] = result[index];
        return acc;
    }, {});

    return dictionary;
}