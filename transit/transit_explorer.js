/**
 * @author Fei Chen
 * Latest update:
 */

var TransitMgr = {
  BACKEND_URL_: "http://211.157.3.197:8080/transit/",
  AUTO_SCROLL_UP_: 1,
  AUTO_SCROLL_DOWN_: 2,

  BASE_URL:  "http://chinamaps.googlecode.com/svn/transit/",
  EVENT_FROM_FRAME: 1,
  EVENT_FROM_MAP: 2,

  stopList_: null,
  //{name:***, lines:[{i:***, n:***, s:***, e:***}, ...]}, ...
  cityList_: [],

  //{name:***, lines:[{i:***, n:***, s:***, e:***}, ...]}
  curCity: null,
  //{id:***, name:***, start:***, end:***}
  curLine: null,

  start: function() {
    var param = {
      api: 'lc'
    };
    TransitMgr.map = Map;
    TransitMgr.frame = Frame;
    TransitMgr.map.init();
    TransitMgr.jsonRPC(param, 'Transit.callback_lc');
  },

  lineExists_: function(line, lineList) {
    for (var i = 0, temp; temp = lineList[i]; i++) {
      if (temp.n == line.n && temp.s == line.s && temp.e == line.e) {
        return true;
      }
    }
    return false;
  },

  searchLineList_: function(name) {
    var lineList = [];
    var allLines = TransitMgr.curCity.lines;
    if (isNaN(parseInt(name))) {
      for (var i = 0, line; line = allLines[i]; i++) {
        if (line.n.indexOf(name) != -1 && !TransitMgr.lineExists_(line, lineList)) {
          lineList.push(line);
        }
      }
    } else {
      for (var i = 0, line; line = allLines[i]; i++) {
        if (line.n.match(/\d+/) == name && !TransitMgr.lineExists_(line, lineList)) {
          lineList.push(line);
        }
      }
    }
    return lineList;
  },

  searchLineByInput: function() {
    TransitMgr.openMessageBoard(TransitMgr.MSG_CACHE, true, "highLightMsg");
    var name = document.getElementById("searchBox").value;
    if (name == null || name == "" || name == TransitMgr.LABEL_SEARCH_DEFAULT) {
      TransitMgr.openMessageBoard(TransitMgr.MSG_NO_LINE, false, "highLightMsg");
      return;
    }
    if (TransitMgr.curCity == null) {
      var selector = document.getElementById("citySelector")
        if (selector.selectedIndex == 0) {
          TransitMgr.openMessageBoard(TransitMgr.MSG_NO_CITY, false, "highLightMsg");
        }
        else {
          // Lines data of this city still on loading...
          TransitMgr.openMessageBoard(TransitMgr.MSG_FRM_LOADING, true, "highLightMsg");
        }
      return;
    }
    var lineList = TransitMgr.searchLineList_(name);
    TransitMgr.frame.showLineList(lineList, name);
  },

  showStopsInLine: function(stopList) {
    TransitMgr.stopList_ = stopList;
    TransitMgr.frame.importStop(stopList);
    TransitMgr.map.importStop(stopList);
  },

  getAllStops: function(id, lineName, start, end) {
    TransitMgr.curLine = {
      id: id,
      name: lineName,
      start: start,
      end: end
    };
    TransitMgr.openMessageBoard(TransitMgr.MSG_FRM_LOADING, true, "highLightMsg");
    var param = {
      api: 'sl',
      li: id,
      city: encodeURIComponent(TransitMgr.curCity.name)
    };
    TransitMgr.jsonRPC(param, 'Transit.callback_sl');
  },

  getInverseLine_: function(line, allLines) {
    for (var i = 0, line; line = allLines[i]; i++) {
      if (line.n == TransitMgr.curLine.name && line.s == TransitMgr.curLine.end && line.e == TransitMgr.curLine.start) {
        return line;
      }
    }
    return null;
  },

  getAllInverseStops: function() {
    TransitMgr.openMessageBoard(TransitMgr.MSG_FRM_LOADING, true, "highLightMsg");
    var line = TransitMgr.getInverseLine_(TransitMgr.curLine, TransitMgr.curCity.lines);
    if (line) {
      TransitMgr.curLine = {
        id: line.i,
        name: line.n,
        start: line.s,
        end: line.e
      };
      var param = {
        api: 'sl',
       li: line.i,
       city: encodeURIComponent(TransitMgr.curCity.name)
      };
      TransitMgr.jsonRPC(param, 'Transit.callback_sl');
    }
    else {
      TransitMgr.openMessageBoard(TransitMgr.MSG_NO_INVERSE, false, "highLightMsg");
    }
  },

  openMessageBoard: function(msg, isFixed, className) {
    var resultDiv = document.getElementById('messageBoard');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = msg;
    if (className) {
    	resultDiv.innerHTML = "<span>" + msg + "</span>";
      resultDiv.className = "messageBoard " + className;
    }
    var subDiv = document.getElementById("resultLines");
		if(subDiv && resultDiv.clientHeight>250){
			subDiv.style.height = "250px";
			subDiv.style.overflow = "auto";
			if(document.all){
			  resultDiv.style.width = subDiv.offsetWidth+"px";
			}else{
			  resultDiv.style.width = (subDiv.offsetWidth+10)+"px";
			}
			
		}
    if (!isFixed || isFixed == undefined) {
      resultDiv.onclick = TransitMgr.closeMessageBoard;
    }
  },

  closeMessageBoard: function() {
    document.getElementById('messageBoard').style.display = 'none';
  },

  changeCity: function(selector) {
    document.getElementById("lineContent").style.display = "none";
    document.getElementById("stationLines").style.display = "none";
    document.getElementById('searchBox').value = TransitMgr.LABEL_SEARCH_DEFAULT;
    TransitMgr.closeMessageBoard();
  //  if (selector.selectedIndex == 0) {
  //    TransitMgr.curCity = null;
  //    map.changeCity(null);
  //  }
  //  else {
      var result = selector.options[selector.selectedIndex].value.match(/(\S+)\((\d+\.\d*),(\d+\.\d*)\)/);
      var name = result[1];
      var center = new GLatLng(parseFloat(result[2]), parseFloat(result[3]));
      TransitMgr.map.changeCity(name, center);
      TransitMgr.curCity = TransitMgr.prepareCity(name);
  //  }
  },

  getCityLinesDone: function(cityLines) {
    // City we are working on
    var cityName = Transit.callback_cl.cityName;
    var callBack = Transit.callback_cl.callBack;

    var cityObj = {
        name: cityName,
        lines: cityLines
    };
    TransitMgr.cityList_.push(cityObj);
    TransitMgr.curCity = cityObj;
    if (callBack) {
      callBack.call(cityName);
    }
    TransitMgr.closeMessageBoard();
  },

  prepareCity: function(cityName, callBack) {
    var cityObj = null;
    for (var i = 0; i < TransitMgr.cityList_.length; i++) {
      cityObj = TransitMgr.cityList_[i];
      if (cityObj.name == cityName) {
        return cityObj;
      }
    }
    // If not find city in cityList
    TransitMgr.openMessageBoard(TransitMgr.MSG_FRM_LOADING, true, "highLightMsg");
    var param = {
      api: 'cl',
      city: encodeURIComponent(cityName)
    };

    Transit.callback_cl.cityName = cityName;
    Transit.callback_cl.callBack = callBack;
    TransitMgr.jsonRPC(param, 'Transit.callback_cl');
  },

  setStop: function(stop, whereComeFrom) {
    if (whereComeFrom == TransitMgr.EVENT_FROM_FRAME) {
      TransitMgr.map.setStop(stop);
    } else {
      if (whereComeFrom == TransitMgr.EVENT_FROM_MAP) {
        TransitMgr.frame.setStop(stop);
      }
    }
  },

  getStop: function(stopId) {
    var index = parseInt(stopId.match(/\d+/));
    return TransitMgr.stopList_[index - 1];
  },

  jsonRPC: function(paramObj, callBackName) {
    var paramStr = TransitMgr.getParamStr_(paramObj);
    var url = TransitMgr.BACKEND_URL_ + "?" + paramStr + "&random=" + Math.random();
    url += '&callback=' + callBackName;

    var api = paramObj['api'];
    var scriptTag = document.createElement('script');
    scriptTag.setAttribute('type', 'text/javascript');
    scriptTag.setAttribute('charset', 'utf-8');
    scriptTag.setAttribute('id', 'jsonpScriptTag' + api);

    scriptTag.setAttribute('src', url);
    var oldTag = document.getElementById('jsonpScriptTag' + api);
    var head = document.getElementsByTagName('head')[0];
    if (oldTag) {
      head.removeChild(oldTag);
    }
    head.appendChild(scriptTag);
  },

  getParamStr_: function(paramObj) {
    var paramArray = [];
    for (var i in paramObj) {
      if (i != "toJSONString") {
        var paramToken = i + '=' + paramObj[i];
        paramArray.push(paramToken);
      }
    }
    return paramArray.join("&");
  },

  prepareSearch: function(elem) {
    elem.value = "";
    TransitMgr.openMessageBoard(TransitMgr.MSG_NO_LINE, false, "highLightMsg");
  },

  autoScroll: function(direction, id) {
    var topParent = document.getElementById(id);
    if (direction == TransitMgr.AUTO_SCROLL_UP_) {
      topParent.scrollTop = topParent.scrollTop - 20;
    } else if (direction == TransitMgr.AUTO_SCROLL_DOWN_) {
      topParent.scrollTop = topParent.scrollTop + 20;
    }
  },

  startScroll: function(direction, id) {
    TransitMgr.autoScroll(direction, id);
    var param = "TransitMgr.autoScroll(" + direction + ",'" + id + "');";
    TransitMgr.scrollId = setInterval(param, 500);
  },

  stopScroll: function() {
    clearInterval(TransitMgr.scrollId);
    TransitMgr.scrollId == null;
  },

  backToStopList: function() {
    if (TransitMgr.curLine) {
      document.getElementById("lineContent").style.display = "block";
      document.getElementById("stationLines").style.display = "none";
    }
  }

};

