export function isArray(obj) {
	return Array.isArray?Array.isArray(obj):(Object.prototype.toString.call(obj) === "[object Array]");
}

export function isUndefined(a){
	return typeof a == "undefined";
}

export function extend(base, source, force){
	//copy methods, overwrite existing ones in case of conflict
	for (var method in source)
		if (!base[method] || force)
			base[method] = source[method];
	return base;
}

var seed;

export function uid(){
	if (!seed)
		seed=(new Date()).valueOf();
	seed++;
	return seed;
}

