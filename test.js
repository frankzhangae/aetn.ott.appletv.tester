// lib
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
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
	error: 'red'
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

	let config = require('./config/config-' + brand + '.json');
	//let config = require('./config/config-test.json');

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

	for(key in allRoutes) {
		let category = allRoutes[key];
		// console category
		console.log("Category", colors.category(category.name));

		await testEachCategory(category);
	}
}
 
async function testEachCategory(category) {
	//console.log("testEachCategory");

	for(key in category.routes) {
		let task = category.routes[key];

		let result = await testEachTask(task);
		// console status for each task result
		console.log(colors[result](result), task.name);
	}
}

async function testEachTask(task) {
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

function testEachEndPoint(resType, url1, url2) {
	//console.log("testEachEndPoint");

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

main(); 





