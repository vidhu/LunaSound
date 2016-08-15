(function () {
    'use strict'

    angular.module('LunaSound.Settings')
        .component('lastfmSettings', {
            templateUrl: 'components/settings/lastfm/lastfm.setting.template.html',
            controller: LastfmSettingsController
        });

    function LastfmSettingsController(Lastfm) {
        var ctrl = this;

        ctrl.lastfmName = function () {
            if (!Lastfm.Auth.isAuth()) {
                return null;
            }
            return Lastfm.Auth.getSession().name;
        };

        ctrl.isConnected = function () {
            return Lastfm.Auth.isAuth();
        };

        ctrl.login = function () {
            ctrl.loginError = '';
            Lastfm.Auth.getMobileSession(ctrl.username, ctrl.password)
            .then((response)=>{
                console.log(response);
            }).catch((err)=>{
                if(err.data.error == 4){
                    //Incorrect username password
                    ctrl.loginError = 'Incorrect username or password'
                }
            });
        };

        ctrl.logout = function () {
            Lastfm.Auth.deleteMobileSession();
        }
    }
})();