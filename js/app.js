/* Vars */

var meme_image_list = $('#meme-images > li'),
	font_list = $('#meme-fonts > li'),
	active_meme = meme_image_list.filter('.active')[0].children[0].getAttribute('data-img'),
	active_font = font_list.filter('.active')[0].children[0].getAttribute('data-font'),
	color1 = $('#color1'),
	color2 = $('#color2'),
	meme_label = $('#label-active-meme'),
	font_label = $('#label-active-font'),
	canvas = $('#cvs')[0],
	top_input = $('#text-top'),
	bottom_input = $('#text-bottom'),
	generate = $('#generate'),
	userlink = $('#img-link'),
	spinner = $('#spinner'),
	font_size = $("#font-size"),
	outline_size = $("#outline-size"),
	api_key_btn = $('#api-key'),
	api_key_input = $('#api-key-input'),
	ctx = canvas.getContext('2d'),
	PATH = 'images/';

/* Draw function
 * I render the image on the page
 * */
function draw() {
	var img = $("<img />")[0];
	img.src = PATH + active_meme;
	img.onload = function(e) {
		canvas.height = img.height;
		canvas.width = img.width;
		ctx.save();
		ctx.clearRect(0, 0, img.height, img.width);
		ctx.drawImage(img, 0, 0, img.width, img.height);

		ctx.font = "bold " + font_size.val() + "px " + active_font;
		ctx.textAlign = "center";
		ctx.fillStyle = color1.val();
		ctx.fillText(top_input.val(), img.width / 2, parseFloat(font_size.val()), img.width);
		ctx.fillText(bottom_input.val(), img.width / 2, img.height - 10, img.width);

		if( outline_size.val() > 0 ) {
			ctx.strokeStyle = color2.val();
			ctx.lineWidth = outline_size.val();
			ctx.strokeText(top_input.val(), img.width / 2, parseFloat(font_size.val()), img.width);
			ctx.strokeText(bottom_input.val(), img.width / 2, img.height - 10, img.width);
		}

		ctx.restore();
	};
}

//Called on window onbeforeunload to save it all
//localStorage uses synchronous disk i/o so obviously
//it's not a good idea to constantly save there
function persist_settings() {

	if (!window.localStorage || !window.JSON) {
		return;
	}	

	var storeObj = {
		active_meme: active_meme,
		active_font: active_font,
		font_size: font_size.val(),
		outline_size: outline_size.val(),
		color1: color1.val(),
		color2: color2.val(),
		top_text: top_input.val(),
		bottom_text: bottom_input.val(),
		
	};
	
	localStorage.setItem("lememe_preferences", JSON.stringify(storeObj));
}

function load_settings() {
	var item;

	if (!window.localStorage || !window.JSON) {
		return;
	}
	
	item = localStorage.getItem("lememe_preferences");
	
	if (!item) {
		return;
	}
	
	return JSON.parse( item );
}


function swap_active_meme(e) {
	meme_image_list.each(function(i, el) {
		if (e.target.parentNode != el) {
			el.className = '';
		} else {
			el.className = 'active';
			active_meme = el.children[0].getAttribute('data-img');
			meme_label.text($(el.children[0]).text());
		}
	});
	draw();
	e.preventDefault();
}

function swap_active_font(e) {
	font_list.each(function(i, el) {
		if (e.target.parentNode != el) {
			el.className = '';
		} else {
			el.className = 'active';
			active_font = el.children[0].getAttribute('data-font');
			font_label.text($(el.children[0]).text());
		}
	});
	draw();
	e.preventDefault();
}

function image_uploaded(data) {
	Notifier.success('Your image has been uploaded successfully.', 'Complete!');
	spinner.hide();
	userlink.val(data['upload']['links']['original']);
	userlink[0].select();
	userlink[0].focus();
}
function image_upload_failed() {
	Notifier.error('Could not reach imgur service. Enter a new API Key or wait a few minutes and try again.', 'Error!');
	spinner.hide();
}

function generate_meme(e) {
	spinner.show();
	var dataURL = canvas.toDataURL("image/png").split(',')[1];
	$.ajax({
		url: 'http://api.imgur.com/2/upload.json',
		type: 'POST',
		data: {
			type: 'base64',
			key: api_key_input.val(),
			image: dataURL
		},
		dataType: 'json'
	}).success(image_uploaded).error(image_upload_failed);
	e.preventDefault();
	return false;
}

function update_api_key(e) {
	if( $.cookie('lememe-api-key') != $(this).val() ) {
		$.cookie('lememe-api-key', $(this).val(), { expires: 7 });
		Notifier.info('Your API KEY will be rememberd in your browsers cookies for 7 days. If you would like to revert to the old key please clear your browsers cookies and refresh the page.', 'API KEY Saved!');
	}
	$(this).unbind('blur', update_api_key);
	api_key_btn.show();
	api_key_input.hide();
	e.preventDefault();
	return false;
}

function show_api_key_input(e) {
	api_key_btn.hide();
	api_key_input.show();
	api_key_input.bind('blur', update_api_key);
	api_key_input[0].select();
	api_key_input[0].focus();
	e.preventDefault();
	return false;
}

function register_events() {
	$([top_input[0], bottom_input[0]]).on('keyup', draw);
	meme_image_list.on('click', swap_active_meme);
	font_list.on('click', swap_active_font);
	generate.on('click', generate_meme);
	api_key_btn.on('click', show_api_key_input);
	
	/* quick and dirty disable form submission */
	$('.nosubmit-form').submit(function(e) {
		e.preventDefault();
		return false;
	});
	//Persist settings before closing tab
	$(window).on("beforeunload", persist_settings);
}

function init() {
	var settings = load_settings(),
		active_meme_item,
		active_font_item;
	
	if (settings) {
		active_meme_item = meme_image_list.filter(function(){
			return $(this.children[0]).data('img') === settings.active_meme;
		});
		active_font_item = font_list.filter(function(){
			return $(this.children[0]).data('font') === settings.active_font;
		});
		active_meme = settings.active_meme;
		active_font = settings.active_font;
		
		meme_label.text(active_meme_item.children().text());
		font_label.text(active_font_item.children().text());

		color1.val(settings.color1);
		color2.val(settings.color1);
		font_size.val(settings.font_size);
		outline_size.val(settings.outline_size);
		top_input.val(settings.top_text);
		bottom_input.val(settings.bottom_text);
	}
	register_events();
	
	/* color picker init */
	$('input.color-picker').miniColors({
		change: function(hex, rgb) {
			draw();
		}
	});

	font_size.on('slide', draw);
	outline_size.on('slide', draw);

	/* preview font faces */
	font_list.each(function() {
		var link = $(this).children('a');
		link.css('font-family', link.attr('data-font'));
	});

	/* check for stored api key */
	if( $.cookie('lememe-api-key') ) {
		api_key_input.val($.cookie('lememe-api-key'));
	}
	/* draw the default image */
	draw();
}

init();
