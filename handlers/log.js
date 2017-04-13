var log = {
	info: function (info) {
		console.log(new Date().toLocaleString()+' - INFO : ' + info);
	},
	debug:function (debug) {
		console.log(new Date().toLocaleString()+' - DEBUG : ' + debug);
	},
	warn:function (warn) {
		console.log(new Date().toLocaleString()+' - WARN : ' + warn);
	},
	error:function (error) {
		console.log(new Date().toLocaleString()+' - ERROR : ' + error);
	}
};

module.exports = log;
