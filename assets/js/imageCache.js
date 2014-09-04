/**
 * jQuery Image Cache
 *
 * Load images from browser local storage
 *
 * @author Dumitru Glavan
 * @link http://dumitruglavan.com
 * @version 1.1
 * @requires jQuery v1.3.2 or later
 *
 * Examples and documentation at: http://dumitruglavan.com/jquery-image-cache-plugin-cache-images-in-browsers-local-storage/
 * Official jQuery plugin page: http://plugins.jquery.com/project/jquery-image-cache
 * Find source on GitHub: https://github.com/doomhz/jQuery-Image-Cache
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 */
;
(function($) {
    $.fn.imageCache = function(options) {
        this.config = {
            // base64ImageEncoderPath: 'get_image.php?id='
        };
        $.extend(this.config, options);

        var self = this;
        var $self = $(this);

        $(document).ready(function() {
            $(self).each(function(i, img) {
                var src = $(img).attr('src') || $(img).attr('data-src');
                if (localStorage) {
                    var localSrc = localStorage[src];
                    if (localSrc && localSrc != 'pending') {
                        $(img).attr('src', localSrc);
                    } else {
                        $(img).attr('src', src);
                        if (localStorage[src] !== 'pending') {
                            localStorage[src] = 'pending';

                            convertImgToBase64(imageUrl, function(base64Img) {
                                localStorage[src] = base64Img;
                            });
                        }
                    }
                }
            });
        });

        return this;
    }
})(jQuery);

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
