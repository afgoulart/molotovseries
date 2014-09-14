(function() {
    'use strict';
    window.appversion = '0.1';
    window.online = true;
    window.vbase = '0.1';
    window.molotov = angular.module('Molotov', ['ngRoute', 'mongolabResourceHttp', 'ng-isotope', 'facebook']);
    window.molotov.config(function($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'app/views/home3.html'
            })
            .when('/all', {
                templateUrl: 'app/views/home.html'
            })
            .when('/casting/:id', {
                templateUrl: 'app/views/cast.html'
            })
            .when('/serie/:id', {
                templateUrl: 'app/views/serie.html'
            })
            .when('/seriebycat/:id', {
                templateUrl: 'app/views/seriebycat.html'
            })
            .when('/show/:id', {
                templateUrl: 'app/views/show.html'
            })
            .when('/calendar', {
                templateUrl: 'app/views/calendar.html'
            })
            .otherwise({
                redirectTo: '/'
            });
        // $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix('!');
        /**/

    });
    window.molotov.config(function(FacebookProvider) {
        // console.log('location.hostname', location.hostname);
        // FacebookProvider.init('1501693240076943');
        FacebookProvider.init('1501692520077015');
    });
    window.molotov.constant('MONGOLAB_CONFIG', {
        API_KEY: 'F1Fk9-FjLLrA4c62rbTuCDmgkGg0sE4A',
        DB_NAME: 'molotovseries'
    });
    window.molotov.factory('Series', function($mongolabResourceHttp) {
        return $mongolabResourceHttp('series');
    });
    window.molotov.factory('Casting', function($mongolabResourceHttp) {
        return $mongolabResourceHttp('casting');
    });
    window.molotov.filter('trusted', ['$sce',
        function($sce) {
            return function(url) {
                return $sce.trustAsResourceUrl(url);
            };
        }
    ]);
    window.molotov.controller('MolotovController', ['$scope', '$http', '$routeParams', 'Series', 'Casting', 'Facebook',
        function($scope, $http, $routeParams, Series, Casting, Facebook) {
            $scope.series = [];
            $scope.load = true;
            /**/
            $scope.getAll = function() {
                $scope.load = true;
                // if (window.localStorage[window.vbase + '_ms_ss'] !== undefined) {
                //     $scope.series = JSON.parse(window.localStorage[window.vbase + 'ms_ss']);
                //     $scope.load = false;
                // } else {
                Series.all({
                    fields: {
                        "title": 1,
                        "hashid": 1,
                        "img": 1
                    },
                    sort: {
                        // "title": 1
                    }
                }).then(function(series) {
                    // console.log( === undefined ? );
                    $scope.series = series;
                    // window.localStorage[window.vbase + '_ms_ss'] = JSON.stringify($scope.series);
                    $scope.load = false;
                });
                // }
            };

            $scope.getbirthday = function(year) {
                var d = (new Date().getMonth() + 1) + '-' + new Date().getDate();
                if (window.localStorage[window.vbase + '_ms_bd'] !== undefined) {
                    $scope.currentbirthday = JSON.parse(window.localStorage[window.vbase + '_ms_bd']);
                    $scope.load = false;
                } else {

                    Casting.query({
                        "nascimentodt": d
                    }).then(function(birthday) {
                        $scope.currentbirthday = birthday;
                        window.localStorage[window.vbase + '_ms_bd'] = JSON.stringify($scope.currentbirthday);
                        $scope.load = false;
                    });
                }

            };
            $scope.getseriebycat = function(c) {
                $scope.load = true;
                if (c !== undefined) {
                    $scope.cat = c;
                } else {
                    $scope.cat = $routeParams.id;
                }
                Series.query({
                    "info.categorias": $scope.cat
                }, {
                    fields: {
                        "title": 1,
                        "hashid": 1,
                        "img": 1,
                        "ano": 1
                    },
                    sort: {
                        "ano": -1
                    }
                }).then(function(series) {
                    $scope.seriebycat = series;
                    // window.localStorage[window.vbase + '_ms_sy'] = JSON.stringify($scope.currentseries);
                    $scope.load = false;
                });
            };

            $scope.getseriebyyear = function(year) {
                $scope.load = true;
                console.log($routeParams.id);
                if (window.localStorage[window.vbase + '_ms_sy'] !== undefined) {
                    $scope.currentseries = JSON.parse(window.localStorage[window.vbase + '_ms_sy']);
                    $scope.load = false;
                } else {
                    Series.query({
                        "ano": year
                    }).then(function(series) {
                        $scope.currentseries = series;
                        // window.localStorage[window.vbase + '_ms_sy'] = JSON.stringify($scope.currentseries);
                        $scope.load = false;
                    });
                }
                try {

                    FB.XFBML.parse();
                } catch (e) {}
            };

            $scope.getserie = function() {
                $scope.load = true;
                console.log($routeParams.id);
                if (window.localStorage[window.vbase + '_' + $routeParams.id] !== undefined) {
                    $scope.serie = JSON.parse(window.localStorage[$routeParams.id]);
                    $scope.load = false;
                }
                Series.getById($routeParams.id).then(function(serie) {
                    $scope.serie = serie;
                    // window.localStorage[window.vbase + '_' + $routeParams.id] = JSON.stringify($scope.serie);
                    $scope.load = false;
                });
                FB.XFBML.parse();
            };
            $scope.getSeriesByCast = function(hash) {
                alert(hash);
            };

            $scope.getcast = function() {
                $scope.load = true;
                $scope.casthashid = $routeParams.id;
                Casting.query({
                    "hashid": $scope.casthashid
                }).then(function(cast) {
                    if (cast.length !== 0) {
                        $scope.cast = cast[0];
                        Series.query({
                            "info.casting.hashid": $scope.cast.hashid
                        }, {
                            fields: {
                                "title": 1,
                                "hashid": 1,
                                "img": 1
                            }
                        }).then(function(series) {
                            $scope.cast.series = series;
                        });
                        // window.localStorage[window.vbase + '_' + $routeParams.id] = JSON.stringify($scope.cast);
                        $scope.load = false;
                    } else {
                        window.location = './';
                    }
                });
                try {

                    FB.XFBML.parse();
                } catch (e) {}
            };

            $scope.showepisode = function() {
                $scope.load = true;

                var k = getParam('k');
                var id = getParam('i');
                var p = getParam('p');
                console.log(k);
                Series.getById($routeParams.id).then(function(serie) {
                    $scope.serie = serie;
                    $scope.load = false;
                    var PLAYERS = {
                        dp: "http://dropvideo.com/embed/{{id}}/",
                        vdm: "http://vidto.me/embed-{{id}}-1280x720.html",
                        amv: "http://allmyvideos.net/embed-{{id}}.html"
                    };
                    $scope.serie.currentlink = PLAYERS[p].replace("{{id}}", k);
                });
            };

            $scope.loadoff = function() {
                $scope.load = false;
            }

            /*FACEBOOK*/
            $scope.loginStatus = 'disconnected';
            $scope.facebookIsReady = false;
            $scope.user = null;

            $scope.login = function() {
                Facebook.login(function(response) {
                    $scope.loginStatus = response.status;
                });
            };
            $scope.logout = function() {
                Facebook.logout(function(response) {
                    $scope.loginStatus = response.status;
                });
            };

            $scope.removeAuth = function() {
                Facebook.api({
                    method: 'Auth.revokeAuthorization'
                }, function(response) {
                    Facebook.getLoginStatus(function(response) {
                        $scope.loginStatus = response.status;
                    });
                });
            };

            $scope.api = function() {
                Facebook.api('/me', function(response) {
                    $scope.user = response;
                });
            };

            $scope.$watch(function() {
                return Facebook.isReady();
            }, function(newVal) {
                if (newVal) {
                    $scope.facebookIsReady = true;
                }
            });
        }
    ]);

    window.molotov.directive(
        "bnLazySrc",
        function($window, $document) {
            var lazyLoader = (function() {
                var images = [];
                var renderTimer = null;
                var renderDelay = 100;
                var win = $($window);
                var doc = $document;
                var documentHeight = doc.height();
                var documentTimer = null;
                var documentDelay = 2000;
                var isWatchingWindow = false;

                function addImage(image) {
                    images.push(image);
                    if (!renderTimer) {
                        startRenderTimer();
                    }
                    if (!isWatchingWindow) {
                        startWatchingWindow();
                    }
                }

                function removeImage(image) {
                    // Remove the given image from the render queue.
                    for (var i = 0; i < images.length; i++) {
                        if (images[i] === image) {
                            images.splice(i, 1);
                            break;
                        }
                    }
                    if (!images.length) {
                        clearRenderTimer();
                        stopWatchingWindow();
                    }
                }

                function checkDocumentHeight() {
                    if (renderTimer) {
                        return;
                    }
                    var currentDocumentHeight = doc.height();
                    if (currentDocumentHeight === documentHeight) {
                        return;
                    }
                    documentHeight = currentDocumentHeight;
                    startRenderTimer();
                }

                function checkImages() {
                    var visible = [];
                    var hidden = [];
                    var windowHeight = win.height();
                    var scrollTop = win.scrollTop();
                    var topFoldOffset = scrollTop;
                    var bottomFoldOffset = (topFoldOffset + windowHeight);
                    for (var i = 0; i < images.length; i++) {
                        var image = images[i];
                        if (image.isVisible(topFoldOffset, bottomFoldOffset)) {
                            visible.push(image);
                        } else {
                            hidden.push(image);
                        }
                    }
                    for (var i = 0; i < visible.length; i++) {
                        visible[i].render();
                    }
                    images = hidden;
                    clearRenderTimer();
                    if (!images.length) {
                        stopWatchingWindow();
                    }
                }

                function clearRenderTimer() {
                    clearTimeout(renderTimer);
                    renderTimer = null;
                }

                function startRenderTimer() {
                    renderTimer = setTimeout(checkImages, renderDelay);
                }

                function startWatchingWindow() {
                    isWatchingWindow = true;
                    win.on("resize.bnLazySrc", windowChanged);
                    win.on("scroll.bnLazySrc", windowChanged);
                    documentTimer = setInterval(checkDocumentHeight, documentDelay);
                }

                function stopWatchingWindow() {
                    isWatchingWindow = false;
                    win.off("resize.bnLazySrc");
                    win.off("scroll.bnLazySrc");
                    clearInterval(documentTimer);
                }

                function windowChanged() {
                    if (!renderTimer) {
                        startRenderTimer();
                    }
                }
                return ({
                    addImage: addImage,
                    removeImage: removeImage
                });
            })();

            function LazyImage(element) {
                var source = null;
                var isRendered = false;
                var height = null;

                function isVisible(topFoldOffset, bottomFoldOffset) {
                    if (!element.is(":visible")) {
                        return (false);
                    }
                    if (height === null) {
                        height = element.height();
                    }
                    var top = element.offset().top;
                    var bottom = (top + height);
                    return (
                        (
                            (top <= bottomFoldOffset) &&
                            (top >= topFoldOffset)
                        ) ||
                        (
                            (bottom <= bottomFoldOffset) &&
                            (bottom >= topFoldOffset)
                        ) ||
                        (
                            (top <= topFoldOffset) &&
                            (bottom >= bottomFoldOffset)
                        )
                    );
                }

                function render() {
                    isRendered = true;
                    renderSource();
                }

                function setSource(newSource) {
                    source = newSource;
                    if (isRendered) {
                        renderSource();
                    }
                }

                function renderSource() {
                    element[0].src = source;
                }
                return ({
                    isVisible: isVisible,
                    render: render,
                    setSource: setSource
                });
            }

            function link($scope, element, attributes) {
                var lazyImage = new LazyImage(element);
                lazyLoader.addImage(lazyImage);
                attributes.$observe(
                    "bnLazySrc",
                    function(newSource) {
                        lazyImage.setSource(newSource);
                    }
                );
                $scope.$on(
                    "$destroy",
                    function() {
                        lazyLoader.removeImage(lazyImage);
                    }
                );
            }
            return ({
                link: link,
                restrict: "A"
            });
        }
    );
})();

function convertImgToBase64(url, callback, outputFormat) {
    var canvas = document.createElement('CANVAS');
    var ctx = canvas.getContext('2d');
    var img = new Image;
    img.crossOrigin = 'Anonymous';
    img.onload = function() {
        canvas.height = img.height;
        canvas.width = img.width;
        ctx.drawImage(img, 0, 0);
        var dataURL = canvas.toDataURL(outputFormat || 'image/png');
        callback.call(this, dataURL);
        // Clean up
        canvas = null;
    };
    img.src = url;
}

function getParam(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null)
        return null;
    else
        return results[1];
}

function online(event) {
    window.online = navigator.onLine ? true : false;
    console.log(window.online);
}

addEvent(window, 'online', online);
addEvent(window, 'offline', online);
