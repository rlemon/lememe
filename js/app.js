var meme_data = {
	toons: [
		{
		link: 'toons/all_of_the_things.jpg',
		title: 'All Of The Things'},
	{
		link: 'toons/rainbow_star_pony.jpg',
		title: 'Rainbow Star Pony'},
	{
		link: 'toons/yuno_guy.jpg',
		title: 'Y U NO Guy'},
	{
		link: 'toons/not_sure_if.jpg',
		title: 'Not Sure If'},
	{
		link: 'toons/my_little_pony_1.jpg',
		title: 'My Little Pony 1'},
	{
		link: 'toons/trollface.jpg',
		title: 'Trollface'},
	{
		link: 'toons/forever_alone.jpg',
		title: 'Forever Alone'}
			],
	people: [
		{
		link: 'people/ridiculously_photogenic_guy.jpg',
		title: 'Ridiculously Photogenic Guy'},
	{
		link: 'people/baby_godfather.jpg',
		title: 'Baby Godfather'},
	{
		link: 'people/rick_rolled.jpg',
		title: 'Rick Rolled'},
	{
		link: 'people/helicopter_kid.jpg',
		title: 'Helicopter Kid'},
	{
		link: 'people/loktarian.jpg',
		title: 'Loktarian'},
	{
		link: 'people/too_tanned_guy.jpg',
		title: 'Too Tanned Guy'},
	{
		link: 'people/scumbag_steve.jpg',
		title: 'Scumbag Steve'},
	{
		link: 'people/hipster_barista.jpg',
		title: 'Hipster Barista'},
	{
		link: 'people/good_guy_greg.jpg',
		title: 'Good Guy Gre'},
	{
		link: 'people/the_most_interesting_man_in_the_world.jpg',
		title: 'The Most Interesting Man In The World'},
	{
		link: 'people/success_kid.jpg',
		title: 'Success Kid'}
			],
	animals: [
		{
		link: 'animals/philosoraptor.jpg',
		title: 'Philosoraptor'},
	{
		link: 'animals/socially_awkward_penguin.jpg',
		title: 'Socially Awkward Penguin'},
	{
		link: 'animals/conversational_penguins.jpg',
		title: 'Conversational Penguins'}
			]
	},
	font_list = $('#meme-fonts > li'),
	active_meme, active_font = font_list.filter('.active')[0].children[0].getAttribute('data-font'),
	color1 = $('#color1'),
	color2 = $('#color2'),
	font_label = $('#label-active-font'),
	canvas = $('#cvs')[0],
	top_input = $('#text-top'),
	bottom_input = $('#text-bottom'),
	meme_list_container = $('#meme-list-container'),
	generate = $('#generate'),
	userlink = $('#img-link'),
	is_persistent = $('#persistent-data'),
	font_size = $("#font-size"),
	outline_size = $("#outline-size"),
	api_key = $('#api-key'),
	ctx = canvas.getContext('2d'),
	PATH = 'memes/',
	data_key = 'lememe_data',
	img = $("<img />")[0],
	img_is_loaded = false;

function draw() {
	if( img_is_loaded ) {
		$('#spinner-loading').hide();
		var maxh = 640,
			maxw = 480,
			height = img.height,
			width = img.width;
		while (height > maxh || width > maxw) {
			--height;
			--width;
		}
		canvas.height = height;
		canvas.width = width;
		ctx.save();
		ctx.clearRect(0, 0, height, width);
		ctx.drawImage(img, 0, 0, width, height);

		ctx.font = "bold " + font_size.val() + "px " + active_font;
		ctx.textAlign = "center";
		ctx.fillStyle = color1.val();
		ctx.fillText(top_input.val(), width / 2, parseFloat(font_size.val()), width);
		ctx.fillText(bottom_input.val(), width / 2, height - 10, width);

		if( outline_size.val() > 0 ) {
			ctx.strokeStyle = color2.val();
			ctx.lineWidth = outline_size.val();
			ctx.strokeText(top_input.val(), width / 2, parseFloat(font_size.val()), width);
			ctx.strokeText(bottom_input.val(), width / 2, height - 10, width);
		}

		ctx.restore();
	} else {
		setTimeout(draw, 100);
	}
}
function persist_settings() {
	//if( is_persistent.is(':checked') ) {
		//store_data({
			//'active_meme': active_meme,
			//'active_font': active_font,
			//'color1': color1.val(),
			//'color2': color2.val(),
			//'font_size': font_size.val(),
			//'outline_size': outline_size.val(),
			//'top_input': top_input.val(),
			//'bottom_input': bottom_input.val()
		//});
	//} else {
		//remove_data();
	//}
}

function swap_active_meme(e) {
	$('#btn-meme-list').trigger('click'); // always close the menu
	
	if( $(this).is('.active') ) {
		return;
	}
	
	$('#spinner-loading').show();
	meme_list_container.find('li.active').removeClass('active');
	$(this).addClass('active');
	active_meme = $(this).children('a').data('img');
	img_is_loaded = false;
	img.src = PATH + active_meme;
	draw();
	if(e) e.preventDefault();
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
	$('#spinner-generate').hide();
	userlink.val(data['upload']['links']['original']);
	userlink[0].select();
	userlink[0].focus();
}
function image_upload_failed() {
	Notifier.error('Could not reach imgur service. Enter a new API Key or wait a few minutes and try again.', 'Error!');
	$('#spinner-generate').hide();
}

