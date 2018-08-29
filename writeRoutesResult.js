// config 
const brands = ['history'];
//const brands = ['mlt', 'history', 'fyi', 'ae'];
const config = require('./config.json');
//const config = require('./config-test.json');

// lib
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

const request = require('request');
const colors = require('colors');
//text colors: black red green yellow blue magenta cyan white gray grey
colors.setTheme({
	category: 'yellow',
	ae: 'blue',
	fyi: 'green',
	history: 'red',
	mlt: 'magenta',
	version: 'yellow',
	info: 'cyan',
	pass: 'green',
	warn: 'yellow',
	debug: 'blue',
	error: 'red'
});
const allRoutes = config["all-routes"];
const mvpds = config.mvpd;
const _ = require('underscore');
/* 
 * main()
 * node writeRoutesResult [laravel ver] [php version] [env] ...[brand]
 * @param laravel version: mandatory
 * @param php version: 5.6
 * @param env: dev
 * @param brand: all four brands
 */
const laravelVer = process.argv[2];
const phpVer = process.argv[3] || '5.6';
const env = process.argv[4] || 'dev';
const timestamp = new Date().getTime();

// use async and await to make sure the sequence
async function main() {
	console.log('---------------------- PARAMS ----------------------');
	console.log('Laravel:', colors.version(laravelVer), 'PHP:', colors.version(phpVer), 'Env:', colors.version(env));
	console.log('---------------------- Start Testing ---------------');
	console.log();

	for(brandKey in brands) {
		let brand = brands[brandKey];
		let pendingHyphens = new Array(29 - brand.length).join('-');
		console.log("--------------- Brand:",  colors[brand](brand), pendingHyphens);

		const baseUrl = 'http://' + env + '-appletv.aetndigital.com/' + brand;
		const prodBaseUrl = 'http://appletv.aetndigital.com/' + brand;

		for(allRoutesKey in allRoutes) {
			let category = allRoutes[allRoutesKey];
			console.log("Category", colors.category(category.name));

			await testGroup(category, baseUrl, prodBaseUrl);
		}
	}
}
 
async function testGroup(category, baseUrl, prodBaseUrl) {
	//console.log("testGroup");

	for(key in category.routes) {
		let task = category.routes[key];

		let result = await testEachTask(task, baseUrl, prodBaseUrl);

		console.log(colors[result](result), task.name);
	}
}

async function testEachTask(task, baseUrl, prodBaseUrl) {
	//console.log("testEachTask");

	for(key in task.urls) {
		let endpoint = task.urls[key];

		if(task.mvpd) {
			for(mvpdKey in mvpds) {
				let slashMvpd = mvpds[mvpdKey];

				let result = await testEachEndPoint(task.type, baseUrl + endpoint + slashMvpd, prodBaseUrl + endpoint + slashMvpd);

				if(result != 'pass') {
					return "error";
				}
			}
		} else {
			let result = await testEachEndPoint(task.type, baseUrl + endpoint, prodBaseUrl + endpoint);

			if(result != 'pass') {
				return "error";
			}
		}
	}

	return "pass";
}

function testEachEndPoint(type, url1, url2) {
	return new Promise((resolve, reject) => {
		request(url1, (error, res, body) => {
			if(error || res.statusCode != 200) {
				resolve("error");
			} 
			request(url2, (error2, res2, body2) => {
				if(error2 || res2.statusCode != 200) {
					resolve('error');
				}
				// deal with xml and make it the same as prod xml
				body1 = body.replaceAll(env + '-', '').replaceAll('.' + env + '.', '').replaceAll('https', 'http');
				body2 = body2.replaceAll('.prod.', '').replaceAll('https', 'http');

				//console.log(body1);
				//console.log(body2);

				if(body1 == body2) {
					resolve('pass');
				}
				resolve('error');
			});
		});
	});
}



if(!laravelVer) {
	console.error('no laravel version');
	return;
}

main(); 





