export function setStructure(view, baseName, structure, config){

	var uiArrays = ["rows", "cols"],
		uiViews = ["head", "body"],
		popup = view,
		eventH = config.on?config.on.onViewInit:null;

	var checkStructure = function(id,obj){
		var i, j, name;

		for(i =0; i < uiViews.length;i++ ){
			name = null;
			if(obj[uiViews[i]]){
				if(typeof obj[uiViews[i]] == "string"){
					name = obj[uiViews[i]];
					obj[uiViews[i]] = structure[name];
				}
				checkStructure(name, obj[uiViews[i]]);
			}
		}
		for(i =0; i < uiArrays.length;i++ ){
			if(obj[uiArrays[i]]){
				let elements = obj[uiArrays[i]];
				for(j=0; j < elements.length;j++){
					name = null;
					if(typeof elements[j] == "string"){
						name = elements[j];
						obj[uiArrays[i]][j] = structure[name];
					}
					checkStructure(name, obj[uiArrays[i]][j]);
				}
			}
		}
		if(id && id!=baseName && !obj.id)
			obj.id = id;
		if(id){
			if(eventH)
				eventH.apply(popup,[id,obj]);
		}
	};
	checkStructure(baseName,structure[baseName]);
	return structure[baseName];

}