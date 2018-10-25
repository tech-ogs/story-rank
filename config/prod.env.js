function getIP() { 
  const interfaces = require('os').networkInterfaces();
    
  const addresses = Object.keys(interfaces)
    .reduce((results, name) => results.concat(interfaces[name]), [])
    .filter((iface) => iface.family === 'IPv4' && !iface.internal)
    .map((iface) => iface.address);
    
  return addresses[0]
}

var IP = getIP()

if (IP.match(/^192/)) {
	URL = '"http://' + IP + '"'
} 
else {
	URL = '"http://www.ranknvote.com"'
}

module.exports = {
  NODE_ENV: '"production"',
  URL: URL
}
