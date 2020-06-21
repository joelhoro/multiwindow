import * as clc from "../operations/popup_clicks.js";
import {popupTemplates} from "./templates.js";

const clickHandlers = webix.extend({
	"color": function(e,id,el) {
		var colorboard = {
			view: "colorboard",
			borderless: true

		};
		if(webix.$$(this.config.pivot).config.colorboard){
			webix.extend(colorboard,webix.$$(this.config.pivot).config.colorboard);
		}
		else{
			webix.extend(colorboard,{
				width:  150,
				height: 150,
				palette: webix.$$(this.config.pivot).config.palette
			});
		}

		var p = webix.ui({
			view:"popup",
			id: "colorsPopup",
			body:colorboard
		});
		p.show(el);
		p.getBody().attachEvent("onSelect",function(){
			p.hide();
		});
		p.attachEvent("onHide", webix.bind(function() {
			var index = webix.html.locate(e, "webix_operation");
			var value = p.getBody().getValue();
			if (value) {
				this.$$("values").getItem(id).color[index] = value;
				this.$$("values").updateItem(id);
			}
			p.close();
		}, this));
		return false;
	}
},clc.clickHandlers);

export function getStructureMap(view, config) {
	var chartTypes = [];
	var pivot = webix.$$(config.pivot);
	var types = pivot.chartMap;
	for(var type in types){
		chartTypes.push({id: type, title: pivot._applyLocale(type).toLowerCase()});
	}

	var chartType = pivot.config.chartType;

	return {
		"popup": {
			width: config.popupWidth,
			head: "toolbar",
			body: "body"
		},
		"toolbar": {
			view: "toolbar",
			borderless: true,
			padding: 10,
			cols: [
				"configTitle",
				{
					margin: 6,
					cols: [
						"cancel",
						"apply"
						
					]
				}
			]
		},
		"configTitle": { id: "configTitle",  view: "label", label: webix.i18n.pivot.windowTitle || "" },
		"cancel":{ view: "button", id: "cancel",  label: pivot._applyLocale("cancel"), width: config.cancelButtonWidth },
		"apply":{ view: "button", id: "apply", type: "form", css:"webix_pivot_apply", label:pivot._applyLocale("apply"), width:config.applyButtonWidth },
		"body": {
			type: "wide",
			rows: [
				{
					css: "webix_pivot_fields_layout",
					type: "space",
					cols: [
						"fieldsLayout",
						{
							type: "wide",
							rows: [
								{
									type: "wide",
									css: "webix_pivot_configuration",
									rows: [
										{
											type: "wide",
											cols: [
												"filtersLayout",
												"groupLayout",
												
											]
										},
										{
											type: "wide",
											cols: [
												"valuesLayout",
												"chartLayout"
											]
										}
									]
								}
							]
						}
					]
				}
			]
		},
		"fieldsLayout":{
			width: config.fieldsColumnWidth,
			rows: [
				"fieldsHeader",
				"fields"
			]
		},
		"fieldsHeader": { id: "fieldsHeader", data: {value: "fields"}, css: "webix_pivot_header_fields",
			template: popupTemplates.header, height: 40
		},
		"fields": {
			view: "list", type: {height: "auto"}, css: "webix_pivot_fields", drag: true, 
			template: "<span class='webix_pivot_list_marker'></span>#text#<span class='webix_pivot_icon pt-list-drag'></span>",
			on: view._getListEvents()
		},
		"filtersLayout": {
			rows: [
				"filtersHeader",
				"filters"
			]
		},
		"filtersHeader": { data:{value: "filters", icon:"filter" }, template: popupTemplates.iconHeader, css: "webix_pivot_popup_title", height: 40 },
		"filters": {
			view: "list", scroll: "auto", type: {height: "auto"}, drag: true, 
			template: webix.bind(popupTemplates.filters, view),
			onClick: {
				"webix_link_selection": webix.bind(clickHandlers["filter-selector"], view),
				"webix_pivot_minus": webix.bind(clc.clickHandlers.remove, view)
			},
			on: view._getListEvents()
		},
		"valuesLayout":{
			rows:[
				"valuesHeader",
				"values"
			]
		},
		"valuesHeader":{id: "valuesHeader", data: {value: "values", icon:"values-chart"},
			template: popupTemplates.iconHeader, css: "webix_pivot_popup_title", height: 40
		},
		"values":{
			view: "list", scroll: "auto", drag: true, css: "webix_pivot_chart_values", type: { height: "auto" },
			template: webix.bind(popupTemplates.chartValues, view),
			onClick: {
				"webix_link_title": webix.bind(clickHandlers.selector, view),
				"webix_link_selection": webix.bind(clickHandlers.selector, view),
				"webix_color_selection": webix.bind(clickHandlers.color, view),
				"webix_pivot_minus": webix.bind(clickHandlers.remove, view)
			},
			on:view._getListEvents()
		},
		"groupLayout": {
			rows:[
				"groupHeader",
				"groupBy"
			]
		},
		"groupHeader": { data:{value: "groupBy", icon:"group"},  template: popupTemplates.iconHeader, css: "webix_pivot_popup_title", height: 40},
		"groupBy": {
			view: "list", scroll: false, drag: true, type: {height: "auto"},
			template: webix.bind(popupTemplates.groupBy, view),
			on:view._getListEvents(),
			onClick:{
				"webix_pivot_minus": webix.bind(clc.clickHandlers.remove, view)
			}
		},
		"chartLayout":{
			css:"webix_pivot_popup_chart",
			rows:[
				"chartHeader",
				"chartBody",
				// "logScale",
				// "chart"
			]
		},
		"chartHeader": { data:{value: "chart", icon:"chart"},  template: popupTemplates.iconHeader, css: "webix_pivot_popup_title", height: 40},
		"chartBody": {
			view: "list", scroll: false, drag: false,
			type:{
				height: "auto",
				markCheckbox:function(obj){
					if(typeof obj.markCheckbox === "undefined") { //check for first init
						(pivot.config.chart.scale&&pivot.config.chart.scale == "logarithmic")?obj.markCheckbox=1:obj.markCheckbox=0;
					}
					return "<span class='webix_icon wxi-checkbox-"+(obj.markCheckbox?"marked":"blank")+"'></span>";
				},
				getType:function(obj) {
					return obj.chartType = chartType;
				}
			},
			onClick:{
				"webix_link_selection": function(e, id, el) {
					var popup,
						selector = {
							view: "webix_pivot_popup", css: "webix_pivot_popup", autofit:true,
							autoheight: true, width: 150,
							data: chartTypes
						};
					popup = webix.ui(selector);
					popup.show(el);
					popup.attachEvent("onHide", webix.bind(function() {
						var sel = popup.getSelected();
						if (sel !== null) {
							chartType = sel.id;
							this.refresh();
						}
						popup.close();
					}, this));
				},
				"webix_chart_checkbox":function(e, id){
					var item = this.getItem(id);
					item.markCheckbox = item.markCheckbox?0:1;
					this.updateItem(id, item);
				}
			},
			template:function(obj, common) {
				if(obj.id === "logScale") {
					return "<div class='webix_chart_checkbox'>"+common.markCheckbox(obj, common)+"<span>"+ obj.title.toLowerCase() +"</span></div>";
				} else {
					return "<span class='webix_pivot_icon pt-bar-chart'></span><span>"+webix.i18n.pivot.chartType.toLowerCase()+"</span><span class='webix_link_selection'>"+webix.i18n.pivot[common.getType(obj, common)]+ "</span>";
				}
			},
			data:[{title:webix.i18n.pivot.logScale, id:"logScale"}, {title:webix.i18n.pivot.chartType, id:"chartType", chartType:chartType}]
		}
	};
}