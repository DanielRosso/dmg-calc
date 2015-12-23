(function () {
    'use strict';

    angular
        .module('d3dps')
        .service('heroService', heroService);

    heroService.$inject = ['$http', '$q', 'urlService'];

    function heroService($http, $q, urlService) {
        var service = {
            getHeroModel: getHeroModel,
            calculateDPS: calculateDPS,
            loadHeroesData: loadHeroesData,
            loadHeroesData2: loadHeroesData2
        };

        return service;

        /////////////////

        //function getHeroModel(rawData, heroStats, items) {            
        function getHeroModel(data) {
            var rawData = data.data;
            var heroStats = data.data.stats;
            var items = data.data.items;
            
            //            durch alle items loopen. ich brauche von allen elemental dmg und so zeugs.$anchorScroll
            //            http://stackoverflow.com/questions/21024411/angular-q-how-to-chain-multiple-promises-within-and-after-a-for-loop

            var defer = $q.defer();
            var promises = [];

            function createHeroModel(e) {
                //model erstellen
                var items = [];
                var heroModel = {};

                angular.forEach(e, function (element) {
                    var itemModel = {};
                    itemModel.item = element.config.item;
                    itemModel.stats = element.data;
                    items.push(itemModel);
                });

                heroModel.stats = heroStats;
                heroModel.items = items;
                heroModel.rawData = e[0].config.rawData;

                defer.resolve(heroModel);
            }

            function loadItem(url, heroStats, item, rawData) {
                return $http.jsonp(url, {
                    //der zweite param wird im config obj gespeichert. welche das element ist von den einzelnen promises.
                    //siehe createHeroModel(e) e=element. damit behalte ich das urspürngliche item mit dem ergebniss zussammen
                    item: item,
                    heroStats: heroStats,
                    rawData: rawData
                });
            }

            angular.forEach(items, function (item, key) {
                var url = urlService.getUrlForItem(item.tooltipParams);
                item.slot = key;
                promises.push(loadItem(url, heroStats, item, rawData));
            });

            $q.all(promises).then(createHeroModel);

            return defer.promise;
        }

        function loadHeroesData2(heroList, battleNetTag) {
            return $q.all(heroList.map(loadHeroData2, battleNetTag))
                .then(function (result) {
                    var x = result;
                    var hero = hero;
                });
        }

        function loadHeroData2(hero) {
            var battleNetTag = this;
            var url = urlService.getUrlForHero(hero.id, battleNetTag);
            return $http.jsonp(url)
                .then(function (result) {
                    var itemList = [];
                    Object.keys(result.data.items).forEach(function (key) {
                        var item = {};
                        item.slot = key;
                        item.data = result.data.items[key];
                        itemList.push(item);
                    });

                    return $q.all(itemList.map(loadItemData2))
                });
        }
        
        /**
         * item objekt { slot: 'head', data: data}
         */
        function loadItemData2(item, index) {
            var url = urlService.getUrlForItem(item.data.tooltipParams);
            //der zweite param ist ein config obj.
            return $http.jsonp(url, {
                item: item,
            });
        }

        function loadHeroesData(heroList, battleNetTag) {
            var defer = $q.defer();
            var promises = [];

            function createHeroList(e) {
                var hero1 = {};
                hero1.dps = 100;

                var hero2 = {}
                hero2.dps = 200;

                var hero3 = {}
                hero2.dps = 300;


                var model = { hero1, hero2, hero3 };

                defer.resolve(model);
            }

            function loadHeroData(url) {
                return $http.jsonp(url)
                    .then(function (data) {
                        getHeroModel(data.data, data.data.stats, data.data.items)
                            .then(function (data) {
                                data.dps = calculateDPS(data);
                            });
                    });
            }

            angular.forEach(heroList, function (hero, index) {
                var url = urlService.getUrlForHero(hero.id, battleNetTag);
                promises.push(loadHeroData(url));
            });

            $q.all(promises).then(createHeroList);

            return defer.promise;
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

            angular.forEach(heroModel.items, function (e) {
                if (e.item.slot == "mainHand") {
                    averageWeaponDamage = e.stats.dps.min;
                }
            });
            //        DPS = (Sum Average Weapon Damage)*AS*(10*%Crit)*(10*%Crit Damage)
            dpsModel.Mainhand = averageWeaponDamage * attackSpeed * (10 * critChance) * (10 * critDamage);
        }

        function calculateElementalDmg(heroModel, dpsModel) {
            angular.forEach(heroModel.items, function (item) {
                angular.forEach(item.stats.attributesRaw, function (stat, key) {
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
    }
})();
