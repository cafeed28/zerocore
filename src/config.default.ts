export default {
	debug: true, // debug mode
	secret: 'secret', // secret for validating client
	apiKey: 'apiKey', // key for authing in some apis
	basePath: 'zerocore', // host.com/basePath/api/roles
	port: 80, // port
	mongodbUri: 'mongodb://user:password@localhost:27017/zerocore?authSource=admin', // mongodb connection uri
	webhook: 'discord webhook', // discord webhook for logging some events
	bannedIps: [ // ip's that blocked (remove content if you don't need it)
		'1.2.3.4'
	],
	prefix: '!' // prefix in comment commands
}