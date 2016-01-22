(function () {
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
            return $q.all(heroList.map(loadHeroData, battleNetTag)); //map: auf jedes item in der liste wird die funktion angewendet
        }

        function loadHeroData(hero) {
            var battleNetTag = this; //zweiter param von loadHeroesData
            var url = urlService.getUrlForHero(hero.id, battleNetTag);
            return $http.jsonp(url)
                .then(function (result) {
                    var itemList = [];
                                        
                    //braucht es weil result.items keine arraylist ist
                    Object.keys(result.data.items).forEach(function (key) {
                        var item = {};
                        item.slot = key;
                        item.data = result.data.items[key];
                        itemList.push(item);
                    });

                    return $q.all(itemList.map(loadItemData))
                        .then(function (itemlist) {
                            var hero = result.data;
                        
                            //die ganzen stats den items zuweisen
                            Object.keys(hero.items).forEach(function (key) {
                                for (var i = 0; i < itemlist.length; i++) {
                                    var item = itemlist[i];
                                    if (key == item.config.item.slot) {
                                        hero.items[key].stats = item.data;
                                        itemlist.splice(i, 1); //removen von liste
                                        break;
                                    }
                                }
                            });

                            hero.dpsModel = calculateDPS(hero);

                            return hero;
                        });
                });
        }

        function loadItemData(item, index) {
            var url = urlService.getUrlForItem(item.data.tooltipParams);
            //der zweite param ist ein config obj.
            return $http.jsonp(url, {
                item: item,
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

            angular.forEach(heroModel.items, function (value, key) {
                if (key == "mainHand") {
                    averageWeaponDamage = value.stats.dps.min;
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

        function HasNewData(heroArray, battleNetTag) {
            return $q.all(heroArray.map(loadLastUpdatedFromHeroProfile, battleNetTag)) //map: auf jedes item in der liste wird die funktion angewendet
                .then(function (result) {
                    // return result.every(e => e == true) // error wegen es6 anotation. mol luege!
                    return result.every(function (element) {
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
                .then(function (result) {
                    // compare last updated
                    if (hero["last-updated"] < result.data["last-updated"])
                        return true;
                    else
                        return false;
                })
        }
    }
})();
