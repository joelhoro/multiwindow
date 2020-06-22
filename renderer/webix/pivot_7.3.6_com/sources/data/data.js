import * as hlp from "./helpers.js";
import {processHeader} from "./header.js";
import {addTotalData} from "./total_columns.js";
import {addFooter} from "./footer.js";
import * as itm from "./item_values.js";
import * as flt from "./filters.js";

export class Data{
	constructor(master, config){
		this.master = master;
		this.config = config;
		this.count = 0;
	}

	get operations(){
		return this.master._pivotOperations;
	}

	get divider(){
		return this.master.$divider;
	}
	get structure(){
		return this.config.structure;
	}

	process(data, order){
		this.watch = new Date();
		var columns, fields, header, i, items;

		var structure = this.structure;
		structure._header = [];
		structure._header_hash = {};

		flt.formatFilterValues(structure.filters);
		flt.setFilterValues(structure.filters);

		for (i = 0; i < structure.values.length; i++) {
			structure.values[i].operation = structure.values[i].operation || [this.config.defaultOperation];
			if (!hlp.isArray(structure.values[i].operation))
				structure.values[i].operation = [structure.values[i].operation];
		}

		columns = [];
		for(i=0;i< structure.columns.length; i++){
			columns[i] = (typeof structure.columns[i] == "object"?(structure.columns[i].id||i):structure.columns[i]);
		}

		fields = structure.rows.concat(columns);
		items = this.group(data, order, fields);

		header = {};
		if (structure.rows.length > 0)
			items = this.processRows(items, structure.rows, structure, header, "");
		else {
			// there are no rows in structure, only columns and values
			this.processColumns(items, columns, structure, header);
			items = [];
		}

		header = processHeader(this.master, header);

		items = addTotalData(this.master, items);

		if(this.config.footer)
			addFooter(this.master, header, items);

		delete structure._header;
		delete structure._header_hash;

		return { header: header, data: items };
	}

	processColumns(data, columns, structure, header, item, name) {
		var vname;

		item = item || { $source: [] };
		if (columns.length > 0) {
			name = name || "";
			for (let i in data) {
				if(!header[i])
					header[i] = {};
				data[i] = this.processColumns(data[i], columns.slice(1), structure, header[i], item, (name.length>0 ? (name + this.divider) :"") + i);
			}
		} else {
			var values = structure.values;
			for (var id in data) {
				item.$source.push(id);
				for (let i = 0; i < values.length; i++) {
					for (var j = 0; j < values[i].operation.length; j++) {
						if(typeof name !== "undefined")
							vname = name + this.divider + values[i].operation[j] + this.divider + values[i].name;
						else // if no columns
							vname = values[i].operation[j] + this.divider + values[i].name;
						if (!structure._header_hash[vname]) {
							structure._header.push(vname);
							structure._header_hash[vname] = true;
						}
						if (hlp.isUndefined(item[vname])) {
							item[vname] = [];
							header[values[i].operation[j] + this.divider + values[i].name] = {};

						}
						item[vname].push({value:data[id][values[i].name],id: id});
					}
				}
			}
		}
		return item;
	}

	processRows(data, rows, structure, header, prefix) {
		var i, item, j, k, value,
			items = [];
		if (rows.length > 1) {
			for (i in data)
				data[i] = this.processRows(data[i], rows.slice(1), structure, header, prefix+"_"+i);

			var values = structure._header;

			for (i in data) {
				item = { data: data[i] };
				for (j = 0; j < item.data.length; j++) {
					for (k = 0; k < values.length; k++) {
						value = values[k];
						if (hlp.isUndefined(item[value]))
							item[value] = [];
						item[value].push(item.data[j][value]);
					}
				}
				this.setItemValues(item);
				if (this.master.config.stableRowId)
					item.id = prefix + "_" + i;

				item.name = i;
				item.open = true;
				items.push(item);
			}
		} else {
			for (i in data) {
				item = this.processColumns(data[i], structure.columns, structure, header);
				item.name = i;

				if (this.master.config.stableRowId)
					item.id = prefix + "_" + i;

				this.setItemValues(item);
				items.push(item);
			}
		}
		return items;
	}

	setItemValues(item){
		item = itm.calculateItem(item, {
			header: this.structure._header,
			divider: this.divider,
			operations: this.operations
		}, this);
		item = itm.setMinMax(item,{
			header: this.structure._header,
			max: this.config.max,
			min: this.config.min,
			values: this.structure.values
		});

		//watchdog
		if (this.count > 50000){
			this.count = 0;
			if (this.config.ping)
				this.config.ping.call(this, this.watch);
		}

		return item;
	}

	group(data, order, fields ){
		var i, id, item,
			hash = {};

		for (i = 0; i < order.length; i++) {
			id = order[i];
			item = data[id];
			if (item && flt.filterItem(this.structure.filters, item, this.config.filterMap)){
				this.groupItem(hash, item, fields );
			}
		}
		return hash;
	}

	groupItem(hash, item, fields ){
		if(fields.length){
			var value = item[fields[0]];
			if (typeof value === "undefined") return null;

			if(hlp.isUndefined(hash[value]))
				hash[value] = {};
			this.groupItem(hash[value], item, fields.slice(1));
		}
		else
			hash[item.id] = item;
	}

	filterItem(item){
		var filters = this.structure.filters || [];
		for (var i = 0; i < filters.length; i++) {
			var f = filters[i];
			if (f.fvalue){
				if (hlp.isUndefined(item[f.name]))
					return false;

				var value = item[f.name].toString().toLowerCase();
				var result = f.func(f.fvalue, value);

				if (!result)
					return false;
			}
		}
		return true;
	}
}
