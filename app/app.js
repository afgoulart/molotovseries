(function() {
    'use strict';
    window.appversion = '0.1';
    window.online = true;
    window.vbase = '0.2';
    window.molotov = angular.module('Molotov', ['ngRoute', 'mongolabResourceHttp', 'ng-isotope', 'facebook', 'infinite-scroll']);
    window.molotov.config(function($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'app/views/home.html'
            })
            .when('/all', {
                templateUrl: 'app/views/all.html'
            })
            .when('/about', {
                templateUrl: 'app/views/about.html'
            })
            .when('/seriesday', {
                templateUrl: 'app/views/seriesday.html'
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
        /*$locationProvider.html5Mode(true);*/
        $locationProvider.hashPrefix('!');

    });
    window.molotov.config(function(FacebookProvider) {
        /*console.log('location.hostname', location.hostname);*/
        /*dev*/
        FacebookProvider.init('1501693240076943');
        /*prod*/
        /*FacebookProvider.init('1501692520077015');*/
    });
    window.molotov.constant('MONGOLAB_CONFIG', {
        API_KEY: '',
        DB_NAME: 'molotovseries'
    });
    window.molotov.factory('Series', function($mongolabResourceHttp) {
        return $mongolabResourceHttp('series');
    });
    window.molotov.factory('Casting', function($mongolabResourceHttp) {
        return $mongolabResourceHttp('casting');
    });
    window.molotov.factory('Updates', function($mongolabResourceHttp) {
        return $mongolabResourceHttp('updates');
    });
    window.molotov.factory('Client', function($mongolabResourceHttp) {
        return $mongolabResourceHttp('client');
    });
    window.molotov.filter('trusted', ['$sce',
        function($sce) {
            return function(url) {
                return $sce.trustAsResourceUrl(url);
            };
        }
    ]);
    window.molotov.controller('MolotovController', ['$scope', '$http', '$routeParams', 'Series',
        'Casting', 'Client', 'Updates', 'Facebook', 'AllSeries',
        function($scope, $http, $routeParams, Series, Casting, Client, Updates, Facebook, AllSeries) {
            $scope.series = [];
            $scope.load = true;
            $scope.limit = 10;
            $scope.sk = 10;
            $scope.allseries = new AllSeries();
            $scope.seriestoday = [];
            $scope.user = null;

            $scope.stopLoad = function() {
                $scope.load = false;
            }
            /**/
            $scope.tracking = function() {
                _gaq.push(['_trackPageview', window.location.href]);
            };
            /**/
            $scope.getseriestoday = function() {
                var d = new Date();
                var day = 0;
                if (d.getMonth() < 10) {
                    day = '0' + (d.getMonth() + 1);
                }
                var today = day + '_' + d.getDate() + '_' + d.getFullYear();
                try {
                    Updates.query({
                        update: today
                    }).then(function(results) {
                        $scope.seriestoday = results;
                    });
                } catch (e) {

                }
            };
            $scope.getseriesday = function() {
                try {
                    Updates.query({
                        // update: today
                    }).then(function(results) {
                        var r = _.groupBy(results, function(obj) {
                            var d = obj.update.split('_');
                            var dd = d[1] + '/' + d[0] + '/' + d[2];
                            return dd;
                        });
                        console.log();
                        $scope.seriesday = [];
                        for (var key in r) {
                            var obj = {};
                            obj.date = key;
                            obj.series = r[key];
                            $scope.seriesday.push(obj);
                        }
                        $scope.seriesday = _.sortBy($scope.seriesday, function(obj) {
                            return obj.date;
                        });
                        console.log($scope.seriesday);
                        $scope.load = false;
                    });
                } catch (e) {

                }
            };

            $scope.getbirthday = function(year) {
                /**/
                try {
                    _gaq.push(['_trackEvent', 'getbirthday', year]);
                } catch (e) {}
                /**/

                var d = (new Date().getMonth() + 1) + '-' + new Date().getDate();
                if (window.localStorage[window.vbase + '_ms_bd'] !== undefined) {
                    $scope.currentbirthday = JSON.parse(window.localStorage[window.vbase + '_ms_bd']);
                    $scope.load = false;
                }
                Casting.query({
                    "nascimentodt": d
                }).then(function(birthday) {
                    $scope.currentbirthday = birthday;
                    window.localStorage[window.vbase + '_ms_bd'] = JSON.stringify($scope.currentbirthday);
                    $scope.load = false;
                });

            };
            $scope.getseriebycat = function(c) {
                $scope.load = true;
                /**/
                try {
                    _gaq.push(['_trackEvent', 'getseriebycat', c]);
                } catch (e) {}
                /**/
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
                /**/
                try {
                    _gaq.push(['_trackEvent', 'getseriebyyear', year]);
                } catch (e) {}
                /**/
                console.log($routeParams.id);
                if (window.localStorage[window.vbase + '_ms_sy'] !== undefined) {
                    $scope.currentseries = JSON.parse(window.localStorage[window.vbase + '_ms_sy']);
                    $scope.load = false;
                }
                Series.query({
                    "ano": year
                }).then(function(series) {
                    $scope.currentseries = series;
                    window.localStorage[window.vbase + '_ms_sy'] = JSON.stringify($scope.currentseries);
                    $scope.load = false;
                    $("#loadcurrentseries").hide();
                });
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
                    if ($scope.serie.dublado === undefined) {
                        $scope.serie.dublado = [];
                    }
                }
                Series.getById($routeParams.id).then(function(serie) {
                    $scope.serie = serie;
                    // window.localStorage[window.vbase + '_' + $routeParams.id] = JSON.stringify($scope.serie);
                    $scope.load = false;
                    if ($scope.serie.dublado === undefined) {
                        $scope.serie.dublado = [];
                    }
                    /**/
                    try {
                        _gaq.push(['_trackEvent', 'getserie', $scope.serie.title]);
                    } catch (e) {}
                    /**/
                });

                try {
                    FB.XFBML.parse();
                } catch (e) {}
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
                        /**/
                        try {
                            _gaq.push(['_trackEvent', 'getcast', $scope.cast.nome]);
                        } catch (e) {}
                        /**/
                    } else {
                        window.location = './';
                    }
                });
                try {

                    FB.XFBML.parse();
                } catch (e) {}
            };

            $scope.showtemp = function(i) {
                alert('s');
                $(".tab__content").hide();
                $("#tab" + i).fadeIn();
                $(".tab__head li").removeClass("active");
                $(this).addClass("active");
            };

            $scope.showepisode = function() {
                $scope.load = true;

                var k = getParam('k');
                var id = getParam('i');
                var p = getParam('p');
                var info = getParam('info');
                console.log(k);
                Series.getById($routeParams.id).then(function(serie) {
                    $scope.serie = serie;
                    $scope.load = false;
                    var PLAYERS = {
                        dp: "http://dropvideo.com/embed/{{id}}/",
                        vdm: "http://vidto.me/embed-{{id}}-967x600.html",
                        amv: "http://allmyvideos.net/embed-{{id}}.html"
                    };
                    $scope.serie.currentlink = PLAYERS[p].replace("{{id}}", k);
                    $scope.serie.episodio = info;
                    $scope.serie.index = id;
                    try {
                        var type = info.split('_');
                        var _eps = $scope.serie[type[1]];
                        var ep = _eps[type[0] - 1].episodios[id];
                        $scope.serie.episodio = ep;
                        $scope.serie.eps = _eps[type[0] - 1].episodios;

                    } catch (e) {
                        console.log(e);
                    }
                    /**/
                    try {
                        _gaq.push(['_trackEvent', 'showepisode', $scope.serie.episodio.title]);
                    } catch (e) {}
                    /**/
                    // <iframe width="200" height="113" src="http://vidto.me/embed-2zljuqgw21mc-200x113.html" frameborder="0" allowfullscreen></iframe>
                    // $("#player").load($scope.serie.currentlink + " #flvplayer_wrapper");
                });
                try {
                    $scope.setSeeInterval = setInterval(function() {
                        $scope.assisti($scope.serie.hashid, $scope.serie.episodio.hashid, true);
                        console.log('gravou');
                        clearInterval($scope.setSeeInterval);
                    }, 30000);

                } catch (E) {}
                try {

                    FB.XFBML.parse();
                } catch (e) {}
            };

            $scope.assisti = function(seriehashid, hashid, status) {
                if ($scope.user !== null) {
                    if ($scope.user.preferencias === undefined) {
                        $scope.user.preferencias = {};
                    }
                    if ($scope.user.preferencias[seriehashid] === undefined) {
                        $scope.user.preferencias[seriehashid] = {};
                        try {
                            new Client($scope.user).$update();
                        } catch (e) {
                            console.log($scope.user, e);
                        }
                        return false;
                    }
                    if (status === null) {
                        return $scope.user.preferencias[seriehashid][hashid];
                    } else {
                        $scope.user.preferencias[seriehashid][hashid] = true;
                        try {
                            new Client($scope.user).$update();
                            // var u = new Client($scope.user);
                            // u.$update();
                        } catch (e) {
                            console.log(e);
                        }
                    }
                }
            };

            $scope.loadoff = function() {
                $scope.load = false;
            }

            /*FACEBOOK*/
            $scope.loginStatus = 'disconnected';
            $scope.loginStatusb = false;
            $scope.facebookIsReady = false;
            $scope.user = null;

            $scope.login = function() {
                Facebook.login(function(response) {
                    $scope.loginStatus = response.status;
                    if ($scope.loginStatus === 'connected') {
                        $scope.loginStatusb = true;
                        $scope.api();
                    } else {
                        $scope.loginStatusb = false;
                    }
                    /**/
                    try {
                        _gaq.push(['_trackEvent', 'login', 'facebook']);
                    } catch (e) {}
                    /**/
                });
            };
            $scope.logout = function() {
                Facebook.logout(function(response) {
                    $scope.loginStatus = response.status;
                    if ($scope.loginStatus === 'connected') {
                        $scope.loginStatusb = true;
                    } else {
                        $scope.loginStatusb = false;
                    }
                });
            };

            $scope.removeAuth = function() {
                console.log("removeAuth");
                Facebook.api({
                    method: 'Auth.revokeAuthorization'
                }, function(response) {
                    Facebook.getLoginStatus(function(response) {
                        $scope.loginStatus = response.status;
                        console.log($scope.loginStatus);
                        if ($scope.loginStatus === 'connected') {
                            $scope.loginStatusb = true;
                        } else {
                            $scope.loginStatusb = false;
                        }
                    });
                });
            };

            $scope.api = function() {
                // console.log($scope.loginStatusb, $scope.user === null);
                if ($scope.loginStatusb) {
                    if ($scope.user === null) {

                        Facebook.api('/me', function(response) {
                            // $scope.user = ;
                            // console.log($scope.user);
                            Client.query({
                                "id": response.id
                            }).then(function(result) {
                                console.log('result', result);
                                if (result.length === 0) {
                                    console.log("CRIOU");
                                    $scope.user = new Client(response);
                                    $scope.user.dtcreated = Date.now();
                                    $scope.user = $scope.user.$saveOrUpdate();
                                    window.localStorage['u'] = JSON.stringify($scope.user);
                                } else {
                                    console.log("RECUPEROU");
                                    window.localStorage['u'] = JSON.stringify(result[0]);
                                    $scope.user = JSON.parse(window.localStorage['u']);
                                }
                                console.log("$scope.user", $scope.user);
                                /**/
                                try {
                                    _gaq.push(['_trackEvent', 'user', $scope.user.id]);
                                } catch (e) {}
                                /**/
                            });

                        });
                    }
                }
            };

            $scope.$watch(function() {
                return Facebook.isReady();
            }, function(newVal) {
                if (newVal) {
                    $scope.facebookIsReady = true;
                    Facebook.getLoginStatus(function(response) {
                        $scope.loginStatus = response.status;
                        console.log($scope.loginStatus);
                        if ($scope.loginStatus === 'connected') {
                            $scope.loginStatusb = true;
                            $scope.api();
                        }
                    });
                }
            });


        }
    ]);

    // email: "jgabriel.ufpa@gmail.com"
    // first_name: "J Gabriel"
    // gender: "male"
    // id: "904443389583831"
    // last_name: "Lima"
    // link: "https://www.facebook.com/app_scoped_user_id/904443389583831/"
    // locale: "pt_BR"
    // name: "J Gabriel Lima"
    // timezone: -3
    // updated_time: "2014-04-08T16:56:34+0000"
    // verified: true
    window.molotov.factory('AllSeries', function($http, Series) {
        var AllSeries = function() {
            this.items = [];
            this.busy = false;
            this.after = '';
            this.limit = 20;
            this.sk = 1;
            this.stop = false;
        };

        AllSeries.prototype.nextPage = function() {
            if (this.stop) return;
            if (this.busy) return;
            this.busy = true;
            var a = this;
            Series.all({
                fields: {
                    "title": 1,
                    "hashid": 1,
                    "img": 1
                },
                limit: a.limit,
                skip: (a.sk * a.limit)
            }).then(function(series) {
                if (series.length !== 0) {
                    _.each(series, function(value, index) {
                        a.items.push(value);
                    });
                    a.sk++;
                    a.busy = false;
                } else {
                    a.stop = true;
                }
            });
        };

        return AllSeries;
    });

    window.molotov.filter('range', function() {
        return function(input, total) {
            total = parseInt(total);
            for (var i = 0; i < total; i++)
                input.push(i);
            return input;
        };
    });
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
