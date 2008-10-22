Event.observe(window, 'load', function() {
  new Vasco.RoutesTable();
  new Vasco.Tabs(".tab", ".content_panel");
});

Object.extend(Rest.Request.defaultOptions, {method: "GET", 
                     onComplete: function(xhr) {
                          $('request').innerHTML = createXhrRequestString(xhr.request);
                                 },
                     onSuccess: function(xhr) {
                          $('response').innerHTML = "<h2>You found gold and silk in Cochin!</h2>" + xhr.responseText.escapeHTML();
                     },

                     onFailure: function(xhr) {
                          $('response').innerHTML = "<h3>You lost your storage ship near the Bay of São Brás.</h3>" + xhr.responseText.escapeHTML();
                     }
});


var Vasco = {};

Vasco.Tabs = Class.create({
  initialize: function(tabClass, contentClass) {
    $$(tabClass).each(function(tab) {
      Event.observe(tab, 'click', function() {
        $$(tabClass).invoke("removeClassName", "current");
        this.addClassName('current');
        $$(contentClass).invoke('hide');
        id = this.id + "_content";
        $(id).show();
      });
    });
  }
});

Vasco.RoutesTable = Class.create({
  initialize: function() {
    curController = "";
    tableTemplate = new Template("<h1>Routes</h1><table><thead><tr><th>Method</th><th>URL</th></tr></thead><tbody>#{tbody}</tbody></table>");
    rowTemplate = new Template("<tr style='display:none' class='#{controller}_row row'><td>#{verb}</td><td>#{linkText}</td></tr>");
    linkTemplate = new Template("<tr><td colspan='2'><a href='#' class='controller_link' id='#{controller}'>#{controller}</a></td></tr>");
    results = "";
    vascoRoutes.each(function(route) {
      if(curController != route.controller) {
        curController = route.controller;
        results += linkTemplate.evaluate({controller: route.controller});
      }         
      if(route.verb && !route.segs.match(/format/)) {
        results += rowTemplate.evaluate({verb: route.verb, linkText: new Vasco.RouteLink(route).linkText, controller: route.controller});
      }        
    });
    $('leftcontent').innerHTML = tableTemplate.evaluate({tbody: results});    
    $$('.controller_link').each(function(link) {
      Event.observe(link, 'click', function() {
        $$('.' + this.id + '_row').invoke('toggle');
      })
    })
  }
});


Vasco.RouteLink = Class.create({
  linkText: "",
  initialize: function(route) {
    js = "alert('Cannot access this route.'); return false;";

    switch(route.verb) {
      case "GET":

       if(route.segs.match(/\:id/) && vascoIds[route.controller] != null) {
          id = vascoIds[route.controller][0];
          js = "getIdFromWindow('" + route.segs + "', '" + id + "'); return false;";      
        } else {
          js = "new Ajax.Request('" + route.segs + "' + getFormat(), {method: 'GET', onComplete: function(xhr) {$('request').innerHTML = createXhrRequestString(xhr.request);}, onFailure: function(xhr) {$('response').innerHTML = '<h3>You lost your storage ship near the Bay of São Brás.</h3>';}, onSuccess: function(xhr) {$('response').innerHTML = xhr.responseText.escapeHTML();}}); return false;";      
        } 
        this.linkText = "<a onclick=\"" + js + "\" href='#'>" + route.segs + "</a>";
        break;
      case "DELETE":
        if(vascoIds[route.controller] != null) {
          id = vascoIds[route.controller][0];
          js = "deleteIdFromWindow('" + route.segs + "', '" + id + "'); return false;";
        }      
        this.linkText = "<a onclick=\"" + js + "\" href='#'>" + route.segs + "</a>";      
        break;

      case "PUT":
        if(vascoModelProperties[route.controller] != null) {
          id = vascoIds[route.controller][0];
          js = "updateFromWindow('" + route.segs + "', '" + route.controller + "', '" + id + "'); return false;";
        }      
        this.linkText = "<a onclick=\"" + js + "\" href='#'>" + route.segs + "</a>";          

        break;

      case "POST":
        if(vascoModelProperties[route.controller] != null) {
          js = "newFromWindow('" + route.segs + "', '" + route.controller + "'); return false;";
        }      
        this.linkText = "<a onclick=\"" + js + "\" href='#'>" + route.segs + "</a>";          
        break;

      default:
        this.linkText = route.segs;
    }
  }
});


