export const defaults = {
	fieldMap: {},
	yScaleWidth: 300,
	columnWidth: 150,
	defaultOperation: "sum",
	filterLabelAlign: "right",
	filterPlaceholder:false,
	filterWidth: 200,
	filterMinWidth: 150,
	filterLabelWidth: 100,
	separateLabel: true,
	headerTemplate: function(config){
		return this._applyMap(config.text || config.name) + "<span class='webix_pivot_operation'> " + this._applyLocale(config.operation)+"</span>";
	},
	format: function(value){
		return (value&& value!="0"?parseFloat(value).toFixed(3):value);
	}
};