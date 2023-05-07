import {
  AppSink,
  Pipeline,
  pipelineFromArray,
} from "gstreamer-superficial";
import { Express, Request, Response } from "express";
import log from "loglevel";
import { Subject } from "rxjs";

abstract class Stream {
  // #region Properties (4)

  protected appsink: AppSink | undefined
  protected frames = new Subject<any>();
  protected pipeline: Pipeline | undefined;
  protected streamHeaders: any;

  // #endregion Properties (4)

  // #region Public Methods (2)

  public init() {
    const launch = this.generateGSTLaunch();
    this.pipeline = new Pipeline(launch);
    this.appsink = this.pipeline.findChild("sink") as AppSink;

    

    this.pipeline.pollBus((msg: any) => {
      log.debug("bus message:", msg);
      switch (msg.type) {
        case "eos":
          this.pipeline?.stop();
          break;
      }
    });

    this.pipeline.play();

    this.pullFromAppSink();
    
  }

  public registerExpress(route: string, app: Express) {
    app.get(route, (req: Request, res: Response) => {
      log.debug(`handling stream request from ${req.ip} on ${req.baseUrl}`);
      res.writeHead(200, {
        "Content-Type": "video/webm",
      });
      res.flushHeaders();
      if (this.streamHeaders) {
        for (let header of this.streamHeaders) {
          log.debug("Write stream header", header);
          res.write(header);
        }
      }
      const sub = this.frames.subscribe((buf) => {
        //log.debug("write a frame", buf)
        res.write(buf);
        res.write;
      });
    });
  }

  // #endregion Public Methods (2)

  // #region Protected Methods (1)

  protected pullFromAppSink() {
    this.appsink?.pull((buf: any, caps: any) => {
      if (caps) {
        log.debug("CAPS", caps);
        if (caps.streamheader) {
          this.streamHeaders = caps.streamheader;
        }
      }
      if (buf) {
        //log.debug("BUFFER size", buf.length);
        this.frames.next(buf);
        this.pullFromAppSink()
      } else {
        setTimeout(this.pullFromAppSink, 500);
      }
    });
  }

  // #endregion Protected Methods (1)

  // #region Protected Abstract Methods (1)

  protected abstract generateGSTLaunch(): string;

  // #endregion Protected Abstract Methods (1)
}

export class DummyStream extends Stream {
  // #region Protected Methods (1)

  protected generateGSTLaunch() {
    return pipelineFromArray([
      "videotestsrc pattern=ball",
      "video/x-raw,width=320,height=240,framerate=100/1",
      "theoraenc",
      "oggmux",
      "appsink max-buffers=1 name=sink",
    ]);
  }

  // #endregion Protected Methods (1)
}
