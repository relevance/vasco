Object.extend(HTMLUListElement.prototype, {
  sort: function(comparator) {
    if(comparator == null) {
      comparator = function(element) {return element.down('span').innerHTML;};
    }
    ul = this;
    lis = ul.childElements();
    sorted_lis = lis.sortBy(comparator);
    lis.invoke('remove');
    sorted_lis.each(function(li) {
      new Insertion.Bottom(ul, li);
    });    
  }
});

Object.extend(String, {
  random: function(size, alphaOnly) {
    if(alphaOnly == null) {alphaOnly = false;}
    schars = "abcdefghijklmnopqrstuvwxyz";
    if(!alphaOnly) {schars += "0123456789";}
    size = size || 10;
    random = "";
    for(i = 1; i<=size; i++) {
      random += schars[Math.round(Math.random()*(schars.length-1))];
    }
    return random;
  }
});

Object.extend(String.prototype, {
  lastUrlComponent: function() {
    components = this.split("/");
    return components[components.length - 1];    
  }
});

Object.extend(Autocompleter.Local.prototype, {
  initialize: function(element, update, array, options) {
    $(element).setAttribute('autocomplete', 'off');
    this.baseInitialize(element, update, options);
    this.options.array = array;
  },
  // Taken from http://www.webreference.com/programming/java_dhtml/chap8/2/
	// (only O'Reilly would dare publish a nested ternary in one of their books)
	blockEnter: function(evt) {
		evt = (evt) ? evt : event;
		var charCode = (evt.charCode) ? evt.charCode :
				((evt.which) ? evt.which : evt.keyCode);
		if (charCode == 13 || charCode == 3) evt.stop();
	}
});

var Rest = {};

Rest.Request = Class.create({
  initialize: function(url, options) {
    default_options = Object.extend({}, Rest.Request.defaultOptions);
    final_options = Object.extend(default_options, options);                        
    return new Ajax.Request(url, final_options);
  }
});

Rest.Request.defaultOptions = {method: "GET"};

Rest.Delete = Class.create({
  initialize: function(url, options) {
    default_options = {method: 'POST', parameters: {"_method": "DELETE"}};
    return new Rest.Request(url, Object.extend(default_options, options));
  }
});

Rest.Update = Class.create({
  initialize: function(url, options) {
    default_options = {method: 'POST', "_method": "PUT", contentType: 'application/xml; charset=utf-8'};
    if(url.match(/\?/)) {
      url += "&_method=PUT";
    } else {
      url += "?_method=PUT";
    }
    return new Rest.Request(url, Object.extend(default_options, options));
  }
});

Rest.Create = Class.create({
  initialize: function(url, options) {
    default_options = {method: 'POST', contentType: 'application/xml; charset=utf-8'};
    return new Rest.Request(url, Object.extend(default_options, options));
  }
});