function generate_meme(e) {
	$('#spinner-generate').show();
	var dataURL = canvas.toDataURL("image/png").split(',')[1];
	$.ajax({
		url: 'http://api.imgur.com/2/upload.json',
		type: 'POST',
		data: {
			type: 'base64',
			key: api_key.val(),
			image: dataURL
		},
		dataType: 'json'
	}).success(image_uploaded).error(image_upload_failed);
	e.preventDefault();
	return false;
}

function toggle_meme_list(e) {
    $(this).children('i').toggle();
    $('.meme-list-container').slideToggle(100);
    var tmp = this.title;
    this.title = $(this).data('title-alt');
    $(this).data('title-alt', tmp);
    e.preventDefault();
    return false;
}

function generateList() {
	var first = true;
    for (var cat in meme_data) {
        var list = [
            {
            'tagName': 'ul',
            'className': 'nav nav-list span3',
            'childNodes': [
                {
                'tagName': 'li',
                'className': 'nav-header',
                'textContent': cat.toTitleCase()}
            ]}
        ];
        for (var item in meme_data[cat]) {
			var obj = {
                'tagName': 'li',
                'childNodes': [
                    {
                    'tagName': 'a',
                    'textContent': meme_data[cat][item].title,
                    'href': '#',
                    'data-img': meme_data[cat][item].link}
                ]
            };
            if( first ) {
				obj['className'] = 'active';
			}
            list[0].childNodes.push(obj);
            first = false;
        }
        meme_list_container.append(FragBuilder(list));
    }
}

function filter_list(text) {
    if (typeof text != 'undefined' && text.length > 0) {
        meme_list_container.find('li:not(.nav-header)').each(function(i, el) {
            if ($(this).text().toLowerCase().indexOf(text.toLowerCase()) === -1) {
                $(this).hide();
            } else if ($(this).is(':hidden')) {
                $(this).show();
            }
        });
    } else {
        meme_list_container.find('li:not(.nav-header)').show();
    }
}

function register_events() {
	$([top_input[0], bottom_input[0]]).on('keyup', draw);
	$('#btn-meme-list').on('click',toggle_meme_list);
	meme_list_container.find('li:not(.nav-header)').on('click', swap_active_meme);
	font_list.on('click', swap_active_font);
	generate.on('click', generate_meme);
	
	/* quick and dirty disable form submission */
	$('.nosubmit-form').submit(function(e) {
		e.preventDefault();
		return false;
	});
	//Persist settings before closing tab
	$(window).on("beforeunload", persist_settings);
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
	
	$('#btn-clear-filter').on('click', function() {
		$('#meme-filter').val('');
		filter_list();
	});

	$('#meme-filter').on('keyup', function() {
		filter_list(jQuery.trim(this.value));
	});

	$('#toggle-custom-api').on('click', function() {
		$('#api-key-container').slideToggle();
	});
	
	$('.info-popover').popover();
	
	$(document).on('dragover', function(e) {
		e.preventDefault();
		return false;
	});
	
	$(document).on('drop', function(e) {
		var data = e.dataTransfer || e.originalEvent.dataTransfer;
		if ( data.files.length === 1 ) {
			img_is_loaded = false;
			$('#spinner-loading').show();
			var file = data.files[0];
			if ( file.type.indexOf( 'image' ) === -1 ) { 
				Notifier.error('Not an image!', 'you may only drop images to the page');
				e.preventDefault();
				return false;
			}
			var reader = new FileReader();
			reader.readAsDataURL( file );
			reader.onload = function ( ev ) {
				img_is_loaded = false;
				img.src = ev.target.result;
				draw();
			};
		} else {
			Notifier.error('Too many files!', 'you may only drop one image at a time to the page');
		}
		e.preventDefault();
		return false;
	});
	$(document).on('click', function(e) {
		if( $('.meme-list-container').is(':visible') ) {
			$('#btn-meme-list').trigger('click');
		}
	});
	$('.meme-list-container').on('click', function(e) {
		e.preventDefault();
		return false;
	});
}

function init() {
	generateList();
	register_events();
	var data = false;//get_data();
	if (data) {
		active_meme = data.active_meme;
		active_font = data.active_font;
		color1.miniColors('value', data.color1);
		color2.miniColors('value', data.color2);
		font_size.val(data.font_size);
		outline_size.val(data.outline_size);
		top_input.val(data.top_input);
		bottom_input.val(data.bottom_input);
		
		var active_meme_item = meme_list_container.filter(function(){
			return $(this.children[0]).data('img') === active_meme;
		});
		var active_font_item = font_list.filter(function(){
			return $(this.children[0]).data('font') === active_font;
		});
		font_label.text(active_font_item.children().text());
		$(meme_list_container.children('li')).add(font_list).removeClass("active");
		$(active_meme_item).add(active_font_item).addClass("active");
		
		is_persistent.attr("checked", "checked");
	} else {
		active_meme = meme_list_container.find('li.active > a').data('img');
	}


	img_is_loaded = false;
	img.src = PATH + active_meme;

	img.onload = function(e) {
		img_is_loaded = true;
	};
	/* draw the default image */

	setTimeout(draw,200); // hack fix
}
init();
