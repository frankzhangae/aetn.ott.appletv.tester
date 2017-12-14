// To bypass CORS, disbale it on safari in develop/disable CO restriction
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

let thisEnv = env.prod;

for (brand in brands) {

	let thisBrand = brands[brand],
		baseUrl = 'http://' + thisEnv + domain + '/' + thisBrand;
	// home screen
	QUnit.module(brand, () => {	
		test("Home", t => { 
			let url = baseUrl + '/section/shows';
			api_test(url, t);
		});
		// shows
		QUnit.module('Shows', () => {
			$.ajax({
				url: 'http://' + thisEnv + feedsUrl + brand + '/showssort?filter[isSuppressFromWA]=false&perpage=500&fields[]=id',
				type: 'GET',
				async: false,
				complete: function(xhr) {
					let shows = xhr.responseJSON.results;
					for(let i = 0; i < shows.length; i++) {
						let show = shows[i];
						// some shows don't have videos, will not be shown in real app
						test(show.title_mod, t => {
							let url = baseUrl + '/show/' + show.id + '/default';
							api_test(url, t);
						});
						// videos
						QUnit.module('Videos', () => {
							$.ajax({
								url: 'http://' + thisEnv + feedsUrl + brand + '/shows/' + show.id + '/videos?perpage=100&orderby=originalAirDate&sort=desc&fields[]=id&fields[]=title',
								type: 'GET',
								async: false,
								complete: function(xhr) {
									let videos = xhr.responseJSON.results;
									for(let j = 0; j < videos.length; j++) {
										let video = videos[j];
										test(video.title, t => {
											let url = baseUrl + '/video/' + video.id;
											api_test(url, t);
										});
									}
								}
							})
						});
					}
				}
			});	
		});
	});

};





function api_test(url, assert) {
  $.ajax({
      url: url,
      type: 'GET',
      async: false,
      complete: function (result) {
        if (result.status == 200) {
          assert.ok(true, 'Passed');
        } else {
          assert.ok(false, 'Falied');
        }
      }
    });
}