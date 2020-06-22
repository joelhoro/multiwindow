export function freezeTotals(view){
	if(view.config.freezeTotal){
		var i, columns = view.$$("data").config.columns;
		let width = getWidth(columns);
		let totalCount = getTotalCount(columns);

		for( i =0; i < view.$$("data").config.leftSplit;i++)
			width -= columns[i].width;

		for( i =columns.length-1; i > columns.length-totalCount;i--)
			width -=columns[i].width;

		if(width > 100){
			view.$$("data").config.rightSplit = totalCount;
			view.$$("data").refreshColumns();
		}
	}
}

function getTotalCount(columns){
	var count = 0;
	for(var i=columns.length-1; !count &&i >=0; i--){
		if(columns[i].header[0] && columns[i].header[0].name == "total")
			count = columns.length-i;
	}
	return count;
}

function getWidth(columns){
	var i, width =0;
	for( i =0; i < columns.length;i++ )
		width +=columns[i].width;
	return width;
}