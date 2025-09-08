// Declare options
var default_options = {
	url: '',
	header: 'GreenTech High School Alerts',
	footer: 'Monday, March 20, 2017',
	uREC_ID: null,
	pREC_ID: null,
	debug: false,
	visible: false,
	targetLocation: "",
	ssp: true,
	dsp: {
		parentID: null,
		REC_ID: null,
	}
};
var alertActive = 0;
var pageResponse = '';
var disabledPage = '<b>No Faculty or Staff are listed at this time.</b><br><br>';

function alertBox(options) {
	var alertBox = jQuery.extend({}, default_options, options || {});

	function closeAlert() {
		$("#alert-box, #alert-box-overlay").fadeOut();
		$("#alert-box").attr("aria-hidden", "true");
		$(document).unbind("keyup");
		alertBox.visible = false;
	}
		
	// Check if Alert is set to visible
	if (alertBox.visible == true) {
		// check if on homepage
		if (window.location.pathname === '/' || window.location.pathname === '/index.jsp' || window.location.pathname === alertBox.targetLocation) {
			// Display URL's based on if SSP or DSP
			var alertURL = '';
			if (alertBox.ssp == true) {
				alertURL = '/apps/pages/index.jsp?uREC_ID=' + alertBox.uREC_ID + '&type=d&pREC_ID=' + alertBox.pREC_ID + '&strip=1';
			} else {
				if (alertBox.dsp.REC_ID == alertBox.dsp.parentID) {
					alertURL = '/apps/pages/index.jsp?uREC_ID=' + alertBox.uREC_ID + '&type=d&pREC_ID=' + alertBox.pREC_ID + '&strip=1';
				} else {
                   alertURL = '/apps/cross.jsp?strip=1&wREC_ID='+ alertBox.dsp.parentID +'&crossPath=/apps/pages/index.jsp%3FuREC_ID%3D' + alertBox.uREC_ID + '%26type%3Dd%26pREC_ID%3D' + alertBox.pREC_ID + '%26strip=1';
				}
			}
			// Load alert content 
			if (alertBox.debug != true) {
				$.ajax({
					url: alertURL,
					success: function(response) {
						response = response.replace(/^\s+|\s+$/g, '');
						if (response.indexOf('No Faculty or Staff are listed at this time.') > 1 || response == disabledPage || response == '') {
							alertActive = 0;
						} else {
							alertActive = 1;
						}
						pageResponse = response;
					},
					async: false
				});
			} else {
				// Debug Text 
				pageResponse = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer scelerisque ipsum at felis fringilla pharetra. Fusce consequat mauris at ipsum lacinia mattis. Quisque dolor elit, commodo eget maximus non, viverra bibendum augue. Aenean ante elit, porttitor gravida tellus sed, accumsan vestibulum justo.'
				alertActive = 1;
			}
			// Check if alert has content 
			if (alertActive == 1) {
				// Append alert html
				$('#alert-holder').append('<div id=alert-box-overlay></div><div tabindex="0" role="region" aria-label="' + alertBox.header + '" class=alert-box id=alert-box><div class=alert-box-header><a tabindex="0" aria-label="Close alerts" class=close href=#>×</a><h1 role="alert">' + alertBox.header + '</h1></div><div class=alert-box-body><div class=contents>' + pageResponse + '</div></div><div class=alert-box-footer>' + alertBox.footer + '<div></div>').prependTo($("body"));
				// Check for images 
				if ($('.alert-box img.sub').length > 0) {
					$(".alert-box table a img.sub:first-child").each(function(index) {
						var grabSrc = $(this).attr('src').split("_thumb").join("");
						$('.alert-box-body').append('<img class="regImg" src="' + grabSrc + '" /> ');
					});
				}
				// Center alert box
				var alertHeight = $("#alert-box").height() / 2;
				var alertWidth = $("#alert-box").width() / 2;
				$("#alert-box").css('margin-top', -alertHeight);
				$("#alert-box").css('margin-left', -alertWidth);
				// Remove last br 
				
				$('#alert-box .contents div br, #alert-box .contents br').last().remove();
				// Add handler for closing alert
				
				$("#alert-box .close, #alert-box-overlay").click(function() {
					 closeAlert();
				});

				$(document).bind("keyup", function(e) {
					if(!alertBox.visible) return;
					if (e.keyCode === 27) {
						closeAlert();
					}
				});

				$('[role="navigation"]').attr({"tabindex":0,"safe-unset":1});
				
				$("#alert-box").bind("blur focusout focusin", function(e) {
					window.setTimeout(function() {
						if(!$(document.activeElement).parents("#alert-holder").length) {
							closeAlert();
						}
					}, 3000);
				});
				
				$("#alert-box, #alert-box-overlay").show().promise().done(function(){
					document.getElementById("alert-box").focus();
				});
			}
		}
	} 
}
// make defaults public
alertBox.default_options = default_options;
