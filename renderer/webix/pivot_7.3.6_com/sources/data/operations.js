import * as hlp from "./helpers.js";

const operations =  {
	sum: function(values) {
		var sum = 0;
		for (var i = 0; i < values.length; i++) {
			var value = values[i];
			value = parseFloat(value, 10);
			if (!isNaN(value))
				sum += value;
		}
		return sum;
	},
	count: function(data, key, item) {
		var count = 0;
		if(!item.data)
			count = data.length;
		else{
			for(var i=0; i < item.data.length; i++)
				count += item.data[i][key]||0;
		}
		return count;
	},
	max: function(args) {
		if (args.length == 1) return args[0];
		return Math.max.apply(this, args);
	},
	min: function(args) {
		if (args.length == 1) return args[0];
		return Math.min.apply(this, args);
	}
};

const totalOperations = {
	"sum": function(values){
		var i, sum = 0;
		for (i = 0; i < values.length; i++)
			sum += values[i];
		return sum;
	},
	"min": function(values){
		if (values.length == 1) return values[0];
		return Math.min.apply(null,values);
	},
	"max": function(values){
		if (values.length == 1) return values[0];
		return Math.max.apply(null,values);
	},
	"count": function(values){
		var value = totalOperations.sum.call(this, values);
		return value?parseInt(value,10):"";
	}
};

export class Operations{
	constructor() {
		this.pull = hlp.extend({},operations);
		this.options = {};
		this.pullTotal = hlp.extend({},totalOperations);
		this.totalOptions = {};
	}

	serialize() {
		var str = {};
		for (let key in this.pull)
			str[key] = this.pull[key].toString();
		return str;
	}

	parse(str){
		for (var key in str){
			eval("this.temp = "+str[key]);
			this.pull[key] = this.temp;
		}
	}

	add(name, method, options){
		this.pull[name] = method;
		if(options)
			this.options[name] = options;
	}

	addTotal(name, method, options){
		this.pullTotal[name] = method;
		if(options)
			this.totalOptions[name] = options;
	}

	get(name){
		return this.pull[name]||null;
	}
	getOptions(name){
		return this.options[name]||null;
	}
	getOption(name,option){
		return this.options[name]?this.options[name][option]:null;
	}

	getTotal(name){
		return this.pullTotal[name] || this.pull[name]||null;
	}
	getTotalOptions(name){
		return this.pullTotal[name]?(this.totalOptions[name])||null:(this.options[name]||null);
	}
	getTotalOption(name,option){
		var options = this.getTotalOptions(name);
		return options?options[name][option]:null;
	}
}

