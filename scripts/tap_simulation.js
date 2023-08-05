function shorten_number_by_magnitude(number)
{
    let magnitudes = ['', 'k', 'm', 'b', 't'];
    let i = 0;
    while (number >= 1000)
    {
        number /= 1000;
        i++;
    }
    return (number + magnitudes[i]);
}

function get_number_from_text(number)
{
    // This returns the number corresponding to the value entered (4t, 2.89b, etc)
    let magnitudes = ['', 'k', 'm', 'b', 't'];
    //let numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    let index = -1;
    for (let i = 0; i < number.length; i++)
    {
        if (magnitudes.includes(number[i]))
        {
            index = i;
        }
    }
    if (index == -1)
        return (+ number);
    let value = number.slice(0, index);
    for (let i = 1; i < magnitudes.length; i++)
    {
        if (magnitudes[i] == number[index])
            return (value * 1000);
        value *= 1000;
    }
}

async function multi_tap_sim(sauce, amount)
{
    let simulator = new Simulator();
    await simulator.initialize();

    reset_list();
    sauce = get_number_from_text(sauce);
    let values_found = {};
    let num_updates = 1000;
    let i = 0;
    let looping_moment = setInterval(function() {
        if (i < amount)
        {
            let simulation_result = simulator.tap_simulation(sauce);
            values_found = update_values_found(values_found, reduce_values_found(simulation_result));

            if (i % (amount / num_updates) == 0) // TODO: this is not working properly, the elements are updated, but it is not displaying the updates?
            {
                update_list(values_found);
            }
        }
        else
            clearInterval(looping_moment);
        i++;
    }, 0);

    update_list(values_found);
}

function update_values_found(previous, current)
{
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
function reduce_values_found(values_found)
{
    const counts = values_found.reduce((counts, number) => {
        counts[number] = (counts[number] || 0) + 1;
        return counts;
      }, {});

    return counts;
}

function update_list(values_found)
{
    for (const key in values_found)
    {
        let name = key;
        name = shorten_number_by_magnitude(Number(name));
        let html_name = name;
        if (name == "5t")
            html_name = "Glas / Goch";
        else if (name == "10t")
            html_name = "Bla / Rod";
    
        document.getElementById("power_result_" + name).innerHTML = html_name + ": " + values_found[key];
    }
    
}

// function simple_power_sim(sauce)
// {
//     reset_list();
//     result = calc_power(sauce);
//     result = shorten_number_by_magnitude(result);
//     if (result == "5t")
//         result = "Glas / Goch";
//     else if (result == "10t")
//         result = "Bla / Rod";

//     document.getElementById("power_result").innerHTML = result + "<br>" + document.getElementById("power_result").innerHTML;
// }

// function multi_power_sim(sauce, amount)
// {
//     let rarity_count = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

//     reset_list();
//     let i = 0;
//     let update_ratio = Math.floor(amount / 1000);
//     let refreshIntervalID = setInterval(function() {
//         if (i < amount && amount <= 1000)
//         {
//             result = calc_power(sauce);
//             let rarity_index = true_rarities.findIndex(x => x === result);
//             if (rarity_index == -1)
//                 return;
//             rarity_count[rarity_index]++;
//             result = shorten_number_by_magnitude(result);
//             console.log(result);
//             if (result == "5t")
//                 document.getElementById("power_result_" + result).innerHTML = "Glas / Goch: " + rarity_count[rarity_index];
//             else if (result == "10t")
//                 document.getElementById("power_result_" + result).innerHTML = "Bla / Rod: " + rarity_count[rarity_index];
//             else
//                 document.getElementById("power_result_" + result).innerHTML = result + ": " + rarity_count[rarity_index];
//             update_list(rarity_count, rarity_index, result);
//             i++;
//         }
//         else if (i < amount)
//         {
//             if (amount - i < update_ratio)
//                 update_ratio = amount - i;
//             for (let j = 0; j < update_ratio; j++)
//             {
//                 result = calc_power(sauce);
//                 let rarity_index = true_rarities.findIndex(x => x === result);
//                 if (rarity_index == -1)
//                     return;
//                 rarity_count[rarity_index]++;
//                 result = shorten_number_by_magnitude(result);
//                 console.log(result);
//                 if (result == "5t")
//                     document.getElementById("power_result_" + result).innerHTML = "Glas / Goch: " + rarity_count[rarity_index];
//                 else if (result == "10t")
//                     document.getElementById("power_result_" + result).innerHTML = "Bla / Rod: " + rarity_count[rarity_index];
//                 else
//                     document.getElementById("power_result_" + result).innerHTML = result + ": " + rarity_count[rarity_index];
//                 update_list(rarity_count, rarity_index, result);
//                 i++;
//             }
//         }
//         else
//         {
//             clearInterval(refreshIntervalID);
//         }
//     }, 0);
// }



// setTimeout(function() {
//     update_list(rarity_count, rarity_index, rarity);
// }, 0);

function reset_list()
{
    let divs = document.getElementsByName("power");
    for (let i = 0; i < divs.length; i++)
        divs[i].innerHTML = "";
}

/*
				for (let i = 0; i < amount; i++)
				{
					result = calc_power(sauce);
					let rarity_index = true_rarities.findIndex(x => x === result);
					if (rarity_index == -1)
						return;
					rarity_count[rarity_index]++;
					result = shorten_number_by_magnitude(result);
					console.log(result);
					if (result == "5t")
						document.getElementById("power_result_" + result).innerHTML = "Glas / Goch: " + rarity_count[rarity_index];
					else if (result == "10t")
						document.getElementById("power_result_" + result).innerHTML = "Bla / Rod: " + rarity_count[rarity_index];
					else
						document.getElementById("power_result_" + result).innerHTML = result + ": " + rarity_count[rarity_index];
					update_list(rarity_count, rarity_index, result);
					//if (result == "5t")
					//	result = "Glas / Goch";
					//else if (result == "10t")
					//	result = "Bla / Rod";
					// document.getElementById("power_result").innerHTML = result;
					// I wanted this to "roll" but it doesn't seem to want to
				}
				*/