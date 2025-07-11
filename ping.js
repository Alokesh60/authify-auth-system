const https = require("https");

const url = "https://authify-zz0q.onrender.com/signup";

https
  .get(url, (res) => {
    console.log(`Pinged ${url}, status code: ${res.statusCode}`);
  })
  .on("error", (e) => {
    console.error(`Error pinging ${url}: ${e.message}`);
  });
