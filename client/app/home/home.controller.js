(function () {
    'use strict';

    angular
        .module('d3dps')
        .controller('Home', Home);

    Home.$inject = ['$scope', '$http', '$location', 'urlService', 'heroService'];

    function Home($scope, $http, $location, urlService, heroService) {
        var vm = this;
        var heroesLoading = false;
        var heroLoading = false;

        var battleNetTagFromUrl = $location.search().battlenetTag;
        vm.loadProfile = loadProfile;
        vm.areHeroesLoading = areHeroesLoading;
        vm.isHeroLoading = isHeroLoading;
        vm.loadHero = loadHero;
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
            var url = urlService.getUrlForHero(hero.id, vm.battleNetTag);

            //hier sollte anhand der hero id gesucht werden. hero.service sollte diese function bieten und direkt den hero zurückliefern
            $http.jsonp(url)
                .then(function (data) {
                    heroLoading = false;
                    //vm.hero = [data.data];
                    vm.currentHero = data.data;
                    loadHeroDataAndCalcDps(vm.currentHero.stats, vm.currentHero.items);
                    
                    /*
                    heroService.getHeroModel(vm.hero.stats, vm.hero.items)
                        .then(function (data) {
                            vm.heroModel = data;
                            vm.dps = heroService.calculateDPS(vm.heroModel);
                        });
                        */
                });

            var x = vm.heroes;
        }

        function loadHerosFromBnet() {
            angular.forEach(vm.heroes, function (hero, index) {
                heroService.getHeroModel(hero.stats, hero.items)
                    .then(function (data) {
                        hero.heroModel = data;
                        hero.heroModel.dps = heroService.calculateDPS(vm.heroModel);
                    });
            });
        }

        function loadHeroDataAndCalcDps(stats, items) {
            heroService.getHeroModel(stats, items)
                .then(function (data) {
                    vm.heroModel = data;
                    vm.heroModel.dps = heroService.calculateDPS(vm.heroModel);
                });
        }

        function loadProfile() {
            vm.heroes = null;
            heroesLoading = true;

            if (battleNetTagFromUrl !== null && battleNetTagFromUrl !== undefined) {
                vm.battleNetTag = battleNetTagFromUrl;
            }

            if (vm.battleNetTag !== null && vm.battleNetTag !== undefined) {
                vm.battleNetTag = urlService.getBattleNetTag(vm.battleNetTag);
            }

            var url = urlService.getUrlForHeroes(vm.battleNetTag);

            $http.jsonp(url)
                .then(function (data) {
                    heroesLoading = false;
                    //vm.heroes = data.data.heroes;
                    heroService.loadHeroesData(data.data.heroes, vm.battleNetTag)
                        .then(function (data) {
                            vm.heroes = data;
                        });
                    
                    ///todo heroservice sollte alle daten laden und ein vm.hereos object zurückgeben                    
                    //loadHerosFromBnet();
                });
        }
    }
})();
