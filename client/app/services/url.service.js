(function() {
    'use strict';

    var profileUrl = 'https://eu.api.battle.net/d3/profile/';
    var dataUrl = 'https://eu.api.battle.net/d3/data/';
    var itemUrl = dataUrl + 'item/';
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
            var url = profileUrl + battleNetTag + '/?locale=' + locale + '&callback=JSON_CALLBACK&apikey=' + key;
            return url;
        }

        function getUrlForHero(heroId, battleNetTag) {
            var url = profileUrl + battleNetTag + '/hero/' + heroId + '?locale=' + locale + '&callback=JSON_CALLBACK&apikey=' + key;
            return url;
        }

        function getUrlForItem(item) {
            var url = itemUrl + item + '?locale=' + locale + '&callback=JSON_CALLBACK&apikey=' + key;
            return url;
        }
        //        item //        item/CogBCODkvJwMEgcIBBW-od50HcxWYkYdnAYAyx0WmWc7Hcr6vKAdaL0cYTCLHjj8AkAAUBJYBGD8AmorCgwIABC805a7gICAwCgSGwifsej6ChIHCAQVI5aumDCPEjgAQAFYBJABAIABRo0BXRXedKUBFplnO60Bnk-D3LUB_DpWg7gBvNrvBsABAxj8hvXNDlAAWAA
        //        http://eu.battle.net/api/d3/data/item/ClsI2fD64wYSBwgEFV-wsXod08wHYx1_jofMHZsGAMsddEWniR1-VrMuHcn6vKAwiwI4gQNAAFASWARggQOAAUalAXRFp4mtAZinjsC1AclbkqS4AfCax8ANwAEDGL7BjasPUABYAKABlZ3y4Q6gAZO9xvwFoAHMj4D3AaAB6oPokwagAb7BjasP?locale=es&fields=guild&jsoncallback=mostrarObjetoEspecificoPersonaje&jsonp=jQuery1110045150547521188855_1424977269867&callback=mostrarObjetoEspecificoPersonaje&_=1424977269873
        //
        //
        //        DPS = (Sum Average Weapon Damage)*AS*(1+%Crit)*(1+%Crit Damage)
        //        DPS = (Sum Average Weapon Damage)*AS*(10*%Crit)*(10*%Crit Damage)
        //
        //        2981,77 *  1,4* ( 10+ 49) * ( 1 + 403)

    }
})();
