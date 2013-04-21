(function($){

  const PLAYABLE = "playable";

  var songStructure;
  var player;
  var timing;

  var createTiming = function(songStructure){
    return {};
  };

  var init = function(givenSongStructure, givenPlayer){
    player = givenPlayer;
    songStructure = givenSongStructure;
    return this;
  };

  var methods = {
    init: init
  };

  var methodInvoker = function(methodOrOptions) {
    if ( methods[methodOrOptions] ) {
      return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist' );
    }
  };

  $.fn.conductor = methodInvoker;
})(jQuery);
