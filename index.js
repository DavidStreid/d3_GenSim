var express = require("express"),
  // bodyParser = require("body-parser"),
  path = require("path");

var views = path.join(process.cwd(), "views");

var app = express();

//TODO - Add Middleware

// Accesses html, css, and images
app.use(express.static("public"));
app.use(express.static("bower_components"));

app.get("/genSim", function(req, res){
	// goes to ./views/genSim.html
	var genSimPath = path.join(views,"genSim.html");
	console.log(genSimPath);
	res.sendFile(genSimPath);
});

app.get("/", function (req, res) {
  var genSim_link = "<a href='/genSim'>GenSim</a>";
  res.send(genSim_link);
});



app.listen(3000, function () {
  console.log("Running");
});