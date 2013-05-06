(function($){
  var methodInvoker = function(methods){
    return function(methodOrOptions) {
      if ( methods[methodOrOptions] ) {
        return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
      } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
        return methods.init.apply( this, arguments );
      } else {
        $.error( 'Method ' +  method + ' does not exist' );
      }
    };
  };

  $.tapalot = $.tapalot || {};
  $.tapalot.createPlugin = methodInvoker;
})(jQuery);

