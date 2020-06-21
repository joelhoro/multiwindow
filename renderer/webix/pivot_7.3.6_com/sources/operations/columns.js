export function setColumns(master, columns){
	var format = master.config.format;
	for(var i =0; i < columns.length; i++){
		if(!i){
			setFirstColumn(master, columns[i]);
		}
		else{
			webix.extend(columns[i],{
				format: format,
				sort:"int",
				width: master.config.columnWidth
			});
			var header = columns[i].header;

			for(let j=0; j < header.length; j++){
				let h = header[j];
				if(h){
					if(!j && h.name == "total")
						h.text = master._applyLocale("total");
					else if(j == header.length-1){
						h.text = master.config.headerTemplate.call(master,h);
					}
					else
						h.text = h.name;
				}
			}

			var footer = columns[i].footer;
			var footer_format = columns[i].format;
			if(footer){
				if (typeof footer === "string") footer = { text: footer };
				if (typeof footer_format == "string") //web worker
					footer_format = webix.i18n[footer_format] || window[footer_format]; 

				let text = !webix.isUndefined(footer.$pivotValue)? footer.$pivotValue : footer.text;
				//format footer only when column specific format was defined
				footer.text = footer_format && (footer.$pivotOperation != "count" || footer_format != format) ?footer_format(text):text;
			}
		}
	}
}

function setFirstColumn(master, column){
	var text = "";
	if(master.config.readonly)
		text = master.config.readonlyTitle||"";
	else
		text = "<div class='webix_pivot_config_msg'><div class='webix_pivot_icon pt-settings'></div>"+webix.i18n.pivot.pivotMessage+"</div>";
	column.header = text;
	column.width = master.config.yScaleWidth;
	column.exportAsTree = true;
	if(master.config.footer)
		column.footer = master._applyLocale("total");
}