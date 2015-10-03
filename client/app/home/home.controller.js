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

        function loadHero(hero) {
            heroLoading = true;
            var url = urlService.getUrlForHero(hero.id, vm.battleNetTag);

            $http.jsonp(url)
                .then(function (data) {
                    heroLoading = false;
                    //vm.hero = [data.data];
                    vm.hero = data.data;
                    heroService.getHeroModel(vm.hero.stats, vm.hero.items)
                        .then(function (data) {
                            vm.heroModel = data;
                            vm.dps = heroService.calculateDPS(vm.heroModel);
                        });
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
                    vm.heroes = data.data.heroes;
                });
        }
    }
})();
