/**
 * @author Fei Chen
 * Latest update:
 */
(function(){})()
var $ = function(id){
  return document.getElementById(id);
}

/**
 * A Singletom class as a request proxy
 */
var rpcProxy = (function(){
  // Private member
  var backend_url = "http://transit.dituapps.cn:8080/transit";
  var msgBoard = $("msgBoard");
  var wrapDom = $("transit");
  var msgFlag = 0;
  var msgCounter = 0;
  var msgTimeId = null;
  function getParamStr(paramObj){
    var paramArray = [];
    for (var i in paramObj) {
      if (i != "toJSONString") {
        var paramToken = i + '=' + paramObj[i];
        paramArray.push(paramToken);
      }
    }
    return paramArray.join("&");
  }
  function request(param, callBackName){
    var paramStr = getParamStr(param);
    var url = backend_url + "?" + paramStr + "&random=" + Math.random();
    url += '&callback=' + callBackName;
    var api = param['api'];
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
  }
  //  Supplied by liuli
  function openMsgBoard(msg) {
  	if(!msg) msg = "数据加载中...";
  	msgBoard.style.display = 'block';
    msgBoard.innerHTML = msg;
    msgFlag = new Date().getTime();
    msgCounter ++;
    if(!msgTimeId)  clearTimeout(msgTimeId);
    msgTimeId = setTimeout(function(){
      msgTimeId = null;
      msgCounter = 0;
      closeMsgBoard();
    }, 5000);
    var h = msgBoard.offsetHeight + msgBoard.offsetTop;
    if(wrapDom.offsetHeight < h){
      wrapDom.style.height = h + "px";
    }
  }

  function closeMsgBoard(){
  	if(msgCounter > 1){
  	  msgCounter --;
  	} else {
  	  if(msgTimeId) clearTimeout(msgTimeId);
  	  msgTimeId = null;
  	  msgBoard.style.display = 'none';
  	  msgCounter = 0;
  	}
  }
 
  return {  // Public members
    getCities:function(){
      openMsgBoard("城市数据加载中...");
      var param = {
        api : 'lc'
      }
      request(param, 'Transit.callback_lc');
    },
    getLinesByCity:function(cityName){
      openMsgBoard("公交数据加载中...");
      var param = {
        api: 'cl',
        city: encodeURIComponent(cityName)
      };
      request(param, 'Transit.callback_cl');
    },
    getLinesByStation:function(stationName, cityName){
      var msg = "加载经过"+stationName+"的公交路线..";
      openMsgBoard(msg);
      var param = {
        api: 'ls',
        sn: encodeURIComponent(stationName),
        city: encodeURIComponent(cityName)
      };
      request(param, 'Transit.callback_ls');
    },
    getStopsByLine:function(lineId, cityName){
      openMsgBoard("站点数据加载中...");
      var param = {
        api: 'sl',
        li: lineId,
        city: encodeURIComponent(cityName)
      };
      request(param, 'Transit.callback_sl');
    },
    getStopsByBounds:function(bounds){
      openMsgBoard("地图站点数据加载中...");
      var bt = bounds.getNorthEast().lat();
      var bl = bounds.getSouthWest().lng();
      var bb = bounds.getSouthWest().lat();
      var br = bounds.getNorthEast().lng();
      var params = {
        api: 'sib',
        bt: bt,
        bl: bl,
        bb: bb,
        br: br
      };
      request(params, 'Transit.callback_sib');
    },
    getCitiesCallback:function(cities){
      transitMgr.importCities(cities);
      closeMsgBoard();
    },
    getLinesByCityCallback:function(lines){
      transitMgr.importCityLines(lines);
      closeMsgBoard();
    },
    getLinesByStationCallback : function(lines){
      transitMgr.importStationLines(lines);
      closeMsgBoard();
    },
    getStopsByLineCallback : function(stops){
      transitMgr.importLineStops(stops);
      closeMsgBoard();
    },
    getStopsByBoundsCallback : function(stops){
      transitMgr.importBoundsStops(stops);
      closeMsgBoard();
    }
  }
})();

