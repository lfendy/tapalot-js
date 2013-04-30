(function($){

  const PLAYING = "playing";
  const SONGLINE = "song_line";
  const SONGTIME = "song_time";

  var getId = function(idxSection, idxLine){
    return "section_" + idxSection.toString() + "_line_" + idxLine.toString();
  };

  var hasStartTime = function(songLine){
    return songLine.startTime != null && songLine.startTime.minutes != null;
  };






  var textRenderer = function(){
    var renderTimeSignature = function(timeSignature){
      return timeSignature.beats + "/" + timeSignature.noteValue;
    };

    var renderLine = function(id, songLine){
      var repetition = songLine.repetition;
      var text = songLine.lineText;
      var startTime = hasStartTime(songLine) ? " @" + songLine.startTime.minutes + ":" + songLine.startTime.seconds : "";
      return repetition + "x " + text + startTime;
    };

    return {
      renderLine: renderLine,
      renderTimeSignature: renderTimeSignature
    };
  };






  var htmlRenderer = function(){
    var renderTimeSignature = function(timeSignature){
      return null;
    };

    var renderStartTime = function(songLine){
      var $timeDiv = $(document.createElement('div'));
      var timeText = " @" + songLine.startTime.minutes + ":" + (songLine.startTime.seconds.toFixed(2));
      $timeDiv
        .append(timeText)
        .addClass(SONGTIME);

      return $timeDiv;
    };

    var renderLine = function(id, songLine){
      var $newDiv = $(document.createElement('div'));
      var $timeDiv = hasStartTime(songLine) ? renderStartTime(songLine) : null;

      var text = songLine.repetition + "x " + songLine.lineText;
      $newDiv
        .append(text)
        .append($timeDiv)
        .attr("id", id)
        .addClass(SONGLINE);

      return $newDiv;
    };

    return {
      renderLine: renderLine,
      renderTimeSignature: renderTimeSignature
    };
  };







  var renderLine = function(idxSection, renderer){
    return function(line, idx){
      return renderer.renderLine(getId(idxSection, idx), line);
    };
  };

  var renderLines = function(songLines, idxSection, renderer){
    return _.map(songLines, renderLine(idxSection, renderer));
  };

  var renderSection = function(renderer){
    return function(section, idx){
      var ts = renderer.renderTimeSignature(section.timeSignature);
      return [ts].concat(renderLines(section.songLines, idx, renderer));
    };
  };

  var renderSections = function(songStructure, renderer){
    return _.flatten(_.map(songStructure, renderSection(renderer)));
  };






  var rerenderLine = function(element, songLine){
    var $element = $(element);
    var classes = $element[0].classList;
    var id = $element.attr("id");
    $element.replaceWith(htmlRenderer().renderLine(id, songLine));
    $element = $("#" + id);
    _.each(classes, function(name){ $element.addClass(name) });
  };

  var renderText = function(givenSongStructure){
    return renderSections(givenSongStructure, textRenderer()).join("\n");;
  };






  var init = function(givenSongStructure){
    var $this = $(this);

    var clear = function(){
      $this.children().remove();
    };

    var renderHtml = function(givenSongStructure){
      $this.append(renderSections(givenSongStructure, htmlRenderer()));
    };

    clear();
    renderHtml(givenSongStructure);

    return $this;
  };

  var unhighlight = function(){
    $("div." + SONGLINE).removeClass(PLAYING);
  };

  var highlightLine = function(idxSection, idxLine){
    unhighlight();
    var id = getId(idxSection, idxLine);
    var toHighlight = $("#" + id);
    var display = this;
    var magicPixelNumber = -80;
    this.animate({scrollTop: toHighlight.offset().top + magicPixelNumber - this.offset().top + this.scrollTop()})
    toHighlight.addClass(PLAYING);
  };

  var methods = {
    init: init,
    highlightLine: highlightLine,
    rerenderLine: rerenderLine,
    renderText: renderText
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

  $.fn.renderer = methodInvoker;
})(jQuery);