var Frame = {
  curStopId_: null,
  
  getLineListHtml_: function(lineList, keyword) {
    var html = '<div id="resultLines">';
    var replacement = '<span style="font-weight:bold;">' + keyword + '</span>';
    for (var i = 0, line; line = lineList[i]; i++) {
      var params = '"' + line.i + '","' + line.n + '","' + line.s + '","' + line.e + '"';
      html += '<a class="resultLines" href="#" onclick=TransitMgr.getAllStops(' + params + ')>';
      html += '<span class="line-name">' + line.n.replace(keyword, replacement) + '</span><p>(' + line.s + '--' + line.e + ')</p>';
      html += '</a>';
//      if (i >= 9) {
//        html += '<span>......<span>';
//        break;
//      }
    }
    html += '</div>';
    return html;
  },
  
  //  function parseFullName(fullName){
  //    var result = fullName.match(/(\S+)\((\S+)--(\S+)\)/);
  //    return result.slice(1);
  //  }
  
  getLineTitle_: function() {
    var html = '';
    html += '<span id="titleName" class="lineName">' + TransitMgr.curLine.name + '</span>';
    html += '<span id="titleDest">' + TransitMgr.curLine.start + '<a class="plyIcon"></a>' + TransitMgr.curLine.end + '</span>';
    return html;
  },
  
  getLineDescript_: function() {
    var html = '';
    html += '<span>' + TransitMgr.LABEL_LINE_FROM + TransitMgr.curLine.start + TransitMgr.LABEL_LINE_TO + TransitMgr.curLine.end + '</span>';
    html += '<a href="#" onclick=TransitMgr.getAllInverseStops()>' + TransitMgr.LABEL_REVERSE + '</a>';
    return html;
  },
  
  getStationLinesHtml_: function(stopName, lineList) {
    var html = '';
    if (TransitMgr.curLine) {
      html += '<a href="javascript:TransitMgr.backToStopList()" class="backLink">&laquo;' + TransitMgr.LABEL_BACK + TransitMgr.curLine.name + '</a>';
    }
    
    html += '<div class="stationName">' + stopName + '</div>';
    html += '<p class="stationTitle">' + TransitMgr.LABEL_STATION_TITLE + '</p>';
    html += '<div class="stationContent">';
    html += '<div class="lineList">';
    for (var i = 0, line; line = lineList[i]; i++) {
      html += '<p class="lineInfo">';
      var params = '"' + line.line_id + '","' + line.short_name + '","' + line.start_station + '","' + line.end_station + '"';
      
      html += '<a href="#" onclick=TransitMgr.getAllStops(' + params + ')>';
      html += line.short_name + '</a>';
      html += '<p class="lineTermi">';
      html += line.start_station;
      html += '<a class="plyIcon"></a>';
      html += line.end_station + '</p></li>';
    }
    html += '</div>';
    html += '</div>';
    return html;
  },
  
  getLineListForStation_: function(stationName) {
    TransitMgr.openMessageBoard(TransitMgr.MSG_FRM_LOADING, true, "highLightMsg");
    var param = {
      api: 'ls',
      sn: encodeURIComponent(stationName),
      city: encodeURIComponent(TransitMgr.curCity.name)
    };
    Transit.callback_ls.stationName = stationName;
    TransitMgr.jsonRPC(param, 'Transit.callback_ls');
  },

  changeStop: function(stop) {
    if (TransitMgr.curCity) {
      // Restore the current stop's style
      var curStopNode = document.getElementById(Frame.curStopId_);
      if (Frame.curStopId_ && curStopNode) {
        curStopNode.className = "";
      }
      // Highlight "new" current stop.
      Frame.curStopId_ = stop.id;
      curStopNode = document.getElementById(Frame.curStopId_);
      if (curStopNode) {
        curStopNode.className = "selected";
        Frame.scrollToVisible_(curStopNode.parentNode);
      }
      Frame.getLineListForStation_(stop.name);
    }/* else { // Invoked from map and the city is still not selected.
      var cityName = stop.location;
      TransitMgr.curCity = TransitMgr.prepareCity(cityName, Frame.getLineListForStation_);
    }*/
  },
 
  getPosition_: function(element, topParent) {
    var height = 0;
    for (var e = element; e && e != topParent; e = e.offsetParent) 
      height += e.offsetTop;
    for (e = element.parentNode; e && e != topParent; e = e.parentNode) 
      if (e.scrollTop) 
        height -= e.scrollTop;
    return height;
  },

  /**
   * Auto scroll the city list.
   * @param {Element} stopElem
   */
  scrollToVisible_: function(stopElem) {
    var topParent = document.getElementById("stopList");
    var height = topParent.offsetHeight;
    var scrollTop = topParent.scrollTop;
    var nowPosition = Frame.getPosition_(stopElem, topParent) - scrollTop;
    if (nowPosition > height) {
      topParent.scrollTop = scrollTop + (nowPosition - height);
    } else if (nowPosition < 0) {
      topParent.scrollTop = scrollTop + nowPosition - 2 * stopElem.offsetHeight;
    }
  },
  
  onNameClick_: function(elem) {
    var nameNode = elem;
    var stopId = nameNode.id;
    if (Frame.curStopId_ != stopId) {
      var stop = TransitMgr.getStop(stopId);
      Frame.changeStop(stop);
      TransitMgr.setStop(stop, TransitMgr.EVENT_FROM_FRAME);
    }
  },
  
  addStopListDom_: function(stopList) {
    var container = document.getElementById("stopList");
    container.innerHTML = "";
    var html = '';
    for (var i = 0, stop; stop = stopList[i]; i++) {
    	stop.id = "stop" + stop.line_seq;
    	html += '<li>';
    	html += '  <span>'+stop.line_seq+'</span>';
    	html += '  <a href="#" id="'+stop.id+'" onclick="Frame.onNameClick_(this)">'+stop.name+'</a>';
    	html += '</li>';
    }
    container.innerHTML = html;
  },
  
  importCity: function(cityList) {
    var citySelector = document.getElementById("citySelector");
    for (var i = 0, city; city = cityList[i]; i++) {
      var option = new Option(city.city, city.city + city.coordinates);
      citySelector.options[citySelector.options.length] = option;
    }
		TransitMgr.changeCity(citySelector);
  },
  
  importStop: function(stopList) {
    TransitMgr.closeMessageBoard();
    Frame.curStopId_ = null;
    document.getElementById("stationLines").style.display = "none";
    document.getElementById("lineContent").style.display = "block";
    var title = document.getElementById("lineTitle");
    title.innerHTML = Frame.getLineTitle_();
    var dest = document.getElementById("titleDest");
    var name = document.getElementById("titleName");
    dest.style.marginLeft = name.offsetWidth + "px";
    dest.style.width = (290-name.offsetWidth)+"px";
    if(dest.offsetHeight > name.offsetHeight){
     name.style.top = (dest.offsetHeight - name.offsetHeight)/2 + "px";
    }else{
//     dest.offsetHeight = name.offsetHeight;
     dest.style.marginTop = dest.style.marginBottom = (name.offsetHeight - dest.offsetHeight)/2 + "px";
    }
    
    document.getElementById("lineDescript").innerHTML = Frame.getLineDescript_();
    Frame.addStopListDom_(stopList);
  },
  
  showLineList: function(lineList, keyword) {
    if (lineList.length == 0) {
      TransitMgr.openMessageBoard(TransitMgr.MSG_NO_DATA, false, "highLightMsg");
    } else {
      TransitMgr.openMessageBoard(Frame.getLineListHtml_(lineList, keyword), false);
    }
  },
  
  setStop: function(stop) {
    Frame.changeStop(stop);
  },

  // Callback for ls api.
  showLinesForStation: function (lineList) {
    document.getElementById("lineContent").style.display = "none";
    var stationLines = document.getElementById("stationLines");
    stationLines.style.display = "block";
    document.getElementById("stationLines").innerHTML = Frame.getStationLinesHtml_(Transit.callback_ls.stationName, lineList);
    TransitMgr.closeMessageBoard();
  }
 
};

