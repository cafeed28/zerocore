export default {
	secret: 'secret', // secret for validating client
	tokenSecret: 'tokenSecret', // secret for generating auth tokens
	basePath: 'zerocore', // host.com/basePath/api/roles
	port: 80, // port
	mongodbAddress: 'localhost:27017',
	mongodbUser: 'user', // user for mongodb
	mongodbPassword: 'password', // password for mongodb
	mongodbCollection: 'zerocore', // collection with zerocore 
	webhook: 'discord webhook', // discord webhook for logging some events
	bannedIps: [ // ip's that blocked (remove content if you don't need it)
		'1.2.3.4'
	],
	prefix: '!' // prefix in comment commands
}