function createXhrRequestString(request) {

  result = new Template("#{method} #{url}\n #{body}");
  var curMethod = null;
  if(request.url.match(/PUT/)) {
    curMethod = "PUT";
  }
  return result.evaluate({method: curMethod || request.parameters["_method"] || request.options["_method"] || request.method.toUpperCase(), url: request.url, 
                          body: request.body ? request.body.escapeHTML() : ""}); 
}


function newFromWindow(route_url, id) {
  form = "<input type='hidden' id='url_from_win' value='" + route_url + "'/><input type='hidden' id='type_from_window' value='" + vascoModelNames[id] + "'/><form id='form_from_window'><table>";
  props = vascoModelProperties[id];
  props.each(function(prop) {form += "<tr><td>" + prop + ":</td><td><input name='" + prop +"' id='" + prop +"'></td>";}); 
  form += "</table></form>";
  Dialog.confirm("Update with: " + form, 
                  {className: "alphacube", width:500, height:500, okLabel: "commit", 
                          ok:function(win) {
                              new Rest.Create($('url_from_win').value + getFormat(), {postBody: formToXML('form_from_window', $('type_from_window').value)});
                              return true;
    }});
}

function updateFromWindow(route_url, id, suggested) {
  form = "<input type='hidden' id='url_from_win' value='" + route_url + "'/><input type='hidden' id='type_from_window' value='" + vascoModelNames[id] + "'/><form id='form_from_window'><table>";
  props = vascoModelProperties[id];
  props.each(function(prop) {
    if(prop == 'id') {
      form += "<tr><td>" + prop + ":</td><td><input value='" + suggested + "' name='" + prop +"' id='" + prop +"'></td>";
    } else {
      form += "<tr><td>" + prop + ":</td><td><input name='" + prop +"' id='" + prop +"'></td>";
    }
  }); 
  form += "</table></form>";
  Dialog.confirm("Update with: " + form, {className: "alphacube", width:500, height:500, okLabel: "commit", ok:function(win) {
      new Rest.Update($('url_from_win').value.replace(":id", $('id').value) + getFormat(), {postBody: formToXML('form_from_window', $('type_from_window').value)});
      return true; 
    }});
}


function getIdFromWindow(route_url, suggested_match) {
  Dialog.confirm("ID to try: <input type='text' id='id_from_win' value='" + suggested_match + "'/><input type='hidden' id='url_from_win' value='" + route_url + "'/>", {className: "alphacube", width:300, height:100, okLabel: "commit", ok:function(win) {
      new Rest.Request($('url_from_win').value.replace(":id", $('id_from_win').value) + getFormat());
      return true;
    }});
}

function deleteIdFromWindow(route_url, suggested_match) {
    Dialog.confirm("ID to try: <input type='text' id='id_from_win' value='" + suggested_match + "'/><input type='hidden' id='url_from_win' value='" + route_url + "'/>", {className: "alphacube", width:300, height:100, okLabel: "commit", ok:function(win) {
      new Rest.Delete($('url_from_win').value.replace(":id", $('id_from_win').value) + getFormat());
      return true; 
    }});
}


function formToXML(form, typeName) {
  results = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><" + typeName + ">";
  Form.getElements(form).each(function(input) {
    if(input.value != null && input.value != '') {
      results += "<" + input.name + ">" + input.value + "</" + input.name + ">";
    }
  });
  results += "</" + typeName + ">";
  return results;  
}

function getFormat() {
  return $('format_select').value;
}