export class timer {
  globalTime: number;
  globalDeltaTime: number;
  time: number;
  deltaTime: number;
  FPS: number;
  isPause: boolean;
  startTime: number;
  oldTime: number;
  oldTimeFPS: number;
  pauseTime: number;
  timePerSec: number;
  frameCounter: number;
  d : any;

  constructor() {
    this.d = new Date();
    this.startTime = this.oldTime = this.oldTimeFPS = new Date().getTime();
    this.frameCounter = 0;
    this.isPause = false;
    this.FPS = 30.0;
    this.pauseTime = 0;
    this.globalDeltaTime = 0;
    this.globalTime = 0;
    this.time = 0;
    this.deltaTime = 0;
    this.timePerSec = 1000;
  } /* End of 'timer' function */

  /* Response.
   * ARGUMENTS: None.
   * RETURNS: None.
   */
  response() {
    /* Global time */
    this.globalTime = (Date.now() - this.startTime) / this.timePerSec;
    this.globalDeltaTime = (Date.now() - this.oldTime) / this.timePerSec;
    /* Time with pause */
    if (this.isPause) {
      this.deltaTime = 0;
      this.pauseTime += Date.now() - this.oldTime;
    } else {
      this.deltaTime = this.globalDeltaTime;
      this.time =
        (Date.now() - this.pauseTime - this.startTime) / this.timePerSec;
    }
    /* FPS */
    this.frameCounter++;
    if (Date.now() - this.oldTimeFPS > this.timePerSec) {
      this.FPS =
        (this.frameCounter * this.timePerSec) / (Date.now() - this.oldTimeFPS);
      this.oldTimeFPS = Date.now();
      this.frameCounter = 0;
    }
    this.oldTime = Date.now();
  }
}
