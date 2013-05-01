(function($){
  var player = null;

  var init = function(){
    player = this[0];
    return this;
  };

  var setSongSource = function(source){
    player.src = source;
    return this;
  }

  var play = function(){
    player.play();
    return this;
  };

  var pause = function(){
    player.pause();
    return this;
  };

  var rewind = function(){
    player.currentTime = 0;
    return this;
  };

  var setCurrentTime = function(songLocation){
    player.currentTime = songLocation;
    return this;
  };

  var getCurrentTime = function(){
    var time = player.currentTime;
    var minutes = Math.floor(time / 60);
    var seconds = time - (minutes * 60);
    return { minutes:minutes, seconds:seconds };
  };

  var methods = {
    init: init,
    pause: pause,
    play: play,
    rewind: rewind,
    getCurrentTime: getCurrentTime,
    setCurrentTime: setCurrentTime,
    setSongSource: setSongSource
  };

  $.fn.audioPlayer = $.tapalot.createPlugin(methods);
})(jQuery);
