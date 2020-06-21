import * as clc from "../operations/popup_clicks.js";
import {popupTemplates} from "./templates.js";

export function getStructureMap(view, config) {
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
		"configTitle": {id: "configTitle", view: "label", label: webix.i18n.pivot.windowTitle || ""},
		"cancel": {view: "button", id: "cancel", label: webix.i18n.pivot.cancel, width: config.cancelButtonWidth},
		"apply": {view: "button", id: "apply", type: "form", label: webix.i18n.pivot.apply, width: config.applyButtonWidth},
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
												"columnsLayout"
											]
										},
										{
											type: "wide",
											cols: [
												"rowsLayout",
												"valuesLayout"
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
		"fieldsLayout": {
			width: config.fieldsColumnWidth,
			rows: [
				"fieldsHeader",
				"fields"
			]
		},
		"filtersLayout": {
			rows: [
				"filtersHeader",
				"filters"
			]
		},
		"columnsLayout": {
			rows: [
				"columnsHeader",
				"columns"
			]
		},
		"rowsLayout": {
			rows: [
				"rowsHeader",
				"rows"
			]
		},
		"valuesLayout": {
			rows: [
				"valuesHeader",
				"values"
			]
		},
		"fieldsHeader": {
			id: "fieldsHeader", data: {value: "fields"}, css: "webix_pivot_header_fields",
			template: popupTemplates.header, height: 40
		},
		"fields": {
			id: "fields", css: "webix_pivot_fields", view: "list", scroll: "auto",
			type: {height: "auto"}, drag: true, template: "<span class='webix_pivot_list_marker'></span>#text#<span class='webix_pivot_icon pt-list-drag'></span>",
			on: view._getListEvents()
		},
		"filtersHeader": {
			id: "filtersHeader", data: {value: "filters", icon: "filter"},
			template: popupTemplates.iconHeader, css: "webix_pivot_popup_title", height: 40
		},
		"filters": {
			id: "filters", view: "list", drag: true, scroll: "auto",
			template: webix.bind(popupTemplates.filters, view),
			type: {height: "auto"},
			onClick: {
				"webix_link_selection": webix.bind(clc.clickHandlers["filter-selector"], view),
				"webix_pivot_minus": webix.bind(clc.clickHandlers.remove, view)
			},
			on: view._getListEvents()
		},
		"columnsHeader": {
			id: "columnsHeader", data: {value: "columns", icon: "columns"},
			template: popupTemplates.iconHeader, css: "webix_pivot_popup_title", height: 40
		},
		"columns": {
			id: "columns", view: "list", drag: true, scroll: "auto", type: {height: "auto"}, 
			template: webix.bind(popupTemplates.columns, view),
			on: view._getListEvents(),
			onClick: {
				"webix_pivot_minus": webix.bind(clc.clickHandlers.remove, view)
			}
		},
		"rowsHeader": {
			id: "rowsHeader", data: {value: "rows", icon: "list"},
			template: popupTemplates.iconHeader, css: "webix_pivot_popup_title", height: 40
		},
		"rows": {
			id: "rows",
			view: "list",
			drag: true, scroll: "auto",
			template: webix.bind(popupTemplates.rows, view),
			type: {height: "auto"},
			on: view._getListEvents(),
			onClick: {
				"webix_pivot_minus": webix.bind(clc.clickHandlers.remove, view)
			}
		},
		"valuesHeader": {
			id: "valuesHeader", data: {value: "values", icon:"values"},
			template: popupTemplates.iconHeader, css: "webix_pivot_popup_title", height: 40
		},
		"values": {
			id: "values", view: "list", scroll: "auto", drag: true, css: "webix_pivot_values", type: {height: "auto"},
			template: webix.bind(popupTemplates.tableValues, view),
			onClick: {
				"webix_link_selection": webix.bind(clc.clickHandlers.selector, view),
				"webix_pivot_plus": webix.bind(clc.clickHandlers.add, view),
				"webix_pivot_minus": webix.bind(clc.clickHandlers.remove, view)
			},
			on: view._getListEvents()
		}
	};
}

