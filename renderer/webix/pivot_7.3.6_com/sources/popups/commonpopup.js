import * as clc from "../operations/popup_clicks.js";
import {setStructure} from "../operations/set_structure.js";
import {popupTemplates} from "../structures/templates.js";

webix.protoUI({
	name: "webix_pivot_config_common",
	$init: function(config) {
		webix.extend(config,this.defaults);
		webix.extend(config, this._getUI(config), true);
		this.$ready.push(this._afterInit);
	},
	defaults:{
		padding:8,
		height: 500,
		width: 700,
		cancelButtonWidth: 100,
		applyButtonWidth: 85,
		head: false,
		modal:true,
		move: true
	},
	_getUI: function() {
		return {};
	},
	_afterInit: function() {},
	setStructure: function(config){
		this.define("structure", config);
		this.render();
	},
	getStructure: function() {
		return {};
	},
	_lists:[],
	_dndCorrection:{},
	data_setter: function(value) {
		value = webix.copy(value);

		var data, i,
			fields = value.fields,
			lists = this._lists;

		fields.forEach(function(field){
			lists.forEach(function(listName){
				data = value[listName];
				data.forEach(function(item){
					if(item.name == field.name)
						field.$css = " webix_pivot_field_selected";
				});
			});
		});

		this.$$("fields").clearAll();
		this.$$("fields").parse(fields);
		
		for( i=0; i < lists.length; i++){
			this.$$(lists[i]).clearAll();
			this.$$(lists[i]).parse(value[lists[i]]);
		}
	},
	_dropField: function(ctx){
		var item,
			from = ctx.from,
			to = ctx.to;
		if(to && to != from){
			item = webix.copy(from.getItem(ctx.start));
			if(to == this.$$("fields"))
				this._removeListField(this.innerId(from.config.id),item);
			else
				this._addListField(this.innerId(to.config.id), item, ctx.index);
			return false;
		}
	},
	_addListField: function(list, item, index){
		this._handlers[list].call(this, list, item, index);
	},
	_removeListField: function(list, item){
		this.$$(list).remove(item.id);
		var lists = this._lists;
		var found = false;
		for(var i =0; !found && i < lists.length;i++){
			this.$$(lists[i]).data.each(function(field){
				if(field.name == item.name)
					found = field;
			});
		}
		if(!found)
			this._setPivotFieldCss(item.name,"");
	},
	_setPivotFieldCss: function(name, css){
		this.$$("fields").data.each(function(item){
			if(item.name == name){
				item.$css = " "+css;
				this.refresh(item.id);
			}
		});
	},
	_handlers: {
		"filters": function(listName, item){
			var found = false,
				name = item.name,
				list = this.$$(listName);

			list.data.each(function(field){
				if(field.name == name){
					found = true;
				}
			});
			if(!found){
				delete item.id;
				list.add(item);
				this._setPivotFieldCss(name,"webix_pivot_field_selected");
				this._correctLists(name, listName);
			}
		},
		"rows": function(listName, item){
			var found = false,
				name = item.name,
				list = this.$$(listName);

			list.data.each(function(field){
				if(field.name == name){
					found = true;
				}
			});
			if(!found){
				delete item.id;
				list.add(item);
				this._setPivotFieldCss(name,"webix_pivot_field_selected");
				this._correctLists(name, listName);
			}
		},
		"columns": function(listName, item){
			this._handlers.rows.call(this,listName, item);
		},
		"values": function(listName, item, index){
			var targetItem = null,
				list = this.$$(listName);
			list.data.each(function(field){
				if(field.name == item.name){
					targetItem = field;
				}
			});
			
			if(targetItem){
				clc.clickHandlers.add.call(this,{},targetItem.id);
			}
			else{
				this._setPivotFieldCss(item.name,"webix_pivot_field_selected");
				list.add(webix.copy(item),index);
			}
			this._correctLists(item.name, listName);
		},
		"groupBy": function(listName, item){
			if(this.$$(listName).data.order.length){
				var id = this.$$(listName).getFirstId();
				this._removeListField(listName, this.$$("groupBy").getItem(id));
			}
			this._setPivotFieldCss(item.name,"webix_pivot_field_selected");
			delete item.id;
			this.$$(listName).add(item);
			this._correctLists(item.name, listName);
		}
	},
	_correctLists: function(name, listName){
		var i, res,
			lists = this._dndCorrection[listName];
		for( i=0; lists && i< lists.length; i++ ){
			res = null;
			this.$$(lists[i]).data.each(function(item){
				if(item.name == name)
					res = item;
			});
			if(res)
				this.$$(lists[i]).remove(res.id);
		}
	},
	_setStructure: function(structure, config){
		return setStructure(this,"popup",structure, config);
	},
	_listDragHTML: function(context){
		if(context.start){
			var item = this.getItem(context.start);
			context.html = this.type.templateStart(item,this.type)+popupTemplates.listDrag(item)+this.type.templateEnd(item, this.type);

		}
	},
	_getListEvents: function(){
		return {
			onBeforeDrop: webix.bind(this._dropField,this),
			onBeforeDrag: this._listDragHTML,
			onBeforeDragIn: function(){
				webix.html.addCss(webix.DragControl.getNode(),"webix_pivot_drag_zone",true);
			}
		};
	}
}, webix.ui.window, webix.IdSpace);