import Express from "express"
import log from "loglevel";

log.setDefaultLevel("DEBUG")
log.debug("starting");
const app = Express();

//app.use(Express.static(__dirname + '/'));


//send the html page which holds the video tag
app.get('/', function (req, res) {
  log.debug("handling request")
  return res.send('index.html');
});

app.listen(3000);

log.debug("started");