var transitMgr = (function(){
  var lineSearchDom = $('lineSearch');
  var citySearchDom = $('citySearch');
  var searchDom = {
    pane : $("searchPane"),
    result : $("searchResult"),
    button : $("lineSearchButton")
  };
  var wrapDom = {
    pane : $("transit"),
    head : $("lineHead")
  }
  var linesDom = {
    pane : $("linePane"),
    head : $("linePaneHead"),
    back : $("backStop"),
    stopName : $("stationName"),
    content : $("linePaneContent")
  };
  var stopsDom = {
    pane : $("stopPane"),
    head : $("stopPaneHead"),
    lineName : $("lineName"),
    start : $("lineStart"),
    end : $("lineEnd"),
    content : $("stopPaneContent")
  };
  var map = new GMap2($('mapDiv'));
  lineSearchDom.onkeyup = onkeyup;
  citySearchDom.onkeyup = onkeyup;
  /**
   * Container of Objects below
   * City Object: cityName:{name: ***, latlng:***, lineList:{list of Line Object}}
   * Line Object: lineId:{id:***, name:***, start:***, end:***, stopList:{list of Stop Object}}
   * Stop Object: coordinate:{name:***, latlng:***, marker:***}
   */
  var cityList = {};
  var cur = {};
  var focus = {
  	dom : null,
  	type : null,
    line : "line",
    city : "city",
    lineSearch : "lineSearch",
    citySearch : "citySearch"
  };
  
  var MSIE = !!(window.attachEvent && !window.opera);
  var MAX_LEVEL = 17;
  var MIN_LEVEL = 15;
  var DEFAULT_LEVEL = MSIE ? 16 : 15;
  var DEFAULT_CENTER = new GLatLng(39.929, 116.388);  // Beijing
  var DEFAULT_CITY = "北京";
  
  var boundsStops = {};
  var baseUrl = "http://chinamaps.googlecode.com/svn/transit/";
  var blueIconUrl = baseUrl + "icons/blueStopIcon.png";
  var redIconUrl = baseUrl + "icons/redStopIcon.png";
  var highIconUrl = baseUrl + "icons/highStopIcon2.png";
  var blueIcon = createIcon(blueIconUrl);
  var redIcon = createIcon(redIconUrl);
  
  function onkeyup(e){
    e = e || window.event;
    var keyCode = e.keyCode || e.which || e.charCode;
    var elem = e.target || e.srcElement;
    if(elem && elem.id  && keyCode != 13 && keyCode != 37 && keyCode != 38 && keyCode != 39 && keyCode != 40){
      if(elem.id == "lineSearch"){
        transitMgr.searchLine();
      } else if(elem.id == "citySearch"){
        transitMgr.searchCity();
      }
    }
  }
  function createIcon(imageUrl) {
  	var icon = new GIcon();
    icon.image = imageUrl;
    icon.iconSize = new GSize(16, 16);
    icon.iconAnchor = new GPoint(8, 8);
    icon.infoWindowAnchor = new GPoint(8, 4);
    return icon;
  }
  function addMarkerListener(marker, stopName){
    GEvent.addListener(marker, 'click', function() {
      cur.stopName = stopName;
      var level = map.getZoom();
      if(!isInVisible(level)){
      	map.setCenter(marker.point, DEFAULT_LEVEL);
      }
      openStopInfoWindow(marker, stopName);
      rpcProxy.getLinesByStation(stopName, cur.cityName);
    });
    GEvent.addListener(marker, 'mouseover', function() {
//      marker.setImage(highIconUrl);
      highlightStopNode(stopName);
    });
    GEvent.addListener(marker, 'mouseout', function() {
//      marker.setImage(redIconUrl);
      unhighlightStopNode(stopName);
    });
  }
  
  function openStopInfoWindow(marker, name, noDetail){
    var html = '<div style="font-weight:bold;font-size:1.2em;margin-bottom:3px;">' + name + '</div>';
    if(!noDetail){
      html += '<div style="font-size:0.8em;margin:10px 5px 5px 10px;color:#808080;">在左侧查看详细站点信息 &laquo;<div>';
    
    }
    marker.openInfoWindowHtml(html);
  }
  function highlightStopNode(stopName){
    var curStopNode = $(stopName);
    if (curStopNode) {
      curStopNode.className = "stopIcon selected";
      scrollToVisible(curStopNode);
    }
  }
  function unhighlightStopNode(stopName){
    var curStopNode = $(stopName);
    if (curStopNode) {
      curStopNode.className = "stopIcon";
    }
  }
  function scrollToVisible(node){
  	var container = node.parentNode;
  	var offset = node.offsetHeight;
    var topPosi = container.offsetTop;
    var bottomPosi = topPosi + container.offsetHeight;
    var curPosi = node.offsetTop - container.scrollTop;
    if( (curPosi + offset) > bottomPosi){  // Under bottom
      container.scrollTop = container.scrollTop + ((curPosi + offset) - bottomPosi);
    } else if(curPosi < topPosi){
      container.scrollTop = container.scrollTop - (topPosi - curPosi);
    }
  }
  function createStopMarker(latlngStr, icon, name, map){
  	var result = latlngStr.split(",");
  	var point = new GLatLng(parseFloat(result[1]),parseFloat(result[0]));
  	var marker = new GMarker(point, { icon: icon, title: name});
  	marker.point = point;
  	if(map) map.addOverlay(marker);
    addMarkerListener(marker, name);
    return marker;
  }
  function cacheStops(line, stops){
  	if(!line.stopList)
  	  line.stopList = {};
  	var points = [stops.length];
  	for(var i = 0, item; item = stops[i]; i++){
  	  var seq = item['line_seq'];
      var name = item['name'];
      var stop = line.stopList[seq] = {};
      stop.name = name;
      stop.seq = seq;
      stop.marker = createStopMarker(item['coordinates'], redIcon, name);
      points[seq] = stop.marker.point;
    }
    line.route = [];
    if (points.length > 1) {
      for (var i = 2, point; point = points[i]; i++) {
        var polyline = new GPolyline([points[i - 1], point], "#FF0033", 5, 1);
        line.route.push(polyline);
      }
    }
  }
  function addClassname(elem, classname){
    elem.className = elem.className + " " + classname;
  }
  function delClassname(elem, classname){
    elem.className = elem.className.replace(classname, "");
    elem.className = elem.className.replace("  ", " ");
  }
  function closePopup(){
    focus.type = null;
    searchDom.pane.style.display = "none";
  }
  function openPopup(type){
  	focus.type = type;
    searchDom.pane.style.display = "block";
//    lineSearchDom.blur();
//    citySearchDom.blur();
  }
  
  function initMap(){
    if(google.loader && google.loader.ClientLocation){
      var loc = google.loader.ClientLocation;
      if(loc.latitude && loc.longitude)
        map.setCenter(new GLatLng(loc.latitude, loc.longitude), DEFAULT_LEVEL);
    } else {
      map.setCenter(DEFAULT_CENTER, DEFAULT_LEVEL);
    }
    map.enableScrollWheelZoom();
    addMapListener();
  }
  
  function addMapListener(){
    GEvent.addListener(map, "infowindowclose", function() {
      if(cur.lineId)  transitMgr.clickBack();
    });

    GEvent.addListener(map, "zoomend", function(oldLevel, newLevel) {
      if (!isInVisible(newLevel)) {
        for(var i in boundsStops){
          boundsStops[i].marker.hide();
        }
      } else if (!isInVisible(oldLevel) && isInVisible(newLevel)) {
      	var bounds = map.getBounds();
      	for(var i in boundsStops){
      	  var marker = boundsStops[i].marker;
      	  if(bounds.containsLatLng(marker.point)){
      	    marker.show();
      	  }
        }
        rpcProxy.getStopsByBounds(bounds);
      }
    });

    GEvent.addListener(map, "moveend", function() {
      if (isInVisible(map.getZoom())) {
        rpcProxy.getStopsByBounds(map.getBounds());     
      }
    });
  }
  function isInVisible(zoom){
    if(zoom > MAX_LEVEL || zoom < MIN_LEVEL) return false;
    return true;
  }
  function checkCity(cityName){
    if(cityName && cityName != cur.cityName){
      if(MSIE && cityName == "上海"){
        DEFAULT_LEVEL = MAX_LEVEL;
      } else {
        DEFAULT_LEVEL = MSIE ? 16 : 15;
      }
      // Clear current data
      if(cur.cityName){  // Need relocate map
        map.clearOverlays();
        var result = cityList[cityName].latlng.match(/\((\d+\.\d*),(\d+\.\d*)\)/);
        var point = new GLatLng(parseFloat(result[1]), parseFloat(result[2]));
        map.setCenter(point, DEFAULT_LEVEL);
      }
      closePopup();
      linesDom.pane.style.display = 'none';
      stopsDom.pane.style.display = 'none';
      boundsStops = {};
      cur = {};
      //  Set new data
      citySearchDom.value = cityName;
      cur.cityName = cityName;
      rpcProxy.getLinesByCity(cityName);
    }
  }
  
  function displayBoundsStops(stops, lineStops){
    var tobeRemove = {};
    for(var i in boundsStops){
      tobeRemove[i] = boundsStops[i];
    }
    for(var i = 0, item; item = stops[i]; i++){
      var name = item['name'];
      if(lineStops[name]) continue;
      if(boundsStops[name]){
        delete tobeRemove[name];
      } else {
        var stop = {};
        stop.name = name;
        stop.marker = createStopMarker(item['coordinates'], blueIcon, name, map);
        boundsStops[name] = stop;
      }
    } 
    for(var i in tobeRemove){
      map.removeOverlay(tobeRemove[i].marker);
      delete boundsStops[i];
    }
  }
  
  function openLineSearchPane(lines, key){
    openPopup(focus.lineSearch);
    var html = "", counter = 0, existLines = {};
  	var replacement = '<span style="font-weight:bold;">' + key + '</span>';
  	for(var i in lines){
  	  var name = lines[i].name;
  	  if(existLines[name]) continue;
  	  html += '<div id="S_' + lines[i].id + '" onclick=Transit.click_line(id) onmouseover="Transit.mouse_over(this, 2)" style="margin:3px;overflow:hidden;width:100%;">' +
  	  		    '<span style="float:left;width:40%;">' + name.replace(key, replacement) + '</span>' +
                '<span style="float:right;width:55%;color:#666;">' + lines[i].start + '<a class="plyIcon"></a>' + lines[i].end + '</span>' +
  	          '</div>';
  	  existLines[name] = name;
  	  counter ++;
    }
  	if(html == ""){
  	  html = "没有找到匹配路线，换一个关键字试试...";
  	}
  	searchDom.result.innerHTML = html;
  	if(counter > 10){
  	  searchDom.result.style.height = "15em";
  	} else {
  	  searchDom.result.style.height = "auto";
  	}
    if(counter){
      focus.dom = searchDom.result.firstChild;
  	  focus.dom.className = "mouseover";
    }
  }
  function openCitySearchPane(cities, key){
  	openPopup(focus.citySearch);
    var html = "", counter = 0, lineCounter = 0;
  	var replacement = '<span style="font-weight:bold;">' + key + '</span>';
  	for(var i in cities){
      var left = counter%4 * 70;
      if(!left){
  	    html += "<div class='search-pane-city-row'>";
  	  	lineCounter ++;
  	  }
  	  html += '<span index="'+counter%4+'" id="'+i+'" onclick=Transit.click_city(id) onmouseover="Transit.mouse_over(this, 2)" style="float:left;width:24%;text-align:center;">' +
  	  		    '<span>' + i.replace(key, replacement) + '</span>' +
  	          '</span>';
  	  if(counter%4 == 3){
  	    html += "</div>";
  	  }
  	  counter ++;
  	}
  	if(html == ""){
  	  html = "没有找到匹配路线，换一个关键字试试...";
  	}
    searchDom.result.innerHTML = html;
    if(lineCounter > 10){
      searchDom.result.style.height = "15em";
    } else {
      searchDom.result.style.height = "auto";
    }
    if(counter){
      focus.dom = searchDom.result.firstChild.firstChild;
  	  focus.dom.className = "mouseover";
    }
  }
  function fillLineStops(line){
    closePopup();
    stopsDom.pane.style.display = "block";
    linesDom.pane.style.display = "none";
    stopsDom.lineName.innerHTML = line.name;
    stopsDom.start.innerHTML = line.start;
    stopsDom.end.innerHTML = line.end;
    var html = ''; 
    var bounds = new GLatLngBounds();
  	for(var i = 0, polyline; polyline = line.route[i]; i++){
      map.addOverlay(polyline);
    }
    var list = line.stopList;
    for(var i in list){
      var stop = list[i];
      map.addOverlay(stop.marker);
      html += '<p class="stopIcon" id="'+stop.name+'" style="line-height:1.5em;" onclick="Transit.click_stop(id, true)" onmouseover="style.fontWeight=\'bolder\';" onmouseout="style.fontWeight=\'normal\';">';
      html += '  <span style="text-align:center;width:15px;color:#666">'+stop.seq+'</span>';
      html += '  <span>'+stop.name+'</span>';
      html += '</p>';
      bounds.extend(stop.marker.point);
    }
    stopsDom.content.innerHTML = html;
    dynamicContentHeight(stopsDom);
    var center = bounds.getCenter();
    var zoom = map.getBoundsZoomLevel(bounds);
    map.setCenter(center, zoom);
  }
  function fillStationLines(lines){
    closePopup();
    stopsDom.pane.style.display = "none";
    linesDom.pane.style.display = "block";
    linesDom.stopName.innerHTML = cur.stopName;
  	if (cur.lineId) {
  	  linesDom.back.style.display = "block";
  	  linesDom.back.innerHTML = "返回" + cityList[cur.cityName].lineList[cur.lineId].name;
  	}
      
  	var html = '';
  	var existLines = {};
  	for(var i = 0, item; item = lines[i]; i++){
  	  var name = item['short_name'];
  	  if(existLines[name]) continue;
  	  html += '<div style="position:relative;margin:5px 3px;overflow:auto;">';
  	  html += '<p class="list-line-name" style="float:left;width:40%;" onclick=Transit.click_line(\'' + item['line_id'] + '\') onmouseover="style.backgroundColor=\'#c0c0c0\';style.cursor=\'pointer\'" onmouseout="style.backgroundColor=\'#fff\';">' + name + '</p>';
  	  html += '<p style="float:right; width:57%;">' + item['start_station'] + '<a class="plyIcon"></a>' + item['end_station'] + '</p>';
  	  html += '</div>';
  	  existLines[name] = name;
  	}
  	if(html == ""){
  	  html = "没有搜索结果!";
  	}
  	linesDom.content.innerHTML = html;
  	dynamicContentHeight(linesDom);
  }
  function dynamicContentHeight(container){
    GLog.write(wrapDom.pane.parentNode.offsetHeight+"||clientHeight: "+wrapDom.pane.parentNode.clientHeight);
    var total = wrapDom.pane.clientHeight;
  	var head1 = wrapDom.head.offsetHeight;
  	var head2 = container.head.offsetHeight;
  	container.content.style.height = (total - head1 - head2) + "px";
  }
  function findStop(stopName){
  	var list = cityList[cur.cityName].lineList[cur.lineId].stopList;
    for(var i in list){
      if(list[i].name == stopName)  return list[i];
    }
    for(var i in boundsStops){
      if(boundsStops[i].name == stopName)  return boundsStops[i];
    }
    return null;
  }
  function onLineSearchResultKeydown(keyCode){
    switch(keyCode){
      case 13:  //Enter
        if(!focus.dom.id)
          focus.dom = searchDom.result.firstChild;
        transitMgr.clickLine(focus.dom.id);
        break;
      case 37:  //left
      case 38:  //up
        transToPreLine();
        break;
      case 39:  //right
      case 40:  //down
        transToNextLine();
        break;
    }
  }
  function transToNextLine(){
  	focus.dom.className = "mouseout";
    var next = focus.dom.nextSibling;
    if(!next) next = focus.dom;
    next.className = "mouseover";
    focus.dom = next;
    scrollToVisible(focus.dom, 1);
  }
  function transToPreLine(){
    focus.dom.className = "mouseout";
    var pre = focus.dom.previousSibling;
    if(!pre) pre = focus.dom;
    pre.className = "mouseover";
    focus.dom = pre;
    scrollToVisible(focus.dom, 1);
  }
  function onCitySearchResultKeydown(keyCode){
    switch(keyCode){
      case 13:  //Enter
        if(!focus.dom.id)
          focus.dom = searchDom.result.firstChild.firstChild;
        transitMgr.clickCity(focus.dom.id);
        break;
      case 37:  //left
        transToPreCity();
        break;
      case 38:  //up
        transToUpCity();
        break;
      case 39:  //right
        transToNextCity();
        break;
      case 40:  //down
        transToDownCity();
        break;
    }
  }
  function transToNextCity(){
    focus.dom.className = "mouseout";
    var next = focus.dom.nextSibling;
    if(!next){
      var nextRow = focus.dom.parentNode.nextSibling
      if(nextRow){
        next = nextRow.firstChild || focus.dom;
      } else {
        next = focus.dom;
      }
    } 
    next.className = "mouseover";
    focus.dom = next;
    scrollToVisible(focus.dom.parentNode);
  }
  function transToPreCity(){
    focus.dom.className = "mouseout";
    var pre = focus.dom.previousSibling;
    if(!pre){
      var preRow = focus.dom.parentNode.previousSibling
      if(preRow){
        pre = preRow.lastChild || focus.dom;
      } else {
        pre = focus.dom;
      }
    } 
    pre.className = "mouseover";
    focus.dom = pre;
    scrollToVisible(focus.dom.parentNode);
  }
  function transToUpCity(){
    focus.dom.className = "mouseout";
    var preRow = focus.dom.parentNode.previousSibling;
    var up;
    if(preRow){
      up = preRow.childNodes[focus.dom.getAttribute("index")];
      if(!up){
        up = preRow.lastChild || focus.dom;
      } 
    } else {
      up = focus.dom;
    }
    up.className = "mouseover";
    focus.dom = up;
    scrollToVisible(focus.dom.parentNode);
  }
  function transToDownCity(){
    focus.dom.className = "mouseout";
    var nextRow = focus.dom.parentNode.nextSibling;
    var down;
    if(nextRow){
      down = nextRow.childNodes[parseInt(focus.dom.getAttribute("index"))];
      if(!down && nextRow.lastChild){
        down = nextRow.lastChild || focus.dom;
      } 
    } else {
      down = focus.dom;
    }
    down.className = "mouseover";
    focus.dom = down;
    scrollToVisible(focus.dom.parentNode);
  }
  function checkNum(str){
  	var num = "1234567890";
    for(var i = 0, c; c = str.charAt(i); i++){
      if(num.indexOf(c) == -1) return false;
    }
    return true;
  }
  return {
    init : function(){
      rpcProxy.getCities();
  	  initMap();
  	  rpcProxy.getStopsByBounds(map.getBounds());
  	},
    importCities:function(cities){
  	  for(var i = 0, item; item = cities[i]; i++){
  	  	var name = item['city'];
  	  	if(!cityList[name]){
  	  	  var city = cityList[name] = {};
  	  	  city.name = name;
  	  	  city.latlng = item['coordinates'];
  	  	  city.pinyin = item['pinyin'];
  	  	} else {
  	  	  GLog.write("None cities!");
  	  	}
  	  }
  	},
    importCityLines:function(lines){
  	  var city = cityList[cur.cityName];
  	  var lineList = city.lineList = {};
  	  for(var i = 0, item; item = lines[i]; i++){
  	    var line = lineList[item['i']] = {};
  	    line.id = item['i'];
  	    line.name = item['n'];
  	    line.start = item['s'];
  	    line.end = item['e'];
  	  }
  	},
  	importLineStops : function(stops){
      var line = cityList[cur.cityName].lineList[cur.lineId];
      cacheStops(line, stops);
      fillLineStops(line);
    },
    importBoundsStops : function(stops){
      if(stops && stops.length > 0){
        checkCity(stops[0].location);
      } else if(!cur.cityName){
        map.setCenter(DEFAULT_CENTER, DEFAULT_LEVEL);
        return;
      }
      var lineStops = {};
      if(cur.cityName && cur.lineId){
        lineStops = cityList[cur.cityName].lineList[cur.lineId].stopList;
      }
      displayBoundsStops(stops, lineStops);
    },
    importStationLines : function(lines){
  	  fillStationLines(lines);
  	},
    clickLine : function(lineId){
  	  if(lineId.indexOf("_") != -1){
  	    lineId = lineId.split("_")[1];
  	  }
  	  if(lineId && cur.lineId != lineId){
      	var oldLine = cityList[cur.cityName].lineList[cur.lineId];
      	if(oldLine && oldLine.stopList){
      	  var stops = oldLine.stopList;
      	  for(var i in stops) {
      	    map.removeOverlay(stops[i].marker);
      	  }
      	  for(var i = 0, polyline; polyline = oldLine.route[i]; i++){
      	    map.removeOverlay(polyline);
      	  }
      	  // BIG Question: if remove polyline first, the markers can not removed.
      	}
      }
      cur.lineId = lineId;
      var newLine = cityList[cur.cityName].lineList[lineId];
      if(newLine && newLine.stopList){
        fillLineStops(newLine);
      } else {
        rpcProxy.getStopsByLine(lineId, cur.cityName);
      }
    },
    clickStop : function(stopName, noDetail){
      if(stopName && cur.stopName != stopName){
      	// Restore old curNode
        var curStopNode = $(cur.stopName);
        if (curStopNode)  curStopNode.className = "stopIcon";
        // Set new curNode
        cur.stopName = stopName;
        curStopNode = $(cur.stopName);
        if (curStopNode) curStopNode.className = "selected stopIcon";
        var stop = findStop(stopName);
        if(stop){
          var level = map.getZoom();
      	  if(!isInVisible(level)){
      	    map.setCenter(stop.marker.point, DEFAULT_LEVEL);
      	  }
      	  openStopInfoWindow(stop.marker, stop.name, noDetail);
        } else {
//          GLog.write("None stop found.");
        }
      }
    },
    clickInverse : function(){
      var lines = cityList[cur.cityName].lineList;
      var id = cur.lineId;
  	  var name = lines[cur.lineId].name;
      for (var i in lines) {
        var line = lines[i];
        if (line.name == name && line.id != id) {
      	  transitMgr.clickLine(line.id);
      	  break;
        }
      }
    },
    clickTri : function(){
      openCitySearchPane(cityList);
    },
    clickCity : function(cityName){
      checkCity(cityName);
    },
    searchLine : function(){
      var key = lineSearchDom.value;
      if (key == null || key == "" || key == '输入公交线路名') return;
      if(cur.cityName && cityList[cur.cityName].lineList){
        var lineList = cityList[cur.cityName].lineList;
      } else {
        setTimeout("Transit.searchLine()", 200);
        return;
      }
      var result = {};
      if(checkNum(key)){
        for (var i in lineList) {
          if (lineList[i].name.match(/\d+/) == key) {
            result[i] = lineList[i];
          }
        }
      } else {
        for (var i in lineList) {
          if(lineList[i].name.indexOf(key) != -1){
            result[i] = lineList[i];
          }
        }
      }
      openLineSearchPane(result, key);
    },
    searchCity : function(){
      var key = citySearchDom.value;
      if (key == null || key == "") return;
      var result = {}, counter = 0;
      for(var i in cityList){
        if(i.indexOf(key) != -1 || cityList[i].pinyin.indexOf(key) != -1){
          result[i] = cityList[i];
          counter ++;
        }
      }
      openCitySearchPane(result, key);
    },
    restore : function(id, type){
      var dom = $(id);
      var key = dom.value;
      if (type == 1) {
      	if(key == null || key == ""){
      	  dom.value = "输入公交线路名";
      	}
      } else if(type == 2){
        if(key == null || key == "" || key != cur.cityName){
      	  dom.value = cur.cityName;
      	}
      }
    },
    clickBack : function(){
      stopsDom.pane.style.display = "block";
      linesDom.pane.style.display = "none";
//      map.closeInfoWindow();
    },
    onmouseover : function(elem, type){
      if(type == 2){  // Popup
      	if(focus.dom){
          focus.dom.className = 'mouseout';
        }
        focus.dom = elem;
      }
      elem.className = 'mouseover';
    },
    onkeydown : function(e){
      e = e || window.event;
      e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
      var keyCode = e.keyCode || e.which || e.charCode;
      var elem = e.target || e.srcElement;
      if(elem && elem.id && keyCode == 13){
        if(elem.id == "lineSearch"){
          if(searchDom.pane.style.display == "none"){
            transitMgr.searchLine();
          } else {
            onLineSearchResultKeydown(keyCode);
          }
        } else if(elem.id == "citySearch"){
          if(searchDom.pane.style.display == "none"){
          	transitMgr.searchCity();
          } else {
            onCitySearchResultKeydown(keyCode);
          }
        }
      } else {
        switch(focus.type){
          case focus.lineSearch:
            onLineSearchResultKeydown(keyCode);
            break;
          case focus.citySearch:
            onCitySearchResultKeydown(keyCode);
            break;
        }
      }
    }
    
  }
})();
window.document.onkeydown = transitMgr.onkeydown;

// Export global symbols.
// They are used for callback when got json results.
window['Transit'] = {
  'callback_ls':  rpcProxy.getLinesByStationCallback,
  'callback_sib': rpcProxy.getStopsByBoundsCallback,
  'callback_lc':  rpcProxy.getCitiesCallback,
  'callback_cl':  rpcProxy.getLinesByCityCallback,
  'callback_sl':  rpcProxy.getStopsByLineCallback,
  
  'start' : transitMgr.init,
  'searchLine' : transitMgr.searchLine,
  'searchCity' : transitMgr.searchCity,
  'click_line' : transitMgr.clickLine,
  'click_stop' : transitMgr.clickStop,
  'click_city' : transitMgr.clickCity,
  
  'key_down' : transitMgr.onkeydown,
  'mouse_over' : transitMgr.onmouseover,
  'blur' : transitMgr.restore,
  'click_inverse' : transitMgr.clickInverse,
  'click_back' : transitMgr.clickBack,
  'click_tri' : transitMgr.clickTri
};

Transit.start();