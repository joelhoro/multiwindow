import * as hlp from "./helpers.js";
import {addTotalColumns} from "./total_columns.js";


// default sorting properties
var sortConfig = {
	dir: 1,
	as: function(a,b){
		if(isNum(a) && isNum(b))
			return sorting.int(a,b);
		return sorting.string(a,b);
	}
};

var sorting = {
	"date":function(a,b){
		a=a-0; b=b-0;
		return a>b?1:(a<b?-1:0);
	},
	"int":function(a,b){
		a = a*1; b=b*1;
		return a>b?1:(a<b?-1:0);
	},
	"string":function(a,b){
		if (!b) return 1;
		if (!a) return -1;
		a = a.toString().toLowerCase(); b=b.toString().toLowerCase();
		return a>b?1:(a<b?-1:0);
	}
};

export function processHeader(master, header) {
	var i, j, p, text0, vConfig,
		valuesConfig = master.config.structure.values;

	header = sortHeader(master.config.structure, header);

	header = getHeader(master, header);

	for (i = 0; i < header.length; i++) {
		var parts = [];
		for (j = 0; j < header[i].length; j++)
			parts.push(header[i][j].name);

		// find value configuration
		vConfig = null;
		var tmp = parts[parts.length-1].split(master.$divider);
		for(j =0; j < valuesConfig.length && !vConfig; j++){
			if(valuesConfig[j].operation)
				for(p =0; p< valuesConfig[j].operation.length; p++){
					if(valuesConfig[j].name == tmp[1] && valuesConfig[j].operation[p] == tmp[0]){
						vConfig = valuesConfig[j];
					}
				}
		}

		header[i] = {id: parts.join(master.$divider), header: header[i]};
		header[i].format = (vConfig && vConfig.format) ?
			vConfig.format :
			(tmp[0] != "count" ? master.config.format : null);
	}

	if(header.length && master.view && master.view.callEvent)
		master.view.callEvent("onHeaderInit", [header]);

	if(master.config.totalColumn && header.length)
		header = addTotalColumns(master, header);

	header.splice(0, 0, {id:"name", template:"{common.treetable()} #name#", header:{ text:  text0}});

	return header;
}

function isNum(value){
	return !isNaN(value*1);
}

/*
* get sort properties for a column
* */
function setSortConfig(config, column){
	var sorting = sortConfig;
	if(config){
		// for a specific columns
		if(config[column])
			sorting = config[column];
		// for any other column
		else if(config.$default)
			sorting = config.$default;

		if(sorting.dir)
			sorting._dir = sorting.dir=="desc"?-1:1;
		hlp.extend(sorting,sortConfig);
	}
	return sorting;
}


function sortHeader(config, header,cIndex){
	var column, i, key, keys, sorting,
		sorted = [];

	if(Object.keys && config.columnSort !== false){
		cIndex = cIndex||0;

		column = config.columns[cIndex];
		sorting = setSortConfig(config.columnSort, column);
		keys = Object.keys(header);
		if (cIndex < config.columns.length)
			keys = keys.sort(function(a,b){
				return sorting.as(a,b)*sorting._dir;
			});
		cIndex++;

		for(i=0; i < keys.length; i++){
			key = keys[i];
			sorted.push({
				key: key,
				data: sortHeader(config, header[key], cIndex)
			});
		}
	}
	else{
		for(key in header){
			sorted.push({
				key: key,
				data: sortHeader(config, header[key])
			});
		}
	}

	return sorted;
}

function getHeader(view, data) {

	var first, i, item, j, h,
		header = [];

	for (i =0; i < data.length; i++) {
		item = data[i];

		if (item.data.length) {
			let result = getHeader(view, item.data);
			first = false;
			for (j = 0; j < result.length; j++) {
				h = result[j];
				h.splice(0, 0, { name:item.key});
				if (!first) {
					h[0].colspan = result.length;
					first = true;
				}
				header.push(h);
			}
		} else {
			let keys = data[i].key.split(view.$divider);
			header.push([{ name: data[i].key, operation:keys[0], text:keys[1]}]);
		}
	}
	return header;
}