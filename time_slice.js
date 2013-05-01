(function($){

  var getTotalSeconds = function(startTime){
    return (parseInt(startTime.minutes) * 60) + parseFloat(startTime.seconds);
  };

  var getPreviousTimeSlices = function(allTimeSlices, timeSlice){
    return _.filter(allTimeSlices, function(ts){
      return ts.section <= timeSlice.section && ts.line < timeSlice.line;
    });
  };

  var getNextTimeSlices = function(allTimeSlices, timeSlice){
    return _.filter(allTimeSlices, function(ts){
      return ts.section >= timeSlice.section && ts.line > timeSlice.line;
    });
  };

  var getFirstPreceedingSliceWithStartTime = function(allTimeSlices, timeSlice){
    var previousSlices = getPreviousTimeSlices(allTimeSlices, timeSlice);
    return _.last(_.filter(previousSlices, function(ts){
      return !isNaN(ts.startTime);
    }));
  };

  var getFirstSucceedingSliceWithStartTime = function(allTimeSlices, timeSlice){
    var nextSlices = getNextTimeSlices(allTimeSlices, timeSlice);
    return _.first(_.filter(nextSlices, function(ts){
      return !isNaN(ts.startTime);
    }));
  };

  var getSumOfPreviousRepetitions = function(allTimeSlices, timeSlice){
    var backSlice = getFirstPreceedingSliceWithStartTime(allTimeSlices, timeSlice);
    var allPreviousSlices = getPreviousTimeSlices(allTimeSlices, timeSlice);
    var inBetweenSlices = getNextTimeSlices(allPreviousSlices, backSlice).concat([backSlice]);
    return _.reduce(inBetweenSlices, function(acc, ts){
      return acc + ts.repetition;
    }, 0);
  };

  var getSumOfNextRepetitions = function(allTimeSlices, timeSlice){
    var forwardSlice = getFirstSucceedingSliceWithStartTime(allTimeSlices, timeSlice);
    var allNextSlices = getNextTimeSlices(allTimeSlices, timeSlice);
    var inBetweenSlices = getPreviousTimeSlices(allNextSlices, forwardSlice);
    inBetweenSlices = inBetweenSlices.concat([timeSlice]);
    return _.reduce(inBetweenSlices, function(acc, ts){
      return acc + ts.repetition;
    }, 0);
  };

  var getMostRecentTempo = function(allTimeSlices, timeSlice){
    var prevSlice = getFirstPreceedingSliceWithStartTime(allTimeSlices, timeSlice);
    var prevprevSlice = getFirstPreceedingSliceWithStartTime(allTimeSlices, prevSlice);
    var delta = prevSlice.startTime - prevprevSlice.startTime;
    return delta / prevprevSlice.repetition;
  };

  var fillStartTime = function(allTimeSlices, timeSlice){
    var previousTime = getFirstPreceedingSliceWithStartTime(allTimeSlices, timeSlice).startTime;
    var nextTimeSlice = getFirstSucceedingSliceWithStartTime(allTimeSlices, timeSlice);
    var prevReps = getSumOfPreviousRepetitions(allTimeSlices, timeSlice);
    if(nextTimeSlice != undefined){
      var nextReps = getSumOfNextRepetitions(allTimeSlices, timeSlice);
      var nextTime = nextTimeSlice.startTime;
      var delta = nextTime - previousTime;
      var ratio = prevReps / (prevReps + nextReps);
      timeSlice.startTime = previousTime + (ratio * delta);
    } else {
      var secondsPerBar = getMostRecentTempo(allTimeSlices, timeSlice);
      timeSlice.startTime = previousTime + (prevReps * secondsPerBar);
    }
  };

  var fillAllStartTime = function(allTimeSlices){
    var emptySlices = _.filter(allTimeSlices, function(ts){
      return isNaN(ts.startTime);
    });
    _.each(emptySlices, function(ts){
      fillStartTime(allTimeSlices, ts);
    });
    return allTimeSlices;
  };

  var createTimeSlices = function(songStructure){
    var sectionTimeSlices = _.map(songStructure, function(section, idxSection, sections){
      return _.map(section.songLines, function(songLine, idxLine, songLines){
        return {
          section: idxSection,
          line: idxLine,
          startTime: getTotalSeconds(songLine.startTime),
          repetition: songLine.repetition,
          numberOfBeats: section.timeSignature.beats
        };
      });
    });
    var hierarchicalTimeSlices = sectionTimeSlices;
    var flatTimeSlices = _.flatten(hierarchicalTimeSlices);
    fillAllStartTime(flatTimeSlices);
    return {
      hierarchical: hierarchicalTimeSlices,
      flat: flatTimeSlices
    };
  };

  $.tapalot = $.tapalot || {};
  $.tapalot.timeSlice = {
    createTimeSlices: createTimeSlices,
    getTotalSeconds: getTotalSeconds
  };


})(jQuery);
