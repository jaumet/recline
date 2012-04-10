this.recline = this.recline || {};
this.recline.View = this.recline.View || {};

(function($, my) {
// ## DataGrid
//
// Provides a tabular view on a Dataset.
//
// Initialize it with a recline.Dataset object.
//
// Additional options passed in second arguments. Options:
//
// * cellRenderer: function used to render individual cells. See DataGridRow for more.
my.Jaume = Backbone.View.extend({
  tagName:  "div",
  className: "data-table-container",

  initialize: function(modelEtc, options) {
    var self = this;
    this.el = $(this.el);
    _.bindAll(this, 'render');
    this.model.currentDocuments.bind('add', this.render);
    this.model.currentDocuments.bind('reset', this.render);
    this.model.currentDocuments.bind('remove', this.render);
    this.state = {};
    this.hiddenFields = [];
    this.options = options;
  },

  events: {

  },

  // TODO: delete or re-enable (currently this code is not used from anywhere except deprecated or disabled methods (see above)).
  // showDialog: function(template, data) {
  //   if (!data) data = {};
  //   util.show('dialog');
  //   util.render(template, 'dialog-content', data);
  //   util.observeExit($('.dialog-content'), function() {
  //     util.hide('dialog');
  //   })
  //   $('.dialog').draggable({ handle: '.dialog-header', cursor: 'move' });
  // },


  // ======================================================
  // Column and row menus


  
  showColumn: function(e) {
    this.hiddenFields = _.without(this.hiddenFields, $(e.target).data('column'));
    this.render();
  },

  // ======================================================
  // #### Templating
  template: ' \
    <h1><span class="mixit btn">mix it up!</span></h1> \
    <p>after mix it up, with one click in a data, you will see the related row values</p>  \
    <table class="data-table table-striped table-condensed" cellspacing="0"> \
      <thead> \
      </thead> \
      <tbody></tbody> \
    </table> \
  ',
  events: {
    'click .mixit': 'mixitup',
    'click .mixselect': 'mixselect',
	},
	
	mixitup: function() {
		$('.mixitup').css('position', 'absolute'); 
		myleft = function(index) {
			index = Math.floor(Math.random()*800) + 20;
		  return index;
		};	
		mytop = function(index) {
			index = Math.floor(Math.random()*500) + 220;
		  return index;
		};	
		$('.mixitup').css('left', myleft);
		$('.mixitup').css('top', mytop);
		$('.mixitup').css('font-weight', 'bold');		
		$(".mixitup").click(function () {
    	$(".mixitup").css('font-size', '13px');		
    	$(this).parent().children().css('font-size', '50px');
		});	
	},

	mixselect: function() {
		// select all the elements in the same label
		//$("div data-id\=1").find(".mixitup").css('color', 'red');
	},

  toTemplateJSON: function() {
    var modelData = this.model.toJSON()
    modelData.notEmpty = ( this.fields.length > 0 )
    // TODO: move this sort of thing into a toTemplateJSON method on Dataset?
    modelData.fields = _.map(this.fields, function(field) { return field.toJSON() });
    return modelData;
  },
  render: function() {
    var self = this;
    this.fields = this.model.fields.filter(function(field) {
      return _.indexOf(self.hiddenFields, field.id) == -1;
    });
    var htmls = $.mustache(this.template, this.toTemplateJSON());
    this.el.html(htmls);
    this.model.currentDocuments.forEach(function(doc) {
      var tr = $('<div>');
      self.el.find('tbody').append(tr);
      var newView = new my.DataGridRowJaume({
          model: doc,
          el: tr,
          fields: self.fields
        },
        self.options
        );
      newView.render();
    });
    this.el.toggleClass('no-hidden', (self.hiddenFields.length == 0));
    return this;
  }
});

// ## DataGridRow View for rendering an individual document.
//
// Since we want this to update in place it is up to creator to provider the element to attach to.
//
// In addition you *must* pass in a FieldList in the constructor options. This should be list of fields for the DataGrid.
//
// Additional options can be passed in a second hash argument. Options:
//
// * cellRenderer: function to render cells. Signature: function(value,
//   field, doc) where value is the value of this cell, field is
//   corresponding field object and document is the document object. Note
//   that implementing functions can ignore arguments (e.g.
//   function(value) would be a valid cellRenderer function).
//
// Example:
//
// <pre>
// var row = new DataGridRow({
//   model: dataset-document,
//     el: dom-element,
//     fields: mydatasets.fields // a FieldList object
//   }, {
//     cellRenderer: my-cell-renderer-function 
//   }
// );
// </pre>
my.DataGridRowJaume = Backbone.View.extend({
  initialize: function(initData, options) {
    _.bindAll(this, 'render');
    this._fields = initData.fields;
    if (options && options.cellRenderer) {
      this._cellRenderer = options.cellRenderer;
    } else {
      this._cellRenderer = function(value) {
        return value;
      }
    }
    this.el = $(this.el);
    this.model.bind('change', this.render);
  },

  template: ' \
        <div class="btn-group row-header-menu"> \
        </div> \
      {{#cells}} \
		   <div class="mixitup">{{{value}}}</div> \
      {{/cells}} \
    ',
  
  toTemplateJSON: function() {
    var self = this;
    var doc = this.model;
    var cellData = this._fields.map(function(field) {
      return {
        field: field.id,
        value: self._cellRenderer(doc.get(field.id), field, doc)
      }
    })
    return { id: this.id, cells: cellData }
  },

  render: function() {
    this.el.attr('data-id', this.model.id);
    var html = $.mustache(this.template, this.toTemplateJSON());
    $(this.el).html(html);
    return this;
  },

  // ===================
  // Cell Editor methods
  
});

})(jQuery, recline.View);
