(function() {

  var jQuery;

  if (window.jQuery === undefined) {
    console.log("jquery was not found");

    var script_tag = document.createElement('script');
    script_tag.setAttribute("type","text/javascript");
    script_tag.setAttribute("src",
        "https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js");
    if (script_tag.readyState) {
      script_tag.onreadystatechange = function () { // For old versions of IE
          if (this.readyState == 'complete' || this.readyState == 'loaded') {
              scriptLoadHandler();
          }
      };
    } else {
      script_tag.onload = scriptLoadHandler;
    }
    // Try to find the head, otherwise default to the documentElement
    (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
  } else {
    console.log("jquery was found");
    // The jQuery version on the window is the one we want to use
    jQuery = window.jQuery;
    main();
  }

  function scriptLoadHandler() {
    // Restore $ and window.jQuery to their previous values and store the
    // new jQuery in our local jQuery variable
    jQuery = window.jQuery.noConflict(true);
    // Call our main function
    main();
  }

  /* TUTORIAL PUBLIC CLASS DEFINITION
  * =============================== */

  var Tutorial = function(options) {
    this.init('tutorial', options);
  }

  Tutorial.prototype = {

    constructor: Tutorial,

    init: function(type, options) {
      this.type = type;
      this.options = options;
      this.tutorialItemIndex = 0;
      this.tutorialItems = [];
    },

    start: function() {
      this.bindEvents();

      if (!this.options.active) {
        console.log(this.options.name + " is NOT active.");
        return;
      }

      if (this.tutorialItems.length === 0) {
        console.log(this.options.name + " has ZERO tutorial items.");
        return;
      } else {
        this.initTutorialItem();
      }
    },

    initTutorialItem: function() {
      var tutorialItems = this.tutorialItems;
      var index = this.tutorialItemIndex;

      if (index < tutorialItems.length - 1) {
        tutorialItems[index].show(next = true);
      } else {
        tutorialItems[index].show();
      }
    },

    nextTutorialItem: function() {
      var tutorialItems = this.tutorialItems;
      var index = this.tutorialItemIndex;

      tutorialItems[index].hide();
      this.tutorialItemIndex++

      this.initTutorialItem();
    },

    bindEvents: function() {
      $(document).on('click', '.bubble-action.action-next', this.nextTutorialItem.bind(this));
    }
    
  }

  /* TUTORIAL ITEM PUBLIC CLASS DEFINITION
  * =============================== */

  var TutorialItem = function(options) {
    this.init('tutorialItem', options);
  }

  TutorialItem.prototype = {

    constructor: TutorialItem,

    init: function(type, options) {
      this.type = type;
      this.options = options;
      this.element = this.getElement();
      this.template = $('<div style="position: absolute;background-color: #151582;color: white;padding: .5em;" class="bubble"><div class="bubble-arrow"></div><div class="bubble-inner"></div></div>');
    },

    show: function(next = false) {
      var pos = this.getPosition(this.element[0]);
      this.setPosition(pos);

      if (this.options.content) {
        this.setContent(next);
      }

      $('body').append(this.template);
    },

    hide: function() {
      var $bubble = this.template;
      $bubble.detach();
    },

    getElement: function() {
      if (!this.options.css_selector) {
        console.log("no css selector found");
        return;
      }

      var $element = $(this.options.css_selector);

      if ($element.length > 1) {
        $element = $element.first();
      }

      return $element;
    },

    getPosition: function(element) {
      var position;
      var elemRect = element.getBoundingClientRect();
      position = {
        top: elemRect.top + window.scrollY,
        right: elemRect.right,
        bottom: elemRect.bottom,
        left: elemRect.left + window.scrollX,
        Ymiddle: (elemRect.top + window.scrollY + elemRect.bottom) / 2,
        Xmiddle: (elemRect.left + window.scrollX + elemRect.right) / 2
      };

      return position;
    },

    setPosition: function(pos) {
      var $bubble = this.template;
      $bubble.css({top: pos.Ymiddle, left: pos.right, display: 'block'});
    },

    setContent: function(next) {
      var $bubble = this.template;
      var content = this.options.content;
      $bubble.find('.bubble-inner')['text'](content);

      //if there is a tutorial item that is next show this, otherwise, show nothing
      if (next) {
        var $actionBtn = '<div class="bubble-action action-next" style="background-color: #5959f7;width: 30%;text-align: center;float: right;">Next</div>';
        $bubble.append($actionBtn);
      }
    }

  }

  function main() { 
    jQuery(document).ready(function($) { 
        /******* Load CSS *******/
        // var css_link = $("<link>", { 
        //     rel: "stylesheet", 
        //     type: "text/css", 
        //     href: "style.css" 
        // });
        // css_link.appendTo('head');          

        var api_url = "http://api.stevenlocal.com:3000/v1/sites/1/tutorials";
        $.getJSON(api_url, function(data) {

          if (data['data'].length === 0) {
            console.log("data member is empty; no tutorials");
            return;
          }

          var result = parseTutorialData(data);
          console.log(result);
          //for testing
          result[0].start();
        });
    });
  }

  function parseTutorialData(data) {
    var dataArray = data['data'];
    var includedArray = data['included'];

    if (includedArray.length === 0) {
      console.log("included member is empty; no tutorial items");
      return;
    }

    var tutorialsArray = [];

    for (i = 0; i < dataArray.length; i++) {
      var tutorial = new Tutorial(dataArray[i]['attributes']);
      var tutorialItemRelationships = dataArray[i]['relationships']['tutorial_items']['data'];

      for (j = 0; j < includedArray.length; j++) {
        var tutorialItemId = includedArray[j]['id'];

        for (t = 0; t < tutorialItemRelationships.length; t++) {
          var relId = tutorialItemRelationships[t]['id'];

          if (relId === tutorialItemId) {
            tutorial.tutorialItems.push(new TutorialItem(includedArray[j]['attributes']));
          }
        }
      }

      tutorialsArray.push(tutorial);
    }

    return tutorialsArray;
  }

})();