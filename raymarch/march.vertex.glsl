#version 300 es
precision highp float;
in highp vec4 in_pos;
in highp vec4 object;
out highp vec4 i_pos;
void main() {
    gl_Position = in_pos;
    i_pos = vec4(object.x, 0.0, 0.0, 0.0);
}
