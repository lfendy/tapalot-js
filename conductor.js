(function($){

  const PLAYABLE = "playable";

  var songStructure;
  var player;
  var timing;
  var display;
  var interval;

  // hack... States ?
  var currentTimeSlice;

  var getTotalSeconds = function(startTime){
    return (parseInt(startTime.minutes) * 60) + parseFloat(startTime.seconds);
  };

  var triggerHighlight = function(){
    var currentTime = getTotalSeconds(player.audioPlayer('getCurrentTime'));
      if(currentTimeSlice != undefined && currentTimeSlice.startTime <= currentTime){
        display.trigger('highlightLine', [currentTimeSlice.section, currentTimeSlice.line]);
        var idx = _.indexOf(timing, currentTimeSlice);
        currentTimeSlice = timing[idx + 1];
      }
  };

  var createTiming = function(songStructure){
    var sectionTimings = _.map(songStructure, function(section, idxSection, sections){
      return _.map(section.songLines, function(songLine, idxLine, songLines){
        return {
          section: idxSection,
          line: idxLine,
          startTime: getTotalSeconds(songLine.startTime)
        };
      });
    });
    return _.flatten(sectionTimings);
  };

  var play = function(){
    player.audioPlayer('play');
    interval = setInterval(triggerHighlight, 100);
  };
  var pause = function(){
    player.audioPlayer('pause');
    clearInterval(interval);
  };
  var skipTo = function(idxSection, idxLine){};
  var setDelay = function(delay){};

  var init = function(givenSongStructure, givenPlayer){
    player = givenPlayer;
    songStructure = givenSongStructure;
    display = this;
    timing = createTiming(songStructure);
    window.timing = timing;
    currentTimeSlice = timing[0];
    return this;
  };

  var methods = {
    init: init,
    play: play,
    pause: pause,
    skipTo: skipTo,
    setDelay: setDelay
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
