var c=null,e="http://chinamaps.googlecode.com/svn/mapplets/euro2008/",ba=e+"euro08_data",f=null,k=[0,1,2,3],q=[false,false,false,false,false],r=[null,null,null,null,null],ca=[true,true,false,false,false],u=new GMap2,v="",x="",z=null,da=new GLatLng(47.249407,11.447754),ea=true,A="div",B="br",C="1px",D="MSG_team_",F="8px",G="Verdana,Arial,Helvetica,Sans-Serif",H="filter_team",I="filter_stadium",J="filter_group",K="additional_element";function fa(){var a=c.blogs.ALL.blog_url+c.blogs.ALL.data_path;_IG_FetchContent(a,
function(b){if(b.search(/__DATA_AKPJCQ__(.*)__DATA_AKPJCQ__/)!=-1){b=RegExp.$1;f=L("("+b+")");ga(ea)}},{refreshInterval:180})}function ia(a){var b="http://news.google.com/news?hl="+M(MSG_lang)+"&ned="+M(MSG_lang)+"&q=uefa+euro+2008&ie=UTF-8&output=atom";_IG_FetchXmlContent(b,function(d){a(ja(d))})}function ja(a){var b=[],d=a.getElementsByTagName("entry");for(var h=0;h<P(d);h++){var g=d[h],i={},l=["title","content"];for(var j=0;j<P(l);++j)i[l[j]]=g.getElementsByTagName(l[j])[0].childNodes[0].nodeValue;
i.link=g.getElementsByTagName("link").href;b.push(i)}return b}function ka(a){if(!c){window.setTimeout(function(){ka(a)},100);return}var b=document.getElementById("news_div");b.innerHTML="";Q(b,R(B));var d=R("fieldset");S(d).borderColor="#d3d9c5";S(d).borderWidth=C;S(d).padding=F;var h=V(MSG_news+": "),g=R("b");Q(g,h);var i=R("legend");Q(i,g);Q(d,i);for(var l=0;l<P(a)&&l<5;l++){var j=R(A);j.innerHTML=a[l].content;S(j).borderBottom="solid 1px #d3d9c5";S(j).paddingBottom=F;S(j).paddingTop=F;Q(d,j)}Q(b,
d);_IG_AdjustIFrameHeight();window.setTimeout(function(){var m=b.getElementsByTagName("a");for(var n=0;n<P(m);++n){var o=m[n];if(o.href&&o.href.search("http://news.google.com")==0)o.target="news_window"}},0)}function la(){if(!c){window.setTimeout(la,100);return}ia(ka)}function ma(a){switch(a){case 0:return MSG_cat_title_teams;case 1:return MSG_cat_title_stadiums;case 2:return MSG_photos;case 3:return MSG_cat_title_bars_clubs;case 4:return MSG_wikipedia}return""}function na(a){var b=3,d=R(A);S(d).fontFamily=
G;S(d).fontSize="12px";S(d).width="577px";var h=R("img");h.src=e+"flag_"+a+"_"+W()+".png";S(h).width="455px";S(h).height="75px";Q(d,h);var g=R("h3");Q(g,V(MSG_squad_list+": "+L(D+a)));Q(d,g);var i=R("i"),l=R("p");Q(i,V(MSG_coach+": "+c.players[a].t));Q(l,i);var j={k:MSG_goalkeepers,d:MSG_defenders,m:MSG_midfielders,f:MSG_forwards},m={k:"#55820a",d:"#a0c02a",m:"#55820a",f:"#a0c02a"};for(var n in j){var o=R("b");Q(o,V(j[n]));Q(d,o);var s=R(A);S(s).borderColor=m[n];S(s).borderWidth=C;S(s).padding="5px";
S(s).borderStyle="solid";var p=R("table");p.width="100%";var t=R("tbody"),w=c.players[a][n],y=P(w);for(var i=0;i<Math.ceil(y/b);++i){var N=R("tr");for(var T=0;T<b;++T){var E=R("td"),O=i*b+T;if(O<y)Q(E,V(w[O]));else Q(E,V(" "));Q(N,E)}Q(t,N)}Q(p,t);Q(s,p);Q(d,s);Q(d,R(B))}var $=R("div"),U=R("a");U.href="http://www.kicker.de/em";U.target="_new";Q(U,V(MSG_copyright_kicker));Q($,U);Q(d,$);X($,"left");var aa=Y(true);X(aa,"right");S(aa).padding="3px";Q(d,aa);var ha=R(B);S(ha).clear="left";Q(d,ha);return d}
function oa(a,b){var d=pa(b),h=R(A);S(h).width="577px";Q(h,qa(d,b));var g=R("p");S(g).fontSize="12px";S(g).fontFamily=G;var i=R("a");i.href="http://www.kicker.de/em";i.target="_new";Q(i,V(MSG_copyright_kicker));Q(g,i);Q(h,g);return h}function ra(a){var b=c.teams[a],d=new GInfoWindowTab(MSG_squad_list,na(a)),h={};h[H]=a;var g=new GInfoWindowTab(MSG_matches,oa(b.name,h));b.marker.openInfoWindowTabs([d,g])}function sa(){ra(this.teamId)}function ta(a){return a=="zrh"||a=="bas"||a=="ber"||a=="gen"?"sui":
"aut"}function ua(a){var b=R(A);S(b).width="577px";S(b).minHeight="377px";S(b).fontFamily=G;S(b).fontSize="10px";var d=R("img");d.src=e+"flag_"+ta(a)+"_"+W()+".png";S(d).width="455px";S(d).height="75px";Q(b,d);Q(b,R(B));var h=R("b");Q(h,V(L("MSG_sta_"+a)));Q(b,h);var g=R(A);S(g).borderColor="#ccc";S(g).borderWidth=C;S(g).padding=F;S(g).borderStyle="solid";var i=R("table");i.bgColor="#F0F1F2";i.width="100%";var l=R("tbody"),j=R("tr"),m=R("td");S(m).padding="10px";var n=R("img");n.src=e+"sta_"+a+".png";
S(n).width="211px";S(n).height="141px";Q(m,n);Q(m,R(B));Q(m,V(MSG_copyright_photos));var o=[];o.push([MSG_capacity+": ",c.stadiums[a].cap]);o.push([MSG_covered_seats+": ",c.stadiums[a].seats_cov]);o.push([MSG_location+": ",L("MSG_hc_"+a)]);o.push([MSG_country+": ",L("MSG_team_"+ta(a))]);var s=R("td");S(s).padding="10px";for(var p=0;p<P(o);++p){var h=R("b");Q(h,V(o[p][0]));Q(s,h);Q(s,V(o[p][1]));Q(s,R(B))}Q(j,m);Q(j,s);Q(l,j);Q(i,l);Q(g,i);try{var t=L("MSG_iw_sta_"+a);t=t.replace(/&lt;/g,"<");t=t.replace(/&gt;/g,
">");var w=t.split("<br />");for(var p=0;p<P(w);++p){var y=R("p");y.innerHTML=w[p];Q(g,y)}var N="";N=a=="bas"||a=="gen"?MSG_copyright_stadiums2:MSG_copyright_stadiums1;Q(g,V(N))}catch(T){}Q(b,g);Q(b,R(B));var E=Y(true);X(E,"right");S(E).padding="3px";Q(b,E);var O=R(B);S(O).clear="left";Q(b,O);return b}function va(a){var b=c.stadiums[a],d=new GInfoWindowTab(MSG_information,ua(a)),h={};h[I]=a;var g=new GInfoWindowTab(MSG_matches,oa(b.name,h));b.marker.openInfoWindowTabs([d,g])}function wa(){va(this.stadiumId)}
function xa(a){var b=new GIcon(G_DEFAULT_ICON);b.image=e+"team_"+a+".png";b.shadow=e+"shadow.png";b.shadowSize=new GSize(52,47);b.infoShadowAnchor=new GPoint(10,40);b.iconSize=new GSize(33,47);b.iconAnchor=new GPoint(10,40);b.infoWindowAnchor=b.iconAnchor;b.imageMap=[0,1,29,1,32,17,28,19,18,17,8,17,12,35,15,40,13,45,8,45,5,42,6,39,8,36,5,20];return b}function ya(){var a=new GIcon(G_DEFAULT_ICON);a.image=e+"ball.png";a.shadow=null;a.iconSize=new GSize(43,37);a.iconAnchor=new GPoint(16,17);a.infoWindowAnchor=
a.iconAnchor;a.imageMap=[1,10,10,1,23,1,22,9,32,21,31,24,23,32,12,32,1,22];return a}function za(){var a=R(A);S(a).fontFamily=G;S(a).fontSize="11px";S(a).fontSizeAdjust="none";S(a).width="477px";Q(a,Aa());c.marker.marker.openInfoWindow(a,{disableGoogleLinks:true})}function ga(a){var b=new GLatLng(c.marker.pos.lat,c.marker.pos.lng),d=new GMarker(b,{icon:ya()});c.marker.marker=d;GEvent.addListener(d,"click",za);u.addOverlay(d);if(a)za()}function Ba(){var a=new GIcon(G_DEFAULT_ICON);a.image=e+"stadium.png";
a.shadow=null;a.iconSize=new GSize(64,30);a.iconAnchor=new GPoint(31,13);a.infoWindowAnchor=a.iconAnchor;a.imageMap=[31,1,40,1,61,9,59,14,50,20,27,27,9,22,3,17,3,14,0,11,10,7];return a}function Ca(){var a=[];for(var b in c.teams){var d=c.teams[b],h=new GLatLng(d.pos.lat,d.pos.lng),g=new GMarker(h,{icon:xa(b)});d.marker=g;g.teamId=b;GEvent.addListener(g,"click",sa);a.push(g)}return a}function Da(a){return[new GLayer(a)]}function Ea(){var a=[];for(var b in c.stadiums){var d=c.stadiums[b],h=new GLatLng(d.pos.lat,
d.pos.lng),g=new GMarker(h,{icon:Ba()});g.stadiumId=b;GEvent.addListener(g,"click",wa);d.marker=g;a.push(g)}return a}function Fa(a){switch(a){case 0:return Ca();case 1:return Ea();case 2:return Da("lmc:panoramio");case 3:return Da("lmc:bars_clubs");case 4:return Da("lmc:wikipedia_en")}return[]}function Z(a){var b=document.getElementById("cat_"+a);if(!b.checked)b.checked=true;if(q[a])return;if(!r[a])r[a]=Fa(a);for(var d=0;d<P(r[a]);d++)u.addOverlay(r[a][d]);q[a]=true}function Ga(a){var b=document.getElementById("cat_"+
a);if(b.checked)b.checked=false;if(!q[a])return;for(var d=0;d<P(r[a]);d++)u.removeOverlay(r[a][d]);q[a]=false}function Ha(){var a=this.value.split("_");if(P(a)!=2)return;var b=a[0],d=a[1];Ia(b,d)}function Ja(){var a=R(A),b=R("fieldset");S(b).borderColor="#a0c02a";S(b).borderWidth=C;S(b).padding=F;var d=R("select");d.onchange=Ha;var h=R("option");Q(h,V(MSG_select_location));Q(d,h);var g=R("optgroup");g.label=MSG_cat_title_teams;var i=[],l={};for(n in c.teams){var j=L(D+n);i.push(j);l[j]=n}i.sort();
for(var m=0;m<P(i);++m){var n=l[i[m]],o=R("option");Q(o,V(L(D+n)));o.value="team_"+n;Q(g,o)}Q(d,g);var s=R("optgroup");s.label=MSG_cat_title_stadiums;var p=[],t={};for(n in c.stadiums){var j=L("MSG_sta_"+n);p.push(j);t[j]=n}p.sort();for(var m=0;m<P(p);++m){var n=t[p[m]],o=R("option");Q(o,V(L("MSG_sta_"+n)));o.value="stadium_"+n;Q(s,o)}Q(d,s);var w=R("legend"),y=R("b");Q(y,V(MSG_zoom_into_location+": "));Q(w,y);Q(b,w);Q(b,d);Q(a,b);return a}function W(){if(MSG_lang=="de"||MSG_lang=="es"||MSG_lang==
"fr"||MSG_lang=="it"||MSG_lang=="nl"||MSG_lang=="ru")return MSG_lang;return"ALL"}function Ka(){var a=document.getElementById("controls"),b=R("img");S(b).width="158px";S(b).height="70px";b.src=e+"23days_logo_"+W()+".png";Q(a,b);var d=R("fieldset");S(d).borderColor="#ccc";S(d).borderWidth=C;S(d).padding="5px";Q(d,Y(false));Q(a,R(B));Q(a,d);var h=R("p"),g=R("i");Q(g,V(MSG_description_new+": "));Q(h,g);Q(a,h);var i=R("fieldset");S(i).borderColor="#55820a";S(i).borderWidth=C;S(i).padding="5px";var l=R("legend"),
j=R("b");Q(j,V(MSG_display_on_the_map+": "));Q(l,j);Q(i,l);var m=[R(A),R(A)];X(m[0],"left");X(m[1],"right");var n=[];for(g=0;g<P(k);g++){var o=R("input");o.type="checkbox";o.id="cat_"+k[g];o.catNr=k[g];o.onclick=function(){if(this.checked)Z(this.catNr);else Ga(this.catNr)};if(ca[g])n.push(k[g]);var s=V(ma(k[g])),p=R(B),t=k[g],w=t==0||t==1?0:1;Q(m[w],o);Q(m[w],s);Q(m[w],p)}Q(i,m[0]);Q(i,m[1]);Q(a,i);Q(a,R(B));Q(a,Ja());window.setTimeout(function(){for(var y=0;y<P(n);++y)Z(n[y])},0)}function La(a){var b=
document.location.search,d=b.indexOf(a+"=");if(d==-1)return"";var h=b.substr(d+P(a)+1,P(b)-d-P(a)-1);d=h.indexOf("&");if(d!=-1)h=h.substr(0,d);return h}function Ma(){if(z)Na();z=setInterval(Oa,100)}function Na(){if(z){clearInterval(z);z=null}}function Ia(a,b){if(a=="team")u.setZoom(9);else u.setZoom(16);switch(a){case "team":Z(0);ra(b);break;case "stadium":Z(1);va(b);break}}function Oa(){Na();var a=document.location.hash;if(P(a)>1){document.location.href=v+"#";a=a.replace("#","");var b=a.split("_");
if(P(b)>0)switch(b[0]){case "goto":P(b)==3&&Ia(b[1],b[2]);break}}Ma()}function Pa(a){if(!c||!c.stadiums||!c.stadiums[a]||!f){window.setTimeout(function(){Pa(a)},100);return}Ia("stadium",a);Z(2)}function _init(){u.setMapType(G_HYBRID_MAP);v=document.location.href;x=La("fid");var a=unescape(La("url")),b=a.split("#"),d=false;if(P(b)>1){var h=b[1].split("_");if(h[0]=="sta"&&P(h)==2){d=true;Pa(h[1])}}if(!d)u.setCenter(da,4);else ea=false;Ma();var g=M(MSG_lang),i=ba+".js";if(g=="cn")i=ba+"_cn.js";_IG_FetchContent(i,
function(l){c=L("("+l+")");Ka();_IG_AdjustIFrameHeight();fa()});la()}function pa(a){if(!a)a={};var b=[];for(var d=0;d<P(f.matches);d++){var h=f.matches[d];if(a[H]&&a[H]!=h.home&&a[H]!=h.away)continue;if(a[J]&&a[J]!=h.group)continue;if(a[I]&&a[I]!=h.stadium)continue;b.push(h)}return b}function Qa(a,b,d){if(!d)d={};var h=null;if(d[K])h=d[K];var g=R("tr");S(g).border="1px solid gray";for(var i=0;i<P(b);i++){var l=R("td");S(l).border="1px solid gray";if(h){var j=R(h);Q(j,b[i]);Q(l,j)}else Q(l,b[i]);Q(g,
l)}Q(a,g)}function Ra(a,b){var d=V(a);if(!x)return d;var h=v+"#goto_"+b,g=R("a");g.href=h;g.target=x;Q(g,d);return g}function Sa(a){if(!a||a=="")return V("");return Ra(L(D+a),"team_"+a)}function qa(a,b){if(!b)b={};var d=R(A);S(d).fontFamily=G;S(d).fontSize="11px";S(d).fontSizeAdjust="none";var h=R(A);S(h).borderColor="#ccc";S(h).borderWidth=C;S(h).padding=F;S(h).borderStyle="solid";var g=R("span");S(g).fontSize="14px";S(g).fontWeight="bold";var i=MSG_match_schedule;if(b[I])i=i+": "+L("MSG_sta_"+b[I]);
else if(b[J])i=i+": "+L("MSG_group_"+b[J]);else if(b[H])i=i+": "+L(D+b[H]);var l=R("b");Q(l,V(i));Q(d,l);Q(h,g);var j=R("table");S(j).border="0px";S(j).borderCollapse="collapse";S(j).width="100%";var m=R("tbody"),n=[V(MSG_grp),V(MSG_date),V(MSG_time),V(" "),V(" "),V(MSG_stadium),V(MSG_score)],o={};o[K]="b";Qa(m,n,o);for(var s=0;s<P(a);s++){var p=a[s],t=MSG_date_format;t=t.replace(/%YY/,p.date[2]);t=t.replace(/%MM/,p.date[1]);t=t.replace(/%DD/,p.date[0]);var w=MSG_time_format;w=w.replace(/%HH/,p.time[0]);
w=w.replace(/%MM/,p.time[1]);var y=[V(p.group),V(t),V(w),Sa(p.home),Sa(p.away),Ra(L("MSG_sta_"+p.stadium),"stadium_"+p.stadium),V(p.score)];Qa(m,y)}Q(j,m);Q(h,j);Q(d,h);return d}function Ta(a,b){var d=["","",MSG_matches_played_abbr,MSG_matches_won_abbr,MSG_matches_drawn_abbr,MSG_matches_lost_abbr,MSG_goals_for_abbr,MSG_goals_against_abbr,MSG_points_won_abbr];function h(l){var j=R("tr");S(j).border="1px solid gray";for(var m=0;m<P(l);++m){var n=R("td");Q(n,V(l[m]));Q(j,n)}Q(b,j)}h(d);for(var g=0;g<
P(a);++g){var i=a[g],d=[i.pos,L(D+i.team),i.p,i.w,i.d,i.l,i.gf,i.ga,i.pts];h(d)}}function Ua(){var a=R(A);X(a,"left");S(a).width="250px";var b={A:"#55820a",B:"#a0c02a",C:"#55820a",D:"#a0c02a"};for(var d in f.groups){var h=R("span");S(h).fontWeight="bold";Q(h,V(L("MSG_group_"+d)));Q(a,h);var g=R(A);S(g).borderColor=b[d];S(g).borderWidth=C;S(g).padding=F;S(g).borderStyle="solid";var i=R("table");S(i).border="0px";S(i).borderCollapse="collapse";S(i).width="100%";var l=R("tbody");Ta(f.groups[d],l);Q(i,
l);Q(g,i);Q(a,g);Q(a,R(B))}return a}function Va(){var a=R(A);X(a,"right");S(a).marginRight="5px";S(a).width="130px";var b=R("b");Q(b,V(MSG_legend+":"));Q(a,b);Q(a,R(B));var d=R(A);S(d).borderColor="#ccc";S(d).borderWidth=C;S(d).padding=F;S(d).borderStyle="solid";var h=["matches_played","matches_won","matches_drawn","matches_lost","goals_for","goals_against","points_won"];for(var g=0;g<P(h);++g){var i=h[g],b=R("b");Q(b,V(L("MSG_"+i+"_abbr")+": "));Q(d,b);Q(d,V(L("MSG_"+i)));Q(d,R(B))}Q(a,d);return a}
function M(a){return a=="ALL"?"en":a}function Y(a){var b=R(A);if(a){S(b).borderColor="#ccc";S(b).borderWidth=C;S(b).borderStyle="solid"}var d=R("a");d.href="http://maps.google.com/support/bin/answer.py?hl="+M(MSG_lang)+"&answer=68480";d.target="_new";Q(d,V(MSG_mymaps));Q(b,d);return b}function Aa(){var a=R(A);S(a).padding="5px";var b=R("h3");S(b).fontWeight="bold";Q(b,V(MSG_group_standings));Q(a,b);var d=R("table");S(d).border="0px";S(d).width="100%";var h=R("tbody"),g=R("tr"),i=R("td");Q(i,Ua());
var l=R("td");S(l).verticalAlign="top";Q(l,Va());Q(g,i);Q(g,l);Q(h,g);Q(d,h);Q(a,d);var j=R("div"),m=R("a");m.href="http://www.kicker.de/em";m.target="_new";Q(m,V(MSG_copyright_kicker));Q(j,m);X(j,"left");S(j).padding="3px";Q(a,j);var n=Y(true);X(n,"right");S(n).padding="3px";Q(a,n);var o=R(B);S(o).clear="left";Q(a,o);return a}function R(a){return document.createElement(a)}function V(a){return document.createTextNode(a)}function Q(a,b){a.appendChild(b)}function S(a){return a.style}function P(a){return a.length}
function L(a){return eval(a)}function X(a,b){if(a.style.styleFloat===undefined)a.style.cssFloat=b;else a.style.styleFloat=b};
