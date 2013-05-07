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
  var nextSliceToHighlight;

  var heartbeat = {
    progressForRepetition: 0,
    display: "",
    beats: 0
  };
  var triggerHeartbeat = function(beatsPerBar){
    var trigger = function(){
      var currentSlice = $.tapalot.timeSlice.getPreviousTimeSlice(timeSlices, nextSliceToHighlight);
      if(heartbeat.beats % beatsPerBar == 0) {
        heartbeat.progressForRepetition += 1;
        heartbeat.display = "(" + heartbeat.progressForRepetition + "/" + currentSlice.repetition + ")";
      } else {
        heartbeat.display = heartbeat.display + ".";
      }
      heartbeat.beats += 1;
      display.trigger('heartbeat', heartbeat.display);
    };
    return trigger;
  };

  var clearHeartbeat = function(){
    heartbeat = {
      progressForRepetition: 0,
      display: "",
      beats: 0
    };
    clearInterval(heartbeatInterval);
  };

  var startHeartbeat = function(duration, beatsPerBar){
    var trigger = triggerHeartbeat(beatsPerBar);
    trigger();
    heartbeatInterval = setInterval(trigger, duration);
  };

  var checkTriggers = function(){
    var currentTime = player.audioPlayer('getCurrentTime').totalSeconds;
    if(nextSliceToHighlight != undefined && (nextSliceToHighlight.startTime.totalSeconds + viewDelay) <= currentTime){

      var heartbeatDuration = nextSliceToHighlight.heartbeatDuration * 1000;
      var beatsPerBar = nextSliceToHighlight.beatsPerBar;
      setTimeout(function(){
        clearHeartbeat();
        startHeartbeat(heartbeatDuration, beatsPerBar);
      }, (-1 * viewDelay) * 1000);

      display.trigger('highlightLine', [nextSliceToHighlight.section, nextSliceToHighlight.line]);

      nextSliceToHighlight = $.tapalot.timeSlice.getNextTimeSlice(timeSlices, nextSliceToHighlight);
    }
  };

  var clearTriggerIntervals = function(){
    clearInterval(checkTriggersInterval);
    clearHeartbeat();
  };

  var play = function(){
    player.audioPlayer('play');
    checkTriggersInterval = setInterval(checkTriggers, CHECK_TRIGGERS_DURATION_MS);
  };

  var pause = function(){
    player.audioPlayer('pause');
    clearTriggerIntervals();
  };

  var ended = function(){
    clearTriggerIntervals();
    nextSliceToHighlight = timeSlices.flat[0];
  };

  var skipTo = function(idxSection, idxLine){
    var slice = timeSlices.hierarchical[idxSection][idxLine];
    player.audioPlayer('setCurrentTime', slice.startTime.delayBy(viewDelay));
    nextSliceToHighlight = slice;
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
    player.audioPlayer('ended', ended);
    songStructure = givenSongStructure;
    display = this;
    timeSlices = $.tapalot.timeSlice.createTimeSlices(songStructure);
    $.tapalot.debug.timeSlices = timeSlices;
    nextSliceToHighlight = timeSlices.flat[0];
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
