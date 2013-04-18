(function($){
  var renderer_init = function(givenSongStructure){
    var $this = $(this);

    var getId = function(idxSection, idxLine){
      return "rendered_section_" + idxSection.toString() + "_line_" + idxLine.toString();
    };

    var renderLine = function(id, songLine){
      var $newDiv = $(document.createElement('div'));
      $newDiv
        .append(songLine.lineText)
        .attr("id", id);

      $this.append($newDiv);
    };

    var renderLines = function(songLines, idxSection){
      _.each(songLines, function(songLine, idxLine){
        renderLine(getId(idxSection, idxLine), songLine);
      });
    };

    var renderSections = function(songStructure){
      _.each(songStructure, function(songSection, idxSection){
        renderLines(songSection.songLines, idxSection);
      });
    };

    var clear = function(){
      $this.children().remove();
    };

    renderSections(givenSongStructure);

    return $this;
  };
  $.fn.renderer = renderer_init;
})(jQuery);
