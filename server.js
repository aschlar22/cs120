// server.js
// Web App #2:

const dns = require("node:dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
const http = require("http");
const { MongoClient } = require("mongodb");
const url = require("url");

// MongoDB:
const uri = "mongodb+srv://aschla03_db_user:newpw123@cluster0.par3mxc.mongodb.net/cs120?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

let collection;

// Connect to MongoDB once at startup:
async function start() {
    await client.connect();
    const db = client.db("cs120");
    collection = db.collection("places");
    console.log("Connected to MongoDB Atlas");
}
start();

// Heroku Port:
const port = process.env.PORT || 3000;

// Create HTTP Server:
http.createServer(async function (req, res) {

    // HOME PAGE (GET /):
    if (req.method === "GET" && req.url === "/") {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write("<h1>Lookup a Place or Zip Code</h1>");
        res.write(`
            <form action="/process" method="POST">
                <input type="text" name="search" placeholder="Enter place or zip" required>
                <button type="submit">Search</button>
            </form>
        `);
        return res.end();
    }

    // PROCESS PAGE (POST /process):
    if (req.method === "POST" && req.url === "/process") {

        // Collect POST data manually:
        let body = "";
        req.on("data", chunk => {
            body += chunk.toString();
        });

        req.on("end", async () => {
            // Parse form data: search=Cambridge
            const params = new URLSearchParams(body);
            const input = params.get("search").trim();

            let result;

            // Determine place vs zip:
            if (!isNaN(input.charAt(0))) {
                console.log("ZIP entered:", input);
                result = await collection.findOne({ zips: input });
            } else {
                console.log("PLACE entered:", input);
                result = await collection.findOne({ place: input });
            }

            // Print result in console:
            console.log("Database result:", result);

            // Server message:
            if (result) {
                res.write("<h1>Search Results</h1>");
                res.write(`<p><strong>Place:</strong> ${result.place}</p>`);
                res.write(`<p><strong>Zip Codes:</strong> ${result.zips.join(", ")}</p>`);
            } else {
                res.write("<h1>No Results Found</h1>");
                res.write(`<p>No data found for "${input}".</p>`);
            }
            res.write(`<a href="/">Back</a>`);
            return res.end();
        });

        return;
    }

    // DEFAULT: 404
    res.writeHead(404, { "Content-Type": "text/html" });
    res.write("<h1>404 Not Found</h1>");
    res.end();

}).listen(port, () => {
    console.log("Web App 2 running on port " + port);
});
