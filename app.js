/*
	Battle.net/Diablo III Tooltip Script

	Changelog:
	v1.1
		- Added support for follower skills
*/

if(typeof Bnet == 'undefined') var Bnet = {};
if(typeof Bnet.D3 == 'undefined') Bnet.D3 = {};

if(typeof Bnet.D3.Tooltips == 'undefined') Bnet.D3.Tooltips = new function() { // Reminder: Keep in sync with the equivalent code in d3.js

	var URL_CSS = 'http://{region}.battle.net/d3/static/css/';
	var URL_QUERY_BASE = 'http://{region}.battle.net/d3/{locale}/tooltip/';

	var TYPES = {
		item: {
			type: 'item',
			url: 'item/{key}'
		},
		recipe: {
			type: 'recipe',
			url: 'recipe/{key}'
		},
		skill: {
			type: 'skill',
			url: 'skill/{folder}/{key}'
		},
		calculator: {
			type: 'calculator',
			url: 'calculator/{folder}/{key}'
		}
	};

	/*
		Extract (region), (locale), and (rest) of the URL

		{region}.battle.net/d3/{locale}/{rest}
	*/
	var URL_PATTERN_BASE = new RegExp('^http://([a-z]{2})\\.battle\\.net/d3/([a-z]{2})/(.+)');
	var URL_PATTERN_SELF = new RegExp('([a-z]{2})\\.battle\\.net/d3/static/js/tooltips\\.js'); // Used to get region from the <script> tag

	/*
		Each regex below extracts a (folder) and (key).
	*/
	var URL_PATTERNS = [
		/*
		Notes:
			- Using [^#\\?]+ below to ignore URL parameters or hashes
		*/

		// item/{itemSlug}
		{
			regex: new RegExp('^item/()([^#\\?]+)$'),
			params: {
				type: 'item'
			}
		},
		// artisan/{artisanSlug}/recipe/{recipeSlug}
		{
			regex: new RegExp('^artisan/([^/]+)/recipe/([^#\\?]+)$'),
			params: {
				type: 'recipe'
			}
		},
		// class/{classSlug}/active/{skillSlug}
		{
			regex: new RegExp('^class/([^/]+)/active/([^#\\?]+)$'),
			params: {
				type: 'skill'
			}
		},
		// class/{classSlug}/passive/{skillSlug}
		{
			regex: new RegExp('^class/([^/]+)/passive/([^#\\?]+)$'),
			params: {
				type: 'skill'
			}
		},
		// follower/{followerSlug}/skill/{skillSlug}
		{
			regex: new RegExp('^follower/([^/]+)/skill/([^#]+)'),
			params: {
				type: 'skill'
			}
		},
		// calculator/{classSlug}#{build}
		{
			regex: new RegExp('^calculator/([^#]+)[#/](.+)'),
			params: {
				type: 'calculator'
			}
		}
	];

	var DELAY_LOADING = 500; // ms
	var dataCache = {};

	// State
	var loadingTimer;
	var currentLink;
	var currentParams;



	function construct() {
		$.documentReady(initialize);
	}

	function initialize() {
		setTimeout(getCss, 1);
		setTimeout(bindEvents, 1);
	}

	function getCss() {

		// Grab the region from the script URL
		var scripts = document.getElementsByTagName('script');
		var currentScript = scripts[scripts.length - 1];
		var scriptRegion;

		if(currentScript && currentScript.src.match(URL_PATTERN_SELF)) {
			scriptRegion = RegExp.$1;
		}

		var cssUrl = URL_CSS.replace('{region}', scriptRegion || 'us');

		$.getStyle(cssUrl + 'tooltips.css');
		if($.Browser.ie6) {
			$.getStyle(cssUrl + 'tooltips-ie6.css');
		}
	}

	function bindEvents() {

		$.bindEvent(document, 'mouseover', function(e) {

			var link = getLinkFromEvent(e);
			if(link) {
				linkMouseOver(link);
			}
		});

		$.bindEvent(document, 'mouseout', function(e) {

			var link = getLinkFromEvent(e);
			if(link) {
				linkMouseOut(link);
			}
		});
	}

	function getLinkFromEvent(e) {

		e = $.normalizeEvent(e);

		var target = e.target;
		var tries = 0;

		while(target && ++tries <= 5) {

			if(target.nodeName.toUpperCase() == 'A') {
				return target;
			}
			target = target.parentNode;
		}

		return null;
	}

	function linkMouseOver(link) {

		var params = {};

		parseUrl(link, params);
		parseOptions(link, params);

		if(!params.key || currentLink == link) {
			return;
		}

		currentLink = link;
		currentParams = params;

		var data = getTooltip(params);
		if(data != null) {
			showTooltip(data);
		}
	}

	function linkMouseOut(link) {

		if(link != currentLink) {
			return;
		}

		Tooltip.hide();

		currentLink = null;
		currentParams = null;
	}

	function parseUrl(link, params) {

		if(!link.href.match(URL_PATTERN_BASE)) {
			return;
		}

		var region = RegExp.$1;
		var locale = RegExp.$2;

		var rest = RegExp.$3;

		for(var i = 0; i < URL_PATTERNS.length; ++i) {

			var urlPattern = URL_PATTERNS[i];

			if(!rest.match(urlPattern.regex)) {
				continue;
			}

			var folder = RegExp.$1;
			var key = RegExp.$2;

			if(folder.indexOf('/') != -1 || key.indexOf('/') != -1) { // Folder and key shouldn't contain any slashes
				continue;
			}

			params.region = region;
			params.locale = locale;
			params.folder = folder;
			params.key = key;

			// Copy pattern's params
			for(var i in urlPattern.params) {
				params[i] = urlPattern.params[i];
			}

			params.tooltipType = getTooltipType(params.type);
			return;
		}
	}

	function parseOptions(link, params) {

		// TBD

	}

	function requestTooltip(params) {

		var url = (URL_QUERY_BASE + params.tooltipType.url)
			.replace('{region}', params.region)
			.replace('{locale}', params.locale)
			.replace('{folder}', params.folder)
			.replace('{key}',    params.key);

		$.getScript(url + '?format=jsonp');
	}

	function registerData(data) {

		clearTimeout(loadingTimer);

		var params = data.params;

		if(params.type == "item") {
			params.key = currentParams.key;
		}

		saveData(params, data);

		if(currentParams != null && getCacheKeyFromParams(params) == getCacheKeyFromParams(currentParams)) {
			showTooltip(data);
		}
	}

	function getTooltip(params) {

		var data = loadData(params);

		if(data == null) { // Fetch data if not already cached

			clearTimeout(loadingTimer);
			loadingTimer = setTimeout(showLoading, DELAY_LOADING);
			requestTooltip(params);
			return null;
		}

		return data;
	}

	function showLoading() {

		if(currentLink != null) {
			Tooltip.show(currentLink, '<div class="d3-tooltip"><div class="loading"></div></div>');
		}
	}

	function showTooltip(data) {

		if(currentLink != null) {
			Tooltip.show(currentLink, data.tooltipHtml);
		}
	}

	// Utilities
	function getTooltipType(type) {
		return TYPES[type];
	}

	function saveData(params, data) {

		var cacheKey = getCacheKeyFromParams(params);
		dataCache[cacheKey] = data;
	}

	function loadData(params) {

		var cacheKey = getCacheKeyFromParams(params);
		return dataCache[cacheKey];
	}

	function getCacheKeyFromParams(params) {
		return [
			params.region,
			params.locale,
			params.type,
			params.key
		].join('-');
	}

	// Public methods
	this.registerData = registerData;



	// HTML Helpers
	var $ = {

		create: function(nodeName) {
			return document.createElement(nodeName);
		},

		getScript: function(url) {

			var script = $.create('script');
			script.type = 'text/javascript';
			script.src = url;

			document.body.appendChild(script);
		},

		getStyle: function(url) {

			var link = $.create('link');
			link.rel = 'stylesheet';
			link.type = 'text/css';
			link.href = url;

			document.body.appendChild(link);
		},

		documentReady: function(callback) {

			if(document.readyState == 'complete') {
				callback();
				return;
			}

			var occurred = false;

			$.bindEvent(document, 'DOMContentLoaded', function() {

				if(!occurred) {
					occurred = true;
					callback();
				}
			});

			$.bindEvent(document, 'readystatechange', function() {

				if(document.readyState == 'complete' && !occurred) {
					occurred = true;
					callback();
				}
			});

		},

		bindEvent: function(node, eventType, callback) {
			if(node.addEventListener) {
				node.addEventListener(eventType, callback, true); // Must be true to work in Opera
			} else {
				node.attachEvent('on' + eventType, callback);
			}
		},

		normalizeEvent: function(e) {
			var ev = {};
			ev.target = (e.target ? e.target : e.srcElement);
			ev.which = (e.which ? e.which : e.button);
			return ev;
		},

		getWindowSize: function() {

			var w = 0;
			var h = 0;

			if(document.documentElement && document.documentElement.clientHeight) {
				w = document.documentElement.clientWidth;
				h = document.documentElement.clientHeight;
			} else if (document.body && document.body.clientHeight) {
				w = document.body.clientWidth;
				h = document.body.clientHeight;
			} else if(window.innerHeight) {
				w = window.innerWidth;
				h = window.innerHeight;
			}

			return {
				w: w,
				h: h
			};
		},

		getScrollPosition: function () {

			var x = 0;
			var y = 0;

			if(window.pageXOffset || window.pageYOffset) {
				x = window.pageXOffset;
				y = window.pageYOffset;
			} else if(document.body && (document.body.scrollLeft || document.body.scrollTop)) {
				x = document.body.scrollLeft;
				y = document.body.scrollTop;
			} else if(document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
				x = document.documentElement.scrollLeft;
				y = document.documentElement.scrollTop;
			}

			return {
				x: x,
				y: y
			};
		},

		getOffset: function(node) {

			var x = 0;
			var y = 0;

			while(node) {
				x += node.offsetLeft;
				y += node.offsetTop;

				var p = node.parentNode;

				while(p && p != node.offsetParent && p.offsetParent) {
					if(p.scrollLeft || p.scrollTop) {
						x -= (p.scrollLeft | 0);
						y -= (p.scrollTop | 0);
						break;
					}
					p = p.parentNode;
				}
				node = node.offsetParent;
			}

			return {
				x: x,
				y: y
			};
		},

		getViewport: function() {
			var windowSize = $.getWindowSize();
			var scroll = $.getScrollPosition();

			return {
				l: scroll.x,
				t: scroll.y,
				r: scroll.x + windowSize.w,
				b: scroll.y + windowSize.h
			};
		}
	};

	$.Browser = {};
	$.Browser.ie = !!(window.attachEvent && !window.opera);
	$.Browser.ie6 = $.Browser.ie && navigator.userAgent.indexOf("MSIE 6.0") != -1;



	// Helper class that handles displaying tooltips
	var Tooltip = new function() {

		var PADDING = 5;

		var tooltipWrapper;
		var tooltipContent;

		function initialize() {

			tooltipWrapper = $.create('div');
			tooltipWrapper.className = 'd3-tooltip-wrapper';

			tooltipContent = $.create('div');
			tooltipContent.className = 'd3-tooltip-wrapper-inner';

			tooltipWrapper.appendChild(tooltipContent);
			document.body.appendChild(tooltipWrapper);

			hide();
		}

		function show(node, html) {

			if(tooltipWrapper == null) {
				initialize();
			}

			tooltipWrapper.style.visibility = 'hidden';
			tooltipWrapper.style.display = 'block';
			tooltipContent.innerHTML = html;

			var viewport = $.getViewport();
			var offset = $.getOffset(node);

			var x = offset.x + node.offsetWidth + PADDING;
			var y = offset.y - tooltipWrapper.offsetHeight - PADDING;

			if(y < viewport.t) {
				y = viewport.t;
			}

			if(x + tooltipWrapper.offsetWidth > viewport.r) {
				x = offset.x - tooltipWrapper.offsetWidth - PADDING;
			}

			reveal(x, y);
		}

		function hide() {

			if(tooltipWrapper == null) {
				return;
			}

			tooltipWrapper.style.display = 'none';
		}

		function reveal(x, y) {

			tooltipWrapper.style.left = x + 'px';
			tooltipWrapper.style.top  = y + 'px';

			tooltipWrapper.style.visibility = 'visible';
		}

		// Public methods
		this.show = show;
		this.hide = hide;

	};

	construct();

};

