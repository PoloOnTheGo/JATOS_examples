/**
 * jspsych-cattell-text-nav
 * a jspsych plugin for Cattell images with text input responses and navigation buttons
 *
 * Becky Gilbert
 * based on the jspsych survey text plugin
 *
 */

 jsPsych.plugins['cattell-text-nav'] = (function() {
  var plugin = {};
  jsPsych.pluginAPI.registerPreload('single-stim', 'stimulus', 'image', function(t){ return !t.is_html || t.is_html == 'undefined';});

  plugin.info = {
    name: 'cattell-text-nav',
    description: '',
    parameters: {
      stimuli: {
        type: [jsPsych.plugins.parameterType.STRING],
        array: true,
        default: undefined,
        no_function: false,
        description: ''
      },
      is_html: {
        type: [jsPsych.plugins.parameterType.BOOL],
        default: false,
        no_function: false,
        description: ''
      },
      required: {
        type: [jsPsych.plugins.parameterType.BOOL],
        array: true,
        default: false,
        no_function: false,
        description: ''
      },
      rows: {
        type: [jsPsych.plugins.parameterType.INT],
        array: true,
        default: [1],
        no_function: false,
        description: ''
      },
      columns: {
        type: [jsPsych.plugins.parameterType.INT],
        array: true,
        default: [1],
        no_function: false,
        description: ''
      },
      placeholders: {
        type: [jsPsych.plugins.parameterType.STRING],
        array: true,
        default: '',
        no_function: false,
        description: ''
      },
      preamble: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: '',
        no_function: false,
        description: ''
      },
      posttext: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: '',
        no_function: false,
        description: ''
      },
      button_label_next: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: 'Next',
        no_function: false,
        description: ''
      },
      button_label_back: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: 'Back',
        no_function: false,
        description: ''
      },
      response_box_heading: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: '',
        no_function: false,
        description: ''
      },
      timing_response: {
        type: [jsPsych.plugins.parameterType.INT],
        default: -1,
        no_function: false,
        description: ''
      },
      validate_response: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: "",
        no_function: false,
        description: ''
      },
      validate_warning: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: "",
        no_function: false,
        description: ''
      },
      require_correct_to_continue: {
        type: [jsPsych.plugins.parameterType.BOOL],
        default: false,
        no_function: false,
        description: ''
      },
      correct: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: [],
        no_function: false,
        description: ''
      },
      show_button_label_back: {
        type: [jsPsych.plugins.parameterType.BOOL],
        default: true,
        no_function: false,
        description: ''
      }
    }
  };
  plugin.trial = function(display_element, trial) {
    var plugin_id_name = "jspsych-cattell-text-nav";
    var plugin_id_selector = '#' + plugin_id_name;
    var _join = function( /*args*/ ) {
      var arr = Array.prototype.slice.call(arguments, _join.length);
      return arr.join(separator = '-');
    };

    // trial defaults
    trial.preamble = typeof trial.preamble == 'undefined' ? plugin.info.parameters.preamble.default : trial.preamble;
    trial.posttext = (typeof trial.posttext == 'undefined') ? plugin.info.parameters.posttext.default : trial.posttext;
    trial.required = typeof trial.required == 'undefined' ? plugin.info.parameters.required.default : trial.required;
    trial.is_html = (typeof trial.is_html == 'undefined') ? false : trial.is_html;
    trial.button_label_back = (typeof trial.button_label_back === 'undefined') ? 'Back' : trial.button_label_back;
    trial.button_label_next = (typeof trial.button_label_next === 'undefined') ? 'Next' : trial.button_label_next;
    trial.response_box_heading = typeof trial.response_box_heading == 'undefined' ? plugin.info.parameters.response_box_heading.default : trial.response_box_heading;
    trial.timing_response = trial.timing_response || -1;
    trial.validate_response = trial.validate_response || "";
    trial.validate_warning = trial.validate_warning || "";
    trial.require_correct_to_continue = (typeof trial.require_correct_to_continue == 'undefined') ? false : trial.require_correct_to_continue;
    trial.correct = typeof trial.correct == 'undefined' ? plugin.info.parameters.correct.default : trial.correct;
    trial.show_button_label_back = typeof trial.show_button_label_back == 'undefined' ? plugin.info.parameters.show_button_label_back.default : trial.show_button_label_back;

    if (typeof trial.rows == 'undefined') {
      trial.rows = [];
      for (var i = 0; i < trial.stimuli.length; i++) {
        trial.rows.push(trial.rows.default);
      }
    }
    if (typeof trial.columns == 'undefined') {
      trial.columns = [];
      for (var i = 0; i < trial.stimuli.length; i++) {
        trial.columns.push(trial.columns.default);
      }
    }
    if (typeof trial.placeholders == 'undefined') {
      trial.placeholders = [];
      for (var i = 0; i < trial.stimuli.length; i++) {
        trial.placeholders.push("");
      }
    }

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    var current_page = 0;
    var view_history = [];
    var all_responses = [];
    var all_resp_box_interaction = [];
    var start_time = (new Date()).getTime();
    var last_page_update_time = start_time;

    function btn_listener(evt){
      evt.target.removeEventListener('click', btn_listener);
      if(this.id === "jspsych-cattell-text-nav-back"){
        back();
      }
      else if(this.id === 'jspsych-cattell-text-nav-next'){
        next();
      }
    }

    function show_current_page() {
      // inject CSS for trial
      display_element.innerHTML = '<style id="jspsych-cattell-text-nav-css"></style>';
      var cssstr = ".jspsych-display-element {justify-content:center;align-items:center;padding-top:20px;}" +
      ".jspsych-content-wrapper {max-width:95%;text-align:center;align-items:center;justify-content:center;}" + 
      ".jspsych-cattell-text-nav-stim span.required {color: darkred;}"+
      ".jspsych-cattell-text-nav-stim {text-align: right; margin-left: 1em; margin-right: 1em;}"+ //max-width: 70%;
      "input[type='text'] {font-size:20px;border:2px solid black;padding:3px 0px 3px 8px;width:20px;}" +
      "textarea {font-family:'Open Sans','Arial',sans-serif;font-size:20px;border: 2px solid black;resize:none;padding:0px 0px 0px 5px;}" + //label.jspsych-cattell-text-nav-stim // margin-right:0em;
      ".jspsych-cattell-text-nav-form {display: flex; margin: auto; flex-basis: auto; flex-grow: 1;}" +
      //".jspsych-cattell-text-nav-stim {text-align:center;}" +
      "img.jspsych-img-stim {width:600px;min-width:300px;}" + 
      "div.jspsych-cattell-text-nav-question p.jspsych-cattell-text-nav {margin: 5px; padding: 5px;}" +
      "div.jspsych-cattell-text-nav-preamble {margin-top:5px;margin-bottom:15px;}" +
      //".jpsych-cattell-text-nav-resp-box {text-align:left;vertical-align:top}" + //max-width: 30%;
      //"table td {border: 1px solid black;}" +
      "table {cellspacing=0px;cellpadding=0px;border-spacing:0px;border-collapse:collapse;align:center;}" +  
      //"tr td {height:200px;}" +
      //"td {vertical-align:top;}" + 
      //"td.jspsych-cattell-text-nav-stim {vertical-align:middle;}" +
      ".jspsych-btn {margin-bottom:2cm;}" +
      ".jspsych-cattell-text-nav-nav {text-align:center;padding:10px 0px}" +
      "input.jspsych-resp-box-warn {border:2px solid red;}" +
      "textarea.jspsych-resp-box-warn {border:2px solid red;}" +
      "#jspsych-validate-warn {color:red;font-weight:bold;overflow:auto;}"; 

        display_element.querySelector('#jspsych-cattell-text-nav-css').innerHTML = cssstr;

      // if there's validation, add a div at the top
      if (trial.validate_response !== "") {
        display_element.innerHTML += '<div id="jspsych-validate-warn" class="jspsych-display-element">' + trial.validate_warning + '</div>';
      }

      // form element 
      var trial_form_id = _join(plugin_id_name, "form");
      display_element.innerHTML += '<form id="'+trial_form_id+'"></form>';
      var trial_form = display_element.querySelector("#" + trial_form_id);

      // show preamble text
      var preamble_id_name = _join(plugin_id_name, 'preamble');
      trial_form.innerHTML += '<div id="'+preamble_id_name+'" class="'+preamble_id_name+'">'+trial.preamble[current_page]+'</div>';

      // table for stimuli/response boxes
      var trial_table_id = _join(plugin_id_name, "table");
      trial_form.innerHTML += '<div id="jspsych-cattell-table-container" class="jspsych-content-wrapper"><table id="'+trial_table_id+'" class="'+trial_table_id+' align="center"></table></div>'; 
      var trial_table = display_element.querySelector('#'+trial_table_id);

      // add a header above response box, if specified
      // if (typeof trial.response_box_heading !== 'undefined') {
      //   first_question_row = 1;
      //   var header = trial_table.insertRow(0);
      //   var h1 = header.insertCell(0);
      //   var h2 = header.insertCell(1);
      //   h2.id = _join(plugin_id_name, 'resp-head');
      //   h2.className = _join(plugin_id_name, 'resp-head');
      //   var h2_content = document.createElement('div');
      //   h2_content.innerHTML = trial.response_box_heading;
      //   document.getElementById(_join(plugin_id_name, 'resp-head')).appendChild(h2_content);
      // }

      if (trial.stimuli[current_page][0] !== "") {
      // add text response questions
        var n_rows = trial.stimuli[current_page].length;
        for (var i = 0; i < n_rows; i++) {

          // create table row with question container 
          var question_classes = [_join(plugin_id_name, 'question')];
          //trial_form.innerHTML += '<div id="'+_join(plugin_id_name, i)+'" class="'+question_classes.join(' ')+'"></div>';
          var row = trial_table.insertRow(i);
          var stim_cell = row.insertCell(0);
          var resp_cell = row.insertCell(1);

          var question_selector = _join(plugin_id_selector, i);

          // add question text and response box
          var question_id = _join(plugin_id_name, i);
          var resp_box_name = _join(plugin_id_name, "resp-box", i);
          var resp_box_selector = '#' + resp_box_name;
          if (!trial.is_html) {
            stim_cell.innerHTML = '<img class="jspsych-img-stim" src="' + trial.stimuli[current_page][i] + '">'; 
          } else {
            stim_cell.innerHTML = trial.stimuli[current_page][i]; 
          }
          stim_cell.id = question_id;
          stim_cell.className = plugin_id_name + '-stim';
          resp_cell.id = resp_box_name;
          resp_cell.className = _join(plugin_id_name, 'resp-box');

          // if (!trial.is_html) {
          //   display_element.querySelector(question_selector).innerHTML += '<p class="jspsych-cattell-text-nav ' + plugin_id_name + '-text cattell-text-nav"><img src="' + trial.stimuli[i] + '" id="' + question_id + '"><span id="' + resp_box_name + '" class="' + _join(plugin_id_name, 'resp-box') + '"></span></p>'; //</p>';
          // } else {
          //   display_element.querySelector(question_selector).innerHTML += '<p class="jspsych-cattell-text-nav ' + plugin_id_name + '-text cattell-text-nav" id="' + question_id + '">' + trial.stimuli[i]; + '<span id="'+resp_box_name + '" class="' + _join(plugin_id_name, 'resp-box') + '"></span></p>'; //+ '</p>';
          // }
          
          // add text input/area container
          // display_element.querySelector(question_selector).innerHTML += '<span id="'+resp_box_name+'" class="'+_join(plugin_id_name, 'resp-box')+'"></span></p>';

          // set up the text input/area 
          var question_container = document.getElementById(resp_box_name);
          var input_name = _join(plugin_id_name, 'response', i); // name and ID are the same
          var input; 

          if(trial.rows[i] == 1){
            // input[type=text]
            input = document.createElement('input');
            input.setAttribute('type', "text");
            //input.setAttribute('size', trial.columns[i]); // doesn't work well - set input width in CSS
          } else {
            // textarea
            input = document.createElement('textarea');
            input.setAttribute('rows', trial.rows[i]);
            input.setAttribute('cols', trial.columns[i]);
          }
          // add placeholder text
          if (trial.placeholders && trial.placeholders[current_page][i]) {
            input.setAttribute('placeholder', trial.placeholders[current_page][i]);
          }
          input.setAttribute('name', input_name);
          input.setAttribute('id', input_name);
          // add autofocus
          if (i === 0) {
            input.setAttribute('autofocus', true);
          }

          if (typeof trial.response_box_heading !== 'undefined') {
            question_container.innerHTML = trial.response_box_heading;
          }

          question_container.appendChild(input);

          //if (trial.required && trial.required[i]) {
            // add "question required" asterisk
            //display_element.querySelector(question_selector + " p").innerHTML += "<span class='required'>*</span>";

            // add required property
            // if (trial.rows[i] == 1) {
            //   display_element.querySelector(question_selector + " input[type=text]").required = true;
            // } else {
            //   display_element.querySelector(question_selector + " textarea").required = true;
            // }
          //} // end if
        } // end for
      } // end if 

      // add posttext
      var posttext_id_name = _join(plugin_id_name, 'posttext');
      trial_form.innerHTML += '<div id="'+posttext_id_name+'" class="'+posttext_id_name+'">'+trial.posttext[current_page]+'</div>';

      // add submit button
      // trial_form.innerHTML += '<input type="submit" id="'+plugin_id_name+'-next" class="'+plugin_id_name+' jspsych-btn"' + (trial.button_label ? ' value="'+trial.button_label + '"': '') + '></input>';
      
      // add next and back buttons
      var nav_html = "<div class='jspsych-cattell-text-nav-nav'>";
      if ((current_page !== 0) && (trial.show_button_label_back)) {
         nav_html += "<button id='jspsych-cattell-text-nav-back' class='jspsych-btn' style='margin-right: 5px;'>&lt; "+trial.button_label_back+"</button>";
      }
      nav_html += "<button id='jspsych-cattell-text-nav-next' class='jspsych-btn' style='margin-left: 5px;'>"+trial.button_label_next+" &gt;</button></div>";
      display_element.innerHTML += nav_html;
      if (current_page !== 0) {
        display_element.querySelector('#jspsych-cattell-text-nav-back').addEventListener('click', btn_listener);
      }
      display_element.querySelector('#jspsych-cattell-text-nav-next').addEventListener('click', btn_listener);
      if (trial.require_correct_to_continue && trial.stimuli[current_page][0] !== "") {
        display_element.querySelector('#jspsych-cattell-text-nav-next').disabled = true;
      }

    } // end show page function

    function next() {
      add_current_page_to_view_history();
      get_current_page_responses();
      current_page++;
      // if done, finish up...
      if (current_page >= trial.stimuli.length) {
        end_trial();
      } else {
        show_current_page();
        add_interaction_handlers();
        set_up_validation();
      }
    }

    function back() {
      add_current_page_to_view_history();
      get_current_page_responses();
      current_page--;
      show_current_page();
      set_up_validation();
    }

    function add_current_page_to_view_history() {
      var current_time = (new Date()).getTime();
      var page_view_time = current_time - last_page_update_time;
      view_history.push({
        page_index: current_page,
        viewing_time: page_view_time
      });
      last_page_update_time = current_time;
    }

    // submit button event listener
    // trial_form.addEventListener('submit', function(event) {
    //   event.preventDefault();

    var get_current_page_responses = function() {
      // measure response time
      //var end_time = (new Date()).getTime();
      //var response_time = end_time - start_time;

      // find all questions on the page
      var matches = display_element.querySelectorAll("td." + plugin_id_name + "-resp-box");

      // create object to hold responses
      var question_data = {};
      if (trial.stimuli[current_page][0] !== "") {
        for(var i=0; i<matches.length; i++){
          var id = "Q" + i;
          var val = matches[i].querySelector('textarea, input').value;
          var obje = {};
          obje[id] = val;
          Object.assign(question_data, obje);
        }
      }
      // save data
      // var trial_data = {
      //   //"rt": response_time,
      //   "responses": JSON.stringify(question_data)
      // };
      all_responses.push(question_data);
      console.log("end page: ");
      console.log(question_data);

    };

    function end_trial() {
      display_element.innerHTML = '';
      var trial_data = {
        "view_history": view_history,
        "responses": all_responses,
        "rt": (new Date()).getTime() - start_time,
        "resp_box_interaction": all_resp_box_interaction
      };
      console.log("end trial: ");
      console.log(trial_data);
      jsPsych.finishTrial(trial_data);
    }

    // end trial if timing_response is set
    if (trial.timing_response > 0) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.timing_response);
    }

    //var startTime = (new Date()).getTime();
    show_current_page();

    // function to add event handlers for response box focus/blur recording
    function add_interaction_handlers() {
      var resp_boxes = display_element.querySelectorAll('input[type=text],textarea');
      for (var k=0;k<resp_boxes.length;k++) {
        resp_boxes[k].addEventListener('focus', function(e) {
          var time_stamp = (new Date()).getTime() - last_page_update_time;
          var box_name = e.target.name;
          var box_number = box_name.split("jspsych-cattell-text-nav-response-")[1];
          var f_data = {
            "page": current_page,
            "resp_box": "R" + box_number,
            "time": time_stamp,
            "type": "focus"
          };
          console.log("focus: ", f_data);
          all_resp_box_interaction.push(f_data);
        });
        resp_boxes[k].addEventListener('blur', function(e) {
          var time_stamp = (new Date()).getTime() - last_page_update_time;
          var box_name = e.target.name;
          var box_number = box_name.split("jspsych-cattell-text-nav-response-")[1];
          var b_data = {
            "page": current_page,
            "resp_box": "R" + box_number,
            "time": time_stamp,
            "type": "blur"
          };
          console.log("blur: ", b_data);
          all_resp_box_interaction.push(b_data);
        });
      }
    }
    add_interaction_handlers();

    // add event handlers for response validation
    if (trial.validate_response !== "") {

      // function check_for_invalid() {
      //   if (document.getElementById("jspsych-validate-warn").style.visibility === "visible") {
      //     return true;
      //   } else {
      //     return false;
      //   }
      // }

      function enable_next_when_correct(e) {
        if (e.value === trial.correct[current_page]) {
          display_element.querySelector('#jspsych-cattell-text-nav-next').disabled = false;
        } else {
          display_element.querySelector('#jspsych-cattell-text-nav-next').disabled = true;
        }
      }

      function do_response_validation(e,val_regex) {
        if (!(val_regex.test(e.value)) && e.value !== "") {
          e.classList.add('jspsych-resp-box-warn');
          //e.className += 'jspsych-resp-box-warn';
          document.getElementById("jspsych-validate-warn").style.visibility = "visible";
        } else {
          e.classList.remove('jspsych-resp-box-warn');
          document.getElementById("jspsych-validate-warn").style.visibility = "hidden";
        }
      }

      function set_up_validation() {
        document.getElementById("jspsych-validate-warn").style.visibility = "hidden";
        if (trial.stimuli[current_page][0] !== "") {
          var val_regex = new RegExp(trial.validate_response);
          var resp_boxes = display_element.querySelectorAll('input[type=text],textarea');
          for (var j=0;j<resp_boxes.length;j++) {
            // remove any existing warnings
            resp_boxes[j].classList.remove('jspsych-resp-box-warn');
            document.getElementById("jspsych-validate-warn").style.visibility = "hidden";

            // add focus/blur listeners
            resp_boxes[j].addEventListener('blur', function(e) {
              do_response_validation(this,val_regex);
              if (trial.require_correct_to_continue) {
                enable_next_when_correct(this);
              }
            }, false);

            resp_boxes[j].addEventListener('focus', function(e) {
              this.classList.remove('jspsych-resp-box-warn');
              document.getElementById("jspsych-validate-warn").style.visibility = "hidden";
              if (trial.require_correct_to_continue) {
                enable_next_when_correct(this);
              }
            }, false);

            resp_boxes[j].addEventListener('input', function(e) {
              do_response_validation(this,val_regex);
              if (trial.require_correct_to_continue) {
                enable_next_when_correct(this);
              }
            }, false);
          }        
        }
      }
      set_up_validation();  
    }
  };

  return plugin;
})();
