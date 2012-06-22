String.prototype.toTitleCase = function() {
    return this.replace(/^\w/, function($0) {
        return $0.toUpperCase();
    })
}
function store_data(data, key) {
	if (!window.localStorage || !window.JSON) {
		return;
	}
	key = key || data_key;
	localStorage.setItem(key, JSON.stringify(data));
}

function get_data(key) {
	if (!window.localStorage || !window.JSON) {
		return;
	}
	key = key || data_key;
	var item = localStorage.getItem(key);
	
	if (!item) {
		return;
	}
	
	return JSON.parse( item );
}

function remove_data(key) {
	if (!window.localStorage || !window.JSON) {
		return;
	}
	key = key || 'lutil_generic_data_key';
	localStorage.removeItem(key);
}
