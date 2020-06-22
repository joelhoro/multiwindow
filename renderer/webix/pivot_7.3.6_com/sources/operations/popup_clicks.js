export const clickHandlers = {
	"add": function(e,id) {
		const pivot = webix.$$(this.config.pivot);
		var item = this.$$("values").getItem(id);
		item.operation.push(pivot.config.defaultOperation);
		this.$$("values").updateItem(id);

		webix.delay(function(){
			var index = item.operation.length-1;
			var els = this.$$("values").getItemNode(id).childNodes;
			var el = null;
			for (var i = 0; i < els.length; i++) {
				el = els[i];
				if (!el.getAttribute)
					continue;
				var op = el.getAttribute("webix_operation");
				if (!webix.isUndefined(op) && op == index) break;
			}
			if (el!==null)
				clickHandlers.selector.call(this, el, id, el);
		}, this);
	},
	"filter-selector": function(e,id,el) {
		var popup,
			pivot = webix.$$(this.config.pivot),
			selector = {
				view: "webix_pivot_popup", css: "webix_pivot_popup", autofit:true,
				autoheight: true, width: 150,
				data: getFilterOptions(pivot.filters.get(), pivot._applyLocale)
			};
		popup = webix.ui(selector);
		popup.show(el);
		popup.attachEvent("onHide", webix.bind(function() {
			var sel = popup.getSelected();
			if (sel !== null) {
				var item = this.$$("filters").getItem(id);
				item.type = sel.name;
				item.value = "";
				this.$$("filters").updateItem(id);
			}

			popup.close();
		}, this));
	},
	"chart-selector": function(e,id,el) {
		var popup,
			pivot = webix.$$(this.config.pivot),
			selector = {
				view: "webix_pivot_popup", css: "webix_pivot_popup", autofit:true,
				autoheight: true, width: 150,
				data: getFilterOptions(pivot.filters.get(), pivot._applyLocale)
			};
		popup = webix.ui(selector);
		popup.show(el);
		popup.attachEvent("onHide", webix.bind(function() {
			var sel = popup.getSelected();
			if (sel !== null) {
				var item = this.$$("filters").getItem(id);
				item.type = sel.name;
				item.value = "";
				this.$$("filters").updateItem(id);
			}

			popup.close();
		}, this));
	},
	"selector": function(e,id,el) {
		var func_selector = {
			view: "webix_pivot_popup", css: "webix_pivot_popup", autofit:true,
			width: 150,
			data: this.config.operations||[]
		};
		var p = webix.ui(func_selector);
		p.show(el);
		p.attachEvent("onHide", webix.bind(function() {
			var index = webix.html.locate(e, "webix_operation");
			var sel = p.getSelected();
			if (sel !== null) {
				this.$$("values").getItem(id).operation[index] = sel.name;
				this.$$("values").updateItem(id);
			}

			p.close();
		}, this));
	},
	"remove": function(e, id) {
		var list = webix.$$(e);
		var listId = this.innerId(list.config.id);
		var item = this.$$(listId).getItem(id);
		if(listId == "values"){
			let index = webix.html.locate(e, "webix_operation");
			if (item.operation.length > 1) {
				item.operation.splice(index, 1);
				this.$$("values").updateItem(id);
			} else {
				this._removeListField("values", item);
			}
		}
		else{
			this._removeListField(listId, item);
		}
		return false;
	}
};


function getFilterOptions(filters, process){
	var i, name, items = [];
	for(i =0; i < filters.length; i++){
		name = filters[i];
		items.push({name: name, title: process(name)});
	}
	return items;
}