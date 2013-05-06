(function($){
  var dragdropper_init = function(){
    var $this = $(this);

    var getFileExtension = function(fileName){
      return _.last(fileName.split('.')).toLowerCase();
    };

    var handleFinishReadingTXT = function(evt){
      var data = {contents: evt.target.result};
      $this.trigger("receivedTXT", data);
    };

    var handleFinishReadingPEG = function(evt){
      var data = {contents: evt.target.result};
      $this.trigger("receivedPEG", data);
    };

    var processTXT = function(f){
      var fr = new FileReader();
      fr.onload = handleFinishReadingTXT;
      fr.readAsText(f);
    };

    var processPEG = function(f){
      var fr = new FileReader();
      fr.onload = handleFinishReadingPEG;
      fr.readAsText(f);
    };

    var processAudio = function(f){
      var url = URL.createObjectURL(f);
      var data = {url: url}
      $this.trigger("receivedMP3", data);
    };

    var processFile = function(f){
      switch(getFileExtension(f.name)){
        case "m4a":
        case "mp3":
          processAudio(f);
          break;
        case "peg":
          processPEG(f);
          break;
        case "txt":
          processTXT(f);
          break;
      }
    };

    var handleDragOver = function(evt){
      evt.stopPropagation();
      evt.preventDefault();
      evt.originalEvent.dataTransfer.dropEffect = 'copy';
    };

    var handleDrop = function(evt){
      evt.stopPropagation();
      evt.preventDefault();

      var files = evt.originalEvent.dataTransfer.files;
      _.each(files, processFile);
    };

    $this.on('dragover', handleDragOver);
    $this.on('drop', handleDrop);

    return $this;
  };
  $.fn.dragdropper = dragdropper_init;
})(jQuery);