var Map = {
  map_: new GMap2(),
  BLUE_ICON_URL_: TransitMgr.BASE_URL + "blueStopIcon.png",
  RED_ICON_URL_: TransitMgr.BASE_URL + "redStopIcon.png",
  MAX_LEVEL_: 17,
  MIN_LEVEL_: 15,
  DEFAULT_LEVEL_: 15,
  MSIE: !!(window.attachEvent && !window.opera),
  
  blueIcon_: null,
  redIcon_: null,
  lineMarkers_: [],
  linePolylines_: [],
  boundMarkers_: [],
  move_counter_: 0,

  init: function() {
    if (Map.MSIE) {
      // IE is pretty bad at displaying a lot of markers.
      // Only show stations markers at high zoom level.
      Map.DEFAULT_LEVEL_ = 16;
    }
    Map.blueIcon_ = Map.createIcon_(Map.BLUE_ICON_URL_, new GSize(16, 16), new GPoint(8, 8), new GPoint(8, 4));
    Map.redIcon_ = Map.createIcon_(Map.RED_ICON_URL_, new GSize(16, 16), new GPoint(8, 8), new GPoint(8, 4));
    GEvent.addListener(Map.map_, "infowindowclose", function() {
      TransitMgr.backToStopList();
    });

    GEvent.addListener(Map.map_, "zoomend", function(oldLevel, newLevel) {
      if (Map.isZoomLevelVisible_(newLevel) == false) {
        for (var i = 0, marker; marker = Map.boundMarkers_[i]; ++i) 
          marker.hide();
      } else if (Map.isZoomLevelVisible_(oldLevel) == false && Map.isZoomLevelVisible_(newLevel) == true) {
        for (i = 0, marker; marker = Map.boundMarkers_[i]; ++i) 
          marker.show();
      }
    });

    GEvent.addListener(Map.map_, "moveend", function() {
      Map.map_.getZoomAsync(function(zoomLevel){
        if (Map.isZoomLevelVisible_(zoomLevel) == true) {
          Map.showStationsInViewport_();     
        }
      });
    });
  },

  showStationsInViewport_: function() {
    Map.move_counter_++;
    var moveEndListener = new Map.MoveEndListener(Map.move_counter_);
    moveEndListener.execute(); 
  },
  
  // Callback for sib api.
  showStopsInView: function(stopList) {
    var tempTotalList = [];
    var tempNewList = [];
    for (var i = 0; i < stopList.length; i++) {
      var stop = stopList[i];
      var loc = stop.coordinates.split(",");
      var lat = parseFloat(loc[1]);
      var lng = parseFloat(loc[0]);

      var skip_this_stop = false;
      // avoid adding line marker
      for (var j = 0, lineMarker; lineMarker = Map.lineMarkers_[j]; j++) {
        var latLng = lineMarker.point;
        if (latLng.lat() == lat && latLng.lng() == lng) {
          skip_this_stop = true;
          break;
        }
      }
      if (skip_this_stop)
        continue;
      // avoid adding has existed marker
      for (var k = 0, reserveMarker; reserveMarker = Map.boundMarkers_[k]; k++) {
        var latLng = reserveMarker.point;
        if (latLng.lat() == lat && latLng.lng() == lng) {
          tempTotalList.push(reserveMarker);
          Map.boundMarkers_.splice(k, 1);
          skip_this_stop = true;
          break;
        }
      }
      if (skip_this_stop)
        continue;

      tempNewList.push(stop);
    }
    //remove out of bound markers
    for (var i = 0, oldMarker; oldMarker = Map.boundMarkers_[i]; i++) {
      Map.map_.removeOverlay(oldMarker);
    }
    Map.boundMarkers_ = [];
    // Add new markers
    for (var i = 0, stop; stop = tempNewList[i]; i++) {
      var loc = stop.coordinates.split(",");
      var point = new GLatLng(parseFloat(loc[1]), parseFloat(loc[0]));
      var newMarker = new GMarker(point, { icon: Map.blueIcon_, title: stop.name });
      newMarker.point = point;
      tempTotalList.push(newMarker);
      Map.map_.addOverlay(newMarker);
      Map.addBoundMarkerEvent_(newMarker, stop);
    }
    Map.boundMarkers_ = tempTotalList;
    TransitMgr.closeMessageBoard();
  },

  MoveEndListener: function(listenerId) {
    var id = listenerId;
    
    this.execute = function() {
      if (id != Map.move_counter_) {
        return;
      }
      TransitMgr.openMessageBoard(TransitMgr.MSG_MAP_LOADING, true, "highLightMsg");
      Map.map_.getBoundsAsync(function(bound) {
        if (id != Map.move_counter_) {
          return;
        }
        var bt = bound.getNorthEast().lat();
        var bl = bound.getSouthWest().lng();
        var bb = bound.getSouthWest().lat();
        var br = bound.getNorthEast().lng();
        var params = {
          api: 'sib',
          bt: bt,
          bl: bl,
          bb: bb,
          br: br
        };
        TransitMgr.jsonRPC(params, 'Transit.callback_sib');
      });
    }
  },
  
  addBoundMarkerEvent_: function(marker, stop) {
    GEvent.addListener(marker, 'click', function() {
      Map.changeStop(marker, stop.name);
    });
    GEvent.addListener(marker, 'infowindowopen', function() {
      TransitMgr.setStop(stop, TransitMgr.EVENT_FROM_MAP);
    });
  },
  
  isZoomLevelVisible_:function(zoomLevel) {
    if (Map.MIN_LEVEL_ <= zoomLevel && zoomLevel <= Map.MAX_LEVEL_) 
      return true;
    return false;
  },
  
  createIcon_: function(image, iconSize, iconAnchor, infoWindowAnchor) {
    var icon = new GIcon();
    icon.image = image;
    icon.iconSize = iconSize;
    icon.iconAnchor = iconAnchor;
    icon.infoWindowAnchor = infoWindowAnchor;
    return icon;
  },
  
  changeStop: function(marker, name) {
    marker.getPointAsync(function (latlng) {
      var html = '<div style="font-weight:bold;font-size:1.2em;margin-bottom:3px;">' + name + '</div>';
      html += '<div style="font-size:0.8em;margin:10px 5px 5px 10px;color:#808080;">' + TransitMgr.LABEL_INFOWINDOW + '<div>';
      marker.openInfoWindowHtml(html);
    });
  },
  
  addMarkerEvent_: function(stop) {
    GEvent.addListener(stop.marker, 'click', function() {
      Map.changeStop(stop.marker, stop.name);
    });
    GEvent.addListener(stop.marker, 'infowindowopen', function() {
      TransitMgr.setStop(stop, TransitMgr.EVENT_FROM_MAP);
    });
  },
  
  clearOverlays_: function(olList) {
    if (olList.length > 0) {
      for (var i = 0, ol; ol = olList[i]; i++) {
        Map.map_.removeOverlay(ol);
      }
      olList = [];
    }
  },

  clearLineOverlays_: function() {
    Map.clearOverlays_(Map.lineMarkers_);
    Map.clearOverlays_(Map.linePolylines_);
    Map.map_.closeInfoWindow();
  },
  
  changeCity: function(city, center) {
    Map.clearLineOverlays_();
    if (city && center) {
      var zoomLevel = Map.DEFAULT_LEVEL_;
      Map.map_.setCenter(center, zoomLevel);
    } else {
      //TODO no city selected.
    }
  },

  // Adjust zoom level to show all stops.
  adjustZoomLevel_: function(points) {
    if (points.length == 0)
      return;

    var bound = null;
    for (var i = 0; i < points.length; ++i) {
      if (!bound) {
        bound = new GLatLngBounds(points[i]);
      } else {
        bound.extend(points[i]);
      }
    }
    Map.map_.getBoundsZoomLevelAsync(bound, function(zoomLevel) {
      Map.map_.setZoom(zoomLevel);
      Map.map_.panTo(bound.getCenter());
    });
  },
  
  importStop: function(stopList) {
    TransitMgr.openMessageBoard(TransitMgr.MSG_MAP_LOADING, true, "highLightMsg");
    Map.clearLineOverlays_();
    
    var points = [stopList.length];
    var point_array = [];
    for (var i = 0, stop; stop = stopList[i]; i++) {
      var coordinates = stop.coordinates.split(",");
      var point = new GLatLng(parseFloat(coordinates[1]), parseFloat(coordinates[0]));
      var marker = new GMarker(point, {
        icon: Map.redIcon_,
        title: stop.name
      });
      marker.point = point;
      stop.marker = marker;
      Map.lineMarkers_.push(marker);
      points[stop.line_seq] = point;
      point_array.push(point);
      Map.map_.addOverlay(marker);
      Map.addMarkerEvent_(stop);
    }

    if (points.length > 1) {
      for (var i = 2, point; point = points[i]; i++) {
        var polyline = new GPolyline([points[i - 1], point], "#FF0033", 5, 1);
        Map.map_.addOverlay(polyline);
        Map.linePolylines_.push(polyline);
      }
    }
    TransitMgr.closeMessageBoard();

    // Adjust zoom level to show the whole line.
    Map.adjustZoomLevel_(point_array);
  },
  
  setStop: function(stop) {
    Map.changeStop(stop.marker, stop.name);
  }
};

// Export global symbols.
// They are used for callback when got json results.
window['Transit'] = {
  'callback_ls':  Frame.showLinesForStation,
  'callback_sib': Map.showStopsInView,
  'callback_lc':  Frame.importCity,
  'callback_cl':  TransitMgr.getCityLinesDone,
  'callback_sl':  TransitMgr.showStopsInLine
};