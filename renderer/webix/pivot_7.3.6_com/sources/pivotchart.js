import * as flt from "./operations/filters.js";
import "./popups/chartpopup.js";
import {defaults} from "./config/pivotchart.js";
import {filterItem,setFilterValues} from "./data/filters.js";
import {Filters} from "./structures/filters.js";

webix.protoUI({
	name:"pivot-chart",
	version:"{{version}}",
	defaults: defaults,
	templates:{
		groupNameToStr: function(name,operation){
			return name+"_"+operation;
		},
		groupNameToObject: function(name){
			var arr = name.split("_");
			return {name:arr[0],operation:arr[1]};
		},
		seriesTitle: function(data,i){
			var name = this.config.fieldMap[data.name]||this._capitalize(data.name);
			var operation = (webix.isArray(data.operation)?data.operation[i]:data.operation);
			return name+" ( "+(webix.i18n.pivot[operation]||operation)+")";
		}
	},
	templates_setter: function(obj){
		if(typeof obj == "object")
			webix.extend(this.templates,obj);
	},
	chartMap: {
		bar: function(color){
			return {
				border:0,
				alpha:1,
				radius:0,
				color: color
			};
		},
		line: function(color){
			return {
				alpha:1,
				item:{
					borderColor: color,
					color: color
				},
				line:{
					color: color,
					width:2
				}
			};
		},
		radar: function(color){
			return {
				alpha:1,
				fill: false,
				disableItems: true,
				item:{
					borderColor: color,
					color: color
				},
				line:{
					color: color,
					width:2
				}
			};
		}
	},
	chartMap_setter: function(obj){
		if(typeof obj == "object")
			webix.extend(this.chartMap,obj,true);
	},
	$init: function(config) {
		if (config.separateLabel === false){
			config.filterWidth = config.filterWidth || 300;
		}

		this.data.provideApi(this, true);
		if (!config.structure)
			config.structure = {};
		webix.extend(config.structure, { groupBy:"", values:[], filters:[] });

		this.$view.className +=" webix_pivot webix_pivot_chart";
		webix.extend(config, {editButtonWidth: this.defaults.editButtonWidth});
		webix.extend(config, this.getUI(config));

		this.$ready.push(webix.bind(function(){
			webix.delay(this.render,this); // delay needed for correct legend rendering
		},this));
		this.data.attachEvent("onStoreUpdated", webix.bind(function() {
			// call render if pivot is initialized
			if (this.$$("chart"))
				this.render();
		}, this));

		this.attachEvent("onFilterChange", function(){
			this.render(true);
		});

		this.filters = new Filters();
	},
	getUI: function() {
		var filters = ({ 
			view:"toolbar",
			id: "filters", hidden:true, paddingY: 10,
			paddingX: 5,
			borderless: true,
			margin: 10, cols:[] });

		var chart = { id: "bodyLayout", type: "line", margin: 10, cols:[{id:"chart", view: "chart"}] };
		return { rows: [ filters, chart ]};
	},
	configure: function() {
		if (!this._pivotPopup) {
			var config = { view:"webix_pivot_chart_config", operations:[], pivot: this.config.id };
			webix.extend(config , this.config.popup||{});

			this._pivotPopup = webix.ui(config);
			this.callEvent("onPopup",[this._pivotPopup]);
			this._pivotPopup.attachEvent("onApply", webix.bind(function(structure) {
				this.config.chartType = this._pivotPopup.$$("chartBody")?this._pivotPopup.$$("chartBody").getItem("chartType").chartType:"bar";
				this.config.chart.scale = (this._pivotPopup.$$("chartBody").getItem("logScale").markCheckbox?"logarithmic":"linear");
				webix.extend(this.config.structure, structure, true);
				this.render();
			}, this));
		}

		var functions = [];
		for (var i in this.operations) functions.push({name: i, title: this._applyLocale(i)});
		this._pivotPopup._valueLength = this._valueLength || 0;
		this._pivotPopup.define("operations", functions);
		var pos = webix.html.offset(this.$$("chart").getNode());
		this._pivotPopup.setPosition(pos.x + 10, pos.y + 10);
		this._pivotPopup.define("data", this.getFields());
		this._pivotPopup.show();
	},
	destructor(){
		if (this._pivotPopup){
			if(this._eventId) {
				webix.eventRemove(this._eventId);
			}
			this._pivotPopup.destructor();
			this._pivotPopup = null;
		}
		webix.Destruction.destructor.call(this);
	},
	render: function(withoutFilters) {
		if(!withoutFilters){
			// render filters
			var filters = flt.processFilters(this);
			flt.showFilters(this, filters);
		}
		this._valueLength = 0;
		var struct = this.config.structure;
		if (struct && struct.groupBy && struct.values && struct.values.length){
			this._setChartConfig();
			this._loadFilteredData();
		} else {
			this.config.structure = {
				values:[]
			};
			this._setChartConfig();
		}
	},
	_setChartConfig: function() {
		var config = this.config;
		var values = config.structure.values;

		for (var i = 0; i < values.length; i++) {
			values[i].operation = values[i].operation || [config.defaultOperation];
			if (!webix.isArray(values[i].operation))
				values[i].operation = [values[i].operation];
		}

		var chartType = config.chartType||"bar";
		var mapConfig = this.chartMap[chartType];

		var chart = {
			"type":  (mapConfig&&mapConfig("").type?mapConfig("").type:chartType),
			"xAxis": webix.extend({template: "#id#"},config.chart.xAxis||{},true),
			"yAxis": webix.extend({},config.chart.yAxis||{})
		};

		webix.extend(chart,config.chart);
		if(!chart.padding){
			chart.padding = { top: 17};
		}

		var result = this._getSeries();

		chart.series = result.series;

		chart.legend = false;
		if(config.singleLegendItem || this._valueLength>1){
			chart.legend = result.legend;
		}

		chart.scheme = {
			$group: this._pivot_group,
			$sort:{
				by: "id"
			}
		};
		this.$$("chart").removeAllSeries();
		for(var c in chart){
			this.$$("chart").define(c,chart[c]);
		}
		
		if(this.$$("chart") && !config.readonly){
			var el = document.createElement("div");
			el.className = "webix_pivot_configure";
			el.title = this._applyLocale("settings");
			el.style.width = chart.legend.width +"px";
			el.style.top = chart.padding.top +"px";
			el.innerHTML = "<span class='webix_pivot_icon pt-settings'></span><span class='webix_pivot_configure_label'>"+webix.i18n.pivot.pivotMessage+"</span>";
			this.$$("chart").$view.insertBefore(el, this.$$("chart").$view.querySelector("canvas"));
			this._eventId = webix.event(this.$$("chart").$view.querySelector(".webix_pivot_configure"), "click", function(){
				this.configure();
			}.bind(this));
		}
	},
	_applyLocale: function(value){
		return webix.i18n.pivot[value]||value;
	},
	_capitalize: function(value){
		return value.charAt(0).toUpperCase() + value.slice(1);
	},
	_applyMap: function(value, capitalize){
		return this.config.fieldMap[value]||(capitalize?this._capitalize(value):value);
	},
	_loadFilteredData: function(){
		var filters = this.config.structure.filters;

		flt.formatFilterValues(filters);
		setFilterValues(filters);

		this.data.silent(function(){
			this.data.filter((item) => filterItem(filters,item, this.config.filterMap));
		},this);
		this.$$("chart").data.silent(function(){
			this.$$("chart").clearAll();
		},this);
		this.$$("chart").parse(this.data.getRange());
		// reset filtering
		this.data.silent(function(){
			this.data.filter("");
		},this);
	},
	groupNameToStr: function(obj){
		return obj.name+"_"+obj.operation;
	},
	groupNameToObject: function(name){
		var arr = name.split("_");
		return {name:arr[0],operation:arr[1]};
	},
	_getSeries: function(){
		var i, j, legend, map = {}, name, legendTitle, series = [],
			values = this.config.structure.values;

		// legend definition
		legend = {
			valign:"middle",
			align:"right",
			width:220,
			layout:"y"
		};

		webix.extend(legend,this.config.chart.legend||{},true);
		legend.values = [];
		if(!legend.marker)
			legend.marker = {};
		legend.marker.type = (this.config.chartType=="line"?"item":"s");

		this.series_names = [];
		this._valueLength = 0;

		for(i =0; i < values.length; i++){
			if(!webix.isArray(values[i].operation)){
				values[i].operation = [values[i].operation];
			}
			if(!webix.isArray(values[i].color)){

				values[i].color = [values[i].color||this._getColor(this._valueLength)];
			}
			for(j=0;j<values[i].operation.length;j++){

				name = this.templates.groupNameToStr(values[i].name,values[i].operation[j]);
				this.series_names.push(name);
				if(!values[i].color[j])
					values[i].color[j] = this._getColor(this._valueLength);
				var color = values[i].color[j];
				var sConfig = this.chartMap[this.config.chartType](color)||{};
				sConfig.value = "#"+name+"#";
				sConfig.tooltip = {
					template: webix.bind(function(obj){
						return obj[this].toFixed(3);
					},name)
				};

				series.push(sConfig);
				legendTitle = this.templates.seriesTitle.call(this,values[i],j);
				legend.values.push({
					text: legendTitle,
					color: color
				});
				map[name]= [values[i].name,values[i].operation[j]];
				this._valueLength++;
			}
		}
		this._pivot_group = {};
		if(values.length)
			this._pivot_group = webix.copy({
				by:  this.config.structure.groupBy,
				map: map
			});

		return {series: series,legend: legend};
	},
	_getColor:function(i){
		var palette = this.config.palette;
		var rowIndex = i/palette[0].length;
		rowIndex = (rowIndex> palette.length?0:parseInt(rowIndex,10));
		var columnIndex = i%palette[0].length;
		return palette[rowIndex][columnIndex];
	},
	operations: { sum: 1, count:1, max: 1, min: 1},
	addGroupMethod: function(name, method){
		this.operations[name] = 1;
		if(method)
			webix.GroupMethods[name] = method;
	},
	removeGroupMethod: function(name){
		delete this.operations[name];
	},
	groupMethods_setter: function(obj){
		for(var a in obj){
			if(obj.hasOwnProperty(a))
				this.addGroupMethod(a, obj[a]);
		}
	},
	// fields for edit popup
	getFields: function() {
		var i,
			fields = [],
			fields_hash = {};

		for (i = 0; i < Math.min(this.data.count() || 5); i++) {
			var item = this.data.getItem(this.data.getIdByIndex(i));
			for (var f in item) {
				if (!fields_hash[f]) {
					fields.push(f);
					fields_hash[f] = webix.uid();
				}
			}
		}

		var str = this.config.structure;
		var result = { fields:[], groupBy:[], values:[], filters:[] };

		var field = (typeof str.groupBy == "object"?str.groupBy[0]:str.groupBy);
		if (!webix.isUndefined(fields_hash[field])) {
			result.groupBy.push({name: field, text: this._applyMap(field), id: fields_hash[field]});
		}

		var valueNameHash = {};
		var text;
		for (i = 0; i < str.values.length; i++) {
			field = str.values[i];
			if (!webix.isUndefined(fields_hash[field.name])) {
				text = this._applyMap(field.name);
				if(webix.isUndefined(valueNameHash[field.name])){
					valueNameHash[field.name] = result.values.length;
					result.values.push({name: field.name, text: text, operation: field.operation, color: field.color||[this._getColor(i)], id: fields_hash[field.name]});
				}
				else{
					var value = result.values[valueNameHash[field.name]];
					value.operation =value.operation.concat(field.operation);
					value.color =value.color.concat(field.color||[this._getColor(i)]);
				}
			}
		}

		for (i = 0; i < (str.filters || []).length; i++) {
			field = str.filters[i];
			if (!webix.isUndefined(fields_hash[field.name])) {
				text = this._applyMap(field.name);
				result.filters.push({name: field.name, text: text, type:field.type, value:field.value, id: fields_hash[field]});
			}
		}

		fields.sort();

		for (i = 0; i < fields.length; i++) {
			field = fields[i];
			if (!webix.isUndefined(fields_hash[field]))
				result.fields.push({name:field, text: this._applyMap(field), id: fields_hash[field]});
		}

		return result;
	},
	setStructure: function(config){
		this.define("structure", config);
		this.render();
	},
	getStructure: function() {
		return this.config.structure;
	},
	getConfigWindow: function(){
		return this._pivotPopup;
	},
	getFilterView: function(){
		return this.$$("filters");
	},
	$exportView:function(options){
		webix.extend(options, {
			ignore:{ $group:true, $row:true }
		});
		return this.$$("chart");
	}
}, webix.IdSpace, webix.ui.layout, webix.DataLoader, webix.EventSystem, webix.Settings);