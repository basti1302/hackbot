(function ($) {

  'use strict';

  $(function() {
    var modalId = "modal-load-form-" + parseInt(Math.random() * 1000, 10);
    var container = $('<div id="' + modalId + '"></div>');
    $('body').append(container);

    $.loadLevelForm = function(levels, sharedLevels) {
      if ((!levels || levels.length === 0) &&
          (!sharedLevels || sharedLevels.length === 0)) {
        alert('No levels found, create some levels first :-)');
        return null;
      }
      var modal, field, type, html = "";

      html += '<div class="modal hide fade">';
      html += '  <form style="margin:0">';
      html += '    <div class="modal-header">';
      html += '      <h3>Load Level'
      html += '        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>';
      html += '      </h3>';
      html += '    </div>';
      html += '    <div class="modal-body">';
      html += '      <select class="span3" placeholder="select level" name="levelId">';
      for (var i = 0; i < levels.length; i++) {

        html += '<option label="' + levels[i].name + '">' + levels[i].id + '</option>';
      }
      // TODO Group shared levels by creator (maybe not here, though)
      if (sharedLevels) {
        for (i = 0; i < sharedLevels.length; i++) {

          html += '<option label="' +
                   (sharedLevels[i].createdByName || sharedLevels[i].createdBy) +
                   '/' + sharedLevels[i].name + '">' +
                   sharedLevels[i].createdBy + '/' +
                   sharedLevels[i].id + '</option>';
        }
      }

      /*
      Like this, when global shares are also grouped by creator...
      html += '        <optgroup label="Bart Simpson\'s levels">';
      html += '          <option label="name">id</option>';
      html += '        </optgroup>';
      */
      html += '      </select><br/>';
      html += '    </div>';
      html += '    <div class="modal-footer">';
      html += '      <button type="submit" class="btn btn-primary">Load</button>';
      html += '    </div>';
      html += '  </form>';
      html += '</div>';

      // make sure that only one modal is visible
      modal = $(html);
      container.html('').append(modal);

      modal.modal();
      modal.modal('show');

      modal.on('submit', 'form', function(event){
        event.preventDefault();
        event.stopPropagation();

        var inputs = {};
        var $form = $(event.target);

        $form.find('[name]').each( function () {
          inputs[this.name] = this.value;
        });

        modal.trigger('submit', inputs);
      });

      modal.on('error', function(event, error) {
        modal.find('.alert').remove();
        modal.find('.modal-body').before('<div class="alert alert-error">'+error.message+'</div>');
      });

      modal.on('shown', function() {
        modal.find('input').eq(0).focus()
      });

      modal.on('hide.bs.modal', function(e){
        editor.rebindKeys();
      });

      return modal;
    };

  });
})(window.jQuery);
