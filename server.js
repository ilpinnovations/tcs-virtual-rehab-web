/*
Notes :
1. For some wierd reason, database is connected only when internet is active.
2. If required, change database username:password in dbHandler.js
3. Currently there is an issue with opening multiple projects (from profile),
		this is because session doesn't differentiate between 2 projects and mixes both.
4. Please use Redis Store for session storage when moving to production
*/

var express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");
var multer = require("multer");
var session = require('express-session');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

/*** CUSTOM HANDLERS ***/
var log = require("./handlers/log");
var port = process.env.PORT || 1234; //set port for server to run on
var upload = multer();	//to upload a file in memory
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
var fs = require('fs');     
var jf = require('jsonfile')
var util = require('util')    
var file = 'trails.json'
/*** Middle Ware ***/
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());


//Start the application
http.listen(port, function() {
	log.info("Server started on port : "+port);
});

//Log in 
app.post("/user/login", function(req, res){
	var loginData = req.body;
	if(loginData.u_id == "admin") {
		//log.info(JSON.stringify(loginData));
		if(loginData.u_pass == "admin") {
			res.send("home.html");
		}
		else {
			res.send("index.html");
		}
		
	}
	else {
		res.send("index.html");
	}
});
app.post("/fileUpload", function(req, res){
	var loginData = req.body;
	log.info(loginData.cID);
	fs.existsSync("csv/"+loginData.cID) || fs.mkdirSync("csv/"+loginData.cID);
	fs.writeFile("csv/"+loginData.cID+"/info.csv", loginData.file, function(err ,data) {
		if(err) {
			log.error("file > uploadCSV"+err);
		} else {
			res.send("home.html");
		}
	});
	/*if(loginData.u_id == "admin") {
		//log.info(JSON.stringify(loginData));
		if(loginData.u_pass == "admin") {
			res.send("home.html");
		}
		else {
			res.send("index.html");
		}
		
	}
	else {
		res.send("index.html");
	}*/
});
app.post("/trailSubmission", function(req, res){
	var trailData = req.body;
	
	log.info(JSON.stringify(trailData));
	var found = false;
	var keyName = [];
	var pos = 0;
	var childID = trailData.childID;
	jf.readFile(file, function(err, obj) {
		if(obj.length > 0) {
			for (var i=0;i < obj.length; i++) {
				keyName.push(Object.keys(obj[i])[0]);
			}
			//log.info(JSON.stringify(keyName));
			for (var i=0;i < keyName.length; i++) {
				if (keyName[i]!== trailData.childID) {
				  found = false;
				}
				else if (keyName[i] == trailData.childID){
				  found = true;
				  console.log('found it. stopping.');
				  pos = i;
				  break;
				}
			
			}
		}
	    
		
		if(found) {
			log.info("Pushing data into object");
			obj[pos][childID].push(trailData);
			fs.writeFile(file, JSON.stringify(obj), function (err) {
			  if (err) throw err;
			  console.log('done!');
			});
		}
		
		if(!found) {
			console.log('could not find it so adding it...');
			var newArray = new Array();
			newArray.push(trailData);
			var newobject = new Object();
			newobject = {[childID] :  newArray};
			obj.push(newobject);
			fs.writeFile(file, JSON.stringify(obj), function (err) {
			  if (err) throw err;
			  console.log('done!');
			});
		}
		
	  
	})
		
	res.send("home.html");
});
app.get("/getTrails", function(req, res){
	jf.readFile(file, function(err, obj) {
		res.send(obj);
	});
});