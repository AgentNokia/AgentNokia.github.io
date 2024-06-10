import { vec3, matr } from './mth.js';

export class camera {
  projSize: number;
  projDist: number;
  projFarClip: number;
  frameW: number;
  frameH: number;
  matrView: matr;
  matrProj: matr;
  matrVP: matr;
  loc: vec3;
  at: vec3;
  dir: vec3;
  up: vec3;
  right: vec3;
  constructor() {
    // Projection properties
    this.projSize = 0.1; // Project plane fit square
    this.projDist = 0.1; // Distance to project plane from viewer (near)
    this.projFarClip = 1800; // Distance to project far clip plane (far)

    // Local size data
    this.frameW = 30; // Frame width
    this.frameH = 30; // Frame height

    // Matrices
    this.matrView = new matr(null); // View coordinate system matrix
    this.matrProj = new matr(null); // Projection coordinate system matrix
    this.matrVP = new matr(null); // View and projection matrix precalculate value

    // Set camera default settings
    this.loc = new vec3(0, 0, 0); // Camera location
    this.at = new vec3(0, 0, 0); // Camera destination
    this.dir = new vec3(0, 0, 0); // Camera Direction
    this.up = new vec3(0, 0, 0); // Camera UP direction
    this.right = new vec3(0, 0, 0); // Camera RIGHT direction
    this.setDef();
  } // End of 'constructor' function

  // Camera parmeters setting function
  set(loc: vec3, at: vec3, up: vec3) {
    this.matrView.setView(loc, at, up);
    this.loc = new vec3(loc, 0, 0);
    this.at = new vec3(at.x, at.y, at.z);
    this.dir.set(
      -this.matrView.m[0][2],
      -this.matrView.m[1][2],
      -this.matrView.m[2][2]
    );
    this.up.set(
      this.matrView.m[0][1],
      this.matrView.m[1][1],
      this.matrView.m[2][1]
    );
    this.right.set(
      this.matrView.m[0][0],
      this.matrView.m[1][0],
      this.matrView.m[2][0]
    );
    this.matrVP = new matr(this.matrView).mul(this.matrProj);
  } // End of 'set' function

  // Projection parameters setting function.
  setProj(projSize: number, projDist: number, projFarClip: number) {
    let rx = projSize,
      ry = projSize;

    this.projDist = projDist;
    this.projSize = projSize;
    this.projFarClip = projFarClip;

    // Correct aspect ratio
    if (this.frameW > this.frameH) rx *= this.frameW / this.frameH;
    else ry *= this.frameH / this.frameW;
    this.matrProj.setFrustum(
      -rx / 2.0,
      rx / 2.0,
      -ry / 2.0,
      ry / 2.0,
      projDist,
      projFarClip
    );

    // pre-calculate view * proj matrix
    this.matrVP = new matr(this.matrView).mul(this.matrProj);
  } // End of 'setProj' function

  // Resize camera and projection function.
  setSize(frameW: number, frameH: number) {
    if (frameW < 1) frameW = 1;
    if (frameH < 1) frameH = 1;
    this.frameW = frameW;
    this.frameH = frameH;
    // Reset projection with new render window size
    this.setProj(this.projSize, this.projDist, this.projFarClip);
  } // End of 'setSize' function

  // Camera set default values function.
  setDef() {
    this.loc.set(0, 0, -8);
    this.at.set(0, 0, 0);
    this.dir.set(0, 0, -1);
    this.up.set(0, 1, 0);
    this.right.set(1, 0, 0);

    this.projDist = 0.1;
    this.projSize = 0.1;
    this.projFarClip = 1800;

    this.frameW = 30;
    this.frameH = 30;

    this.set(this.loc, this.at, this.up);
    this.setProj(this.projSize, this.projDist, this.projFarClip);
    this.setSize(this.frameW, this.frameH);
  } // End of 'setDef' function
} // End of 'camera' class
