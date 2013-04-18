(function($){
  var player = null;

  var init = function(){
    player = this[0];
    return this;
  };

  var setSongSource = function(source){
    player.src = source;
  }

  var play = function(){
    player.play();
  };

  var pause = function(){
    player.pause();
  };

  var rewind = function(){
    player.currentTime = 0;
  };

  var seek = function(songLocation){
    player.currentTime = songLocation;
  };

  var methods = {
    init: init,
    play: play,
    pause: pause,
    rewind: rewind,
    seek: seek,
    setSongSource: setSongSource
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

  $.fn.audioPlayer = methodInvoker;
})(jQuery);


/*
var tapalot = $("#player").tapalot();
tapalot.parse(string);
tapalot.play();
tapalot.pause();
tapalot.rewind();
tapalot.seek(number);
tapalot.viewDelay();

var composer = $("#some_div").tapalotComposer();
*/
// when onClick -- will then need to know the time of song when it was clicked
