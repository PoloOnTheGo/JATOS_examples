/**
 * jspsych-cattell-text
 * a jspsych plugin for Cattell images with text input responses
 *
 * Becky Gilbert
 * based on the jspsych survey text plugin
 *
 */

jsPsych.plugins['cattell-text'] = (function() {
  var plugin = {};
  jsPsych.pluginAPI.registerPreload('single-stim', 'stimulus', 'image', function(t){ return !t.is_html || t.is_html == 'undefined'});

  plugin.info = {
    name: 'cattell-text',
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
        default: 1,
        no_function: false,
        description: ''
      },
      columns: {
        type: [jsPsych.plugins.parameterType.INT],
        array: true,
        default: 1,
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
      button_label: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: 'Next',
        no_function: false,
        description: ''
      }
    }
  };
  plugin.trial = function(display_element, trial) {
    var plugin_id_name = "jspsych-cattell-text";
    var plugin_id_selector = '#' + plugin_id_name;
    var _join = function( /*args*/ ) {
      var arr = Array.prototype.slice.call(arguments, _join.length);
      return arr.join(separator = '-');
    };

    // trial defaults
    trial.preamble = typeof trial.preamble == 'undefined' ? plugin.info.parameters.preamble.default : trial.preamble;
    trial.posttext = typeof trial.posttext == 'undefined' ? plugin.info.parameters.posttext.default : trial.posttext;
    trial.required = typeof trial.required == 'undefined' ? plugin.info.parameters.required.default : trial.required;
    trial.button_label = typeof trial.button_label === 'undefined' ? plugin.info.parameters.button_label.default : trial.button_label;
    trial.is_html = (typeof trial.is_html == 'undefined') ? false : trial.is_html;

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

    // inject CSS for trial
    display_element.innerHTML = '<style id="jspsych-cattell-text-css"></style>';
    var cssstr = ".jspsych-display-element {justify-content: center;align-items: center;}" +
      ".jspsych-content-wrapper {margin-right:2em;margin-left:2em;margin-top:2em;margin-bottom:2em;max-width:95%;align:center;}" +
      ".jspsych-cattell-text-question {text-align: left;}"+
      ".jspsych-cattell-text-stim span.required {color: darkred;}"+
      ".jspsych-cattell-text-stim {text-align: right; display: inline-block; margin-left: 1em; margin-right: 1em;  vertical-align: top}"+ //max-width: 70%;
      "label.jspsych-cattell-text-stim input[type='text'] {margin-right: 0em;} textarea {font-family: 'Open Sans', 'Arial', sans-sefif;font-size: 14px;}" +
      ".jspsych-cattell-text-form {display: flex; margin: auto; flex-basis: auto; flex-grow: 1;}" +
      //".jspsych-cattell-text-stim {text-align:center;}" +
      "img {width:600px;min-width: 300px;}" +
      "div.jspsych-cattell-text-question p.jspsych-cattell-text {margin: 5px; padding: 5px;}" +
      "div.jspsych-cattell-text-preamble {margin-top:5px;margin-bottom:15px;}" +
      ".jpsych-cattell-text-resp-box {text-align:left;}" + //max-width: 30%;
      //"table td {border: 1px solid black;}" +
      "table {cellspacing=0px;cellpadding=0px;border-spacing:0px;border-collapse: collapse;align-items:center;justify-content:center;}" + // doesn't work
      ".jspsych-btn {float:right;margin-bottom:2cm;}"; 

    display_element.querySelector('#jspsych-cattell-text-css').innerHTML = cssstr;

    // form element 
    var trial_form_id = _join(plugin_id_name, "form");
    display_element.innerHTML += '<form id="'+trial_form_id+'"></form>';
    var trial_form = display_element.querySelector("#" + trial_form_id);

    // show preamble text
    var preamble_id_name = _join(plugin_id_name, 'preamble');
    trial_form.innerHTML += '<div id="'+preamble_id_name+'" class="'+preamble_id_name+'">'+trial.preamble+'</div>';

    // table for stimuli/response boxes
    var trial_table_id = _join(plugin_id_name, "table");
    trial_form.innerHTML += '<div id="jspsych-cattell-table-container" class="jspsych-content-wrapper"><table id="'+trial_table_id+'" class="'+trial_table_id+'" align="center"></table></div>';
    var trial_table = display_element.querySelector('#'+trial_table_id);
    console.log(trial_table); //null - start here

    // add text response questions
    for (var i = 0; i < trial.stimuli.length; i++) {

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
        stim_cell.innerHTML = '<img src="' + trial.stimuli[i] + '">'; 
      } else {
        stim_cell.innerHTML = trial.stimuli[i]; 
      }
      stim_cell.id = question_id;
      stim_cell.className = 'jspsych-cattell-text ' + plugin_id_name + '-stim';
      resp_cell.id = resp_box_name;
      resp_cell.className = _join(plugin_id_name, 'resp-box');

      // if (!trial.is_html) {
      //   display_element.querySelector(question_selector).innerHTML += '<p class="jspsych-cattell-text ' + plugin_id_name + '-text cattell-text"><img src="' + trial.stimuli[i] + '" id="' + question_id + '"><span id="' + resp_box_name + '" class="' + _join(plugin_id_name, 'resp-box') + '"></span></p>'; //</p>';
      // } else {
      //   display_element.querySelector(question_selector).innerHTML += '<p class="jspsych-cattell-text ' + plugin_id_name + '-text cattell-text" id="' + question_id + '">' + trial.stimuli[i]; + '<span id="'+resp_box_name + '" class="' + _join(plugin_id_name, 'resp-box') + '"></span></p>'; //+ '</p>';
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
        input.setAttribute('size', trial.columns[i]);
      } else {
        // textarea
        input = document.createElement('textarea');
        input.setAttribute('rows', trial.rows[i]);
        input.setAttribute('cols', trial.columns[i]);
      }
      // add placeholder text
      if (trial.placeholders && trial.placeholders[i]) {
        input.setAttribute('placeholder', trial.placeholders[i]);
      }
      input.setAttribute('name', input_name);
      input.setAttribute('id', input_name);
      // add autofocus
      if (i === 0) {
        input.setAttribute('autofocus', true);
      }

      question_container.appendChild(input);

      if (trial.required && trial.required[i]) {
        // add "question required" asterisk
        //display_element.querySelector(question_selector + " p").innerHTML += "<span class='required'>*</span>";

        // add required property
        // if (trial.rows[i] == 1) {
        //   display_element.querySelector(question_selector + " input[type=text]").required = true;
        // } else {
        //   display_element.querySelector(question_selector + " textarea").required = true;
        // }
      }
    }

    // add posttext
    var posttext_id_name = _join(plugin_id_name, 'posttext');
    trial_form.innerHTML += '<div id="'+posttext_id_name+'" class="'+posttext_id_name+'">'+trial.posttext+'</div>';

    // add submit button
    trial_form.innerHTML += '<input type="submit" id="'+plugin_id_name+'-next" class="'+plugin_id_name+' jspsych-btn"' + (trial.button_label ? ' value="'+trial.button_label + '"': '') + '></input>';

    // submit button event listener
    trial_form.addEventListener('submit', function(event) {

      event.preventDefault();
      
      // measure response time
      var endTime = (new Date()).getTime();
      var response_time = endTime - startTime;

      // find all questions on the page
      var matches = display_element.querySelectorAll("div." + plugin_id_name + "-question");

      // create object to hold responses
      var question_data = {};
      for(var i=0; i<matches.length; i++){
        var id = "Q" + i;
        var val = matches[i].querySelector('textarea, input').value;
        var obje = {};
        obje[id] = val;
        Object.assign(question_data, obje);
      }
      // save data
      var trial_data = {
        "rt": response_time,
        "responses": JSON.stringify(question_data)
      };
      display_element.innerHTML = '';

      // next trial
      jsPsych.finishTrial(trial_data);

    });

    var startTime = (new Date()).getTime();

  };

  return plugin;
})();
