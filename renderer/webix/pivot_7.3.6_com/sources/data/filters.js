import * as hlp from "./helpers.js";
function numHelper(fvalue, value, func) {
	if(typeof fvalue == "object"){
		for(var i=0; i < fvalue.length; i++){
			fvalue[i] = parseFloat(fvalue[i]);
			if (isNaN(fvalue[i])) return true;
		}
	}
	else{
		fvalue = parseFloat(fvalue);
		// if filter value is not a number then ignore such filter
		if (isNaN(fvalue)) return true;
	}
	// if row value is not a number then don't show this row
	if (isNaN(value)) return false;
	return func(fvalue, value);
}

export const rules = {
	contains: function(fvalue, value) {
		return value.toLowerCase().indexOf(fvalue.toString().toLowerCase()) >= 0;
	},
	equal: function(fvalue, value) {
		return numHelper(fvalue, value, function(fvalue, value) {
			return (fvalue == value);
		});
	},
	not_equal: function(fvalue, value) {
		return numHelper(fvalue, value, function(fvalue, value) {
			return (fvalue != value);
		});
	},
	less: function(fvalue, value) {
		return numHelper(fvalue, value, function(fvalue, value) {
			return (value < fvalue);
		});
	},
	less_equal: function(fvalue, value) {
		return numHelper(fvalue, value, function(fvalue, value) {
			return (value <= fvalue);
		});
	},
	more: function(fvalue, value) {
		return numHelper(fvalue, value, function(fvalue, value) {
			return (value > fvalue);
		});
	},
	more_equal: function(fvalue, value) {
		return numHelper(fvalue, value, function(fvalue, value) {
			return (value >= fvalue);
		});
	},
	multi: function(fvalues, value){
		if (typeof fvalues === "string")
			fvalues = fvalues.split(",");

		for(var i=0; i < fvalues.length; i++){
			if (value == fvalues[i])
				return true;
		}
		return false;
	},
	range: function(fvalue, value){
		return numHelper(fvalue, value, function(fvalue, value) {
			return (value < fvalue[1] && value >= fvalue[0]);
		});
	},
	range_inc: function(fvalue, value){
		return numHelper(fvalue, value, function(fvalue, value) {
			return (value <= fvalue[1] && value >= fvalue[0]);
		});
	}
};

export function setFilterValues(filters){
	filters = filters || [];

	for (var i = 0; i < filters.length; i++) {
		let f = filters[i],
			fvalue = f.fvalue;
		if(typeof fvalue == "function"){
			f.func = fvalue;
		}  else if(f.type == "select" || f.type == "richselect"){
			f.func = function(fvalue, value) {
				return fvalue == value;
			};
			fvalue = (fvalue||"");
		} else if(f.type.indexOf("multi") >-1){
			f.func = rules.multi;
		} else if (typeof fvalue === "object") {
			f.func = rules.range;
		} else if (fvalue.substr(0,1) == "=") {
			f.func = rules.equal;
			fvalue = fvalue.substr(1);
		} else if (fvalue.substr(0,2) == "<>") {
			f.func = rules.not_equal;
			fvalue = fvalue.substr(2);
		} else if (fvalue.substr(0,2) == ">=") {
			f.func = rules.more_equal;
			fvalue = fvalue.substr(2);
		} else if (fvalue.substr(0,1) == ">") {
			f.func = rules.more;
			fvalue = fvalue.substr(1);
		} else if (fvalue.substr(0,2) == "<=") {
			f.func = rules.less_equal;
			fvalue = fvalue.substr(2);
		} else if (fvalue.substr(0,1) == "<") {
			f.func = rules.less;
			fvalue = fvalue.substr(1);
		}else if (fvalue.indexOf("...") > 0) {
			f.func = rules.range;
			fvalue = fvalue.split("...");
		}else if (fvalue.indexOf("..") > 0) {
			f.func = rules.range_inc;
			fvalue = fvalue.split("..");
		} else if(f.type == "datepicker"){
			f.func = function(fvalue, value) {
				return fvalue == value;
			};
		}else
			f.func = rules.contains;

		f.fvalue = fvalue;
	}
}

export function formatFilterValues(filters) {
	var i, fvalue;
	filters = filters || [];
	for (i = 0; i < filters.length; i++) {
		fvalue = (filters[i].fvalue || filters[i].value || "");
		if (typeof fvalue == "string") {
			if (fvalue.trim)
				fvalue = fvalue.trim();
		}
		filters[i].fvalue = fvalue;
	}
}

export function filterItem(filters, item, map){
	if(filters){
		let i, f;
		for (i = 0; i < filters.length; i++) {
			f = filters[i];
			if (f.fvalue){
				let field = map && map[f.name]?map[f.name]:f.name;
				if (hlp.isUndefined(item[field]))
					return false;

				var raw = item[field];
				if (!raw !== 0 && !raw) return false;

				var value = raw.toString();
				var result = f.func(f.fvalue, value);

				if (!result)
					return false;
			}
		}
	}
	return true;
}