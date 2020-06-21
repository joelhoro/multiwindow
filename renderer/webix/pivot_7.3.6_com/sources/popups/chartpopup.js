import "./commonpopup.js";
import {getStructureMap} from "../structures/chartpopup.js";

webix.protoUI({
	name: "webix_pivot_chart_config",
	$init: function() {
		this.$view.className += " webix_pivot_chart_popup webix_pivot";
	},
	defaults:{
		chartTypeLabelWidth: 100,
		chartTypeWidth: 302,
		logScaleLabelWidth: 125,
		fieldsColumnWidth: 240,
		popupWidth: 890
	},
	_getUI: function(config) {
		var structure = webix.copy(getStructureMap(this, config));
		return this._setStructure(structure, config);
	},
	_lists:["filters","values","groupBy"],
	_dndCorrection: {
		"values": ["groupBy"],
		"groupBy": ["values"]
	},
	_hidePopups: function(){
		webix.callEvent("onClick",[]);
	},
	_afterInit: function() {
		this.attachEvent("onItemClick", function(id){
			if (this.$eventSource.name == "button"){
				//transform button clicks to events
				var innerId = this.innerId(id),
					structure = this.getStructure();

				if(innerId == "apply" && (!structure.values.length || !structure.groupBy)){
					webix.alert(webix.i18n.pivot.valuesNotDefined);
				}
				else{
					if(webix.$$(this.config.pivot).callEvent("onBefore"+innerId, [structure])) {
						this.callEvent("on" + innerId, [structure]);
						this.hide();
					}
				}
			}
		});
		var popupBlocks = this.$view.querySelectorAll(".webix_pivot_configuration .webix_list");
		for (var i = 0; i < popupBlocks.length; i++) {
			popupBlocks[i].setAttribute("window-message", webix.i18n.pivot.windowMessage);
		}
	},
	getStructure: function() {
		var structure = { groupBy:"",values:[],filters:[] };

		var groupBy = this.$$("groupBy");
		if(groupBy.count())
			structure.groupBy = groupBy.getItem(groupBy.getFirstId()).name;


		var values = this.$$("values");
		var temp;
		values.data.each(webix.bind(function(obj){
			for(var j=0; j< obj.operation.length; j++){
				temp = webix.copy(obj);

				webix.extend(temp,{operation: obj.operation[j],color:  obj.color[j]||webix.$$(this.config.pivot).config.color},true);

				structure.values.push(temp);
			}
		},this));

		var filters = this.$$("filters");
		filters.data.each(function(obj){
			structure.filters.push(obj);
		});

		return structure;
	}
}, webix.ui.webix_pivot_config_common);