// config by default
let config = {
	feedsEnv: 'prod',
	appEnv: 'prod',
	brands: ['history', 'lifetime', 'aetv', 'fyi'],
	testPages: ['home']
};



$(document).ready(() => {
	QUnit.config.autostart = false;

	// app env
	$('#appEnvProd').click((evt) => {
		$(evt.currentTarget).addClass('active');
		$.each($(evt.currentTarget).siblings(), function(i, v) {
			$(v).removeClass('active');
		});
		config.appEnv = 'prod';
	});
	$('#appEnvQa').click((evt) => {
		$(evt.currentTarget).addClass('active');
		$.each($(evt.currentTarget).siblings(), function(i, v) {
			$(v).removeClass('active');
		});
		config.appEnv = 'qa';
	});
	$('#appEnvDev').click((evt) => {
		$(evt.currentTarget).addClass('active');
		$.each($(evt.currentTarget).siblings(), function(i, v) {
			$(v).removeClass('active');
		});
		config.appEnv = 'dev';
	});
	$('#appEnvLocal').click((evt) => {
		$(evt.currentTarget).addClass('active');
		$.each($(evt.currentTarget).siblings(), function(i, v) {
			$(v).removeClass('active');
		});
		config.appEnv = 'local';
	});

	// feeds env
	$('#feedsEnvProd').click((evt) => {
		$(evt.currentTarget).addClass('active');
		$.each($(evt.currentTarget).siblings(), function(i, v) {
			$(v).removeClass('active');
		});
		config.feedsEnv = 'prod';
	});
	$('#feedsEnvQa').click((evt) => {
		$(evt.currentTarget).addClass('active');
		$.each($(evt.currentTarget).siblings(), function(i, v) {
			$(v).removeClass('active');
		});
		config.feedsEnv = 'qa';
	});
	$('#feedsEnvDev').click((evt) => {
		$(evt.currentTarget).addClass('active');
		$.each($(evt.currentTarget).siblings(), function(i, v) {
			$(v).removeClass('active');
		});
		config.feedsEnv = 'dev';
	});

	// brands 
	$('#brandHistory').click((evt) => {
		$(evt.currentTarget).toggleClass('active');
		var index = config.brands.indexOf('history');
		if(index != -1) {
			config.brands.splice(index, 1);
		} else {
			config.brands.push('history');
		}
	});
	$('#brandLifetime').click((evt) => {
		$(evt.currentTarget).toggleClass('active');
		var index = config.brands.indexOf('lifetime');
		if(index != -1) {
			config.brands.splice(index, 1);
		} else {
			config.brands.push('lifetime');
		}
	});
	$('#brandAe').click((evt) => {
		$(evt.currentTarget).toggleClass('active');
		var index = config.brands.indexOf('aetv');
		if(index != -1) {
			config.brands.splice(index, 1);
		} else {
			config.brands.push('aetv');
		}
	});
	$('#brandFyi').click((evt) => {
		$(evt.currentTarget).toggleClass('active');
		var index = config.brands.indexOf('fyi');
		if(index != -1) {
			config.brands.splice(index, 1);
		} else {
			config.brands.push('fyi');
		}
	});
	function trick(self) {
		$.each(self.nextAll(), (i, v) => {
			$(v).removeClass('active');
		});
		self.addClass('active');
		$.each(self.prevAll(), (i, v) => {
			$(v).addClass('active');
		});
	}
	// what to test 
	$('#home').click((evt) => {
		trick($(evt.currentTarget));
		config.testPages = ['home'];
	});
	$('#show').click((evt) => {
		trick($(evt.currentTarget));
		config.testPages = ['home', 'show'];
	});
	$('#video').click((evt) => {
		trick($(evt.currentTarget));
		config.testPages = ['home', 'show', 'video'];
	});

	// start onclick event handler
	$('#start').click(() => {
		//$('#thingsToHideAfterTestStarts').hide();
		// use requirejs instead
		//QUnit.start();
		if(config.brands.length > 0){
			pageTest(config);
		} else {
			alert('please check at least 1 brand');
		}
	});
});


var pageTest = (function() {
	return function(configs) {
		console.log(configs);
		// To bypass CORS, disbale it on safari in develop/disable CO restriction
		// consts
		const { test } = QUnit;
		const domain = 'appletv.aetndigital.com';
		const feedsUrl = 'feeds.video.aetnd.com/api/v2/'
		const env = {
			prod:  '',
			qa:    'qa-',
			dev:   'dev-',
			local: 'local-'
		}
		const brands = {
			history: 'history',
			lifetime: 'mlt',
			aetv: 'ae',
			fyi: 'fyi'
		};
		// settings according to configs being passed in 
		let appEnv = env[configs.appEnv],
			feedsEnv = env[configs.feedsEnv],
			brandsToTest = [],
			testLevel = configs.testPages.length;



		// test start!!!!!!!
		QUnit.start();
		$('#thingsToHideAfterTestStarts').hide();
		configs.brands.forEach(function(brand) {
			let	baseUrl = 'http://' + appEnv + domain + '/' + brands[brand];
			// home screen
			if(testLevel > 0) {
				QUnit.module(brand, () => {	
					test("Home", t => { 
						let url = baseUrl + '/section/shows';
						api_test(url, t);
					});
					if(testLevel > 1) {
						// shows
						$.ajax({
							url: 'http://' + feedsEnv + feedsUrl + brand + '/showssort?filter[isSuppressFromWA]=false&perpage=500&fields[]=id',
							type: 'GET',
							async: false,
							complete: function(xhr) {
								let shows = xhr.responseJSON.results;
								for(let i = 0; i < shows.length; i++) {
									let show = shows[i];
									QUnit.module(show.title_mod, () => {
										// some shows don't have videos, will not be shown in real app
										test('Show', t => {
											let url = baseUrl + '/show/' + show.id + '/default';
											api_test(url, t);
										});
										if(testLevel > 2) {
											// videos
											$.ajax({
												url: 'http://' + feedsEnv + feedsUrl + brand + '/shows/' + show.id + '/videos?perpage=100&orderby=originalAirDate&sort=desc&fields[]=id&fields[]=title&fields[]=tvSeasonNumber&fields[]=tvSeasonEpisodeNumber&fields[]=isLongForm',
												type: 'GET',
												async: false,
												complete: function(xhr) {
													let videos = xhr.responseJSON.results;
													for(let j = 0; j < videos.length; j++) {
														let video = videos[j],isLongForm
															videoTitle = 'S' + video.tvSeasonNumber + 'E' + video.tvSeasonEpisodeNumber + ' ' + video.title + (video.isLongForm ? ' (LF)' : ' (SF)');
														QUnit.module(videoTitle, () => {
															test('Video', t => {
																let url = baseUrl + '/video/' + video.id;
																api_test(url, t);
															});
														});
													}
												}
											});
										}		
									});
								}
							}
						});	
					}		
				});
			}
		});
	}
})()
// test helper
function api_test(url, assert) {
  $.ajax({
      url: url,
      type: 'GET',
      async: false,
      complete: function (result) {
        if (result.status == 200) {
          assert.ok(true, 'Passed');
        } else {
          assert.ok(false, 'Falied ' + url);
        }
      }
    });
}