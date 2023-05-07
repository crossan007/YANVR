import Express from "express";
import log from "loglevel";
//@ts-ignore
import gstreamer from "gstreamer-superficial";

import { Subject } from "rxjs/internal/Subject";

log.setDefaultLevel("DEBUG");
log.debug("starting");
const app = Express();

const frames = new Subject<any>();

const pipelineFromArray = (arr: string[]) => {
  return arr.join(" ! ")
}

const pipeline = new gstreamer.Pipeline(
  pipelineFromArray([
    "videotestsrc pattern=ball",
    "video/x-raw,width=320,height=240,framerate=100/1",
    "theoraenc",
    "oggmux",
    "appsink max-buffers=1 name=sink"
  ])

);

const appsink = pipeline.findChild("sink");

let streamHeaders: any;

var pull = function () {

  appsink.pull(function (buf: any, caps: any) {
    if (caps) {
      log.debug("CAPS", caps);
      if (caps.streamheader) streamHeaders = caps.streamheader;
    }
    if (buf) {
      //log.debug("BUFFER size", buf.length);
      frames.next(buf);
      pull();
    } else {
      setTimeout(pull, 500);
    }
  });
};

pipeline.play();

pull();

pipeline.pollBus(function (msg: any) {
  log.debug('bus message:',msg);
  switch (msg.type) {
    case "eos":
      pipeline.stop();
      break;
  }
});

//send the html page which holds the video tag
app.get("/", function (req, res) {
  return res.send("index.html");
});

app.get("/stream.ogg", (req: Express.Request, res: Express.Response) => {
 
  log.debug(`handling stream request from ${req.ip} on ${req.baseUrl}`)
  res.writeHead(200, {
    "Content-Type": "video/webm",
  });
  res.flushHeaders();
  if (streamHeaders) {
    for (let header of streamHeaders) {
      log.debug("Write stream header", header)
      res.write(header)
    }
  }
  const sub = frames.subscribe((buf)=>{
    //log.debug("write a frame", buf)
    res.write(buf);
    res.write
  });

});

app.listen(3000);

log.debug("started");
