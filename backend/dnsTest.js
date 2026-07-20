const dns = require("dns");

console.log("Before:", dns.getServers());

dns.setServers(["8.8.8.8", "1.1.1.1"]);

console.log("After:", dns.getServers());

dns.resolveSrv(
    "_mongodb._tcp.cluster0.uod42fr.mongodb.net",
    (err, records) => {
        if (err) {
            console.error(err);
        } else {
            console.log(records);
        }
    }
);