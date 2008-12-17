
(function() {
  window.onload = function()
  {
  var base = "http://chinamaps.googlecode.com/svn/trunk/apps/XmasMap/";
function $(dom)
{
  return document.getElementById(dom);
}
      function openInfoWindow(marker, item, i)
      {
            var img = new Image();
    img.src = item['image'];
    img.onload = onImgLoaded(img.src, "loaded");
    img.onerror = onImgLoaded(img.src, "error");
            var tabs = [];
        var imgHtml = "<span style='font-size:13px;'>"+ item["name"]+"</span><br/><p style='display: block;font-size: 12px; color: red; padding-right:3px;text-align:right;'><a href='" + img.src + "' alt='点击查看原图'  target = '_blank' >请点击图片查看原图</a></p><p id='demoimg_" + item['type'] + "_" + i + "'><img src='"
        + base + "loading.gif'/>&nbsp;loading...</p>";
        var infoHtml = "<div style='width:200px;font-size:13px;'>"+item["desc"]+"</div>";
        tabs.push(new GInfoWindowTab("图片", imgHtml));
        tabs.push(new GInfoWindowTab("信息", infoHtml));
        marker.openInfoWindowTabsHtml(tabs);
    
    function onImgLoaded(src, type) {
      return function() {


           tabs = [];
           if(type == 'loaded'){
           var css = "";
           var width = img.width;
           var height = img.height;
           var rw = width / 200;
           var rh = height / 250;
           var r = 1;
           r = (rw > rh)?rw:rh;
            if(r < 1) r = 1;
            img.height = height / r;
            img.width =  width / r;

        css = 'height:' + img.height + ';width:' + img.width + ';';
        imgHtml = "<span style='font-size:13px;'>"+ item["name"]+"</span><br/><p style='display: block;font-size: 12px; color: red; padding-right:3px;text-align:center;'><a href='" + img.src + "' alt='点击查看原图'  target = '_blank' >请点击图片查看原图</a></p><div style='width: 200px; height:250px;'><a href='" + img.src + "' alt='点击查看原图'  target = '_blank' ><img style='padding:0;margin:0;border:0;width: 200px;" + css + "' alt='preview' src='" + img.src + "'/></a></div>";
        infoHtml = "<div style='width:200px;font-size:13px;'>"+item["desc"]+"</div>";
        tabs.push(new GInfoWindowTab("图片", imgHtml));
        tabs.push(new GInfoWindowTab("信息", infoHtml));
        marker.openInfoWindowTabsHtml(tabs);
        }
        else {
                  imgHtml = "<span style='font-size:13px;'>"+ item["name"]+"</span><br/><span style='display: block;font-size: 12px; color: red; padding-top:30px;text-align:center;'>图片加载失败</span><br/><a  style='display: block;font-size: 12px; color: blue; padding-top:30px;text-align:center;' target = '_blank' href='" + img.src + "'>查看原链接</a>";
        infoHtml = "<div style='width:200px;font-size:13px;'>"+item["desc"]+"</div>";
        tabs.push(new GInfoWindowTab("图片", imgHtml));
        tabs.push(new GInfoWindowTab("信息", infoHtml));
        marker.openInfoWindowTabsHtml(tabs);
        }
      }
    }

      }
      function highlightPos(marker, item, i){
        var url = "img/" + iconType0[item['type']];

        if(window.all)
        {
          $("item_all_" + window.idx).className = "over";
          window.all = false;
        }
        else if(lastTab != 0)
          $("item_" + item['type'] + "_" + i).className = "over";
        marker.setImage(url);
        if(!map.getBounds().contains(marker.point))
          map.panTo(marker.point);
      }
      function unhighlightPos(marker, item, i){
        var url = "img/" + iconType[item['type']];
        if(window.all)
        {
          $("item_all_" + window.idx).className = "";
          window.all = false;
        }
        else if(lastTab != 0)
          $("item_" + item['type'] + "_" + i).className = "";
        marker.setImage(url);
      }

    var types = ['all', 'Church', 'Cinema', 'Shop', 'Bar', 'KTV', 'Restaurant'];
    //var typeNames = ['全部', '基督教堂', '电影院线', '商场购物', '酒吧夜店', 'KTV欢唱', '酒店餐饮'];
    var typeNames = ['全部', '教堂', '影院', '商场', '酒吧', 'KTV', '餐饮'];
    var tabMap = [0, 2, 3, 4, 6, 5, 1];
    window.initInfo = {
      beijing:[0, 0, 0, 0, 0, 0, 0],
      shanghai:[0, 0, 0, 0, 0, 0, 0]
    };
    window.reqTab = 0;
    window.checking = false;
    
    window.hideCity = function(city)
    {
      if(cities[city].marker['all'])
      {
        for(var j = 0; j < cities[city].marker['all'].length; j ++)
        {
          cities[city].marker['all'][j].hide();
        }
      }
    }
    window.selectType = function(i)
    {
      
      $('listContainer').innerHTML = '<div class="hint-msg"><img src="' + base + 'loading.gif"/>&nbsp;loading...</div>';
      hideCity('beijing');
      hideCity('shanghai');
      $('tab_' + lastTab).className = "";
      if(cities[curCity].marker[types[lastTab]])
      {
        for(var j = 0; j < cities[curCity].marker[types[lastTab]].length; j ++)
        {
          cities[curCity].marker[types[lastTab]][j].hide();
        }
      }
      $('tab_' + i).className = "selected";
      lastTab = i;

      if(!cities[curCity].marker[types[lastTab]])
      {
        if((lastTab != 0) && (window.reqTab == 0))
        {
          if(initInfo[curCity][lastTab] == 0)
          {
            var url = "data/" + curCity + "_" + tabMap[i] + ".json";
            initInfo[curCity][lastTab] = 1;
            window.reqTab = lastTab;
            GDownloadUrl(url, onTypeData);
          }
          return;
        }
        else if(lastTab == 0)
        {
          checkLoading();
          return;
        }

      }
      else if(lastTab == 0)
      {
        window.checkLoading();
      }
      if((i != 0) && cities[curCity].html[types[i]])
        $('listContainer').innerHTML = cities[curCity].html[types[i]];

      if(cities[curCity].marker[types[lastTab]])
      {
        for(var j = 0; j < cities[curCity].marker[types[lastTab]].length; j ++)
        {
          cities[curCity].marker[types[lastTab]][j].show();
        }
      }
    }
    window.onTypeData = function(data)
    {
 
      var data = eval(data);
      if(!data) return;
      if(!cities[curCity].all)
      {
        cities[curCity]['all'] = [];
        cities[curCity].html['all'] = [];
        cities[curCity].marker['all'] = [];
      }

      cities[curCity][types[reqTab]] = data;
      cities[curCity].html[types[reqTab]] = [];
      cities[curCity].marker[types[reqTab]] = [];
      for(var i = 0; i < data.length; i ++)
      {
        var len = i;
        var type = types[reqTab];
        var item = data[i];
        item['type'] = types[reqTab];
        var g = item.g.split(",");
        item['lat'] = parseFloat(g[1]);
        item['lng'] = parseFloat(g[0]);
        item['name'] = item.n;
        item['image'] = item.i;
        item['desc'] = item.d;


        cities[curCity].html[item['type']] += "<li id=\"item_" + item['type'] + "_" + len + "\" " +
        "onclick=\"selectMarker('" + item['type'] + "', " + cities[curCity].marker[item['type']].length + ")\"" +
        "onmouseover=\"mouseOverList('" + item['type'] + "', " + cities[curCity].marker[item['type']].length + ")\"" +
        "onmouseout=\"mouseOutList('" + item['type'] + "', " + cities[curCity].marker[item['type']].length + ")\"" +
        ">" + item['name'] + "</li>";
        var point = new GLatLng(item["lat"], item["lng"]);
        var icon = new GIcon();
        icon.image = "img/" + iconType[item['type']];
        icon.iconSize = new GSize(36, 51);
        icon.iconAnchor = new GPoint(18, 51);
        icon.infoWindowAnchor = new GPoint(10, 6);

        var marker = new GMarker(point, {
          icon: icon,
          title: item["name"]
        });
        marker.point = point;
        map.addOverlay(marker);
        cities[curCity].marker[item['type']].push(marker);
        GEvent.addListener(marker, "click", GEvent.callbackArgs(this, openInfoWindow, marker, item, len));
        GEvent.addListener(marker, "mouseover", GEvent.callbackArgs(this,highlightPos, marker, item, len));
        GEvent.addListener(marker, "mouseout", GEvent.callbackArgs(this,unhighlightPos, marker, item, len));
        cities[curCity].html['all'] += "<li id=\"item_all_" + cities[curCity]['all'].length + "\"" +
        "onclick=\"selectMarker('all', " + cities[curCity].marker['all'].length + ")\"" +
        "onmouseover=\"mouseOverList('all', " + cities[curCity].marker['all'].length + ")\"" +
        "onmouseout=\"mouseOutList('all', " + cities[curCity].marker['all'].length + ")\"" +
        ">" + item['name'] + "</li>";
        cities[curCity]['all'].push(item);
        cities[curCity].marker['all'].push(marker);
      }
      cities[curCity].html[types[reqTab]] = "<ul id=\"ul_" + curCity + "_" + types[reqTab] + "\">" + cities[curCity].html[types[reqTab]] + "</ul>";
      cities[curCity].html['allul'] = "<ul id=\"ul_" + curCity + "_all\">" + cities[curCity].html['all'] + "</ul>";

      reqTab = 0;
      if(window.checking)
        window.checkLoading();
      else selectType(lastTab);
      
    }
    window.checkLoading = function()
    {
      window.checking = true;
      var con = $('listContainer');
      for(var i = 1; i < initInfo[curCity].length; i++)
      {
        if((window.reqTab == 0) && (initInfo[curCity][i] == 0))
        {
          var url = "data/" + curCity + "_" + tabMap[i] + ".json";
          initInfo[curCity][i] = 1;
          window.reqTab = i;
          GDownloadUrl(url, onTypeData);
          return false;
          break;
        }
      }
      if(cities[curCity].html['allul'] && lastTab == 0)
      con.innerHTML = cities[curCity].html['allul'];
      window.checking = false;
      return true;
    }
    window.selectCity = function(i)
    {
      var con = $('listContainer');
      con.innerHTML = '<div class="hint-msg"><img src="' + base + 'loading.gif"/>&nbsp;loading...</div>';
      $('city_' + curCity).className = "";
      if(cities[curCity].marker[types[lastTab]])
      {
        for(var j = 0; j < cities[curCity].marker[types[lastTab]].length; j ++)
        {
          cities[curCity].marker[types[lastTab]][j].hide();
        }
      }
      $('city_' + i).className = "selected";
      curCity = i;
      if(init)
      selectType(lastTab);
      map.setCenter(new GLatLng(cities[curCity].lat, cities[curCity].lng));
    }
    function initCity()
    {
      var root = $("cityList");
      root.innerHTML += "<a href=\"javascript:selectCity('beijing')\" title=\"" + cities['beijing'].name + "\" id=\"city_beijing\">" + cities['beijing'].name + "</a>";
      root.innerHTML += "<a href=\"javascript:selectCity('shanghai')\" title=\"" + cities['shanghai'].name + "\" id=\"city_shanghai\">" + cities['shanghai'].name + "</a>";
    }
    function initTabs()
    {
      var root = $('tabHead');
      for(var i = 0; i < types.length; i ++)
      {
        root.innerHTML += "<a href=\"javascript:selectType('" + i + "')\" title=\"" + typeNames[i] + "\" id=\"tab_" + i + "\">" + typeNames[i] + "</a>";
      }
      $('tab_0').className = "selected";
    }
    var cities =
    {
      beijing : {
        name:"北京",
        lat:39.9056,
        lng:116.3958,
        html: [],
        marker: []
      },
      shanghai : {
        name:"上海",
        lat:31.2222,
        lng:111.7409,
        html: [],
        marker: []
      }
    };
    var curCity = 'beijing';
    var map = new GMap2($("map"));
    map.setCenter(new GLatLng(cities[curCity].lat, cities[curCity].lng), 10);
    map.enableScrollWheelZoom();
    map.addControl(new GLargeMapControl());
    map.addControl(new GMapTypeControl());
    var icons = ['', 'medical.png', 'cinema.png', 'shoppingcart.png', 'bar.png', 'music.png', 'restaurant.png'];
    var icons0 = ['', 'medical0.png', 'cinema0.png', 'shoppingcart0.png', 'bar0.png', 'music0.png', 'restaurant0.png'];
    var iconType = {};
    var iconType0 = {};
    for(var i = 0; i < types.length; i ++)
    {
      iconType[types[i]] = icons[i];
      iconType0[types[i]] = icons0[i];
    }
 
    window.selectMarker = function(type, i)
    {
      GEvent.trigger(cities[curCity].marker[type][i], 'click');
    }
    window.mouseOverList = function(type, i)
    {
      if(type == 'all')
      {
        window.all = true;
        window.idx = i;
      }
      GEvent.trigger(cities[curCity].marker[type][i], 'mouseover');
    }
    window.mouseOutList = function(type, i)
    {
      if(type == 'all')
      {
        window.all = true;
        window.idx = i;
      }
      GEvent.trigger(cities[curCity].marker[type][i], 'mouseout');
    }
    var init = false;
    initCity();
    initTabs();
    var lastTab = 0;
    var page = 0;
    var limit = 20;
    selectCity('beijing');
    selectType(1);
    init = true;
    window.cities = cities;
    window.types = types;
    window.curCity = curCity;
    window.lastTab = lastTab;
    window.map = map;
    window.page = page;
    window.limit = limit;
    function initHeight()
    {
      var height = 0;
      if (window.innerHeight)
      {
        height = window.innerHeight;

      }
      else if ((document.body) && (document.body.clientHeight))
      {
        height = document.body.clientHeight;
      }
      /*
      if (document.documentElement  && document.documentElement.clientHeight &&
          document.documentElement.clientWidth)
      {
        height = document.documentElement.clientHeight;
      }
*/
      if(height < 200)
        height = 200;
      /* for margin */
      height -= 20;
      $('map').style.height = height;
      $('listContainer').style.height = height - 70;

      map.checkResize();

      map.setCenter(new GLatLng(cities[curCity].lat, cities[curCity].lng), 10);
    }
    window.onresize = initHeight;
    initHeight();
    var initSearchBar = function()
    {
      var search = $('quickSearch');
      var onclickSearch = function()
      {
        search = $('quickSearch');
        if(search.value == '请输入搜索的内容')
        {
          search.value = "";
        }
        search.style.color = "#000";
      }
      window.onSearch = function(event)
      {
        var search = $("quickSearch");
        var data = cities[curCity][types[lastTab]];
        var key = search.value;
        if(!key)
        {
          selectType(lastTab);
          return;
        }
        var str = "";
        hideCity('beijing');
        hideCity('shanghai');
 
        for(var i = 0; i < data.length; i++)
        {
          var item = data[i];
          var type = item['type'];
          if(lastTab == 0) type = 'all';
          if(item['name'].indexOf(key) != -1)
          {
            str += "<li id=\"item_" + type + "_" + i + "\" " +
            "onclick=\"selectMarker('" + type + "', " + i + ")\"" +
            "onmouseover=\"mouseOverList('" + type + "', " + i + ")\"" +
            "onmouseout=\"mouseOutList('" + type + "', " + i + ")\"" +
            ">" + item['name'] + "</li>";
            cities[curCity].marker[types[lastTab]][i].show();
          }
        }
        str = "<ul id=\"ul_" + curCity + "_" + types[lastTab] + "\">" + str + "</ul>";
        $('listContainer').innerHTML = str;
      }
      GEvent.addDomListener(search, "click", onclickSearch);
      GEvent.addDomListener(search, "keyup", window.onSearch);

      window.onSearchBlur = function(event)
      {
        var search = $('quickSearch');
        if(!search.value)
        {
          search.value = "请输入搜索的内容";
          search.style.color = "#999";
        }
      }

      GEvent.addDomListener(search, "blur", onSearchBlur);

    }
    initSearchBar();
  }
}
)();

