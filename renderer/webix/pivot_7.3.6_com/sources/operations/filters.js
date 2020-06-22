export function formatFilterValues(filters) {
	filters = filters || [];
	for (var i = 0; i < filters.length; i++)
		filters[i].fvalue = getFormattedValue(filters[i].value);
}

function getFormattedValue(value){
	value = value || "";
	if (webix.isDate(value)) {
		value = value.valueOf().toString();
	}
	else if (typeof value == "string") {
		if (value.trim)
			value = value.trim();
	}
	return value;
}

export function processFilters(view) {
	var i, f,
		config = view.config,
		filters = config.structure.filters || [],
		item, items = [],
		indexes = {};
	for (i = 0; i < filters.length; i++) {
		f = filters[i];
		if(webix.isUndefined(indexes[f.type]))
			indexes[f.type] = [];
		indexes[f.type].push(i);
		var type = f.type === "multiselect"?"multicombo":f.type === "select"?"richselect":f.type;
		item = {
			value: (webix.isUndefined(f.value)?"":f.value), point: false, field: f.name, view: type,
			minWidth: config.filterMinWidth, maxWidth: config.filterWidth
		};

		//placeholder API
		if (config.filterPlaceholder){
			if (typeof config.filterPlaceholder === "boolean"){
				item.placeholder = item.label;
				item.label = "";
			}
			else
				item.placeholder = config.filterPlaceholder;
		}

		if(f.type == "multicombo")
			item.tagMode = false;

		if (view.filters.isSelect(f.type)){
			item.options = {};
			item.options.data = distinctValues(view, f.name, f.type.indexOf("multi") == -1);
			item.options.point = false;

			if(type == "richselect")
				item.options.css = "webix_pivot_richselect_suggest";
			if(type == "multicombo")
				item.options.css = "webix_pivot_multicombo_suggest";
		}

		if(!config.separateLabel) {
			item.label = view._applyMap(f.name);
			item.labelAlign = config.filterLabelAlign;
			item.labelWidth = config.filterLabelWidth;
		}

		if (view.callEvent("onFilterCreate", [f, item])){
			if(config.separateLabel) {
				const label = view._applyMap(f.name);
				items.push({
					cols: [
						{ view:"label", autowidth:true, label }, { width:10}, item, {width:18}
					]
				});
			} else {
				items.push(item);
			}
		}
	}
	return items;
}

function distinctValues(view, field, empty) {
	var value, values = [],
		data = view.data.pull,
		hash = {};

	if(empty)
		values.push({value:"",id:"", $empty:true });

	if(view._pivotOptions && view._pivotOptions[field])
		return values.concat(view._pivotOptions[field]);

	for (let obj in data) {
		value = data[obj][field];
		if (!webix.isUndefined(value)){
			if ((value || value === 0) && !hash[value]) {
				values.push({ value:value.toString(), id:value.toString() });
				hash[value] = true;
			}
		}
	}

	var isNumeric = function(n){
		return  !isNaN(parseFloat(n));
	};
	values.sort(function(a,b) {
		var val1 = a.value;
		var val2 = b.value;
		if (!val2) return 1;
		if (!val1) return -1;
		if(!isNumeric(val1) || !isNumeric(val2) ){
			val1 = val1.toString().toLowerCase();
			val2=val2.toString().toLowerCase();
		}
		return val1>val2?1:(val1<val2?-1:0);
	});
	return values;
}

export function showFilters(view, filters){
	setEvents(view, filters);
	var config = {elements: filters};
	view.callEvent("onViewInit", ["filters", config]);
	if (config.elements && view.getFilterView()){
		if (filters.length > 0) {
			view.getFilterView().show();
			webix.ui(filters,view.getFilterView());
		} else {
			view.getFilterView().hide();
		}
	}
}


function setEvents(view, filters){
	for (var i = 0; i < filters.length; i++) {
		let event,
			filter = filters[i];
		if (filter.cols)
			filter = filter.cols[2];

		event = (filter.view == "text"?"onTimedKeyPress":"onChange");
		filter.on = {};
		filter.on[event] = function(){
			var value = this.getValue();
			if (value && this.config.separator && !this.format_setter)
				value = value.split(this.config.separator);
			changeFilterValue(view, this.config.field, value);
		};
	}
}

function changeFilterValue(view, field, value){
	var filters = view.config.structure.filters;
	for (var i = 0; i < filters.length; i++)
		if (filters[i].name == field) {
			filters[i].value = value;
			view.callEvent("onFilterChange", [field, value]);
			return true;
		}
	return false;
}


