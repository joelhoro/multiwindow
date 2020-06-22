export const popupTemplates = {
	header: function(obj){
		return webix.i18n.pivot[obj.value];
	},
	iconHeader: function(obj){
		if(obj.icon)
			return "<span class='webix_pivot_header_icon webix_pivot_icon pt-"+obj.icon+"'></span>"+webix.i18n.pivot[obj.value];
		else
			return "<span class='webix_pivot_header_icon'>"+obj.iconContent+"</span>"+webix.i18n.pivot[obj.value];
	},
	tableValues: function (obj) {
		const pivot = webix.$$(this.config.pivot);
		obj.operation = obj.operation || [pivot.config.defaultOperation];
		if (!webix.isArray(obj.operation))
			obj.operation = [obj.operation];

		var ops = [];
		var locale = pivot._applyLocale;
		for (var i = 0; i < obj.operation.length; i++) {
			var op = "<div class='webix_pivot_link' webix_operation='" + i + "'>";
			op += "<span>" + obj.text + "</span>";
			op += "<span class='webix_link_selection'>" + locale(obj.operation[i]) + "</span>";
			op += "<span class='webix_pivot_minus webix_icon webix_pivot_close'>&#10005;</span>";
			op += "</div>";
			ops.push(op);
		}
		return ops.join(" ");
	},
	chartValues: function (obj) {
		const pivot = webix.$$(this.config.pivot);

		obj.operation = obj.operation || [pivot.config.defaultOperation];
		obj.color = obj.color || [];

		if (!webix.isArray(obj.operation))
			obj.operation = [obj.operation];

		var ops = [];
		var locale = pivot._applyLocale;

		for (var i = 0; i < obj.operation.length; i++) {
			if(!obj.color || !obj.color[i]){
				obj.color[i] = pivot._getColor(this._valueLength);
				this._valueLength++;
			}
			var op = "<div class='webix_pivot_link' webix_operation='" + i + "'>";
			op += "<div class='webix_color_selection'><div style='background-color:"+locale(obj.color[i])+"'></div></div>";
			op += "<div class='webix_link_title'>" + obj.text + "</div>";
			op += "<div class='webix_link_selection'>" + locale(obj.operation[i]) + "</div>";
			op += "<span class='webix_pivot_minus webix_icon webix_pivot_close'>&#10005;</span>";
			op += "</div>";
			ops.push(op);
		}
		return ops.join(" ");
	},
	filters: function (obj) {
		var pivot = webix.$$(this.config.pivot);
		obj.type = obj.type || pivot.filters.getDefault();
		var html = "<a class='webix_pivot_link'>" + obj.text;
		html += "<span class='webix_link_selection'>" + pivot._applyLocale(obj.type) + "</span>";
		html += "</a> ";
		html += "<span class='webix_pivot_minus webix_icon webix_pivot_close'>&#10005;</span>";
		return html;
	},
	rows: function (obj) {
		var html = "<a class='webix_pivot_link'>" + obj.text;
		html += "</a> ";
		html += "<span class='webix_pivot_minus webix_icon webix_pivot_close'>&#10005;</span>";
		return html;
	},
	columns: function (obj) {
		var html = "<a class='webix_pivot_link'>" + obj.text;
		html += "</a> ";
		html += "<span class='webix_pivot_minus webix_icon webix_pivot_close'>&#10005;</span>";
		return html;
	},
	groupBy: function (obj) {
		var html = "<a class='webix_pivot_link'>" + obj.text;
		html += "</a> ";
		html += "<span class='webix_pivot_minus webix_icon webix_pivot_close'>&#10005;</span>";
		return html;
	},
	listDrag: function(obj){
		return "<a class='webix_pivot_link'>" + obj.text+"</a> ";
	}
};