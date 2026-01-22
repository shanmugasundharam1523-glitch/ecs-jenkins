const http = require("http");

const PORT = 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("ECS backend running successfully");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});

                                                 index.js                                                                      Modified





































