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
