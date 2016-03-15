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
