(function($){

  var getTotalSeconds = function(timeInMinutesAndSeconds){
    return (parseInt(timeInMinutesAndSeconds.minutes) * 60) + parseFloat(timeInMinutesAndSeconds.seconds);
  };

  var getTimeInMinutesAndSeconds = function(totalSeconds){
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds - (minutes * 60);
    return { minutes:minutes, seconds:seconds };
  };

  var convertToSecondsIfRequired = function(time){
    if(typeof time === 'object'){
      return getTotalSeconds(time);
    } else {
      return time;
    }
  };

  var convertToObjectIfRequired = function(time){
    if(typeof time === 'object'){
      return time;
    } else {
      return getTimeInMinutesAndSeconds(time);
    }
  };

  var convertToString = function(minutesAndSeconds){
    return minutesAndSeconds.minutes + ":" + minutesAndSeconds.seconds.toFixed(2);
  };


  $.tapalot = $.tapalot || {};
  $.tapalot.time = function(someFormOfTime){

    var totalSeconds = convertToSecondsIfRequired(someFormOfTime);
    var minutesAndSeconds = convertToObjectIfRequired(someFormOfTime);
    var string = convertToString(minutesAndSeconds);
    var differenceWith = function(otherTime){
      return $.tapalot.time(Math.abs(totalSeconds - otherTime.totalSeconds));
    };
    var delayBy = function(seconds){
      return $.tapalot.time(totalSeconds + seconds);
    };

    return {
      totalSeconds: totalSeconds,
      minutesAndSeconds: minutesAndSeconds,
      string: string,
      differenceWith: differenceWith,
      delayBy: delayBy
    };
  };

})(jQuery);

