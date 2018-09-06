// lib
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    if(!target) return target;
    return target.split(search).join(replacement);
};
// Modules
const request = require('request');
const colors = require('colors');
const _ = require('underscore');
// System configs
colors.setTheme({
	//text colors: black red green yellow blue magenta cyan white gray grey
	category: 'yellow',
	ae: 'blue',
	fyi: 'green',
	history: 'red',
	mlt: 'magenta',
	param: 'yellow',
	info: 'cyan',
	pass: 'green',
	warn: 'yellow',
	debug: 'blue',
	fail: 'red'
});
/* 
 * main()
 * node writeRoutesResult [brand] [laravel ver] [php version] [env] 
 * @param brand: one of (history, mlt, fyi, ae)
 * @param laravel version: !mandatory
 * @param php version: one of (5.6, 7.0) - by default 5.6
 * @param env: one of (dev, local, qa) - by default dev
 */
// global var
	const brand = process.argv[2];
	const laravelVer = process.argv[3];
	const phpVer = process.argv[4] || '5.6';
	const env = process.argv[5] || 'dev';
	//const timestamp = new Date().getTime();
	const baseUrl = 'http://' + env + '-appletv.aetndigital.com/' + brand;
	const prodBaseUrl = 'http://appletv.aetndigital.com/' + brand;

	let config = require('./config/config-' + brand);
	//let config = require('./config/config-test');

	let allRoutes = config["all-routes"];
	let mvpds = config.mvpd;
// end global var


// main
// use async and await to make sure the sequence
async function main() {
	if(!laravelVer || !brand) {
		console.error('Params error');
		return;
	}

	console.log('---------------------- PARAMS ----------------------');
	console.log('brand:', colors.param(brand), 'Laravel:', colors.param(laravelVer), 'PHP:', colors.param(phpVer), 'Env:', colors.param(env));
	console.log('---------------------- Start Testing ---------------');
	console.log();
	let pendingHyphens = new Array(29 - brand.length).join('-');
	console.log("--------------- Brand:",  colors[brand](brand), pendingHyphens);
	 
	testAllRoutes();	
}

async function testAllRoutes() {
	//console.log("testAllRoutes");

	for(let key in allRoutes) {
		let category = allRoutes[key];
		// console category
		console.log("Category", colors.category(category.name));
		// testEachCategory
		await Promise.all(category.routes.map(testEachTask));
	}
}

async function testEachTask(task) {
	//console.log("testEachTask");

	let promises = [],
		urls = [],
		prodUrls = [];
	// generate each url based on task's config and push to the urls array
	task.urls.forEach(endpoint => {
		let url = baseUrl + endpoint;
		let prodUrl = prodBaseUrl + endpoint;

		if(task.mvpd) {
			mvpds.forEach(slashMvpd => {
				let urlWithMvpd = url + slashMvpd,
					prodUrlWithMvpd = prodUrl + slashMvpd;
				
				if(task.queryStr) {
					task.queryStr.forEach(obj => {
						for(let key in obj) {
							urlWithMvpd += "?";
							if(urlWithMvpd[urlWithMvpd.length - 1] != "?") {
								urlWithMvpd += "&" + key + "=" + obj[key];
							} else {
								urlWithMvpd += key + "=" + obj[key];
							}
							prodUrlWithMvpd += "?";
							if(prodUrlWithMvpd[prodUrlWithMvpd.length - 1] != "?") {
								prodUrlWithMvpd += "&" + key + "=" + obj[key];
							} else {
								prodUrlWithMvpd += key + "=" + obj[key];
							}
						}						
					});
					urls.push(urlWithMvpd);
					prodUrls.push(prodUrlWithMvpd);
				} else {
					urls.push(urlWithMvpd);
					prodUrls.push(prodUrlWithMvpd);
				}
			});
		} else {
			if(task.queryStr) {
				task.queryStr.forEach(obj => {
					for(let key in obj) {
						url += "?";
						if(url[url.length - 1] != "?") {
							url += "&" + key + "=" + obj[key];
						} else {
							url += key + "=" + obj[key];
						}
						prodUrl += "?";
						if(prodUrl[prodUrl.length - 1] != "?") {
							prodUrl += "&" + key + "=" + obj[key];
						} else {
							prodUrl += key + "=" + obj[key];
						}
					}					
				});
				urls.push(url);
				prodUrls.push(prodUrl);
			} else {
				urls.push(url);
				prodUrls.push(prodUrl);
			}	
		}
	});
	// test each url, return error if any of each failed
	for(let i = 0; i < urls.length; i++) {
		promises.push(testEachEndPoint(task, urls[i], prodUrls[i]));
	}
	return await Promise.all(promises)
		.then(() => {
			console.log('pass'.pass, task.name);
		})
		.catch(errorMsg => {
			console.log('fail'.fail, task.name);
			// deal with error
			console.log('reason:'.fail, errorMsg);
		})
}

function testEachEndPoint(task, url1, url2) {
	//console.log("testEachEndPoint", url1, url2);

	return new Promise((resolve, reject) => {
		request(url1, (error, res, body) => {
			if(error || res.statusCode != 200) {
				reject(url1 + " request fail");
			} 
			request(url2, (error2, res2, body2) => {
				if(error2 || res2.statusCode != 200) {
					reject(url2 + ' request fail');
				}
				// deal with xml and make it the same as prod xml
				body1 = body.replaceAll(env + '-', '').replaceAll('.' + env + '.', '').replaceAll('https', 'http');
				body2 = body2.replaceAll('.prod.', '').replaceAll('https', 'http');

				if(body1 == body2) {
					resolve();
				}
				reject('not match ' + url1 + ' ' + url2);
			});
		});
	});
}

main(); 





