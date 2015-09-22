(function () {
    'use strict';

    angular
        .module('d3dps')
        .service('heroService', heroService);

    heroService.$inject = ['$http', '$q', 'urlService'];

    function heroService($http, $q, urlService) {
        var service = {
            getHeroModel: getHeroModel,
            calculateMaindHandDmg: calculateMaindHandDmg,
            calculateElementalDmg: calculateElementalDmg
        };

        return service;

        /////////////////

        function getHeroModel(heroStats, items) {

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
                defer.resolve(heroModel);
            }

            function loadItem(url, heroStats, item) {
                return $http.jsonp(url, {
                    //der zweite param wird im config obj gespeichert. damit behalte ich das urspürngliche item mit dem ergebniss zussammen
                    item: item,
                    heroStats: heroStats
                });
            }

            angular.forEach(items, function (item, key) {
                var url = urlService.getUrlForItem(item.tooltipParams);
                item.slot = key;
                promises.push(loadItem(url, heroStats, item));
            });

            $q.all(promises).then(createHeroModel);

            return defer.promise;
        }

        function calculateMaindHandDmg(heroModel) {
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
            var mainHandDmg = averageWeaponDamage * attackSpeed * (10 * critChance) * (10 * critDamage);
            return mainHandDmg;
        }

        function calculateElementalDmg(heroModel) {
            var elementalDmg = {
                Lightning: 0,
                Cold: 0,
                Holy: 0,
                Arcane: 0,
                Fire: 0,
                Poison: 0
            };
            angular.forEach(heroModel.items, function (item) {
                angular.forEach(item.stats.attributesRaw, function (stat, key) {
                    if (key.indexOf('Damage_Dealt_Percent_Bonus#Lightning') === 0) {
                        elementalDmg.Lightning += stat.max;
                    } else if (key.indexOf('Damage_Dealt_Percent_Bonus#Cold') === 0) {
                        elementalDmg.Cold += stat.max;
                    } else if (key.indexOf('Damage_Dealt_Percent_Bonus#Holy') === 0) {
                        elementalDmg.Holy += stat.max;
                    } else if (key.indexOf('Damage_Dealt_Percent_Bonus#Arcane') === 0) {
                        elementalDmg.Arcane += stat.max;
                    } else if (key.indexOf('Damage_Dealt_Percent_Bonus#Fire') === 0) {
                        elementalDmg.Fire += stat.max;
                    } else if (key.indexOf('Damage_Dealt_Percent_Bonus#Poison') === 0) {
                        elementalDmg.Poison += stat.max;
                    }
                });
            });

            return elementalDmg;
        }
    }
})();
