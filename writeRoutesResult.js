// import
const request = require('request');
const colors = require('colors');
//text colors: black red green yellow blue magenta cyan white gray grey
colors.setTheme({
	version: 'red',
	info: 'cyan',
	pass: 'green',
	warn: 'yellow',
	debug: 'blue',
	error: 'red'
});
const config = require('./config.json');
const routes = config.routes;
const mvpd = config.mvpd;
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
const brands = ['ae'];
//const brands = ['mlt', 'history', 'fyi', 'ae'];
const timestamp = new Date().getTime();

if(!laravelVer) {
	console.error('no laravel version');
	return;
}

console.log('PARAMS:'.info, 'laravel:', colors.version(laravelVer), 'php:', colors.version(phpVer), 'env:', colors.version(env));

// make sure they all return 200
brands.forEach(brand => {
	const prodBaseUrl = 'http://' + env + '-appletv.aetndigital.com/' + brand + '/';
	const compBaseUrl = 'http://appletv.aetndigital.com/' + brand + '/';

	routes.forEach(route => {
		let name = route.name;
		let type = route.type;
		let endpoint = route.url;

		request(compBaseUrl + endpoint, (error, res, body) => {
			if(error) {
				console.log(colors.error(res.statusCode), env, brand, name);
			} else {
				console.log('Passed'.pass, brand, name);
			}
			
		});
	})
	
});