(function() {
    'use strict';

    angular
        .module('d3dps', [])

        .config(function($httpProvider) {
            $httpProvider.interceptors.push('jsonpInterceptor');
        })
        .factory('jsonpInterceptor', function($timeout, $window, $q) {
            return {
                'request': function(config) {
                    if (config.method === 'JSONP') {
                        var callbackId = angular.callbacks.counter.toString(36);
                        config.callbackName = 'angular_callbacks_' + callbackId;
                        config.url = config.url.replace('JSON_CALLBACK', config.callbackName);

                        $timeout(function() {
                            $window[config.callbackName] = angular.callbacks['_' + callbackId];
                        }, 0, false);
                    }

                    return config;
                },

                'response': function(response) {
                    var config = response.config;
                    if (config.method === 'JSONP') {
                        delete $window[config.callbackName]; // cleanup
                    }

                    return response;
                },

                'responseError': function(rejection) {
                    var config = rejection.config;
                    if (config.method === 'JSONP') {
                        delete $window[config.callbackName]; // cleanup
                    }

                    return $q.reject(rejection);
                }
            };
        })

})();
(function() {
    'use strict';

    var profileUrl = 'https://eu.api.battle.net/d3/profile/';
    var dataUrl = 'https://eu.api.battle.net/d3/data/';
    var key = '4nzu76bj73zj76uzjgxu6repat4damdy';
    var locale = 'de_DE';

    angular
        .module('d3dps')
        .service('urlService', urlService);

    function urlService() {
        var service = {
            getUrlForHeroes: getUrlForHeroes,
            getUrlForHero: getUrlForHero,
            getUrlForItem: getUrlForItem,
            getBattleNetTag: getBattleNetTag
        };

        return service;


        /////////////////

        function getBattleNetTag(searchQuery) {
            var qry = searchQuery.split(/[#, ,-]/);
            return qry[0] + "-" + qry[1];
        }

        function getUrlForHeroes(battleNetTag) {
            var url = profileUrl + battleNetTag + '/?locale=' + locale + '&apikey=' + key;
            return url;
        }

        function getUrlForHero(heroId, battleNetTag) {
            var url = profileUrl + battleNetTag + '/hero/' + heroId + '?locale=' + locale + '&apikey=' + key;
            return url;
        }

        function getUrlForItem(item) {
            var url = dataUrl + item.data.tooltipParams + '?locale=' + locale + '&apikey=' + key;
            return url;
        }
    }
})();

(function() {
    'use strict';

    angular
        .module('d3dps')
        .service('heroService', heroService);

    heroService.$inject = ['$http', '$q', 'urlService'];

    function heroService($http, $q, urlService) {
        var service = {
            loadHeroesData: loadHeroesData,
            HasNewData: HasNewData
        };

        return service;

        /////////////////
        function loadHeroesData(heroList, battleNetTag) {
            return $q.all(heroList.map(loadHeroData, battleNetTag))
        }

        function loadHeroData(hero) {
            var battleNetTag = this; //zweiter param von loadHeroesData
            var url = urlService.getUrlForHero(hero.id, battleNetTag);

            return $http.get(url)
                .success(function(data) {
                    var itemList = [];

                    //braucht es weil data.items keine arraylist ist
                    Object.keys(data.items).forEach(function(key) {
                        var item = {};
                        item.slot = key;
                        item.data = data.items[key];
                        item.hero = data;
                        itemList.push(item);
                    });

                    return $q.all(itemList.map(loadItemData))
                        .then(function(data) {
                            // im config obj is der aktuelle hero gespeichert
                            var hero = data[0].config.item.hero;
                            var itemlist = data;
                            //die ganzen stats den items zuweisen
                            Object.keys(hero.items).forEach(function(key) {
                                for (var i = 0; i < itemlist.length; i++) {
                                    var item = itemlist[i];
                                    if (key == item.config.item.slot) {
                                        hero.items[key].stats = item.data;
                                        itemlist.splice(i, 1); //removen von liste
                                        break;
                                    }
                                }
                            });

                            var date = new Date(1970, 0, 1);
                            date.setSeconds(hero["last-updated"]);
                            //direkt in lastUpdate geht nicht weil es sekunden und nicht ms sind
                            hero.lastUpdate = date;

                            hero.dpsModel = calculateDPS(hero);

                            return hero;
                        });
                });
        }

        function loadItemData(item) {
            var url = urlService.getUrlForItem(item);

            return $http.get(url, {
                item: item
            });
        }

        function calculateDPS(heroModel) {
            var dpsModel = {
                Mainhand: 0,
                Lightning: 0,
                Cold: 0,
                Holy: 0,
                Arcane: 0,
                Fire: 0,
                Poison: 0
            };

            calculateMaindHandDmg(heroModel, dpsModel);
            calculateElementalDmg(heroModel, dpsModel)
            return dpsModel;
        }

        function calculateMaindHandDmg(heroModel, dpsModel) {
            var averageWeaponDamage;
            var attackSpeed = heroModel.stats.attackSpeed;
            var critChance = heroModel.stats.critChance;
            var critDamage = heroModel.stats.critDamage;

            angular.forEach(heroModel.items, function(value, key) {
                if (key == "mainHand") {
                    averageWeaponDamage = value.stats.dps.min;
                }
            });
            //        DPS = (Sum Average Weapon Damage)*AS*(10*%Crit)*(10*%Crit Damage)
            dpsModel.Mainhand = averageWeaponDamage * attackSpeed * (10 * critChance) * (10 * critDamage);
        }

        function calculateElementalDmg(heroModel, dpsModel) {
            angular.forEach(heroModel.items, function(item) {
                angular.forEach(item.stats.attributesRaw, function(stat, key) {
                    if (key.indexOf('Damage_Dealt_Percent_Bonus#Lightning') === 0) {
                        dpsModel.Lightning += stat.max;
                    } else if (key.indexOf('Damage_Dealt_Percent_Bonus#Cold') === 0) {
                        dpsModel.Cold += stat.max;
                    } else if (key.indexOf('Damage_Dealt_Percent_Bonus#Holy') === 0) {
                        dpsModel.Holy += stat.max;
                    } else if (key.indexOf('Damage_Dealt_Percent_Bonus#Arcane') === 0) {
                        dpsModel.Arcane += stat.max;
                    } else if (key.indexOf('Damage_Dealt_Percent_Bonus#Fire') === 0) {
                        dpsModel.Fire += stat.max;
                    } else if (key.indexOf('Damage_Dealt_Percent_Bonus#Poison') === 0) {
                        dpsModel.Poison += stat.max;
                    }
                });
            });

        }

        function HasNewData(heroArray, battleNetTag) {
            return $q.all(heroArray.map(loadLastUpdatedFromHeroProfile, battleNetTag)) //map: auf jedes item in der liste wird die funktion angewendet
                .then(function(result) {
                    // return result.every(e => e == true) // error wegen es6 anotation. mol luege!
                    return result.every(function(element) {
                        if (element)
                            return true;
                        return false;
                    })
                });
        }

        function loadLastUpdatedFromHeroProfile(hero) {
            var battleNetTag = this; //zweiter param des aufrufs
            var url = urlService.getUrlForHero(hero.id, battleNetTag);
            return $http.jsonp(url)
                .then(function(result) {
                    // compare last updated
                    if (hero["last-updated"] < result.data["last-updated"])
                        return true;
                    else
                        return false;
                })
        }
    }
})();

(function() {
    'use strict';

    angular
        .module('d3dps')
        .controller('Home', Home);

    Home.$inject = ['$scope', '$http', '$interval', '$location', 'urlService', 'heroService'];

    function Home($scope, $http, $interval, $location, urlService, heroService) {
        var vm = this;
        var heroesLoading = false;
        var heroLoading = false;
        vm.heroes = null;
        vm.hasNewData = false;
        vm.loadProfile = loadProfile;
        vm.areHeroesLoading = areHeroesLoading;
        vm.isHeroLoading = isHeroLoading;
        vm.loadHero = loadHero;
        vm.newUpdates = newUpdates;
        vm.ImageUrl = ImageUrl;
        vm.TooltipUrl = TooltipUrl;
        vm.dps = {};

        function TooltipUrl(tooltip) {
            return 'http://eu.battle.net/d3/en/' + tooltip;
        }

        function ImageUrl(itemId) {
            return 'http://media.blizzard.com/d3/icons/items/large/' + itemId + '.png';
        }

        function areHeroesLoading() {
            return heroesLoading;
        }

        function isHeroLoading() {
            return heroLoading;
        }

        /**
         * this is called when a hero portrait is selected
         */
        function loadHero(hero) {
            heroLoading = true;
            for (var i = 0; i < vm.heroes.length; i++) {
                if (hero.data.id == vm.heroes[i].data.id)
                    vm.currentHero = vm.heroes[i].data;
            }
        }

        /**
         * this is called the first time to load all hero data from this bnet profile
         */
        function loadProfile() {
            heroesLoading = true;

            if (vm.battleNetTag !== null && vm.battleNetTag !== undefined) {
                vm.battleNetTag = urlService.getBattleNetTag(vm.battleNetTag);
            }

            var url = urlService.getUrlForHeroes(vm.battleNetTag);

            $http.get(url)
                .success(function(data) {
                    heroService.loadHeroesData(data.heroes, vm.battleNetTag)
                        .then(function(data) {
                            vm.heroes = data;
                            heroesLoading = false;
                        });
                });
        };

        $interval(checkForUpdates, 60000)

        function checkForUpdates() {
            if (vm.heroes != null) {
                heroService.HasNewData(vm.heroes, vm.battleNetTag)
                    .then(function(result) { // bool
                        vm.hasNewData = result;
                        console.log('von new data result: ' + result);
                    });
            }
        };

        function newUpdates() {
            return vm.hasNewData;
        };
    }
})();

(function () {
    'use strict'

    angular
        .module('d3dps')
        .directive('loading', ['$http', loadingAnimation]);

    function loadingAnimation($http) {
        return {
            restrict: 'A',
            link: function (scope, elm, attrs) {

                scope.isLoading = function () {
                    return $http.pendingRequests.length > 0;
                };

                scope.$watch(scope.isLoading, function (v) {
                    if (v) {
                        elm.show();
                    } else {
                        elm.hide();
                    }
                });
            }
        };
    }
})();
