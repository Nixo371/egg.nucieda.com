class SimulationResult
{
	constructor(total_sauce, amount, type_of_sim)
	{
		this.amount = amount
		this.total_sauce = total_sauce;
		this.individial_sauce = total_sauce / amount;
		this.type_of_sim = type_of_sim;
		this.total_eggs = 0;

		this.egg_list = {};
		this.initialize();
	}

	async initialize()
	{
		this.rarity_list = await getRaritiesList();
		for (let i = 0; i < this.rarity_list.length; i++)
		{
			this.egg_list[this.rarity_list[i] + ""] = 0;
		}
		//console.log(this.egg_list);
	}

	add_egg(egg)
	{
		this.egg_list[egg.rarity + ""]++;
		this.total_eggs++;
		//console.table(this.egg_list);
	}

	calculate_luck_score()
	{
		if (this.type_of_sim === "tap")
		{
			let luck_score = 1;
			for (let i = 0; i < this.rarity_list.length; i++)
			{
				if (this.egg_list[this.rarity_list[i] + ""] != 0)
				{
					let expected_amount = this.total_sauce / this.rarity_list[i];
					let actual_amount = this.egg_list[this.rarity_list[i] + ""];
					luck_score *= actual_amount / expected_amount;
				}
			}
			return (luck_score);
		}
	}

	reset_list()
	{
		for (let i = 0; i < this.rarity_list.length; i++)
		{
			this.egg_list[this.rarity_list[i] + ""] = 0;
		}
		this.total_eggs = 0;
	}
}