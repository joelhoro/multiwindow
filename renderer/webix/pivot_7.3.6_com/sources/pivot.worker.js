import {WebixPivot} from "./data/core.js";

var pivot;

onmessage = function(e) {
	if (!pivot){
		pivot = new WebixPivot(e.data.structure);
	}
	if (e.type === "error")
		throw(e);

	pivot.config.format = e.data.format;
	pivot.config.footer = e.data.footer;
	pivot.config.structure = e.data.structure;
	if (e.data.ping){
		pivot.config.ping = function(watch){
			postMessage({ type:"ping", watch });
		};
	}

	pivot._pivotOperations.parse(e.data.operations);

	var result = pivot.getData(e.data.data);
	
	postMessage({ type:"data", data:result.data, id: e.data.id });
};