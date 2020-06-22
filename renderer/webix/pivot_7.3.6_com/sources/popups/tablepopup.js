import "./commonpopup.js";
import {getStructureMap} from "../structures/tablepopup.js";


webix.protoUI({
	name: "webix_pivot_config",
	defaults:{
		fieldsColumnWidth: 230,
		popupWidth: 890
	},
	$init: function() {
		this.$view.className += " webix_popup webix_pivot";
	},
	_getUI: function(config) {
		var structure = webix.copy(getStructureMap(this, config));
		return this._setStructure(structure, config);
	},
	_lists:["filters","columns","rows","values"],
	_dndCorrection: {
		"rows": ["columns","values"],
		"columns": ["rows"],
		"values": ["rows"]
	},
	_afterInit: function() {
		this.attachEvent("onItemClick", function(id){
			var innerId = this.innerId(id);
			if (innerId == "cancel" || innerId == "apply"){
				//transform button clicks to events
				var structure = this.getStructure();

				if(webix.$$(this.config.pivot).callEvent("onBefore"+innerId, [structure])){
					this.callEvent("on"+innerId, [structure]);
					this.hide();
				}
			}
		});

		var popupBlocks = this.$view.querySelectorAll(".webix_pivot_configuration .webix_list");
		for (var i = 0; i < popupBlocks.length; i++) {
			popupBlocks[i].setAttribute("window-message", webix.i18n.pivot.windowMessage);
		}
	},
	getStructure: function() {
		var structure = { rows:[], columns:[],values:[],filters:[] };

		var rows = this.$$("rows");
		rows.data.each(function(obj){
			structure.rows.push(obj.name); });

		var columns = this.$$("columns");
		columns.data.each(function(obj){
			structure.columns.push(obj.name); });


		var values = this.$$("values");
		values.data.each(function(obj){
			structure.values.push(obj); });

		var filters = this.$$("filters");
		filters.data.each(function(obj){
			structure.filters.push(obj);
		});

		var pivot = webix.$$(this.config.pivot);

		if(pivot.config.structure.columnSort)
			structure.columnSort = pivot.config.structure.columnSort;

		return structure;
	}
}, webix.ui.webix_pivot_config_common);