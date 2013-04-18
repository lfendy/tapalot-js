(function($){
  var dragdropper_init = function(){
    var $this = $(this);

    var getFileExtension = function(fileName){
      return _.last(fileName.split('.')).toLowerCase();
    };

    var handleFinishReadingFile = function(evt){
      console.log("done reading");
      var newEvent = new Event();
      $this.trigger(newEvent)
    };

    var handleDragOver = function(evt){
      evt.stopPropagation();
      evt.preventDefault();
      evt.originalEvent.dataTransfer.dropEffect = 'copy';
    };

    var handleFileSelect = function(evt){
      evt.stopPropagation();
      evt.preventDefault();

      var files = evt.originalEvent.dataTransfer.files;
      for (var i = 0, f; f = files[i]; i++){
        switch(getFileExtension(f.name)){
          case "mp3":
            var url = URL.createObjectURL(f);
            var newEvent = new Event();
            $this.trigger(newEvent)
            break;
          case "peg":
            var fr = new FileReader();
            fr.onload = handleFinishReadingFile;
            fr.readAsText(f);
            break;
        }
      }

    };

    $this.on('dragover', handleDragOver);
    $this.on('drop', handleFileSelect);

    $this.on();
  };
  $.fn.dragdropper = dragdropper_init;
})(jQuery);
