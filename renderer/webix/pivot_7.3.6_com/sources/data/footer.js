import * as hlp from "./helpers.js";

export function addFooter(master, columns, items){
	var config, i, names, operation;

	for(i=1; i < columns.length;i++){
		config = null;
		names = columns[i].id.split(master.$divider);
		operation = names[names.length-2];
		if(master.config.footer == "sumOnly"){
			if(operation != "sum")
				config = " ";
		}
		let totalMethod = master._pivotOperations.getTotal(operation);
		if(!config && totalMethod){
			let options = master._pivotOperations.getTotalOptions(operation);
			let result = calculateColumn(items, columns[i].id, totalMethod, options&&options.leavesOnly);
			config = {
				$pivotValue: result,
				$pivotOperation: operation
			};
		}
		else
			config = " ";
		columns[i].footer = config;

		if(typeof master.config.footer == "object"){
			hlp.extend(columns[i].footer, master.config.footer, true);
		}
	}
}

function calculateColumn(items, columnId, totalMethod, leaves){
	var i, fItems= [], value, values = [];
	// filter items
	items = filterItems(items, leaves);
	// get column values
	for(i=0; i< items.length; i++){
		value = items[i][columnId];
		if (!isNaN(parseFloat(value))){
			values.push(value*1);
			fItems.push(items[i]);
		}
	}
	return totalMethod(values, columnId, fItems);
}

function filterItems(items, leaves, selectedItems){
	if(!selectedItems)
		selectedItems = [];
	for(var i=0; i < items.length;i++){
		if(leaves && items[i].data)
			filterItems(items[i].data, leaves, selectedItems);
		else
			selectedItems.push(items[i]);
	}
	return selectedItems;
}

