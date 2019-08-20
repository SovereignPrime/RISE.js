class Expense {
	constructor(id, name, date, type=expense, text, amount, status, to, from){
		this.id = id;
		this.name = name;
		this.date = date;
		this.type = type;
		this.text = text;
		this.amount = amount;
		this.status = status;
		this.to = to;
		this.from = from;
	}
}