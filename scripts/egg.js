class Egg
{
	constructor(rarity, sell_value)
	{
		this.rarity = rarity;
		this.sell_value = sell_value;
		//console.log(`Created new egg with rarity ${this.rarity} and sell_value $${this.sell_value}`);
	}

	get_rarity()
	{
		return(this.rarity);
	}

	get_sell_value()
	{
		return(this.sell_value);
	}
}