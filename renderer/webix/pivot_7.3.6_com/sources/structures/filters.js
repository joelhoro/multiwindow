
export class Filters{
	constructor(){
		this._filters = [ "multicombo", "select", "text", "datepicker" ];
		this._selects = {"multicombo": 1, "multiselect": 1, "select": 1, "richselect": 1};
	}

	add(name, isSelect){
		this._filters.push(name);
		if(!webix.isUndefined(isSelect))
			this._selects[name] = isSelect;
	}

	isSelect(name){
		return this._selects[name];
	}

	clear(){
		this._filters = [];
	}

	remove(name){
		var i = this.getIndex(name);
		if(i>=0)
			this._filters.splice(i,1);
	}

	getIndex(name){
		for(let i=0; i <this._filters.length;i++ )
			if(this._filters[i] == name)
				return i;
		return -1;
	}

	getDefault(){
		if (this.getIndex("select") != -1)
			return "select";
		return this._filters[0];
	}

	get(){
		return this._filters;
	}

}