/**
 * @author Fei Chen
 * Latest update: 
 */
 
(function() {
  function elem(id) {
    return document.getElementById(id);
  }
  function newEl(tag, className, prt){
    var el = document.createElement(tag);
    if (className) {
      el.className = className;
    }
    if (prt) {
      prt.appendChild(el);
    }
    return el;
  }
  function autoScroll(node){
    var parent = node.parentNode;
    var offset = node.offsetHeight;
    var parentTop = parent.scrollTop;
    var nodeTop = node.offsetTop;
    var curOffset = nodeTop - parentTop;
    if (curOffset > parent.offsetHeight) {
      parent.scrollTop = parent.scrollTop + offset;
    } else if (curOffset < offset) {
      parent.scrollTop = parent.scrollTop - offset;
    }
  }
  String.prototype.toInitialUpperCase = function(){
    return this.replace(/\w/, function(letter) {    
                return letter.toUpperCase();
            });
  }
  
  var mgr = (function(){
    var map = null;
    var hintDom = elem("hintMsg");
    var searchDom = elem("quickSearch");
    var tabHeadDom = elem("tabHead");
    var chartPinBaseUrl = "http://www.google.com/chart?chst=d_map_pin_icon&chld=";
    var chartXPinBaseUrl = "http://www.google.com/chart?chst=d_map_xpin_icon&chld=";
    var cityObj = {
      beijing : {name:"beijing", lat:39.9056, lng:116.3958},
      shanghai : {name:"shanghai", lat:31.2222, lng:121.7409}
    }
    var typeObj = {
      church : {name:"church", icon : "medical|FFFF00"},
      cinema : {name:"cinema", icon : "cinema|FFFF00"},
      shop : {name:"shop", icon : "shoppingcart|FFFF00"},
      bar : {name:"bar", icon : "bar|FFFF00"},
      ktv : {name:"ktv", icon : "music|FFFF00"},
      restaurant : {name:"restaurant", icon : "restaurant|FFFF00"},
      all : {name:"all"}
    }
    var cur = {
      city : cityObj.beijing.name,  //as default city
      type : typeObj.church.name, // as default type list
      listDom : null
    };
    var loaded = {
      beijing : {},
      shanghai : {}
    }
    function getCityDomId(city){
      return city + "City";
    }
    function getListDomId(city, type){
      return city + type.toInitialUpperCase() + "List";
    }
    function getDataFileName(city, type){
      return city+"_"+type.toInitialUpperCase()+".json";
    }
    function loadData(city, type){
      hintDom.style.display = "block";
      var url = "data/" + getDataFileName(city, type);
      GDownloadUrl(url, importData);
    }
    function importData(data){ 
      var data = eval(data);
      for(var i=0, pos; pos = data[i]; i++){
        var node = addNode(pos);
        var marker = addMarker(pos);
        addListener(node, marker, pos);
        var type = pos["type"].toLowerCase();
        if(!loaded[cur.city][type]){
          loaded[cur.city][type] = {};
          loaded[cur.city][type].markers = [];
        }
        loaded[cur.city][type].markers.push(marker);
      }
      hintDom.style.display = "none";
    }
    function addNode(pos){
      var node = newEl("p", "list-entry", cur.listDom);
      node.innerHTML = pos["name"];
      return node;
    }
    function addMarker(pos, node){
      var point = new GLatLng(parseFloat(pos["lat"]), parseFloat(pos["lng"]));
      var icon = makeIcon(pos["type"].toLowerCase());
      var marker = new GMarker(point, {icon:icon, title:pos["name"]});
      marker.point = point;
      map.addOverlay(marker);
      //Debug
      if(!typeObj[pos["type"].toLowerCase()]){
        GLog.write(pos["name"]+"||"+pos["description"]);
        return marker;
      }
      return marker;
    }
    function makeIcon(type){
      var icon = new GIcon();
      if(!typeObj[type]){GLog.write(type)}
      icon.image = chartPinBaseUrl + typeObj[type].icon;
      icon.iconSize = new GSize(21, 34);
      icon.iconAnchor = new GPoint(10, 34);
      icon.infoWindowAnchor = new GPoint(10, 6);
      return icon;
    }
    function addListener(node, marker, pos){
      GEvent.addListener(marker, "click", GEvent.callbackArgs(this, openInfoWindow, marker, pos));
      GEvent.addListener(marker, "mouseover", GEvent.callbackArgs(this,highlightPos, marker, node, pos));
      GEvent.addListener(marker, "mouseout", GEvent.callbackArgs(this,unhighlightPos, marker, node, pos));
      GEvent.addDomListener(node, "click", GEvent.callbackArgs(this, openInfoWindow, marker, pos));
      GEvent.addDomListener(node, "mouseover", GEvent.callbackArgs(this,highlightPos, marker, node, pos));
      GEvent.addDomListener(node, "mouseout", GEvent.callbackArgs(this,unhighlightPos, marker, node, pos));
    }
    function highlightPos(marker, node, pos){
      var url = chartXPinBaseUrl+"pin_star|"+typeObj[pos["type"].toLowerCase()].icon+"|FF0000";
      marker.setImage(url);
      node.className = "list-entry-highlight";
      if(!map.getBounds().contains(marker.point)){
        map.panTo(marker.point);
      }
      autoScroll(node);
    }
    function unhighlightPos(marker, node, pos){
      var url = chartPinBaseUrl+typeObj[pos["type"].toLowerCase()].icon;
      marker.setImage(url);
      node.className = "list-entry";
    }
    function openInfoWindow(marker, pos){
      var tabs = [];
      var imgHtml = "<span style='font-size:13px;'>"+pos["name"]+"</span><br/><img style='width:200px' src='"+pos["images"][0]+"'/>";
      var infoHtml = "<div style='width:200px;font-size:13px;'>"+pos["description"]+"</div>";
      tabs.push(new GInfoWindowTab("图片", imgHtml));
      tabs.push(new GInfoWindowTab("信息", infoHtml)); 
      marker.openInfoWindowTabsHtml(tabs);
    }
    function initTabs(){
      var tabs = tabHeadDom.childNodes;
      for(var i = 0, tab; tab = tabs[i]; i++){
        GEvent.addDomListener(tab, "click", onTabClick);
        GEvent.addDomListener(tab, "mouseover", onTabMouseover);
        GEvent.addDomListener(tab, "mouseout", onTabMouseout);
      }
    }
    function onTabClick(){
      var tabs = tabHeadDom.childNodes;
      for (var i = 0, tab; tab = tabs[i]; i++) {
        tab.className = "tab-item";
      }
      this.className = "tab-item active-tab";
      var type = this.getAttribute("type");
      if(type != cur.type){
        cur.listDom.style.display = "none";
        hideMarkers(cur.city, cur.type);
        
        cur.listDom = elem(getListDomId(cur.city, type));
        cur.listDom.style.display = "block";
        cur.type = type;
        
        if(!loaded[cur.city][type]){
          loadData(cur.city, type);
        } else {
          showMarkers(cur.city, type);
        }
      }
      var nodes = cur.listDom.childNodes;
        for(var i = 0, node; node = nodes[i]; i++){
          if(node.style.display == "none"){
            node.style.display = "block";
          }
        }
    }
    function onTabMouseover(){
      this.style.textDecoration="underline";
    }
    function onTabMouseout(){
      this.style.textDecoration = 'none';
    }
    function hideMarkers(city, type){
      var markers = loaded[city][type].markers;
      for(var i = 0, marker; marker = markers[i]; i++){
        marker.hide();
      }
    }
    function showMarkers(city, type){
      var markers = loaded[city][type].markers;
      for(var i = 0, marker; marker = markers[i]; i++){
        marker.show();
      }
    }
    function initCity(){
      var cityDoms = elem("cityList").childNodes;
      for (var i = 0, city; city = cityDoms[i]; i++) {
        GEvent.addDomListener(city, "click", onCityClick);
        GEvent.addDomListener(city, "mouseover", onTabMouseover);
        GEvent.addDomListener(city, "mouseout", onTabMouseout);
      }
    }
    function onCityClick(){
      var cityDoms = elem("cityList").childNodes;
      for(var i = 0, city; city = cityDoms[i]; i++){
        city.className = "city";
      }
      var city = this.getAttribute("type");
      this.className = "city active-tab";
      if(city != cur.city){
        cur.listDom.style.display = "none";
        hideMarkers(cur.city, cur.type);
        cur.city = city;
        cur.listDom = elem(getListDomId(cur.city, cur.type));
        cur.listDom.style.display = "block";
        
        map.setCenter(new GLatLng(cityObj[city].lat, cityObj[city].lng));
        
        if(!loaded[cur.city][cur.type]){
          loadData(cur.city, cur.type);
        } else {
          showMarkers(cur.city, cur.type);
        }
      }
    }
    function initQuickSearch(){
      GEvent.addDomListener(searchDom, "mouseover", onSearchMouseover);
      GEvent.addDomListener(searchDom, "blur", onSearchBlur);
      GEvent.addDomListener(searchDom, "keyup", onSearchkeyup);
    }
    function onSearchMouseover(){
      this.style.border = "solid #000 1px";
      this.style.color = "#000";
      this.select();
      this.focus();
    }
    function onSearchBlur(){
      this.style.border = "solid #999999 1px";
      this.style.color = "#999999";
      if (this.value == "") {
        this.value = "快速搜索下面的列表";
      }
    }
    function onSearchkeyup(){
      var value = this.value;
      if (value != "快速搜索下面的列表") {
        var nodes = cur.listDom.childNodes;
        for(var i = 0, node; node = nodes[i]; i++){
          if(node.innerHTML.indexOf(value) == -1){
            node.style.display = "none";
          } else {
            node.style.display = "block";
          }
        }
      }
    }
    return {
      init : function(){
        map = new GMap2(elem("mapDiv")); 
        map.setCenter(new GLatLng(cityObj[cur.city].lat, cityObj[cur.city].lng), 12);
        map.enableScrollWheelZoom();
        map.addControl(new GLargeMapControl());
        map.addControl(new GMapTypeControl());
        cur.listDom = elem(getListDomId(cur.city, cur.type));
        loadData(cur.city, cur.type);
        initTabs();
        initCity();
        initQuickSearch();
      }
    }
  })();
  window['XmasMap'] = {
    'init' : mgr.init,
  }
})();
XmasMap.init();