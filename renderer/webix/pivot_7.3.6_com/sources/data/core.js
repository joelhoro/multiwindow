import {Data} from "./data.js";
import {Operations} from "./operations.js";
import * as hlp from "./helpers.js";

const divider = "_'_";

export function _Pivot(config, master){
	this.$divider = divider;
	this._initOperations();
	this.config = config;
	this.view = master;

	if (config.webWorker && !typeof(Worker) !== "undefined" && master){
		this._initWorker(config, master);
	} else
		this._pivotData = new Data(this, this.config);

	if (!this.config.structure)
		this.config.structure = {};
	hlp.extend(this.config.structure, { rows:[], columns:[], values:[], filters:[] });
}

_Pivot.prototype = {
	_initWorker(config, master){
		this._result = null;
		this._pivotWorker = new Worker(config.webWorker);
		this._pivotWorker.onmessage = (e) => {
			if (e.data.type === "ping"){
				master._runPing(e.data.watch, master);
			} else if (master._result && !master.$destructed){
				master.callEvent("onWebWorkerEnd", []);
				if (!e.data.id || e.data.id === master._result_id){
					master._result(e.data.data);
					master._result = null;
				}
			}
		};
	},
	_runPing(watch, master){
		try{
			this.config.ping(watch);
		} catch(e){
			this._pivotWorker.terminate();
			this._initWorker(this.config, master);
			master.callEvent("onWebWorkerEnd", []);
		}
	},
	_getPivotData(pull, order, next){
		if (this._pivotWorker){
			var id = this._result_id = webix.uid();
			this._result = next;

			var data = [];
			var structure = this.config.structure;
			var footer = this.config.footer;
			var operations = this._pivotOperations.serialize();
			if (structure && (structure.rows.length || structure.columns.length))
				for (var i = order.length - 1; i >= 0; i--)
					data[i] = pull[order[i]];

			this.callEvent("onWebWorkerStart", []);

			var format = this.config.format;
			if (typeof format === "function"){
				var t = "x"+webix.uid();
				webix.i18n[t] = format;
				format = t;
			}

			const ping = !!this.config.ping;
			this._pivotWorker.postMessage({ 
				footer, structure, data, id, operations, ping, format
			});
		} else {
			var result = this._pivotData.process(pull, order);
			if (next) next(result);
			return result;
		}
	},
	_initOperations(){
		var operations = this._pivotOperations = new Operations();
		this.operations = operations.pull;
	},

	addOperation(name, method, options){
		this._pivotOperations.add(name, method, options);
	},
	addTotalOperation(name, method, options){
		this._pivotOperations.addTotal(name, method, options);
	}
};

export function WebixPivot(config, master){
	_Pivot.call(this, config, master);
}

WebixPivot.prototype = hlp.extend({
	getData(data){
		var i, id, option,
			field, fields = [], fieldsHash = {},
			filters = this.config.structure.filters,
			pull = {},  options = {}, optionsHash = {},
			operations = this.operations,
			order = [],
			result = {};

		for(i=0; i < filters.length; i++){
			if(filters[i].type.indexOf("select") != -1 ){
				options[filters[i].name] = [];
				optionsHash[filters[i].name] = {};
			}
		}

		for(i=0; i < data.length; i++){
			id = data[i].id = data[i].id ||hlp.uid();
			pull[id] = data[i];
			order.push(id);

			if(i < 5)
				for (field in data[i])
					if (!fieldsHash[field]) {
						fields.push(field);
						fieldsHash[field] = hlp.uid();
					}

			for(option in options){
				let value = data[i][option];
				if(!hlp.isUndefined(value)){
					if(!optionsHash[option][value]){
						optionsHash[option][value]= 1;
						options[option].push(value);
					}

				}
			}
		}

		result.options = options;
		result.fields = fields;
		result.data = this._getPivotData(pull, order);

		result.operations = [];
		for(id in operations)
			result.operations.push(id);

		return result;
	}
}, _Pivot.prototype);



