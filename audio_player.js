(function($){
  var player_init = function(){

    var player = this[0];

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

    return {
      play: play,
      pause: pause,
      rewind: rewind,
      seek: seek,
      setSongSource: setSongSource
    };
  }

  $.fn.audioPlayer = player_init;
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
