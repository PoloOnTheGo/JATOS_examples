/**
 * jspsych-survey-text
 * a jspsych plugin for free response survey questions
 *
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 *
 */
 // edited by Becky Gilbert to allow audio player before each question

jsPsych.plugins['survey-text-audio'] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'survey-text-audio',
    description: '',
    parameters: {
      questions: {
        type: [jsPsych.plugins.parameterType.STRING],
        array: true,
        default: undefined,
        no_function: false,
        description: ''
      },
      preamble: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: '',
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
        default: 40,
        no_function: false,
        description: ''
      },
      values: {
        type: [jsPsych.plugins.parameterType.STRING],
        array: true,
        default: '',
        no_function: false,
        description: ''
      },
      button_label: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: 'Next',
        no_function: false,
        description: ''
      },
      audio: {
        type: [jsPsych.plugins.parameterType.STRING],
        array: true,
        default: '',
        no_function: false,
        description: ''
      }
    }
  };

  plugin.trial = function(display_element, trial) {

    trial.preamble = typeof trial.preamble == 'undefined' ? "" : trial.preamble;
    trial.button_label = typeof trial.button_label === 'undefined' ? 'Next' : trial.button_label;

    if (typeof trial.audio === 'undefined') {
      trial.audio = Array.apply(null,Array(trial.questions.length)).map(function() {return '';});
    } else if (trial.audio.length !== trial.questions.length) {
      console.error('Error: trial audio must be an array of the same length as the trial questions array.');
    }

    if (typeof trial.rows == 'undefined') {
      trial.rows = [];
      for (var i = 0; i < trial.questions.length; i++) {
        trial.rows.push(1);
      }
    }
    if (typeof trial.columns == 'undefined') {
      trial.columns = [];
      for (var i = 0; i < trial.questions.length; i++) {
        trial.columns.push(40);
      }
    }
    if (typeof trial.values == 'undefined') {
      trial.values = [];
      for (var i = 0; i < trial.questions.length; i++) {
        trial.values.push("");
      }
    }

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // show preamble text
    var html = '<div id="jspsych-survey-text-preamble" class="jspsych-survey-text-preamble">'+trial.preamble+'</div>';

    // add questions
    for (var i = 0; i < trial.questions.length; i++) {
      html += '<div id="jspsych-survey-text-"'+i+'" class="jspsych-survey-text-question" style="margin: 2em 0em;">';
      html += '<p class="jspsych-survey-text">' + trial.questions[i] + '</p>';
      if (trial.audio[i] !== "") {
        html += '<div id="jspsych-audio-player"><audio src = "' + trial.audio[i] + '" controls>Your browser does not support the audio element.</audio></div>';
      }
      if(trial.rows[i] == 1){
        if (i == 0) {
          html += '<input autofocus type="text" name="#jspsych-survey-text-response-' + i + '" size="'+trial.columns[i]+'">'+trial.values[i]+'</input>';
        } else {
          html += '<input type="text" name="#jspsych-survey-text-response-' + i + '" size="'+trial.columns[i]+'">'+trial.values[i]+'</input>';
        }
      } else {
        if (i == 0) {
          html += '<textarea autofocus name="#jspsych-survey-text-response-' + i + '" cols="' + trial.columns[i] + '" rows="' + trial.rows[i] + '">'+trial.values[i]+'</textarea>';
        } else {
        html += '<textarea name="#jspsych-survey-text-response-' + i + '" cols="' + trial.columns[i] + '" rows="' + trial.rows[i] + '">'+trial.values[i]+'</textarea>';
        }
      }
      html += '</div>';
    }

    // add submit button
    html += '<button id="jspsych-survey-text-next" class="jspsych-btn jspsych-survey-text">'+trial.button_label+'</button>';

    display_element.innerHTML = html;

    display_element.querySelector('#jspsych-survey-text-next').addEventListener('click', function() {
      // measure response time
      var endTime = (new Date()).getTime();
      var response_time = endTime - startTime;

      // create object to hold responses
      var question_data = {};
      var matches = display_element.querySelectorAll('div.jspsych-survey-text-question');
      for(var index=0; index<matches.length; index++){
        var id = "Q" + index;
        var val = matches[index].querySelector('textarea, input').value;
        var obje = {};
        obje[id] = val;
        Object.assign(question_data, obje);
      }
      // save data
      var trialdata = {
        "rt": response_time,
        "responses": JSON.stringify(question_data)
      };

      display_element.innerHTML = '';

      // next trial
      jsPsych.finishTrial(trialdata);
    });

    var startTime = (new Date()).getTime();
  };

  return plugin;
})();
