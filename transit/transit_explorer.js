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
  var backend_url = "http://211.157.3.197:8080/transit/";
  var msgBoard = $("msgBoard");
  var msgFlag = 0;
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
  
  function openMsgBoard(msg) {
  	if(!msg) msg = "数据加载中...";
  	msgBoard.style.display = 'block';
    msgBoard.innerHTML = msg;
    msgFlag ++;
  }

  function closeMsgBoard(){
  	if(msgFlag > 1){
  	  msgFlag --;
  	} else {
  	  msgBoard.style.display = 'none';
  	  msgFlag = 0;
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

var dom = (function(){
  var stationRequest = {};
  var searchDom = {
    pane : $("searchPane"),
    result : $("searchResult")
  };
  
//  var linesDom = {
//    pane : $("linePane"),
//    back : $("backStop"),
//    stopName : $("stationName"),
//    content : $("linePaneContent")
//  };
  var stopsDom = {
    pane : $("stopPane"),
    lineName : $("lineName"),
    start : $("lineStart"),
    end : $("lineEnd"),
    content : $("stopPaneContent")
  };
  var cityDom = $('liveCity');
  var boundsStops = {};
  var baseUrl = "http://chinamaps.googlecode.com/svn/transit/";
  var blueIconUrl = baseUrl + "icons/blueStopIcon.png";
  var redIconUrl = baseUrl + "icons/redStopIcon.png";
  var highIconUrl = baseUrl + "icons/highStopIcon2.png";
  var blueIcon = createIcon(blueIconUrl);
  var redIcon = createIcon(redIconUrl);
  var curIcon = blueIcon;
  function createIcon(imageUrl) {
  	var icon = new GIcon();
    icon.image = imageUrl;
    icon.iconSize = new GSize(16, 16);
    icon.iconAnchor = new GPoint(8, 8);
    icon.infoWindowAnchor = new GPoint(8, 4);
    return icon;
  }
  
  function addMarkerListener(marker, name, seq){
    GEvent.addListener(marker, 'click', function() {
      Transit.click_stop(name, seq);
    });
    GEvent.addListener(marker, 'mouseover', function() {
//      marker.setImage(highIconUrl);
      highlightStopNode(name);
    });
    GEvent.addListener(marker, 'mouseout', function() {
//      marker.setImage(redIconUrl);
      unhighlightStopNode(name);
    });
  }
  
  function openStopInfoWindow(marker, name, city){
    var html = '<div class="stationName stopIcon" id="stationName">' + name + '</div>';
    html += '<p style="font-size:0.9em;color:#666">经过本站的公交线路：</p>';
    var url = baseUrl + "infowindow.html?stop="+encodeURIComponent(name)+"&city="+encodeURIComponent(city);
//    var url = "infowindow.html?stop="+encodeURIComponent(name)+"&city="+encodeURIComponent(city);
    html += '<iframe name="infoFrame" id="infoFrame" width=220 height=200 frameBorder=0 src="'+url+'"></iframe>';
//    html += '<iframe name="infowindow" width=220 height=200 frameBorder=0 src="'+url+'" onload="Transit.loadStationLines(this, \''+name+'\')"></iframe>';
//	<div id="linePaneContent">路线列表</div>
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
  
  function createStopMarker(latlngStr, icon, name, map, seq){
  	var result = latlngStr.split(",");
  	var point = new GLatLng(parseFloat(result[1]),parseFloat(result[0]));
  	var marker = new GMarker(point, { icon: icon, title: name});
  	if(map) map.addOverlay(marker);
    addMarkerListener(marker, name, seq);
    return marker;
  }
  
  function transformStops(line, stops){
  	if(!line.stopList)
  	  line.stopList = {};
  	var points = [stopsDom.length];
  	for(var i = 0, item; item = stops[i]; i++){
  	  var seq = item['line_seq'];
      var name = item['name'];
      var stop = line.stopList[seq] = {};
      stop.name = name;
      stop.seq = seq;
      stop.marker = createStopMarker(item['coordinates'], redIcon, name, null, seq);
      points[seq] = stop.marker.getLatLng();
    }
    line.route = [];
    if (points.length > 1) {
      for (var i = 2, point; point = points[i]; i++) {
        var polyline = new GPolyline([points[i - 1], point], "#FF0033", 5, 1);
        line.route.push(polyline);
      }
    }
  }
  function closePopup(){
   searchDom.pane.style.display = "none";
  }
  function openPopup(){
   searchDom.pane.style.display = "block";
  }
  return {
  	openLineSearchPane : function(lines, key){
      openPopup();
  	  var html = "", counter = 0, existLines = {};
  	  var replacement = '<span style="font-weight:bold;">' + key + '</span>';
  	  for(var i in lines){
  	  	var name = lines[i].name;
  	    if(existLines[name]) continue;
  	    html += '<div style="margin:3px;overflow:hidden;width:100%;" onclick=Transit.click_line(' + lines[i].id + ') onmouseover="this.style.backgroundColor=\'#c0c0c0\';this.style.cursor=\'pointer\'" onmouseout="this.style.backgroundColor=\'#fff\';">';
        html += '<span style="float:left;width:40%;">' + name.replace(key, replacement) + '</span>';
        html += '<span style="float:right;width:55%;color:#666;">' + lines[i].start + '<a class="plyIcon"></a>' + lines[i].end + '</span>';
  	    html += '</div>';
  	    existLines[name] = name;
  	    counter ++;
  	  }
  	  if(html == ""){
  	    counter = 1;
  	    html = "没有找到匹配路线，换一个关键字试试...";
  	  }
  	  searchDom.result.innerHTML = html;
  	  if(counter > 10){
  	    searchDom.result.style.height = "15em";
  	  } else {
  	    searchDom.result.style.height = "auto";
  	  }
  	},
  	openCitySearchPane : function(cities, key){
  	  searchDom.pane.style.display = "block";
  	  var html = "";
  	  var counter = 0;
  	  var lineCounter = 0;
  	  var replacement = '<span style="font-weight:bold;">' + key + '</span>';
  	  for(var i in cities){
  	  	var left = counter%4 * 70;
  	  	if(!left){
  	  	  html += "<div style='margin:3px;overflow:auto;width:100%;'>";
  	  	  lineCounter ++;
  	  	}
  	    html += "<span style='float:left;width:24%;'><span onclick=Transit.click_city('"+i+"')  onmouseover='style.backgroundColor=\"#c0c0c0\";style.cursor=\"pointer\"' onmouseout='style.backgroundColor=\"#fff\";'>";
  	    html += i.replace(key, replacement) + "</span></span>";
  	    if(counter%4 == 3){
  	      html += "</div>";
  	    }
  	    counter ++;
  	  }
  	  if(html == ""){
  	    lineCounter = 1;
  	    html = "没有匹配城市，换一个关键字试试...";
  	  }
  	  searchDom.result.innerHTML = html;
  	  if(counter > 40){
  	    searchDom.result.style.height = "15em";
  	  } else {
  	    searchDom.result.style.height = lineCounter*1.5 + "em";
  	  }
  	},
    fillStationLines : function(stopName, lines, lineName){
      closePopup();
//      stopsDom.pane.style.display = "none";
//  	  linesDom.pane.style.display = "block";
//      if (lineName) {
//        linesDom.back.style.display = "block";
//        linesDom.back.innerHTML = "返回" + lineName;
//      }
//      linesDom.stopName.innerHTML = stopName;
      var html = '';
      var existLines = {};
      for(var i = 0, item; item = lines[i]; i++){
  	    var id = item['line_id'];
  	    var name = item['short_name'];
  	    var start = item['start_station'];
  	    var end = item['end_station'];
  	    if(existLines[name]) continue;
  	    html += '<div style="position:relative;margin:5px 3px;overflow:auto;">';
        html += '<p class="list-line-name" style="float:left;width:40%;" onclick=Transit.click_line(' + id + ') onmouseover="style.backgroundColor=\'#c0c0c0\';style.cursor=\'pointer\'" onmouseout="style.backgroundColor=\'#fff\';">' + name + '</p>';
        html += '<p style="float:right; width:57%;">' + start + '<a class="plyIcon"></a>' + end + '</p>';
        html += '</div>';
        existLines[name] = name;
      }
      transitMgr.addStopRequestResponse(stopName, html);
//      linesDom.content.innerHTML = html; //TODO cache and check if is expired
    },
    fillLineStops : function(line, map, stops){
      closePopup();
      stopsDom.pane.style.display = "block";
//  	  linesDom.pane.style.display = "none";
  	  stopsDom.lineName.innerHTML = line.name;
  	  stopsDom.start.innerHTML = line.start;
  	  stopsDom.end.innerHTML = line.end;
  	  if(stops && !line.route){
  	    transformStops(line, stops);
  	  }
      var html = ''; 
  	  var bounds = new GLatLngBounds();
  	  for(var i = 0, polyline; polyline = line.route[i]; i++){
        map.addOverlay(polyline);
      }
      var list = line.stopList;
      for(var i in list){
      	var stop = list[i];
      	map.addOverlay(stop.marker);
      	html += '<p class="stopIcon" id="'+stop.name+'" style="line-height:1.5em;" onclick="Transit.click_stop(\''+stop.name+'\','+stop.seq+')" onmouseover="Transit.high_stop(\''+stop.name+'\')" onmouseout="Transit.unhigh_stop(\''+stop.name+'\')">';
    	html += '  <span style="text-align:center;width:15px;color:#666">'+stop.seq+'</span>';
    	html += '  <span>'+stop.name+'</span>';
    	html += '</p>';
    	bounds.extend(stop.marker.getLatLng());
      }
  	  stopsDom.content.innerHTML = html;
      var center = bounds.getCenter();
      var zoom = map.getBoundsZoomLevel(bounds);
      map.setCenter(center, zoom);
    },
    
    displayBoundsStops : function(stops, lineStops, map){
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
    },
    hideBoundsStops : function(){
      for(var i in boundsStops){
        boundsStops[i].marker.hide();
      }
    },
    showBoundsStops : function(bounds){
      for(var i in boundsStops){
      	var marker = boundsStops[i].marker;
      	if(bounds.containsLatLng(marker.getLatLng())){
      	  marker.show();
      	}
      }
    },
    changeCity : function(cityName){
      closePopup();
      cityDom.value = cityName;
//      linesDom.pane.style.display = 'none';
      stopsDom.pane.style.display = 'none';
      boundsStops = {};
    },
    clickBack : function(){
      stopsDom.pane.style.display = "block";
//      linesDom.pane.style.display = "none";
    },
    openStop : function(stop, city){
      openStopInfoWindow(stop.marker, stop.name, city);
      highlightStopNode(stop.name);
    },
    highStop : function(stop){
      stop.marker.setImage(highIconUrl);
      highlightStopNode(stop.name);
    },
    unhighStop : function(stop){
      stop.marker.setImage(redIconUrl);
      unhighlightStopNode(stop.name);
    }
  }
})();

var transitMgr = (function(){
  var map = new GMap2($('mapDiv'));
  /**
   * Container of Objects below
   * City Object: cityName:{name: ***, latlng:***, lineList:{list of Line Object}}
   * Line Object: lineId:{id:***, name:***, start:***, end:***, stopList:{list of Stop Object}}
   * Stop Object: coordinate:{name:***, latlng:***, marker:***}
   */
  var cityList = {};
  var cur = {};
  var cityDom = $('liveCity');
  var lineDom = $("lineBox");
  var MSIE = !!(window.attachEvent && !window.opera);
  var MAX_LEVEL = 17;
  var MIN_LEVEL = 15;
  var DEFAULT_LEVEL = MSIE ? 16 : 15;
  var DEFAULT_CENTER = new GLatLng(39.929, 116.388);  // Beijing
  var DEFAULT_CITY = "北京";
  
  function initMap(){
    var loc = google.loader.ClientLocation;
    if(loc && loc.address && loc.address.city && loc.latitude && loc.longitude){
      map.setCenter(new GLatLng(loc.latitude, loc.longitude), DEFAULT_LEVEL);
    } else {
      map.setCenter(DEFAULT_CENTER, DEFAULT_LEVEL);
    }
    map.enableScrollWheelZoom();
    addMapListener();
  }
  
  function addMapListener(){
    GEvent.addListener(map, "infowindowclose", function() {
      if(cur.lineId)  Transit.click_back();
    });

    GEvent.addListener(map, "zoomend", function(oldLevel, newLevel) {
      if (!isInVisible(newLevel)) {
        dom.hideBoundsStops();
      } else if (!isInVisible(oldLevel) && isInVisible(newLevel)) {
      	var bounds = map.getBounds();
      	dom.showBoundsStops(bounds);
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
  function checkCity(cityName, needRelocate){
    if(cityName != cur.cityName){
      cur = {};
      cur.cityName = cityName;
      dom.changeCity(cityName);
      rpcProxy.getLinesByCity(cityName);
    }
    if(needRelocate){
      map.clearOverlays();
      var point = getCityPosition(cityName);
      map.setCenter(point, DEFAULT_LEVEL);
    }
  }
  function getCityPosition(cityName){
  	var result = cityList[cityName].latlng.match(/\((\d+\.\d*),(\d+\.\d*)\)/);
	return new GLatLng(parseFloat(result[1]), parseFloat(result[2]));
  }
  var stopRequest = {};
  var checkLineId;
  function getInfoFrame(win){
    var frame = null;
    if(navigator.userAgent.indexOf("Safari") != -1){
      frame = win.frames["infoFrame"];
    }else{
      var elem = win.document.getElementById("infoFrame");
      if(elem) frame = elem.contentWindow;
    }
    if(!frame && win != top){
      win = win.parent;
      getPipeFrame(win);
    }
    return frame;
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
  	  	} else {
  	  	  // Debug
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
      dom.fillLineStops(line, map, stops);
    },
    importBoundsStops : function(stops){
      if(stops && stops.length > 0){
        checkCity(stops[0].location);
      } else if(!cur.cityName){
        map.setCenter(DEFAULT_CENTER, DEFAULT_LEVEL);
      }
      var lineStops = {};
      if(cur.cityName && cur.lineId){
        lineStops = cityList[cur.cityName].lineList[cur.lineId].stopList;
      }
      dom.displayBoundsStops(stops, lineStops, map);
    },
    importStationLines : function(lines){
  	  var stopName = cur.stopName;
  	  if(cur.lineId) var lineName = cityList[cur.cityName].lineList[cur.lineId].name;
  	  dom.fillStationLines(stopName, lines, lineName);
  	},
    clickLine : function(lineId, isFromSearch){
  	  if(isFromSearch){
  	    lineId = lineId.split("_")[1];
  	  }
  	  if(cur.lineId != lineId){
      	var oldLine = cityList[cur.cityName].lineList[cur.lineId];
      	if(oldLine && oldLine.stopList){
      	  var stops = oldLine.stopList;
      	  for(var i in stops) {
      	    map.removeOverlay(stops[i].marker);
      	  }
      	  for(var i = 0, polyline; polyline = oldLine.route[i]; i++){
      	    map.removeOverlay(polyline);
      	  }
      	  // Question: if remove polyline first, the markers can not removed.
      	}
      	cur.lineId = lineId;
      }
      var newLine = cityList[cur.cityName].lineList[lineId];
      if(newLine && newLine.stopList){
        dom.fillLineStops(newLine, map);
      } else {
        rpcProxy.getStopsByLine(lineId, cur.cityName);
      }
    },
    clickStop : function(stopName, stopSeq){
      if(cur.stopName != stopName){
        var curStopNode = $(cur.stopName);
        if (curStopNode) {
          curStopNode.className = "";
        }
        cur.stopName = stopName;
      }
      stopRequest[stopName] = null;
//      stopFlag = true;
//      rpcProxy.getLinesByStation(stopName, cur.cityName);
      var stop = cityList[cur.cityName].lineList[cur.lineId].stopList[stopSeq];
      dom.openStop(stop, cur.cityName);
      transitMgr.checkLineSelectEvent();
    },
    loadInfoWindowIframe : function(iframe, name){
      ifr = iframe;
      var doc = ifr.contentWindow.document;
      if(stopRequest[name]){
      	//var doc = ifr.contentWindow.document;
      	doc.write(stopRequest[name]);
      } else {
      	doc.write("loading...");
        setTimeout("Transit.loadStationLines('"+name+"')", 200); 
      }
    },
    addStopRequestResponse : function(name, html){
      if(stopRequest[name] == null){
        stopRequest[name] = html;
      }
    },
    highStop : function(stopName){
      var list = cityList[cur.cityName].lineList[cur.lineId].stopList;
      	var stop;
      	for(var i in list){
      	  if(list[i].name == stopName){
      	    stop = list[i];
      	    break;
      	  }
      	}
        dom.highStop(stop);
    },
    unhighStop : function(stopName){
      var list = cityList[cur.cityName].lineList[cur.lineId].stopList;
      	var stop;
      	for(var i in list){
      	  if(list[i].name == stopName){
      	    stop = list[i];
      	    break;
      	  }
      	}
        dom.unhighStop(stop);
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
      dom.openCitySearchPane(cityList);
    },
    clickCity : function(cityName){
      checkCity(cityName, true);
    },
    searchLine : function(){
      var key = lineDom.value;
      if (key == null || key == "" || key == '输入公交线路名') return;
      var result = {};
      var lineList;
      if(cur.cityName && cityList[cur.cityName].lineList){
        lineList = cityList[cur.cityName].lineList;
      } else {
        setTimeout("Transit.searchLine()", 500);
        return;
      }
      if (isNaN(parseInt(key))) {
        for (var i in lineList) {
          if(lineList[i].name.indexOf(key) != -1){
            result[i] = lineList[i];
          }
        }
      } else {
        for (var i in lineList) {
          if (lineList[i].name.match(/\d+/) == key) {
            result[i] = lineList[i];
          }
        }
      }
      dom.openLineSearchPane(result, key);
    },
    searchCity : function(){
      var key = cityDom.value;
      if (key == null || key == "") return;
      var result = {}, counter = 0;
      for(var i in cityList){
        if(i.indexOf(key) != -1){
          result[i] = cityList[i];
          counter ++;
        }
      }
      if(counter == 1){
      	for(var i in result)
      	var name = result[i].name;
        if(cur.cityName != name){
          checkCity(name, true);
        }
      } else {
        dom.openCitySearchPane(result, key);
      }
    },
    restore : function(id, type){
      var dom = $(id);
      var key = dom.value;
      if (key == null || key == "") {
      	if(type == 1){
      	  dom.value = "输入公交线路名";
      	}else if(type == 2){
      	  dom.value = cur.cityName;
      	}
      }
    },
    checkLineSelectEvent : function(){
//      var lineId = top.frames['infowindow'].Transit.lineId;
      if(checkCounter > 50){
        clearTimeout(checkLineId);
      	checkCounter = 0;
      	GLog.write("time out");
      	return;
      }
      var frame = getInfoFrame(window);
      if(frame && frame.Transit){
        var lineId = frame.Transit.lineId;
        if(lineId && lineId != cur.lineId){
          Transit.click_line(lineId);
          checkCounter = 0;
        } else {
          checkLineId = setTimeout("Transit.checkLine()", 200);
          checkCounter ++;
        }
      } else {
      	checkLineId = setTimeout("Transit.checkLine()", 200);
      	checkCounter ++;
        GLog.write("can't find info-window!");
      }
      
    }
  }
})();
var checkCounter = 0;
//var ifr = null;
// Export global symbols.
// They are used for callback when got json results.
window['Transit'] = {
  'start' : transitMgr.init,
  'callback_ls':  rpcProxy.getLinesByStationCallback,
  'callback_sib': rpcProxy.getStopsByBoundsCallback,
  'callback_lc':  rpcProxy.getCitiesCallback,
  'callback_cl':  rpcProxy.getLinesByCityCallback,
  'callback_sl':  rpcProxy.getStopsByLineCallback,
  'click_stop' : transitMgr.clickStop,
  'high_stop' : transitMgr.highStop,
  'unhigh_stop' : transitMgr.unhighStop,
  'click_line' : transitMgr.clickLine,
  'click_inverse' : transitMgr.clickInverse,
  'click_back' : dom.clickBack,
  'click_tri' : transitMgr.clickTri,
  'click_city' : transitMgr.clickCity,
  'searchLine' : transitMgr.searchLine,
  'searchCity' : transitMgr.searchCity,
  'restore' : transitMgr.restore,
  'loadStationLines' : transitMgr.loadInfoWindowIframe,
  'checkLine' : transitMgr.checkLineSelectEvent
};

Transit.start();