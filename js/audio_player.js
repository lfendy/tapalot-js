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

  var ended = function(endedFunction){
    this.on("ended", endedFunction);
    return this;
  };

  var setCurrentTime = function(time){
    player.currentTime = time.totalSeconds;
    return this;
  };

  var getCurrentTime = function(){
    return $.tapalot.time(player.currentTime);
  };

  var methods = {
    init: init,
    pause: pause,
    play: play,
    rewind: rewind,
    ended: ended,
    getCurrentTime: getCurrentTime,
    setCurrentTime: setCurrentTime,
    setSongSource: setSongSource
  };

  $.fn.audioPlayer = $.tapalot.createPlugin(methods);
})(jQuery);
