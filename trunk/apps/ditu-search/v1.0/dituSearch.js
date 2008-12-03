(function() {})();
  /**
   * The Core Map Gadget Object
   */
  function DituGadget(mid) {
    this.mid = mid;
    this.prefs = new _IG_Prefs(this.mid);
    this.initialize();
  }
  window.DituGadget = DituGadget;
  TabItems = {};
  
  DituGadget.prototype.initialize = function() {
    this.checkDefaultLocation();
    this.mapContainer = elem("map" + this.mid);
    this.initialTabs();
    this.favoriteCtl = new FavoriteControl(this);
    this.bootComplete();
    this.resize();
  }

  DituGadget.prototype.checkDefaultLocation = function() {
    this.defaultLocation = "";
    var defLoca = this.prefs.getString("defaultLocation");
    if (!defLoca || defLoca == "") {
      this.center = this.GetDefaultCenter();
    } else {
      var result = defLoca.split("+");
      if (result && result.length == 4) {
        this.defaultLocation = result[0];
        this.center = new GLatLng(parseFloat(result[1]), parseFloat(result[2]));
        this.zoom = parseInt(result[3]);
      } else {
        this.clearDefaultLocal();
        this.center = this.GetDefaultCenter();
      }
    }
  }
  DituGadget.prototype.clearDefaultLocal = function() {
    this.defaultLocation = "";
    this.prefs.set("defaultLocation", "");
  }

  DituGadget.prototype.setDefaultLocation = function(address, lat, lng, zoom) {
    this.defaultLocation = address;
    var value = address+"+"+lat+"+"+lng+"+"+zoom;
    this.prefs.set("defaultLocation", value);
  }

  DituGadget.prototype.bootComplete = function() {
    this.gmap = new GMap2(this.mapContainer);
    this.zoom = this.zoom || 13;
    this.gmap.setCenter(this.center, this.zoom);
    
    var me = this;
    this.smallMapControl = new GSmallMapControl();
    this.gmap.addControl(this.smallMapControl);
    this.searchControl = new SearchControl(this);
    this.gmap.addControl(this.searchControl);
  GEvent.addDomListener(window, "resize", methodCallback(this, DituGadget.prototype.resize));
    _IG_AdjustIFrameHeight();
    _IG_AddModuleEventHandler(this.mid, "unzip", methodCallback(this,
        DituGadget.prototype.unzipCallback));
  
  }

  DituGadget.prototype.initialTabs = function(){
    elem("transitButton"+this.mid).onclick = this.transitSubmit;
    var me = this;
    TabItems[":dituItem"+this.mid] = [elem("dituItem"+this.mid), elem("dituTab"+this.mid)];
    TabItems[":favoItem"+this.mid] = [elem("favoItem"+this.mid), elem("favoTab"+this.mid)];
    for(var item in TabItems){
      TabItems[item][0].onclick = function(){
        me.changeTab(this.id);
      };
    }
    this.changeTab("dituItem"+this.mid);
  };
  DituGadget.prototype.resize = function(){
    var totalWidth = this.mapContainer.offsetWidth;
    var btnWidth = document.forms[0].btn.offsetWidth+10;
    var lblWidth = elem("tabLbl"+this.mid).offsetWidth + 2;
    document.forms[0].q.style.width = (totalWidth - btnWidth) + "px";
    document.forms[1].near.style.width = document.forms[1].q.style.width = (totalWidth - btnWidth - lblWidth * 2)/2 + "px";
    document.forms[2].saddr.style.width = document.forms[2].daddr.style.width = (totalWidth - btnWidth * 2 - lblWidth * 2)/2 + "px";
  }
  DituGadget.prototype.changeTab = function(id){
    for(var item in TabItems){
      TabItems[item][0].className = "tab-item";
      TabItems[item][1].style.display = "none";
    }
    var actIt = TabItems[":"+ id];
    actIt[0].className = "tab-item active-tab";
    actIt[1].style.display = "";
    _IG_AdjustIFrameHeight();
  }
  
  DituGadget.prototype.transitSubmit = function(){
    var form = this.parentNode;
    var start = encodeURIComponent(form.elements["saddr"].value);
    var end = encodeURIComponent(form.elements["daddr"].value);
    var url = "http://ditu.google.cn/maps?hl=zh-CN&ie=UTF8&dirflg=r&f=d&saddr="+start + "&daddr="+end;
    window.open(url);
  }
  
  DituGadget.prototype.unzipCallback = function() {
    this.gmap.checkResize();
    this.resize();
  }

  DituGadget.prototype.cssSetClass = function(el, className) {
    el.className = className;
  }

  DituGadget.prototype.GetDefaultCenter = function() {
    return new GLatLng(39.930000, 116.400001); // beijing
  }

  function methodCallback(object, method) {
    return function() {
      return method.apply(object, arguments);
    }
  }

  function elem(id){
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
  
  function newTextEl(text, prt) {
    var el = document.createTextNode(text);
    if (prt) {
      prt.appendChild(el);
    }
    return el;
  }
  
  function newLink(className, prt, lable, handler){
      var link = newEl("a", className, prt);
      link.href = "#";
      newTextEl(lable, link);
      link.onclick = handler;
      return link;
    }

  function FavoriteControl(gadget){
    this.gadget = gadget;
    this.mid = this.gadget.mid;
    this.listContainer = elem("favoTab"+this.mid);
    this.initialize();
  }
  FavoriteControl.prototype.initialize = function(){
    this.editor = elem("customEditor"+this.mid);
    this.input = elem("customInput"+this.mid);
    var me = this;
    elem("customLink"+this.mid).onclick = function(){
      me.openEditor(me);
    };
    elem("customOK"+this.mid).onclick = function(){
      me.customOk(me);      
    };
    elem("customCancel"+this.mid).onclick = function(){
      me.closeEditor(me);
    };
    this.editor.style.display = "none";
    //this.listContainer.style.width = this.gadget.mapContainer.offsetWidth + "px";
    this.importFavorites();
  }
  FavoriteControl.prototype.importFavorites = function(){
    this.favorites = {};
    var favos = this.gadget.prefs.getString("favoriteFolder").split("|");
    if(favos){
      for(var i = 0, favo; favo = favos[i]; i++){
        var result = favo.split("+");
        if(result && result.length == 4){
          this.favorites["f"+result[0]] = [result[0], result[1], result[2], result[3]];
          this.addToList("f"+result[0], result[0], result[1], result[2], result[3]);
        } 
      }
    }
  }
  FavoriteControl.prototype.customOk = function(me){
    var address = me.input.value;
    var point = me.gMarker.getPoint();
    var zoom = me.gadget.gmap.getZoom();
    if(address){
      me.addNewFavorite(address, point.lat(), point.lng(), zoom);
      me.removeMarker();
    }
  }
  FavoriteControl.prototype.addNewFavorite = function(address, lat, lng, zoom){
    if(this.favorites["f"+address]){
      this.listContainer.removeChild(elem("favo_"+address));
    }
    this.addToList("f"+address, address, lat, lng, zoom);
    this.favorites["f"+address] = [address, lat, lng, zoom];
    this.flush();
    this.editor.style.display='none';
  }
  FavoriteControl.prototype.closeEditor = function(me){
    me.editor.style.display='none';
    me.removeMarker();
  }
  FavoriteControl.prototype.removeMarker = function(){
    if(this.gMarker){
      this.gadget.gmap.removeOverlay(this.gMarker);
      this.gMarker = null;
    }
  }
  FavoriteControl.prototype.openEditor = function(me){
    me.editor.style.display='';
    this.input.style.width = (this.editor.offsetWidth - 150)+"px";
    if(!me.gMarker){
      me.gMarker = new GMarker(me.gadget.gmap.getCenter(), {
        draggable : true, title : me.gadget.prefs.getMsg("custom_hint")
      });
      me.gadget.gmap.addOverlay(me.gMarker);
    }else{
      me.gMarker.setPoint(me.gadget.gmap.getCenter());
    }
  }
  FavoriteControl.prototype.addToList = function(code, address, lat, lng, zoom){
    var me = this;
    var root = newEl("p", "favorite-item", this.listContainer);
    root.id = "favo_"+address;
    newLink(null, newEl("span", "favo-name", root), address, function(){
      me.gadget.gmap.setCenter(new GLatLng(lat, lng), zoom);
    });
    var actionRoot = newEl("span", "favo-action", root);
    newLink(null, actionRoot, this.gadget.prefs.getMsg("favo_delete"), function(){
      me.del(code);
    if(me.defaultLoca == this.parentNode){
        me.gadget.clearDefaultLocal();
        //TODO need set other as default?
      }
      me.listContainer.removeChild(this.parentNode.parentNode);
    });
    if(address == this.gadget.defaultLocation){
      newTextEl(this.gadget.prefs.getMsg("favo_default"), newEl("span", "favo-default", actionRoot));
      this.defaultLoca = actionRoot;
      this.gadget.setDefaultLocation(address, lat, lng, zoom);
    }else{
      newLink("favo-default", actionRoot, this.gadget.prefs.getMsg("favo_setDefault"), function(){
        me.setDefaultLoc(this.parentNode, address, lat, lng, zoom);
      });
    }
  }
  FavoriteControl.prototype.setDefaultLoc = function(elem, address, lat, lng, zoom){
    var me = this;
    if(this.defaultLoca){
      this.defaultLoca.removeChild(this.defaultLoca.lastChild);
      newLink("favo-default", this.defaultLoca, this.gadget.prefs.getMsg("favo_setDefault"), function(){
        me.setDefaultLoc(this.parentNode, address, lat, lng, zoom);
      });
    }
    elem.removeChild(elem.lastChild);
    newTextEl(this.gadget.prefs.getMsg("favo_default"), newEl("span", "favo-default", elem));
    this.defaultLoca = elem;
    this.gadget.setDefaultLocation(address, lat, lng, zoom);
  }
  FavoriteControl.prototype.flush = function(){
    var newValue = "";
    for(var item in this.favorites){
      newValue += this.favorites[item][0]+"+"+this.favorites[item][1]+"+"+this.favorites[item][2]+"+"+this.favorites[item][3]+"|";
    }
    this.gadget.prefs.set("favoriteFolder", newValue );
  }
  FavoriteControl.prototype.del = function(code){
    delete this.favorites[code];
    this.flush();
  }
    
  function SearchControl(gadget) {
    this.enableInput = false;
    this.inputElem = null;
    this.searchCtlElem = null;
    this.geocoder = new GClientGeocoder();
    this.map = null;
    this.gadget = gadget;
  }

  SearchControl.prototype = new GControl();

  SearchControl.prototype.initialize = function(map) {
    this.map = map;
    this.container = newEl("div", "search-container", map.getContainer());
    this.resultContainer = newEl("div", "search-result", this.container);
    newEl("div", "empty-clear", this.container);
    var ctl = newEl("div", "search-control", this.container);
    this.searchCtlElem = newEl("span", null, ctl);
    newTextEl(this.gadget.prefs.getMsg("search_label"), this.searchCtlElem);
    
    this.inputElem = newEl("div", "search-input", ctl);
    this.input = newEl("input", null, this.inputElem);
    //this.input.style.width = (this.container.offsetWidth - 100) + "px";
    var actImg = newEl("img", "search-go", this.inputElem);
    actImg.src = "http://gadgetlab.googlecode.com/svn/trunk/mapsearch/images/magnifier.PNG";
    actImg.alt = this.gadget.prefs.getMsg("search_label");
    var me = this;
    actImg.onclick = function(){
      me.search();
    };
    
    if (this.enableInput) {
      this.enable();
    } else {
      this.disable();
    }
    this.input.onblur = function(){
      this.style.color = "#999999";
    }
    this.input.onfocus = function(){
      this.style.color = "#000";
    }
    this.searchCtlElem.onclick = function(){
      if(me.enableInput){
        me.disable();
      }else{
        me.enable();
      }
    };
    return this.container;
  }
  SearchControl.prototype.search = function() {
    var me = this;
    var address = this.input.value;
    //TODO search favorite first
    if(address && address != ""){
      this.geocoder.getLatLng(address, function(point){
          me.geocodeComplete(point, address);  
        });
    }
  }
  SearchControl.prototype.geocodeComplete = function(point, address){
    if(point){
      var zoom = this.map.getZoom();
      if(zoom > 13 || zoom < 5) zoom = 13;
      this.map.setCenter(point, zoom);
      this.showResult(point, address);
    }else{
      this.showHint(address);
    }
  }
  SearchControl.prototype.showHint = function(address){
    this.resultContainer.innerHTML = "";
    if(address){
      var me = this;
      var wrapper = newEl("div","result-hint", this.resultContainer);
      newTextEl(address + '...?', newEl("span", "null-hint", wrapper));
      newLink(null, wrapper, this.gadget.prefs.getMsg("null_result_hint"), function(){
        var url = "http://ditu.google.cn/maps?q="+encodeURIComponent(address);
        window.open(url);
        me.resultContainer.style.display = "none";
      });
    } else {
      newTextEl(this.gadget.prefs.getMsg("null_result_tip"), this.resultContainer);
    }
  }

  SearchControl.prototype.showResult = function(point, address){
    this.resultContainer.style.display = "";
    this.resultContainer.innerHTML = "";
    var me = this;
    var wrapper = newEl("div","result-hint", this.resultContainer);
      newTextEl(address, newEl("span", null, wrapper));
      newLink(null, wrapper, this.gadget.prefs.getMsg("add_favorite"), function(){
        var center = me.gadget.gmap.getCenter();
        var zoom = me.gadget.gmap.getZoom();
        me.gadget.favoriteCtl.addNewFavorite(address, center.lat(), center.lng(), zoom);
        me.resultContainer.style.display = "none";
      });
  }
  SearchControl.prototype.enable = function(){
    this.enableInput = true;
    this.inputElem.style.display = "inline";
    this.searchCtlElem.className = "search-enable";
    this.resultContainer.style.display = "block";
    if(this.input.value == ""){
      this.showHint();
   }
  }
  SearchControl.prototype.disable = function(){
    this.enableInput = false;
    this.inputElem.style.display = "none";
    this.searchCtlElem.className = "search-disable";
    this.resultContainer.style.display = "none";
  }
  SearchControl.prototype.getDefaultPosition = function() {
    return new GControlPosition(G_ANCHOR_BOTTOM_LEFT, new GSize(65, 2));
  }
