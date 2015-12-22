/*
	Battle.net/Diablo III Tooltip Script

	Changelog:
	v1.1
		- Added support for follower skills
*/
if("undefined"==typeof Bnet)var Bnet={};"undefined"==typeof Bnet.D3&&(Bnet.D3={}),"undefined"==typeof Bnet.D3.Tooltips&&(Bnet.D3.Tooltips=new function(){function e(){D.documentReady(t)}function t(){setTimeout(n,1),setTimeout(o,1)}function n(){var e,t=document.getElementsByTagName("script"),n=t[t.length-1];n&&n.src.match(L)&&(e=RegExp.$1);var o=b.replace("{region}",e||"us");D.getStyle(o+"tooltips.css"),D.Browser.ie6&&D.getStyle(o+"tooltips-ie6.css")}function o(){D.bindEvent(document,"mouseover",function(e){var t=r(e);t&&i(t)}),D.bindEvent(document,"mouseout",function(e){var t=r(e);t&&a(t)})}function r(e){e=D.normalizeEvent(e);for(var t=e.target,n=0;t&&++n<=5;){if("A"==t.nodeName.toUpperCase())return t;t=t.parentNode}return null}function i(e){var t={};if(l(e,t),c(e,t),t.key&&w!=e){w=e,x=t;var n=d(t);null!=n&&p(n)}}function a(e){e==w&&(_.hide(),w=null,x=null)}function l(e,t){if(e.href.match(k))for(var n=RegExp.$1,o=RegExp.$2,r=RegExp.$3,i=0;i<S.length;++i){var a=S[i];if(r.match(a.regex)){var l=RegExp.$1,c=RegExp.$2;if(-1==l.indexOf("/")&&-1==c.indexOf("/")){t.region=n,t.locale=o,t.folder=l,t.key=c;for(var i in a.params)t[i]=a.params[i];return void(t.tooltipType=m(t.type))}}}}function c(e,t){}function u(e){var t=(E+e.tooltipType.url).replace("{region}",e.region).replace("{locale}",e.locale).replace("{folder}",e.folder).replace("{key}",e.key);D.getScript(t+"?format=jsonp")}function s(e){clearTimeout(y);var t=e.params;"item"==t.type&&(t.key=x.key),g(t,e),null!=x&&v(t)==v(x)&&p(e)}function d(e){var t=h(e);return null==t?(clearTimeout(y),y=setTimeout(f,B),u(e),null):t}function f(){null!=w&&_.show(w,'<div class="d3-tooltip"><div class="loading"></div></div>')}function p(e){null!=w&&_.show(w,e.tooltipHtml)}function m(e){return T[e]}function g(e,t){var n=v(e);H[n]=t}function h(e){var t=v(e);return H[t]}function v(e){return[e.region,e.locale,e.type,e.key].join("-")}var y,w,x,b="http://{region}.battle.net/d3/static/css/",E="http://{region}.battle.net/d3/{locale}/tooltip/",T={item:{type:"item",url:"item/{key}"},recipe:{type:"recipe",url:"recipe/{key}"},skill:{type:"skill",url:"skill/{folder}/{key}"},calculator:{type:"calculator",url:"calculator/{folder}/{key}"}},k=new RegExp("^http://([a-z]{2})\\.battle\\.net/d3/([a-z]{2})/(.+)"),L=new RegExp("([a-z]{2})\\.battle\\.net/d3/static/js/tooltips\\.js"),S=[{regex:new RegExp("^item/()([^#\\?]+)$"),params:{type:"item"}},{regex:new RegExp("^artisan/([^/]+)/recipe/([^#\\?]+)$"),params:{type:"recipe"}},{regex:new RegExp("^class/([^/]+)/active/([^#\\?]+)$"),params:{type:"skill"}},{regex:new RegExp("^class/([^/]+)/passive/([^#\\?]+)$"),params:{type:"skill"}},{regex:new RegExp("^follower/([^/]+)/skill/([^#]+)"),params:{type:"skill"}},{regex:new RegExp("^calculator/([^#]+)[#/](.+)"),params:{type:"calculator"}}],B=500,H={};this.registerData=s;var D={create:function(e){return document.createElement(e)},getScript:function(e){var t=D.create("script");t.type="text/javascript",t.src=e,document.body.appendChild(t)},getStyle:function(e){var t=D.create("link");t.rel="stylesheet",t.type="text/css",t.href=e,document.body.appendChild(t)},documentReady:function(e){if("complete"==document.readyState)return void e();var t=!1;D.bindEvent(document,"DOMContentLoaded",function(){t||(t=!0,e())}),D.bindEvent(document,"readystatechange",function(){"complete"!=document.readyState||t||(t=!0,e())})},bindEvent:function(e,t,n){e.addEventListener?e.addEventListener(t,n,!0):e.attachEvent("on"+t,n)},normalizeEvent:function(e){var t={};return t.target=e.target?e.target:e.srcElement,t.which=e.which?e.which:e.button,t},getWindowSize:function(){var e=0,t=0;return document.documentElement&&document.documentElement.clientHeight?(e=document.documentElement.clientWidth,t=document.documentElement.clientHeight):document.body&&document.body.clientHeight?(e=document.body.clientWidth,t=document.body.clientHeight):window.innerHeight&&(e=window.innerWidth,t=window.innerHeight),{w:e,h:t}},getScrollPosition:function(){var e=0,t=0;return window.pageXOffset||window.pageYOffset?(e=window.pageXOffset,t=window.pageYOffset):document.body&&(document.body.scrollLeft||document.body.scrollTop)?(e=document.body.scrollLeft,t=document.body.scrollTop):document.documentElement&&(document.documentElement.scrollLeft||document.documentElement.scrollTop)&&(e=document.documentElement.scrollLeft,t=document.documentElement.scrollTop),{x:e,y:t}},getOffset:function(e){for(var t=0,n=0;e;){t+=e.offsetLeft,n+=e.offsetTop;for(var o=e.parentNode;o&&o!=e.offsetParent&&o.offsetParent;){if(o.scrollLeft||o.scrollTop){t-=0|o.scrollLeft,n-=0|o.scrollTop;break}o=o.parentNode}e=e.offsetParent}return{x:t,y:n}},getViewport:function(){var e=D.getWindowSize(),t=D.getScrollPosition();return{l:t.x,t:t.y,r:t.x+e.w,b:t.y+e.h}}};D.Browser={},D.Browser.ie=!(!window.attachEvent||window.opera),D.Browser.ie6=D.Browser.ie&&-1!=navigator.userAgent.indexOf("MSIE 6.0");var _=new function(){function e(){r=D.create("div"),r.className="d3-tooltip-wrapper",i=D.create("div"),i.className="d3-tooltip-wrapper-inner",r.appendChild(i),document.body.appendChild(r),n()}function t(t,n){null==r&&e(),r.style.visibility="hidden",r.style.display="block",i.innerHTML=n;var l=D.getViewport(),c=D.getOffset(t),u=c.x+t.offsetWidth+a,s=c.y-r.offsetHeight-a;s<l.t&&(s=l.t),u+r.offsetWidth>l.r&&(u=c.x-r.offsetWidth-a),o(u,s)}function n(){null!=r&&(r.style.display="none")}function o(e,t){r.style.left=e+"px",r.style.top=t+"px",r.style.visibility="visible"}var r,i,a=5;this.show=t,this.hide=n};e()}),function(){"use strict";angular.module("d3dps",[])}(),function(){"use strict";function e(){function e(e){var t=e.split(/[#, ,-]/);return t[0]+"-"+t[1]}function t(e){var t="https://eu.api.battle.net/d3/profile/"+e+"/?locale=de_DE&callback=JSON_CALLBACK&apikey=4nzu76bj73zj76uzjgxu6repat4damdy";return t}function n(e,t){var n="http://eu.battle.net/api/d3/profile/"+t+"/hero/"+e+"?callback=JSON_CALLBACK";return n}function o(e){var t="http://eu.battle.net/api/d3/data/"+e+"?callback=JSON_CALLBACK";return t}var r={getUrlForHeroes:t,getUrlForHero:n,getUrlForItem:o,getBattleNetTag:e};return r}angular.module("d3dps").service("urlService",e)}(),function(){"use strict";function e(e,t,n){function o(o,r){function i(e){var t=[],n={};angular.forEach(e,function(e){var n={};n.item=e.config.item,n.stats=e.data,t.push(n)}),n.stats=o,n.items=t,l.resolve(n)}function a(t,n,o){return e.jsonp(t,{
//der zweite param wird im config obj gespeichert. damit behalte ich das urspürngliche item mit dem ergebniss zussammen
item:o,heroStats:n})}var l=t.defer(),c=[];return angular.forEach(r,function(e,t){var r=n.getUrlForItem(e.tooltipParams);e.slot=t,c.push(a(r,o,e))}),t.all(c).then(i),l.promise}function r(e){var t={Mainhand:0,Lightning:0,Cold:0,Holy:0,Arcane:0,Fire:0,Poison:0};return i(e,t),a(e,t),t}function i(e,t){var n,o=e.stats.attackSpeed,r=e.stats.critChance,i=e.stats.critDamage;angular.forEach(e.items,function(e){"mainHand"==e.item.slot&&(n=e.stats.dps.min)}),t.Mainhand=n*o*(10*r)*(10*i)}function a(e,t){angular.forEach(e.items,function(e){angular.forEach(e.stats.attributesRaw,function(e,n){0===n.indexOf("Damage_Dealt_Percent_Bonus#Lightning")?t.Lightning+=e.max:0===n.indexOf("Damage_Dealt_Percent_Bonus#Cold")?t.Cold+=e.max:0===n.indexOf("Damage_Dealt_Percent_Bonus#Holy")?t.Holy+=e.max:0===n.indexOf("Damage_Dealt_Percent_Bonus#Arcane")?t.Arcane+=e.max:0===n.indexOf("Damage_Dealt_Percent_Bonus#Fire")?t.Fire+=e.max:0===n.indexOf("Damage_Dealt_Percent_Bonus#Poison")&&(t.Poison+=e.max)})})}var l={getHeroModel:o,calculateDPS:r};return l}angular.module("d3dps").service("heroService",e),e.$inject=["$http","$q","urlService"]}(),function(){"use strict";function e(e,t,n,o,r){function i(e){return"http://eu.battle.net/d3/en/"+e}function a(e){return"http://media.blizzard.com/d3/icons/items/large/"+e+".png"}function l(){return f}function c(){return p}function u(e){p=!0;var n=o.getUrlForHero(e.id,d.battleNetTag);t.jsonp(n).then(function(e){p=!1,d.hero=e.data,r.getHeroModel(d.hero.stats,d.hero.items).then(function(e){d.heroModel=e,d.dps=r.calculateDPS(d.heroModel)})})}function s(){d.heroes=null,f=!0,null!==m&&void 0!==m&&(d.battleNetTag=m),null!==d.battleNetTag&&void 0!==d.battleNetTag&&(d.battleNetTag=o.getBattleNetTag(d.battleNetTag));var e=o.getUrlForHeroes(d.battleNetTag);t.jsonp(e).then(function(e){f=!1,d.heroes=e.data.heroes})}var d=this,f=!1,p=!1,m=n.search().battlenetTag;d.loadProfile=s,d.areHeroesLoading=l,d.isHeroLoading=c,d.loadHero=u,d.ImageUrl=a,d.TooltipUrl=i,d.dps={}}angular.module("d3dps").controller("Home",e),e.$inject=["$scope","$http","$location","urlService","heroService"]}(),function(){"use strict";function e(e){return{restrict:"A",link:function(t,n,o){t.isLoading=function(){return e.pendingRequests.length>0},t.$watch(t.isLoading,function(e){e?n.show():n.hide()})}}}angular.module("d3dps").directive("loading",["$http",e])}();