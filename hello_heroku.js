var http = require('http');
var port = process.env.PORT || 3000;
//var port = 8080; //uncomment to run locally
console.log("This goes to the console window");
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
   res.write("<h2>Hello World</h2>");
   res.write ("Success!  This app is deployed online");
   res.end();
}).listen(port);
