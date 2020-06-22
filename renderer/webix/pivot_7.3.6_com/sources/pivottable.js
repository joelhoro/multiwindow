import * as flt from "./operations/filters.js";

import "./popups/tablepopup.js";
import * as frz from "./operations/freeze_totals.js";
import * as cor from "./data/core.js";
import {defaults} from "./config/pivottable.js";
import {setColumns} from "./operations/columns.js";
import * as ext from "./operations/external_processing.js";
import {Filters} from "./structures/filters.js";

webix.protoUI({
	name:"pivot",
	version:"{{version}}",
	defaults: defaults,
	$init: function(config) {
		if (config.separateLabel === false){
			config.filterWidth = config.filterWidth || 300;
		}

		this.$view.className +=" webix_pivot";
		// add DataStore API
		this.data.provideApi(this, true);
		// add configuration properties
		this._setConfig(config);
		// event event handlers
		this._initDataStore(config);
		// alias for $separator
		this.$separator = this.$divider;

		this.filters = new Filters();
	},
	$divider: "_'_",
	_initDataStore: function(config){
		if(config.externalProcessing)
			ext.init(this,config);
		else{
			// render on data update
			this.data.attachEvent("onStoreUpdated", webix.bind(function() {
				// call render if pivot is initialized
				if (this.$$("data")) this.render();
			}, this));
			// filtering
			this.attachEvent("onFilterChange", function(){
				this.render(true);
			});
			// initial rendering
			this.$ready.push(this.render);
		}
	},
	_setConfig: function(config){
		if (!config.structure)
			config.structure = {};
		webix.extend(config.structure, { rows:[], columns:[], values:[], filters:[] });
		webix.extend(config, this._getUI(config));
	},

	_getUI: function(config) {
		var filters = { id:"filters", view:"toolbar", css:"webix_pivot_configure_toolbar", borderless: true, hidden:true, padding: 10, cols:[
			{  }
		]};
		var active = webix.skin.$active;
		var table = {
			view:"treetable",
			id:"data",
			css:"webix_data_border",
			select: "row",
			navigation:true,
			leftSplit:1,
			resizeColumn:true,
			rowHeight: active.rowHeight + 8,
			rowLineHeight: active.rowHeight + 8,
			headerRowHeight: active.barHeight + 4,
			on:{
				"onHeaderClick": function(id){
					var pivot = this.getTopParentView();
					if (this.getColumnIndex(id.column) === 0 && !pivot.config.readonly)
						pivot.configure();
				}
			},
			columns:[]
		};

		if(config.datatable && typeof config.datatable == "object" ){
			delete config.datatable.id;
			webix.extend(table,config.datatable,true);
		}

		return { rows: [ filters, table ] };
	},
	/*
	* Shows configuration popup
	* */
	configure: function() {
		if (!this._configPopup)
			this._createPopup();

		var functions = [];
		for (var i in this.operations) functions.push({name: i, title: this._applyLocale(i)});

		this._configPopup.define("operations", functions);
		var pos = webix.html.offset(this.$$("data").getNode());
		this._configPopup.setPosition(pos.x + 10, pos.y + 10);
		this._configPopup.define("data", this.getFields());
		this._configPopup.show();
	},
	_createPopup: function(){
		var config = { view:"webix_pivot_config", operations:[], pivot: this.config.id };
		webix.extend(config , this.config.popup||{});
		this._configPopup = webix.ui(config);
		this.callEvent("onPopup",[this._configPopup]);
		this._configPopup.attachEvent("onApply", webix.bind(this.setStructure, this));
	},
	destructor(){
		if (this._configPopup){
			this._configPopup.destructor();
			this._configPopup = null;
		}
		webix.Destruction.destructor.call(this);
	},
	getFilterView: function(){
		return this.$$("filters");
	},
	/*
	 * Renders Pivot
	 * 
	 */
	render: function(skipFilters) {		
		if (webix.debug_pivot)
			window.console.time("pivot:full-processing");

		if(!this._getPivotData){
			const base = new cor._Pivot(this.config, this);
			webix.extend(this, base);
		}
		flt.formatFilterValues(this.config.structure.filters);

		this._getPivotData(this.data.pull, this.data.order, (result) => {
			this._setData(result, skipFilters);

			if (webix.debug_pivot)
				webix.delay(function(){
					window.console.timeEnd("pivot:full-processing");
					window.console.timeEnd("pivot:rendering");
				});
		});
	},
	_setData: function(data, skipFilters){
		setColumns(this, data.header);

		if (!skipFilters)
			data.filters = flt.processFilters(this);

		this.callEvent("onBeforeRender",[data]);

		if (data.filters)
			flt.showFilters(this, data.filters);

		if(this.config.readonly)
			this.$$("data").$view.className += " webix_pivot_readonly";

		if(this.config.totalColumn)
			this.$$("data").define("math", true);

		if(this.config.footer)
			this.$$("data").define("footer", true);

		if (webix.debug_pivot)
			window.console.time("pivot:rendering");

		this.$$("data").clearAll();
		this.$$("data").config.rightSplit = 0;
		this.$$("data").refreshColumns(data.header);
		this.$$("data").parse(data.data);

		frz.freezeTotals(this);		
	},
	$exportView:function(options){
		if (options.flatTree){
			if (typeof options.flatTree !== "object") 
				options.flatTree = {};

			var flat = options.flatTree;
			flat.id = this.$$("data").config.columns[0].id;
			if (!flat.columns){
				var rows = this.config.structure.rows;
				flat.columns = [];
				for (var i = 0; i < rows.length; i++)
					flat.columns.push({ header:this._applyMap(rows[i]) });
			}
		}
		return this.$$("data").$exportView(options);
	},
	_applyLocale: function(value){
		return webix.i18n.pivot[value]||value;
	},
	_applyMap: function(value){
		return this.config.fieldMap[value]||value;
	},
	getFields: function() {
		var i, field, item, text,
			fields = [],
			fieldsHash = {},
			rowsHash = {},
			str = this.config.structure,
			result = { fields:[], rows:[], columns:[], values:[], filters:[] },
			valuesHash = {};

		if(!this._pivotFields){
			for (i = 0; i < Math.min(this.data.count() || 5); i++) {
				item = this.data.getItem(this.data.getIdByIndex(i));
				for (field in item) {
					if (field !== "id" && field.indexOf("$") !== 0 && !fieldsHash[field]){
						fields.push(field);
						fieldsHash[field] = webix.uid();
					}
				}
			}
		}
		else{
			fields = this._pivotFields;
			for (i = 0; i < fields.length; i++)
				fieldsHash[fields[i]] = webix.uid();
		}


		for (i = 0; i < (str.filters || []).length; i++) {
			field = str.filters[i];
			if (!webix.isUndefined(fieldsHash[field.name])) {
				text = this._applyMap(field.name);
				result.filters.push({name: field.name, text: text, type:field.type, value:field.value, id: fieldsHash[field.name]});
			}
		}
		for (i = 0; i < str.rows.length; i++) {
			field = str.rows[i];
			if (!webix.isUndefined(fieldsHash[field])) {
				result.rows.push({name: field, text: this._applyMap(field), id: fieldsHash[field]});
				rowsHash[field] = true;
			}
		}

		for (i = 0; i < str.columns.length; i++) {
			field = (typeof str.columns[i] == "object"? (str.columns[i].id||i): str.columns[i]);
			if (!webix.isUndefined(fieldsHash[field]) && webix.isUndefined(rowsHash[field])) {
				result.columns.push({name: field, text: this._applyMap(field), id: fieldsHash[field]});
			}
		}


		for (i = 0; i < str.values.length; i++) {
			field = str.values[i];
			if (!webix.isUndefined(fieldsHash[field.name])) {
				if(webix.isUndefined(valuesHash[field.name])){
					valuesHash[field.name] = i;
					text = this._applyMap(field.name);
					let value = {
						name: field.name, text: text, id: fieldsHash[field.name],
						operation:webix.isArray(field.operation)?field.operation:[field.operation]
					};
					result.values.push(value);
				}
				else{
					let index = valuesHash[field.name];
					result.values[index].operation.push(field.operation);
				}


			}
		}

		fields.sort();
		for (i = 0; i < fields.length; i++) {
			field = fields[i];
			if (!webix.isUndefined(fieldsHash[field]))
				result.fields.push({name:field, text: this._applyMap(field), id: fieldsHash[field]});
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
		return this._configPopup;
	},
	profile_setter:function(value){
		var c = window.console;
		if (value){
			this.attachEvent("onBeforeLoad", function(){ c.time("data loading");  });
			this.data.attachEvent("onParse", function(){ c.timeEnd("data loading"); c.time("data parsing");  });
			this.data.attachEvent("onStoreLoad", function(){ c.timeEnd("data parsing"); c.time("data processing");  });
			this.$ready.push(function(){
				this.$$("data").attachEvent("onBeforeRender", function(){ if (this.count()) { c.timeEnd("data processing"); c.time("data rendering"); } });
				this.$$("data").attachEvent("onAfterRender", function(){ if (this.count()) webix.delay(function(){ c.timeEnd("data rendering"); });  });
			});
		}
	}
}, webix.IdSpace, webix.ui.layout, webix.DataLoader, webix.EventSystem, webix.Settings);

