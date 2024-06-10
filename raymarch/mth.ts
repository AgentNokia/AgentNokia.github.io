// import { vec3 } from "./mth.js";

export class vec3 {
  x: number;
  y: number;
  z: number;
  constructor(x: any, y: any, z: any) {
    if (x == undefined) (this.x = 0), (this.y = 0), (this.z = 0);
    else if (typeof x == 'object')
      (this.x = x.x), (this.y = x.y), (this.z = x.z);
    else if (y == undefined && z == undefined)
      (this.x = x), (this.y = x), (this.z = x);
    else (this.x = x), (this.y = y), (this.z = z);
  }

  set(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  } // End of 'set' function

  dot(v: vec3) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  } // End of 'dot' function

  cross(v: vec3) {
    return new vec3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  } // End of 'cross' function

  add(v: vec3) {
    if (typeof v == 'number')
      return new vec3(this.x + v, this.y + v, this.z + v);
    return new vec3(this.x + v.x, this.y + v.y, this.x - v.x);
  } // End of 'add' function

  sub(v: vec3) {
    if (typeof v == 'number')
      return new vec3(this.x - v, this.y - v, this.z - v);
    return new vec3(this.x - v.x, this.y - v.y, this.z - v.z);
  } // End of 'sub' function

  mul(v: vec3 | number) {
    if (typeof v == 'number')
      return new vec3(this.x * v, this.y * v, this.z * v);
    return new vec3(this.x * v.x, this.y * v.y, this.z * v.z);
  } // End of 'mul' function

  div(v: vec3) {
    if (typeof v == 'number')
      return new vec3(this.x / v, this.y / v, this.z / v);
    return new vec3(this.x / v.x, this.y / v.y, this.z / v.z);
  } // End of 'div' function

  len2() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  } // End of 'len2' function

  len() {
    let len = this.x * this.x + this.y * this.y + this.z * this.z;

    if (len != 0 && len != 1) return Math.sqrt(len);
    return len;
  } // End of 'len' function

  normalize() {
    let len = this.x * this.x + this.y * this.y + this.z * this.z;

    if (len != 0 && len != 1) {
      len = Math.sqrt(len);
      return new vec3(this.x / len, this.y / len, this.z / len);
    }
    return this;
  } // End of 'normalize' function

  toArray() {
    return [this.x, this.y, this.z];
  } // End of 'toArray' function
}

export class matr {
  m: number[][];

  addMethod(obj: any, name: any, func: any) {
    var old = obj[name];
    obj[name] = (...args: any) => {
      if (func.length == args.length) return func.apply(obj, args);
      else if (typeof old == 'function') return old.apply(obj, args);
    };
  } // End of 'addMethod' function

