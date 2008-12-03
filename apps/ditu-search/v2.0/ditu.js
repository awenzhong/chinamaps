/**
 * Author: Chenfei
 */
(function(){
  var $ = function(id){
    return document.getElementById(id);
  }
  function $n(tag, prt, className){
    var el = document.createElement(tag);
    el.className = className || "";
    if (prt) prt.appendChild(el);
    return el;
  }
  function TrafficButton(){
    this.map;
    this.button;
    this.isShown = false;
    this.trafficOl = new GTrafficOverlay();
  }
  TrafficButton.prototype = new GControl();
  TrafficButton.prototype.initialize = function(map){
    this.map = map;
    this.map.addOverlay(this.trafficOl);
    var container = map.getContainer();
    this.button = $n("div", container, "traffic-button");
    this.button.innerHTML = '交通流量';
    this.button.style.display = "none";
    this.trafficOl.hide();
    GEvent.bind(this.trafficOl, "changed", this, this.toggleButton);
    GEvent.bindDom(this.button, "click", this, this.toggleOverlay);
    return this.button;
  }
  TrafficButton.prototype.toggleButton = function(hasTrafficInView){
    if(hasTrafficInView){
      this.button.style.display = "";
    } else {
      this.button.style.display = "none";
    }
  }
  TrafficButton.prototype.toggleOverlay = function(){
    if(this.isShown){
      this.isShown = false;
      this.button.style.fontWeight = "normal";
      this.trafficOl.hide();
    } else {
      this.isShown = true;
      this.button.style.fontWeight = "bolder";
      this.trafficOl.show();
    }
  }
  TrafficButton.prototype.getDefaultPosition = function(){
    return new GControlPosition(G_ANCHOR_TOP_RIGHT, new GSize(110, 7));
  }
  var mgr = (function(){
    var map;
    var isUsingDefault;
    var location = {};
    var localResult = {};
    var routeResult = {};
    var routeControl = null;
    var localControl = null;
    var localDom = $("localResult");
    var routeDom = $("routeResult");
    var infoTabKeys = {
      route : 'route',
      transit : 'transit',
      near : 'near'
    }
    var apiKey = "ABQIAAAA91OZMiOe8VfhdtstxQrBBxTqQ5WtUwE0C8FR1hRk-yj3qFOmhhToKuCkHwzulUTwzU6LJb92tmbOKA";
    function initMap(){
      location.zoom = 10; //parseInt(prefs.getString("currentZoom")) || 10;
      location.lat = location.lat || 39.9056;
      location.lng =  location.lng || 116.3958;
      map = new GMap2($("mapContainer"));
      map.setCenter(new GLatLng(location.lat, location.lng), location.zoom);
      loadSearchControl();
      map.enableContinuousZoom();
      map.enableScrollWheelZoom();
      map.addControl(new GSmallMapControl);
      map.addControl(new GMenuMapTypeControl);
      map.addMapType(G_PHYSICAL_MAP);
      map.addControl(new TrafficButton());
      new GKeyboardHandler(map);
      GEvent.addListener(map, "infowindowopen", function(){
        map.updateInfoWindow();
        var input = $("route_input");
        if(input) input.focus();
      });
      if(isUsingDefault){
        GEvent.addListener(map, "zoomend", saveMapStatus);
        GEvent.addListener(map, "moveend", saveMapStatus);
      }
//      _IG_AddModuleEventHandler(mid, "unzip", adjustHeight);
    }
    function loadSearchControl(){
      var lsUrl = "http://www.google.com/uds/solutions/localsearch/gmlocalsearch.js?key=" + apiKey;
      google.loader.writeLoadTag("script", lsUrl, true)
    }
    function getLocationByPrefs(){
      isUsingDefault = true;//prefs.getBool("isUsingLast");
      var lat = null;//prefs.getString("currentLat");
      var lng = null;//prefs.getString("currentLng");
      if(isUsingDefault && lat && lng){  //  By last time info
        location.lat = parseFloat(lat);
        location.lng = parseFloat(lng);
        initMap();
      } else {  //  By default address
        var defLoc = "北京";//prefs.getString("defaultLoc");
        if(defLoc){
          var geocoder = new GClientGeocoder();
          geocoder.getLocations(defLoc, function(response){
            if (response) {
              var place = response.Placemark[0];
              location.lat = place.Point.coordinates[1];
              location.lng = place.Point.coordinates[0];
            } else {
              getLocationByIP();
            }
            initMap();
          });
        } else {  // No default address
          getLocationByIP();
          initMap();
      }
      }
    }
    function getLocationByIP(){
      if(google.loader && google.loader.ClientLocation){    //  By IP detection
        var loc = google.loader.ClientLocation;
        if(loc.latitude && loc.longitude){
          location.lat = loc.latitude;
          location.lng = loc.longitude;
        }
      }
    }
    function saveMapStatus() {
//      prefs.set("currentLat", map.getCenter().lat());
//      prefs.set("currentLng", map.getCenter().lng());
//      prefs.set("currentZoom", map.getZoom());
    }
    function loadSearchControl(){
      var lsUrl = "http://www.google.com/uds/solutions/localsearch/gmlocalsearch.js?hl=zh-CN&key=ABQIAAAA91OZMiOe8VfhdtstxQrBBxTA88Ja3eVS5h82c7xtCgVhRculDRS9egijnXNfT4oxbCdUc9hGjeJZ1Q&callback=DituGadget.searchLoaded";
      google.loader.writeLoadTag("script", lsUrl, true)
    }
    function genInfoWindowHtml(marker, html, result){
      localResult.curResult = result;
      localResult.marker = marker;
      var dom = $n("div");
      var link = getDituUrl() + "&f=q&q=" + encodeURIComponent(result.titleNoFormatting);
      var ll = marker.getPoint().lat()+","+marker.getPoint().lng();
      var zoom = map.getZoom() > 13 ? 10 : 15;
      var staticUrl = "http://ditu.google.cn/staticmap?center="+ll+"&zoom="+zoom+"&size=100x67&markers="+ll+",red&key="+apiKey;
      var html = '<div style="width:220px;">' +
          '<p class="info-title">' + result.titleNoFormatting + '</p>' +
          '<p style="width:95%;text-align:right;">';
//      if(map.getZoom() < 15){
//        html += '<span style="color:#0000FF;margin-right:1em" id="magnifyLink" onclick="DituGadget.magnifyMap()" onmouseout="this.style.textDecoration=\'none\'" onmouseover="this.style.textDecoration=\'underline\'">放大查看详细地图</span>';
//      }
      html += '<a href="'+link+'" target="_blank">去地图主页查看更多信息</a></p>'+
          '<div class="info-paragraph">' +
          '<p style="float:right;height:67px;width:100px;"><img style="border:solid #0000CC 1px;cursor:pointer;height:67px;width:100px;" src="' + staticUrl + '" onclick="DituGadget.magnifyMap()"/><br/>' +
          '</p>';
      if(result.streetAddress){
        html += '<p style="width:110px;"><span>地址：</span></p>' +
            '<p style="width:100px;padding-left:1em;">' + result.streetAddress + '</p>';
      }
      if(result.phoneNumbers){
        html += '<p style="width:110px;"><span>电话：</span></p>' +
            '<p style="width:100px;padding-left:1em;">' + result.phoneNumbers[0].number + '</p>';
      }
      html += '</div>';  //  End detail paragraph
      html += '<div class="info-paragraph">' +
          '<div class="tab-head">' +
            '<p class="tab-item active-tab" id="route_tab" onclick="DituGadget.clickInfoTab(\'route\');" onmouseout="this.style.textDecoration=\'none\'" onmouseover="DituGadget.mouseoverInfoTab(this)">驾车路线</p>' +
            '<p class="tab-item" id="transit_tab" onclick="DituGadget.clickInfoTab(\'transit\');" onmouseout="this.style.textDecoration=\'none\'" onmouseover="DituGadget.mouseoverInfoTab(this)">公交路线</p>' +
            '<p class="tab-item" id="near_tab" onclick="DituGadget.clickInfoTab(\'near\');" onmouseout="this.style.textDecoration=\'none\'" onmouseover="DituGadget.mouseoverInfoTab(this)">在附近搜索</p>' +
          '</div>' +
          '<div id="route_cnt" class="tab-content" style="display:block;">' +
            '<p class="info-tip">' +
              '<input type="radio" name="route" id="routeFrom" checked="checked"/>输入目的地&nbsp;' +
              '<input type="radio" name="route" id="routeTo"/>输入出发点&nbsp;</p>' +
            '<input type="text" id="route_input" style="width:75%" class="gsc-input" onkeydown="DituGadget.onkeydown(this, event)"/><input type="button" class="info-button gsc-search-button" value="搜索" onclick="DituGadget.getRoute();"/>' +
            '<p id="routeErrMsg" style="display:none;color:#ff0000;margin-top:2px;">没有找到有效结果，<a href="" id="moreRouteLink" target="_blank">去谷歌地图主页试试</a></p>' +
          '</div>' +
          '<div id="transit_cnt" class="tab-content">' +
            '<p class="info-tip">' +
              '<input type="radio" name="transit" id="transitFrom" checked="checked"/>输入目的地&nbsp;' +
              '<input type="radio" name="transit" id="transitTo"/>输入出发点&nbsp;</p>' +
            '<input type="text" id="transit_input" style="width:52%" class="gsc-input" onkeydown="DituGadget.onkeydown(this, event)"/>' +
            '&nbsp;<a class="info-button gsc-search-button" style="border:none;" href="javascript:DituGadget.getTransit();">去地图主页搜索</a>' +
          '</div>' +
          '<div id="near_cnt" class="tab-content">' +
            '<p class="info-tip"><span>例如：东城区 书店</span></p>' +
            '<input type="text" id="near_input" style="width:75%" class="gsc-input" onkeydown="DituGadget.onkeydown(this, event)"/><input type="button" class="info-button gsc-search-button" value="搜索" onclick="DituGadget.getNear();"/>' +
          '</div>' +
          '</div>';
      dom.innerHTML = html;
//      map.updateInfoWindow();
//  GLog.write(result.staticMapUrl);
//      GLog.write(dom.innerHTML);
      return dom;
    }
    function clearLocalResult(){
      map.closeInfoWindow();
      if(localResult.results){
        for(var i = 0, result; result = localResult.results[i]; i++){
          map.removeOverlay(result.marker);
        }
        localResult.results = null;
      }
      localDom.style.display = "none"; 
    }
    function clearRouteResult(){
      if(routeResult.polyline){
        map.removeOverlay(routeResult.polyline);
        routeResult.polyline = null;
      }
      if(routeResult.markers){
        for(var i = 0, marker; marker = routeResult.markers[i]; i++){
          map.removeOverlay(marker);
        }
        routeResult.markers = null;
      }
      routeDom.style.display = "none";
    }
    function onSearchIdle(){
      localDom.style.display = "none";
      adjustHeight();
    }
    function onSearchLoaded(results){
      localDom.style.display = "block";
      if(localDom.clientHeight > 185){
        localDom.style.height = 185 + "px";
      }
      adjustHeight();
      var elems = localDom.getElementsByTagName("a");
      for(var i=0,elem; elem = elems[i]; i++){
        if(elem.className == "gmls-more-results"){
          elem.href= getDituUrl() + "&f=q&q=" + encodeURIComponent(searcher.ne);
        }
      }
    }
    function onRouteLoaded(){
      routeDom.style.display = "block";
      if(routeDom.clientHeight > 185){
        routeDom.style.height = 185 + "px";
      }
      adjustHeight();
      routeResult.polyline = routeControl.getPolyline();
      routeResult.markers = [routeControl.getMarker(0),routeControl.getMarker(1)];
      GLog.write(routeControl.getSummaryHtml());
    }
    function onRouteError(){
      if(!$("routeErrMsg")) return;
      $("routeErrMsg").style.display = "block";
      if($("routeFrom").checked){
        var from = $("route_input").value;
        var to = localResult.curResult.streetAddress;
      } else if($("routeTo").checked){
        var from = localResult.curResult.streetAddress;
        var to = $("route_input").value;
      }
      $("moreRouteLink").href = getDituUrl() + "&f=d&saddr="+encodeURIComponent(from)+"&daddr="+encodeURIComponent(to);
      map.updateInfoWindow();
      return false;
    }
    function adjustHeight(){
//      _IG_AdjustIFrameHeight();
      map.checkResize();
    }
    function getDituUrl(){
      var center = map.getCenter();
      var span = map.getBounds().toSpan();
      var ll= center.lat()+","+center.lng();
      var spn = span.lat()+","+span.lng();
      return "http://ditu.google.cn/maps?hl=zh-CN&ie=UTF8&sll="+ll+"&sspn="+spn;
    }
    return {
      start: function(){
        getLocationByPrefs();
      },
      searchLoaded: function(){
        var options = {
          resultList: localDom,
          searchFormHint: "提示：缩放地图到目标范围内可以搜索到更精确的结果！",
          onIdleCallback : onSearchIdle,
          onSearchCompleteCallback : clearRouteResult,
          onMarkersSetCallback: onSearchLoaded,
          onGenerateMarkerHtmlCallback: genInfoWindowHtml
        };
        localControl = new google.maps.LocalSearch(options);
        $("loadingImg").style.display="none";
        map.addControl(localControl, new GControlPosition(G_ANCHOR_BOTTOM_LEFT, new GSize(0, -26)));
        searcher = localControl.gs;
        map.getContainer().style.marginBottom = "26px";
        adjustHeight();
        localControl.focus();
        var query= "包子";//prefs.getString("defaultTarget");
        if(query){
          localControl.newSearch(query);
        }
      },
      getRoute : function(){
        if($("routeFrom").checked){
          var from = $("route_input").value;
          var to = localResult.curResult.streetAddress;
        } else if($("routeTo").checked){
          var from = localResult.curResult.streetAddress;
          var to = $("route_input").value;
        }
        if (!routeControl) {
          routeControl = new GDirections(map, routeDom);
          GEvent.addListener(routeControl, "load", clearLocalResult);
          GEvent.addListener(routeControl, "error", onRouteError);
          GEvent.addListener(routeControl, "addoverlay", onRouteLoaded);
        }
        if(from && to){
          routeControl.load("from:"+from+" to:"+to);
        }
      },
      getTransit : function(){
        if($("transitFrom").checked){
          var from = $("transit_input").value;
          var to = localResult.curResult.streetAddress;
        } else if($("transitTo").checked){
          var from = localResult.curResult.streetAddress;
          var to = $("transit_input").value;
        }
        var url = getDituUrl() + "&f=d&dirflg=r&saddr="+encodeURIComponent(from)+"&daddr="+encodeURIComponent(to);
        window.open(url);
      },
      getNear : function(){
        if(map.getZoom() < 16){
          map.setZoom(16);
        }
        var value = $("near_input").value;
        if(value){
          localControl.newSearch(value);
        }
      },
      changeRouteTip : function(elem){
        if(elem.id == "routeFrom"  && elem.checked){
          $("fromTip").style.display = "";
          $("toTip").style.display = "none";
        }else if(elem.id == "routeTo" && elem.checked){
          $("fromTip").style.display = "none";
          $("toTip").style.display = "";
        }
      },
      changeTransitTip : function(elem){
        if(elem.id == "transitFrom"  && elem.checked){
          $("fromTipT").style.display = "";
          $("toTipT").style.display = "none";
        }else if(elem.id == "transitTo" && elem.checked){
          $("fromTipT").style.display = "none";
          $("toTipT").style.display = "";
        }
      },
      onInfoTabClick : function(key){
        $(key + "_tab").className = "tab-item active-tab";
        $(key + "_cnt").style.display = "block";
        $(key + "_input").focus();
        for(var i in infoTabKeys){
          if(infoTabKeys[i] != key){
            $(infoTabKeys[i] + "_tab").className = "tab-item";
            $(infoTabKeys[i] + "_cnt").style.display = "none";
          }
        }
        map.updateInfoWindow();
      },
      onInfoTabMouseover : function(elem){
        if(elem.className && elem.className.indexOf("active-tab") == -1){
          elem.style.textDecoration="underline";
        }
      },
      onkeydown : function(elem, e){
        e = e || window.event;
        e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
        var keyCode = e.keyCode || e.which || e.charCode;
        if(keyCode == 13){
          if(elem.id == "route_input"){
            mgr.getRoute();
          } else if(elem.id == "near_input"){
            mgr.getNear();
          } else if(elem.id == "transit_input"){
            mgr.getTransit();
          }
        }
      },
      magnifyMap : function(){
        var zoom = map.getZoom() > 13 ? 10 : 15;
        map.setCenter(localResult.marker.getPoint(), zoom);
        map.updateInfoWindow();
      }
    }
  })();
  
  window['DituGadget'] = {
    'start' : mgr.start,
    'dituLoaded' : mgr.dituLoaded,
    'searchLoaded' : mgr.searchLoaded,
    'getRoute' : mgr.getRoute,
    'getTransit' : mgr.getTransit,
    'getNear' : mgr.getNear,
    'changeRouteTip' : mgr.changeRouteTip,
    'changeTransitTip' : mgr.changeTransitTip,
    'clickInfoTab' : mgr.onInfoTabClick,
    'mouseoverInfoTab' : mgr.onInfoTabMouseover,
    'onkeydown' : mgr.onkeydown,
    'magnifyMap' : mgr.magnifyMap
  }
})();
DituGadget.start();