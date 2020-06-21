import * as flt from "./filters.js";

export function init(view){
	webix.extend(view, extRender, true);
	// filtering
	view.attachEvent("onFilterChange", function(){
		flt.formatFilterValues(this.config.structure.filters);
		this._loadResults(true);
	});
}

const extRender = {
	render: function(data){
		this.data.silent(function(){
			var url = this.url;
			this.clearAll();
			this.url = url;
		});
		flt.formatFilterValues(this.config.structure.filters);
		if(!data)
			this._loadResults();
		else
			this._setData(data);
	},
	$onLoad: function(data){
		if(data.fields)
			this._pivotFields = data.fields;
		if(data.options)
			this._pivotOptions = data.options;
		if(data.structure)
			this.config.structure = data.structure;

		if(data.operations){
			this.operations = {};
			for(let i =0; i< data.operations.length;i++)
				this.operations[data.operations[i]] = 1;
		}
		if(data.data.columns)
			data.data.header = data.data.columns;

		if(data.data)
			this.render(data.data);
	},
	url_setter:function(value){
		var str = this.config.structure;
		if (str && (str.rows.length || str.columns.length)){
			this.data.url = value;
			this._loadResults();
		} else
			return webix.AtomDataLoader.url_setter.call(this, value);
	},
	_loadResults: function(){
		var structure = this.config.structure,
			url = this.data.url;

		if(url){
			if(url.load)
				url.load(this, {
					success: function(data){
						this.parse(JSON.parse(data));
					}
				}, { structure: structure});
			else if(typeof url == "string")
				this.load("post->"+url, "json", { structure: structure});
		}

	}
};