  constructor(m: any) {
    if (m == null)
      this.m = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
      ];
    else if (typeof m == 'object' && m.length == 4) this.m = m;
    else this.m = m.m;
  } // End of 'constructor' function

  setTranslate(dx: number, dy: number, dz: number) {
    this.m = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [dx, dy, dz, 1]
    ];
    return this;
  }
  setScale(sx: number, sy: number, sz: number) {
    this.m = [
      [sx, 0, 0, 0],
      [0, sy, 0, 0],
      [0, 0, sz, 0],
      [0, 0, 0, 1]
    ];
    return this;
  }
  scale(v: vec3) {
    if (typeof v == 'object') return this.setScale(v.x, v.y, v.z);
    return this.setScale(v, v, v);
  }
  setRotate(AngleInDegree: number, R: any) {
    let a = AngleInDegree * Math.PI,
      sine = Math.sin(a),
      cosine = Math.cos(a);
    let x = 0,
      y = 0,
      z = 1;
    if (typeof R == 'object')
      if (R.length == 3) (x = R[0]), (y = R[1]), (z = R[2]);
      else (x = R.x), (y = R.y), (z = R.z);
    // Vector normalize
    let len = x * x + y * y + z * z;
    if (len != 0 && len != 1)
      (len = Math.sqrt(len)), (x /= len), (y /= len), (z /= len);
    this.m[0][0] = cosine + x * x * (1 - cosine);
    this.m[0][1] = x * y * (1 - cosine) + z * sine;
    this.m[0][2] = x * z * (1 - cosine) - y * sine;
    this.m[0][3] = 0;
    this.m[1][0] = y * x * (1 - cosine) - z * sine;
    this.m[1][1] = cosine + y * y * (1 - cosine);
    this.m[1][2] = y * z * (1 - cosine) + x * sine;
    this.m[1][3] = 0;
    this.m[2][0] = z * x * (1 - cosine) + y * sine;
    this.m[2][1] = z * y * (1 - cosine) - x * sine;
    this.m[2][2] = cosine + z * z * (1 - cosine);
    this.m[2][3] = 0;
    this.m[3][0] = 0;
    this.m[3][1] = 0;
    this.m[3][2] = 0;
    this.m[3][3] = 1;
    return this;
  } // End of 'setRotate' function

  rotate(AngleInDegree: number, R: any) {
    return this.mul(new matr(null).setRotate(AngleInDegree, R));
  } // End of 'rotate' function

  transpose() {
    let r: any;

    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 4; j++) r[i][j] = this.m[j][i];
    return new matr(r);
  } // End of 'transpose' function

  mul(m: any) {
    let matr;
    if (m.length == 4) matr = m;
    else matr = m.m;
    this.m = [
      [
        this.m[0][0] * matr[0][0] +
          this.m[0][1] * matr[1][0] +
          this.m[0][2] * matr[2][0] +
          this.m[0][3] * matr[3][0],
        this.m[0][0] * matr[0][1] +
          this.m[0][1] * matr[1][1] +
          this.m[0][2] * matr[2][1] +
          this.m[0][3] * matr[3][1],
        this.m[0][0] * matr[0][2] +
          this.m[0][1] * matr[1][2] +
          this.m[0][2] * matr[2][2] +
          this.m[0][3] * matr[3][2],
        this.m[0][0] * matr[0][3] +
          this.m[0][1] * matr[1][3] +
          this.m[0][2] * matr[2][3] +
          this.m[0][3] * matr[3][3]
      ],
      [
        this.m[1][0] * matr[0][0] +
          this.m[1][1] * matr[1][0] +
          this.m[1][2] * matr[2][0] +
          this.m[1][3] * matr[3][0],
        this.m[1][0] * matr[0][1] +
          this.m[1][1] * matr[1][1] +
          this.m[1][2] * matr[2][1] +
          this.m[1][3] * matr[3][1],
        this.m[1][0] * matr[0][2] +
          this.m[1][1] * matr[1][2] +
          this.m[1][2] * matr[2][2] +
          this.m[1][3] * matr[3][2],
        this.m[1][0] * matr[0][3] +
          this.m[1][1] * matr[1][3] +
          this.m[1][2] * matr[2][3] +
          this.m[1][3] * matr[3][3]
      ],
      [
        this.m[2][0] * matr[0][0] +
          this.m[2][1] * matr[1][0] +
          this.m[2][2] * matr[2][0] +
          this.m[2][3] * matr[3][0],
        this.m[2][0] * matr[0][1] +
          this.m[2][1] * matr[1][1] +
          this.m[2][2] * matr[2][1] +
          this.m[2][3] * matr[3][1],
        this.m[2][0] * matr[0][2] +
          this.m[2][1] * matr[1][2] +
          this.m[2][2] * matr[2][2] +
          this.m[2][3] * matr[3][2],
        this.m[2][0] * matr[0][3] +
          this.m[2][1] * matr[1][3] +
          this.m[2][2] * matr[2][3] +
          this.m[2][3] * matr[3][3]
      ],
      [
        this.m[3][0] * matr[0][0] +
          this.m[3][1] * matr[1][0] +
          this.m[3][2] * matr[2][0] +
          this.m[3][3] * matr[3][0],
        this.m[3][0] * matr[0][1] +
          this.m[3][1] * matr[1][1] +
          this.m[3][2] * matr[2][1] +
          this.m[3][3] * matr[3][1],
        this.m[3][0] * matr[0][2] +
          this.m[3][1] * matr[1][2] +
          this.m[3][2] * matr[2][2] +
          this.m[3][3] * matr[3][2],
        this.m[3][0] * matr[0][3] +
          this.m[3][1] * matr[1][3] +
          this.m[3][2] * matr[2][3] +
          this.m[3][3] * matr[3][3]
      ]
    ];
    return this;
  } // End of 'mul' function

  determ3x3(
    A11: number,
    A12: number,
    A13: number,
    A21: number,
    A22: number,
    A23: number,
    A31: number,
    A32: number,
    A33: number
  ) {
    return (
      A11 * A22 * A33 -
      A11 * A23 * A32 -
      A12 * A21 * A33 +
      A12 * A23 * A31 +
      A13 * A21 * A32 -
      A13 * A22 * A31
    );
  } // End of 'determ3x3' function

  determ() {
    let det =
      this.m[0][0] *
        this.determ3x3(
          this.m[1][1],
          this.m[1][2],
          this.m[1][3],
          this.m[2][1],
          this.m[2][2],
          this.m[2][3],
          this.m[3][1],
          this.m[3][2],
          this.m[3][3]
        ) -
      this.m[0][1] *
        this.determ3x3(
          this.m[1][0],
          this.m[1][2],
          this.m[1][3],
          this.m[2][0],
          this.m[2][2],
          this.m[2][3],
          this.m[3][0],
          this.m[3][2],
          this.m[3][3]
        ) +
      this.m[0][2] *
        this.determ3x3(
          this.m[1][0],
          this.m[1][1],
          this.m[1][3],
          this.m[2][0],
          this.m[2][1],
          this.m[2][3],
          this.m[3][0],
          this.m[3][1],
          this.m[3][3]
        ) -
      this.m[0][3] *
        this.determ3x3(
          this.m[1][0],
          this.m[1][1],
          this.m[1][2],
          this.m[2][0],
          this.m[2][1],
          this.m[2][2],
          this.m[3][0],
          this.m[3][1],
          this.m[3][2]
        );

    return det;
  } // End of 'determ' function

  inverse() {
    let r: any;
    let det = this.determ();

    if (det == 0) {
      let m = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
      ];

      return new matr(m);
    }

    /* Build adjoint matrix */
    r[0][0] =
      this.determ3x3(
        this.m[1][1],
        this.m[1][2],
        this.m[1][3],
        this.m[2][1],
        this.m[2][2],
        this.m[2][3],
        this.m[3][1],
        this.m[3][2],
        this.m[3][3]
      ) / det;
    r[1][0] =
      -this.determ3x3(
        this.m[1][0],
        this.m[1][2],
        this.m[1][3],
        this.m[2][0],
        this.m[2][2],
        this.m[2][3],
        this.m[3][0],
        this.m[3][2],
        this.m[3][3]
      ) / det;
    r[2][0] =
      this.determ3x3(
        this.m[1][0],
        this.m[1][1],
        this.m[1][3],
        this.m[2][0],
        this.m[2][1],
        this.m[2][3],
        this.m[3][0],
        this.m[3][1],
        this.m[3][3]
      ) / det;
    r[3][0] =
      -this.determ3x3(
        this.m[1][0],
        this.m[1][1],
        this.m[1][2],
        this.m[2][0],
        this.m[2][1],
        this.m[2][2],
        this.m[3][0],
        this.m[3][1],
        this.m[3][2]
      ) / det;

    r[0][1] =
      -this.determ3x3(
        this.m[0][1],
        this.m[0][2],
        this.m[0][3],
        this.m[2][1],
        this.m[2][2],
        this.m[2][3],
        this.m[3][1],
        this.m[3][2],
        this.m[3][3]
      ) / det;
    r[1][1] =
      this.determ3x3(
        this.m[0][0],
        this.m[0][2],
        this.m[0][3],
        this.m[2][0],
        this.m[2][2],
        this.m[2][3],
        this.m[3][0],
        this.m[3][2],
        this.m[3][3]
      ) / det;
    r[2][1] =
      -this.determ3x3(
        this.m[0][0],
        this.m[0][1],
        this.m[0][3],
        this.m[2][0],
        this.m[2][1],
        this.m[2][3],
        this.m[3][0],
        this.m[3][1],
        this.m[3][3]
      ) / det;
    r[3][1] =
      this.determ3x3(
        this.m[0][0],
        this.m[0][1],
        this.m[0][2],
        this.m[2][0],
        this.m[2][1],
        this.m[2][2],
        this.m[3][0],
        this.m[3][1],
        this.m[3][2]
      ) / det;

    r[0][2] =
      this.determ3x3(
        this.m[0][1],
        this.m[0][2],
        this.m[0][3],
        this.m[1][1],
        this.m[1][2],
        this.m[1][3],
        this.m[3][1],
        this.m[3][2],
        this.m[3][3]
      ) / det;
    r[1][2] =
      -this.determ3x3(
        this.m[0][0],
        this.m[0][2],
        this.m[0][3],
        this.m[1][0],
        this.m[1][2],
        this.m[1][3],
        this.m[3][0],
        this.m[3][2],
        this.m[3][3]
      ) / det;
    r[2][2] =
      this.determ3x3(
        this.m[0][0],
        this.m[0][1],
        this.m[0][3],
        this.m[1][0],
        this.m[1][1],
        this.m[1][3],
        this.m[3][0],
        this.m[3][1],
        this.m[3][3]
      ) / det;
    r[3][2] =
      -this.determ3x3(
        this.m[0][0],
        this.m[0][1],
        this.m[0][2],
        this.m[1][0],
        this.m[1][1],
        this.m[1][2],
        this.m[3][0],
        this.m[3][1],
        this.m[3][2]
      ) / det;

    r[0][3] =
      -this.determ3x3(
        this.m[0][1],
        this.m[0][2],
        this.m[0][3],
        this.m[1][1],
        this.m[1][2],
        this.m[1][3],
        this.m[2][1],
        this.m[2][2],
        this.m[2][3]
      ) / det;

    r[1][3] =
      this.determ3x3(
        this.m[0][0],
        this.m[0][2],
        this.m[0][3],
        this.m[1][0],
        this.m[1][2],
        this.m[1][3],
        this.m[2][0],
        this.m[2][2],
        this.m[2][3]
      ) / det;
    r[2][3] =
      -this.determ3x3(
        this.m[0][0],
        this.m[0][1],
        this.m[0][3],
        this.m[1][0],
        this.m[1][1],
        this.m[1][3],
        this.m[2][0],
        this.m[2][1],
        this.m[2][3]
      ) / det;
    r[3][3] =
      this.determ3x3(
        this.m[0][0],
        this.m[0][1],
        this.m[0][2],
        this.m[1][0],
        this.m[1][1],
        this.m[1][2],
        this.m[2][0],
        this.m[2][1],
        this.m[2][2]
      ) / det;
    this.m = r;
    return this;
  } // End of 'inverse' function
  setIdentity() {
    this.m = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ];
    return this;
  } // End of 'inverse' function

  setView(Loc: vec3, At: vec3, Up1: vec3) {
    let Dir = At.sub(Loc).normalize(),
      Right = Dir.cross(Up1).normalize(),
      Up = Right.cross(Dir).normalize();
    this.m = [
      [Right.x, Up.x, -Dir.x, 0],
      [Right.y, Up.y, -Dir.y, 0],
      [Right.z, Up.z, -Dir.z, 0],
      [-Loc.dot(Right), -Loc.dot(Up), Loc.dot(Dir), 1]
    ];
    return this;
  } // End of 'setView' function

  setOrtho(
    Left: number,
    Right: number,
    Bottom: number,
    Top: number,
    Near: number,
    Far: number
  ) {
    this.m = [
      [2 / (Right - Left), 0, 0, 0],
      [0, 2 / (Top - Bottom), 0, 0],
      [0, 0, -2 / (Far - Near), 0],
      [
        -(Right + Left) / (Right - Left),
        -(Top + Bottom) / (Top - Bottom),
        -(Far + Near) / (Far - Near),
        1
      ]
    ];
    return this;
  } // End of 'setOrtho' function

  setFrustum(
    Left: number,
    Right: number,
    Bottom: number,
    Top: number,
    Near: number,
    Far: number
  ) {
    this.m = [
      [(2 * Near) / (Right - Left), 0, 0, 0],
      [0, (2 * Near) / (Top - Bottom), 0, 0],
      [
        (Right + Left) / (Right - Left),
        (Top + Bottom) / (Top - Bottom),
        -(Far + Near) / (Far - Near),
        -1
      ],
      [0, 0, (-2 * Near * Far) / (Far - Near), 0]
    ];
    return this;
  } // End of 'setFrustum' function

  view(Loc: vec3, At: vec3, Up1: vec3) {
    return this.mul(new matr(null).setView(Loc, At, Up1));
  } // End of 'view' function

  ortho(
    Left: number,
    Right: number,
    Bottom: number,
    Top: number,
    Near: number,
    Far: number
  ) {
    return this.mul(
      new matr(null).setOrtho(Left, Right, Bottom, Top, Near, Far)
    );
  } // End of 'ortho' function

  frustum(
    Left: number,
    Right: number,
    Bottom: number,
    Top: number,
    Near: number,
    Far: number
  ) {
    return this.mul(
      new matr(null).setFrustum(Left, Right, Bottom, Top, Near, Far)
    );
  } // End of 'frustum' function

  transform(V: vec3) {
    let w =
      V.x * this.m[0][3] +
      V.y * this.m[1][3] +
      V.z * this.m[2][3] +
      this.m[3][3];

    return new vec3(
      (V.x * this.m[0][0] +
        V.y * this.m[1][0] +
        V.z * this.m[2][0] +
        this.m[3][0]) /
        w,
      (V.x * this.m[0][1] +
        V.y * this.m[1][1] +
        V.z * this.m[2][1] +
        this.m[3][1]) /
        w,
      (V.x * this.m[0][2] +
        V.y * this.m[1][2] +
        V.z * this.m[2][2] +
        this.m[3][2]) /
        w
    );
  } // End of 'transform' function

  transformVector(V: vec3) {
    return new vec3(
      V.x * this.m[0][0] + V.y * this.m[1][0] + V.z * this.m[2][0],
      V.x * this.m[0][1] + V.y * this.m[1][1] + V.z * this.m[2][1],
      V.x * this.m[0][2] + V.y * this.m[1][2] + V.z * this.m[2][2]
    );
  } // End of 'transformVector' function

  transformPoint(V: vec3) {
    return new vec3(
      V.x * this.m[0][0] +
        V.y * this.m[1][0] +
        V.z * this.m[2][0] +
        this.m[3][0],
      V.x * this.m[0][1] +
        V.y * this.m[1][1] +
        V.z * this.m[2][1] +
        this.m[3][1],
      V.x * this.m[0][2] +
        V.y * this.m[1][2] +
        V.z * this.m[2][2] +
        this.m[3][2]
    );
  } // End of 'transformPoint' function

  /*   toArray() {
    return [].concat(...this.m);
  } // End of 'toArray' function */
}
