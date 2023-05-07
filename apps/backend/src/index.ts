import Express from "express";
import log from "loglevel";
import { DummyStream } from "./classes/streams/stream";

log.setDefaultLevel("DEBUG");
log.debug("starting");
const app = Express();

const ds = new DummyStream();

ds.registerExpress("/stream.ogg",app);
ds.init();

//send the html page which holds the video tag
app.get("/", function (req, res) {
  return res.send("index.html");
});

app.listen(3000);

log.debug("started");
