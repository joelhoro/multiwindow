function getTotalColumnId(master, name){
	return "$webixtotal" + master.$divider + name;
}

function getValues(item, ids){
	var i, value, values = [];
	for(i=0; i< ids.length;i++){
		value = item[ids[i]];
		if(!isNaN(parseFloat(value)))
			values.push(value);
	}
	return values;
}

export function addTotalColumns(master, header){
	var groups, groupData, groupName, h, i,
		hRowCount, parts,
		totalCols = [];


	hRowCount = header[0].header.length;
	// if no selected columns
	if(hRowCount < 2)
		return header;

	groupData = getTotalGroups(master, header);
	groups = groupData.groups;
	master._pivotColumnGroups = groups;
	for( groupName in groups){
		// column config
		h = {
			id: getTotalColumnId(master, groupName),
			header:[],
			sort:"int",
			width: master.config.columnWidth,
			format: master.config.format
		};

		// set top headers
		for( i =0; i < hRowCount-1; i++){
			if(!i && !totalCols.length){
				h.header.push({
					name: "total",
					rowspan: hRowCount-1,
					colspan: groupData.count
				});
			}
			else
				h.header.push("");
		}

		// set bottom header
		parts = groupName.split(master.$divider);
		h.header.push({
			name:groupName,
			operation: parts[0],
			text: parts[1]
		});

		totalCols.push(h);
	}

	return header.concat(totalCols);
}

function getTotalGroups(master, header){
	var groupName, i, name, operation, parts,
		groups = {},
		groupCount = 0;

	for(i = 0; i< header.length; i++) {
		parts = header[i].id.split(master.$divider);
		name = parts.pop();
		operation = parts.pop();
		if (operation == "sum" || master.config.totalColumn != "sumOnly") {
			groupName = operation + master.$divider + name;
			if (!groups[groupName]){
				groupCount++;
				groups[groupName] = {
					operation: operation,
					ids:[],
					format: header.format
				};
			}
			groups[groupName].ids.push(header[i].id);
		}
	}
	return {groups: groups, count: groupCount};
}


export function addTotalData(master, items){
	var groups = master._pivotColumnGroups;
	if(groups){
		let group, i, ids, name;
		for(name in groups){
			group = groups[name];
			ids = group.ids;

			for(i =0; i < items.length; i++){
				let operation,
					columnId = getTotalColumnId(master, name),
					result = "",
					values = getValues(items[i], ids);
				if(values.length){
					if((operation = master._pivotOperations.getTotal(name.split(master.$divider)[0])))
						result = operation.call(master, values, columnId, items[i]);
				}

				items[i][columnId] = result;
				if(items[i].data)
					items[i].data = addTotalData(master, items[i].data);
			}
		}
	}
	return items;
}