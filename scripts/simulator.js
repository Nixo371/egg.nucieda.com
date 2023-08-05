class Simulator
{
    constructor() 
    {  
        this.initialize();
    }

    async initialize()
    {
        await this.set_rarities();
    }

    async set_rarities() 
    {
        this.rarity_list = await getRaritiesList(); // can probably rework to return the egg objects instead

        // Also store the reversed rarities for convenience
        this.reversed_rarities = this.rarity_list.slice().reverse(); 
    }
    
    calculate_multiplier(sauce)
    {
        let max_sauce = 1000000;
        if (sauce > max_sauce)
        {
            return {"sauce": max_sauce, "multiplier": sauce / max_sauce};
        }
        console.log("ur mom");
        return {"sauce": sauce, "multiplier": 1};
    }

    simulate_tap(multiplier)
    {
        for (const rarity of this.reversed_rarities) 
        {
            const random_num = Math.random();
            if (random_num < 1 / (rarity / multiplier)) 
            {
                return rarity;
            }
        }

        return 0;
    }

    tap_simulation(sauce) 
    {
        let multiplier_object = this.calculate_multiplier(sauce);
        sauce = multiplier_object['sauce'];
        let multiplier = multiplier_object['multiplier'];

        let values_found = [];
        for (let i = 0; i < sauce; i++)
        {
            let value_found = this.simulate_tap(multiplier);

            if (value_found > 0)
            {
                values_found.push(value_found);
            }
        }

        return values_found;
    }

    


}