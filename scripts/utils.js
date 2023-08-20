async function fetchJSONData() {
    try {
        const response = await fetch('../values.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching JSON data:', error);
        return null;
    }
}

// Function to extract rarities from the JSON data and return them in a list
async function getRaritiesList() {
    const data = await fetchJSONData();
    if (!data) {
        return [];
    }

    const raritiesList = data.map(item => item.rarity);
    return raritiesList;
}

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

// // Example usage
// async function main() {
//     const raritiesList = await getRaritiesList();
//     console.log('Rarities List:', raritiesList);
// }

// main();