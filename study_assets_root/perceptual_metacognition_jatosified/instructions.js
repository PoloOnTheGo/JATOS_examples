/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds
var credit_var = true

/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */

/* define static blocks */
var feedback_instruct_text =
	'Welcome to the experiment. This experiment should take about 30 minutes. Press <strong>enter</strong> to begin.'
var feedback_instruct_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "instruction"
	},
	cont_key: [13],
	text: getInstructFeedback,
	timing_post_trial: 0,
	timing_response: 180000
};
/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.
var instructions_block = {
	type: 'poldrack-instructions',
	data: {
		trial_id: "instruction"
	},
	pages: [
		'<div class = centerbox><p class = block-text>In this experiment, you will see two patches of random noise. In one of the patches there is a slight grating (a striped pattern). Your task is to indicate whether the left or right stimulus has the grating by using the arrow keys. There is a fixation cross in the middle of the screen. The patches come on the screen for a very short amount of time, so keep your eyes on the cross.</p><p class = block-text>After you make your choice you will be asked to rate how confident you are that you were correct, on a scale from 1 to 4. Press the corresponding number key to indicate your confidence. We will begin with practice after you end the instructions.</p></div>'
	],
	allow_keys: false,
	show_clickable_nav: true,
	timing_post_trial: 1000
};

var instruction_node = {
	timeline: [feedback_instruct_block, instructions_block],
	/* This function defines stopping criteria */
	loop_function: function(data) {
		for (i = 0; i < data.length; i++) {
			if ((data[i].trial_type == 'poldrack-instructions') && (data[i].rt != -1)) {
				rt = data[i].rt
				sumInstructTime = sumInstructTime + rt
			}
		}
		if (sumInstructTime <= instructTimeThresh * 1000) {
			feedback_instruct_text =
				'Read through instructions too quickly.  Please take your time and make sure you understand the instructions.  Press <strong>enter</strong> to continue.'
			return true
		} else if (sumInstructTime > instructTimeThresh * 1000) {
			feedback_instruct_text =
				'Done with instructions. Press <strong>enter</strong> to continue.'
			return false
		}
	}
}

/* create experiment definition array */
var perceptual_metacognition_experiment = [];
perceptual_metacognition_experiment.push(instruction_node);
