(function($){
  var tapalot_init = function(){

    var player = this[0];
    var parse = function(songScript){
    };

    var setMusicSource = function(source){
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

    var setViewDelay = function(viewDelay){
    };

    return {
      parse: parse,
      play: play,
      pause: pause,
      rewind: rewind,
      seek: seek,
      setViewDelay: setViewDelay,
      setMusicSource: setMusicSource
    };
  }

  $.fn.tapalot = tapalot_init;
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
