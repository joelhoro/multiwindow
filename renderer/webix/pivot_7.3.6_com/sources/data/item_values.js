export function calculateItem(item, config, master) {
	var i, isIds, key, leaves, operation, tmp, values,
		header = config.header;

	for (i = 0; i < header.length; i++) {
		key = header[i];
		tmp = key.split(config.divider);
		operation = tmp[tmp.length-2];

		values = item[key];

		leaves = config.operations.getOption(operation,"leavesOnly");
		isIds = config.operations.getOption(operation,"ids");
		if(leaves && item.data){
			values = [];
			getKeyLeaves(item.data,key,values);
		}
		if (values){
			var data = [];
			var ids = [];
			for(var j=0; j < values.length;j++){
				let value = values[j];
				let id = null;
				if (typeof value == "object") {
					value = value.value;
					id = values[j].id;
				}
				if (value || value == "0") {
					data.push(value);
					if (id) ids.push(id);
				}
			}
			if(data.length)
				item[key] = config.operations.get(operation)(data, key, item, isIds?ids:null);
			else
				item[key] = "";
		}
		else
			item[key] = "";


		//watchdog
		master.count++;
	}
	return item;
}

function getKeyLeaves(data, key, result){
	var i;

	for(i=0; i < data.length;i++){
		if(data[i].data)
			getKeyLeaves(data[i].data,key,result);
		else
			result.push(data[i][key]);
	}
}

export function setMinMax(item, config) {
	var i, j, key,
		maxArr, maxValue, minArr, minValue,
		value,
		header = config.header,
		max = config.max,
		min = config.min,
		values = config.values;

	// nothing to do
	if (!min && !max)
		return item;

	//values = structure.values;
	if (!item.$cellCss) item.$cellCss = {};

	// calculating for each value
	for (i = 0; i < values.length; i++) {
		value = values[i];
		maxArr=[];
		maxValue=-99999999;
		minArr=[];
		minValue=99999999;

		for (j = 0; j < header.length; j++) {
			key = header[j];
			if (isNaN(item[key])) continue;
			// it's a another value
			if (key.indexOf(value.name) === -1) continue;

			if (max && item[key] > maxValue) {
				maxArr = [ key ];
				maxValue = item[key];
			} else if (item[key] == maxValue) {
				maxArr.push(key);
			}
			if (min && item[key] < minValue) {
				minArr = [ key ];
				minValue = item[key];
			} else if (item[key] == minValue) {
				minArr.push(key);
			}
		}

		for (j = 0; j < minArr.length; j++) {
			item.$cellCss[minArr[j]] = "webix_min";
		}
		for (j = 0; j < maxArr.length; j++) {
			item.$cellCss[maxArr[j]] = "webix_max";
		}
	}
	return item;
}
