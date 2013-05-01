(function($){

  const PLAYABLE = "playable";

  var songStructure;
  var player;
  var viewDelay;
  var timeSlices;
  var display;
  var checkTriggersInterval;
  var heartbeatInterval;
  const CHECK_TRIGGERS_DURATION_MS = 10

  // hack... States ?
  var currentTimeSlice;


  var heartbeat = "";
  var triggerHeartbeat = function(numberOfBeats){
    var trigger = function(){
      var len = heartbeat.length;
      if(len % numberOfBeats == 0) {
        heartbeat = heartbeat + ((len / numberOfBeats) + 1);
      } else {
        heartbeat = heartbeat + ".";
      }
      display.trigger('heartbeat', heartbeat);
    };
    return trigger;
  };

  var clearHeartbeat = function(){
    heartbeat = "";
    clearInterval(heartbeatInterval);
  };

  var startHeartbeat = function(duration, numberOfBeats){
    var trigger = triggerHeartbeat(numberOfBeats);
    trigger();
    heartbeatInterval = setInterval(trigger, duration);
  };

  var checkTriggers = function(){
    var currentTime = $.tapalot.timeSlice.getTotalSeconds(player.audioPlayer('getCurrentTime'));
    if(currentTimeSlice != undefined && (currentTimeSlice.startTime + viewDelay) <= currentTime){

      var idx = _.indexOf(timeSlices.flat, currentTimeSlice);
      var nextSlice = timeSlices.flat[idx+1];
      var delta = nextSlice.startTime - currentTimeSlice.startTime;
      var heartbeatDuration = delta / (currentTimeSlice.repetition * currentTimeSlice.numberOfBeats);
      setTimeout(function(){
        clearHeartbeat();
        startHeartbeat(heartbeatDuration * 1000, currentTimeSlice.numberOfBeats);
      }, (-1 * viewDelay) * 1000);

      display.trigger('highlightLine', [currentTimeSlice.section, currentTimeSlice.line]);

      currentTimeSlice = nextSlice;
    }
  };

  var play = function(){
    player.audioPlayer('play');
    checkTriggersInterval = setInterval(checkTriggers, CHECK_TRIGGERS_DURATION_MS);
  };

  var pause = function(){
    player.audioPlayer('pause');
    clearInterval(checkTriggersInterval);
    clearHeartbeat();
  };

  var skipTo = function(idxSection, idxLine){
    var slice = timeSlices.hierarchical[idxSection][idxLine];
    player.audioPlayer('setCurrentTime', slice.startTime + viewDelay);
    currentTimeSlice = slice;
    clearHeartbeat();
  };
  var setViewDelay = function(delay){};

  var enable = function(){
    display.children().addClass(PLAYABLE);
    return this;
  };

  var disable = function(){
    display.children().removeClass(PLAYABLE);
    return this;
  };

  var handleClickSongLine = function(evt){
    var $songLine = $(evt.target);
    var idxSection = $songLine.attr("idxSection");
    var idxLine = $songLine.attr("idxLine");
    skipTo(idxSection, idxLine);
  };

  var init = function(givenSongStructure, givenPlayer, givenViewDelay){
    viewDelay = givenViewDelay;
    player = givenPlayer;
    songStructure = givenSongStructure;
    display = this;
    timeSlices = $.tapalot.timeSlice.createTimeSlices(songStructure);
    window.tapalotDebug.timeSlices = timeSlices;
    currentTimeSlice = timeSlices.flat[0];
    display.on("click", "." + PLAYABLE, handleClickSongLine);
    return this;
  };

  var methods = {
    init: init,
    play: play,
    pause: pause,
    skipTo: skipTo,
    enable: enable,
    disable: disable,
    setViewDelay: setViewDelay
  };

  $.fn.conductor = $.tapalot.createPlugin(methods);
})(jQuery);
