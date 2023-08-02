async function fetchJSONData() {
    try {
        const response = await fetch('values.json');
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

// // Example usage
// async function main() {
//     const raritiesList = await getRaritiesList();
//     console.log('Rarities List:', raritiesList);
// }

// main();