
;(function($) {

    // Make sure we won't overwrite anything
    if($.fn.spinner) {
        throw('jQuery.fn.spinner already defined');
    }

    $.fn.spinner = function() {

        // there's no need to do $(this) because
        // "this" is already a jquery object

        // $(this) would be the same as $($('#element'));
        //console.log("loading spinner");
        this.empty().html('<div class="center"><img src="/s/img/spinner.gif" alt="Loading data"/></div>');

    };
}(jQuery));
