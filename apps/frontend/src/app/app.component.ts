import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  // #region Properties (2)

  @ViewChild("ourVid") ourVid?: HTMLVideoElement;
  public title = 'my-app';
  public streamURL: string = "http://localhost:3000/stream";

  // #endregion Properties (2)

  // #region Public Methods (2)

  public ngOnInit(): void {
    try {
      console.log("starting");
      this.ourVid?.play();
      console.log("started");
  } catch (error) {
      console.log(error);
  }
  }

  // #endregion Public Methods (2)
}
