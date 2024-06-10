#version 300 es
precision highp float;
out vec4 o_color;
in vec4 i_pos;
uniform highp float time, zoom, AngleX, AngleY;
uniform int sphere_count, thorus_count, cubes_count;
uniform highp vec3 Loc;

float distance_from_sphere(in vec3 p, in vec3 c, float r)
{
    return length(p - c) - r;
}

// float map_the_world_sphere(in vec3 p)
// {
//     float sphere_0 = distance_from_sphere(p, vec3(0.0), 1.0);

//     return sphere_0;
// }

float map_the_world_sphere(in vec3 p, in vec3 c)
{
    float displacement = sin(5.0 * p.x) * sin(5.0 * p.y) * sin(5.0 * p.z) * 0.25;
    float sphere_0 = distance_from_sphere(p, c, 0.7);

    return sphere_0;// + displacement;
}

float map_the_world_thorus(in vec3 p, in vec2 t, in vec3 c)
{
  vec2 q = vec2(length(p.xz - c.xz)-t.x,p.y - c.y);
  return length(q)-t.y;
}

float map_the_world_box( in vec3 p, in vec3 b, in vec3 c )
{
  vec3 q = abs(p - c) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float map_the_world_plane( in vec3 p, in vec3 n, in vec3 q )
{
  vec3 n1 = normalize(n);
  return dot(n1, p) - dot(n1, q);
}

vec3 calculate_normal(in vec3 p, in vec3 c)
{
    const vec3 small_step = vec3(0.001, 0.0, 0.0);

    float gradient_x = map_the_world_sphere(p + small_step.xyy, c) - map_the_world_sphere(p - small_step.xyy, c);
    float gradient_y = map_the_world_sphere(p + small_step.yxy, c) - map_the_world_sphere(p - small_step.yxy, c);
    float gradient_z = map_the_world_sphere(p + small_step.yyx, c) - map_the_world_sphere(p - small_step.yyx, c);

    vec3 normal = vec3(gradient_x, gradient_y, gradient_z);

    return normalize(normal);
}

vec3 calculate_normal_box(in vec3 p, in vec3 b, in vec3 c)
{
    const vec3 small_step = vec3(0.001, 0.0, 0.0);

    float gradient_x = map_the_world_box(p + small_step.xyy, b, c) - map_the_world_box(p - small_step.xyy, b, c);
    float gradient_y = map_the_world_box(p + small_step.yxy, b, c) - map_the_world_box(p - small_step.yxy, b, c);
    float gradient_z = map_the_world_box(p + small_step.yyx, b, c) - map_the_world_box(p - small_step.yyx, b, c);

    vec3 normal = vec3(gradient_x, gradient_y, gradient_z);

    return normalize(normal);
}

vec3 calculate_normal_thorus(in vec3 p, in vec2 t, in vec3 c)
{
    const vec3 small_step = vec3(0.001, 0.0, 0.0);

    float gradient_x = map_the_world_thorus(p + small_step.xyy, t, c) - map_the_world_thorus(p - small_step.xyy, t, c);
    float gradient_y = map_the_world_thorus(p + small_step.yxy, t, c) - map_the_world_thorus(p - small_step.yxy, t, c);
    float gradient_z = map_the_world_thorus(p + small_step.yyx, t, c) - map_the_world_thorus(p - small_step.yyx, t, c);

    vec3 normal = vec3(gradient_x, gradient_y, gradient_z);

    return normalize(normal);
}

vec3 Shade( vec3 P, vec3 N, vec3 C ) 
{
  vec3 L = normalize(vec3(-1, 1, -3));
  vec3 LC = vec3(1, 1, 1);
  vec3 color = vec3(0);
  vec3 V = normalize(P - vec3(Loc.x, 0, -30.0 + Loc.y));

  N = faceforward(N, V, N);

  color += max(0.0, dot(N, L)) * C * LC;
  
  vec3 R = reflect(V, N);
  color += pow(max(0.0, dot(R, L)), 10.0) * vec3(0.8) * LC;
  
  return color;
}

vec3 Shade1( vec3 P, vec3 N, vec3 C ) 
{
  vec3 L = normalize(vec3(-1, 1, 3));
  vec3 LC = vec3(1, 1, 1);
  vec3 color = vec3(0);
  vec3 V = normalize(P - vec3(Loc.x, 0, -30.0 + Loc.y));

  N = faceforward(N, V, N);

  color += max(0.0, dot(N, L)) * C * LC;
  
  vec3 R = reflect(V, N);
  color += pow(max(0.0, dot(R, L)), 10.0) * vec3(0.8) * LC;
  
  return color;
}

vec3 ray_march(in vec3 ro, in vec3 rd)
{
    int y = 0, type = 0;
    vec3 minc, min_cur, minb, minnorm, mincol;
    vec2 mint;
    const float MINIMUM_HIT_DISTANCE = 0.01;
    const int NUMBER_OF_STEPS = 32;
    const float MAXIMUM_TRACE_DISTANCE = 10000.0;
    float min_dist = 100000.0, minlen = 1000000.0;

    // Sphere
    for (int k = 0; k < sphere_count; k++)
    {
      float total_distance_traveled = 0.0;
      int x = k % 7;
      if (x % 7 == 0)
        y++;
      vec3 c = vec3(float(x) * 1.8 - 3.0, y * 1 - 3, 0);
      // c = vec3(0);
      for (int i = 0; i < NUMBER_OF_STEPS; ++i)
      {
          vec3 current_position = ro + total_distance_traveled * rd;

          float distance_to_closest = map_the_world_sphere(current_position, c);

          float len = length(ro - current_position);
          if (distance_to_closest < MINIMUM_HIT_DISTANCE && (distance_to_closest) < min_dist
              && len < minlen)
          {
             minlen = length(ro - current_position);
             min_dist = distance_to_closest, minc = c, min_cur = current_position;
             type = 0;
             mincol = vec3(1, 0, 0);
             // sbreak;
          }

          if (total_distance_traveled > MAXIMUM_TRACE_DISTANCE)
          {
              break;
          }
          total_distance_traveled += distance_to_closest;
      }
    }

    // Cube

    for (int k = 0; k < cubes_count; k++)
    {
      float total_distance_traveled = 0.0;

      int x = (k + sphere_count) % 7 * 3 - 20;
      if (x % 7 == 0)
        y+=3;
      vec3 c = vec3(x, y, 0);
      vec3 b = vec3(0.8);
      // c = vec3(0);
      for (int i = 0; i < NUMBER_OF_STEPS; ++i)
      {
          vec3 current_position = ro + total_distance_traveled * rd;
    
          float distance_to_closest = map_the_world_box(current_position, b, c);
          float len = length(ro - current_position);
    
          if (distance_to_closest < MINIMUM_HIT_DISTANCE && (distance_to_closest) < min_dist
            && len < minlen) 
          {
            minlen = length(ro - current_position);
              min_dist = distance_to_closest, minc = c, min_cur = current_position;
              minb = b;
              type = 1;
              mincol = vec3(0.1294, 0.1059, 0.4784);
              // break;
          }

    
          if (total_distance_traveled > MAXIMUM_TRACE_DISTANCE)
          {
              break;
          }
          total_distance_traveled += distance_to_closest;
      }
    }

    // Thorus

    for (int k = 0; k < thorus_count; k++)
    {
      float total_distance_traveled = 0.0;

      int x = (k + sphere_count) % 7 * 3;
      if (x % 7 == 0)
        y+=3;
      vec3 c = vec3(x, y, 0);
      vec2 t = vec2(0.8, 0.4);
      // c = vec3(0);
      for (int i = 0; i < 128; ++i)
      {
          vec3 current_position = ro + total_distance_traveled * rd;
    
          float distance_to_closest = map_the_world_thorus(current_position, t, c);
          float len = length(ro - current_position);
    
          // if (min_dist > 1000.0) {
          // min_dist = distance_to_closest, minc = c, min_cur = current_position;
          //     mint = t;
          //     type = 2;
          // }
                    
          if (distance_to_closest < MINIMUM_HIT_DISTANCE && (distance_to_closest) < min_dist
            && len < minlen) 
          {
              minlen = length(ro - current_position);

              min_dist = distance_to_closest, minc = c, min_cur = current_position;
              mint = t;
              type = 2;
              mincol = vec3(0.1294, 0.1059, 0.4784);
              // continue;// break;
          }

    
          if (total_distance_traveled > MAXIMUM_TRACE_DISTANCE)
          {
              break;
          }
          total_distance_traveled += distance_to_closest;
      }
    }

    if (min_dist < MINIMUM_HIT_DISTANCE) 
    {
        if (type == 0)
        {
          vec3 normal = calculate_normal(min_cur, minc);
          vec3 light_position = vec3(2.0, -5.0, 3.0);
          vec3 direction_to_light = normalize(min_cur - light_position);
          float diffuse_intensity = max(0.0, dot(normal, direction_to_light));
          return Shade(min_cur, normal, mincol);
          return mincol * diffuse_intensity;
        }
        else if (type == 1)
        {
              vec3 normal = calculate_normal_box(min_cur, minb, minc);
              vec3 light_position = vec3(2.0, -5.0, 3.0);
              vec3 direction_to_light = normalize(min_cur - light_position);
    
              float diffuse_intensity = max(0.0, dot(normal, direction_to_light));
    
              return Shade(min_cur, normal, mincol);
              return mincol * diffuse_intensity;
        }
        else if (type == 2)
        {
              vec3 normal = calculate_normal_thorus(min_cur, mint, minc);
              // vec3 light_position = vec3(2.0, -5.0, 3.0);
              // vec3 direction_to_light = normalize(min_cur - light_position);
              // float diffuse_intensity = max(0.0, dot(normal, direction_to_light));
              return Shade(min_cur, normal, mincol);
              return mincol;// * diffuse_intensity;
        }
    }
    // Plane
    float total_distance_traveled = 0.0;
    for (int i = 0; i < 512; ++i)
    {
      vec3 current_position = ro + total_distance_traveled * rd;
      float distance_to_closest = map_the_world_plane(current_position, vec3(0.0, 1.0, 0.0), vec3(-10.0));
      if (distance_to_closest < MINIMUM_HIT_DISTANCE)
      {
        minnorm = vec3(0, 1, 0), min_cur = current_position;
        mincol = vec3(0.2275, 0.698, 0.8118);
        if (bool((int(min_cur.x * 0.2) ^ int(min_cur.y * 0.2)  ^ int(min_cur.z * 0.2) ) & 1))
          mincol *= 1.0;
        else
          mincol *= 0.0;
        //           mincol = vec3(1);
        //         else
        //           mincol = vec3(0);

        min_dist = distance_to_closest;
        type = 2;
        vec3 normal = minnorm;
        // vec3 light_position = vec3(2.0, 5.0, 3.0);
        // vec3 direction_to_light = normalize(current_position - light_position);
        // float diffuse_intensity = max(0.0, dot(normal, direction_to_light));
        return Shade(min_cur, normal, mincol);
      }
      if (total_distance_traveled > MAXIMUM_TRACE_DISTANCE)
        break;
      total_distance_traveled += distance_to_closest;
    }


    return vec3(0.0);
}
#define pi 3.141592653589793238462643383279
#define MATR_IDENTITY mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
#define D2R(X)        X / 180.0 * pi

/* Rotate around X axis by angle function.
 * ARGUMENTS:
 *   - angle in degree:
 *       float AngleInDegree;
 * RETURNS:
 *   (mat4) matrix result.
 */
mat4 MatrRotateX( float AngleInDegree )
{
  mat4 res = MATR_IDENTITY;

  float a = D2R(AngleInDegree), s = sin(a), c = cos(a);
  
  res[1][1] = c;
  res[1][2] = s;
  res[2][1] = -s;
  res[2][2] = c;

  return res;
} /* End of 'MatrRotateX' function */

/* Rotate around Y axis by angle function.
 * ARGUMENTS:
 *   - angle in degree:
 *       float AngleInDegree;
 * RETURNS:
 *   (mat4) matrix result.
 */
mat4 MatrRotateY( float AngleInDegree )
{
  mat4 res = MATR_IDENTITY;

  float a = D2R(AngleInDegree), s = sin(a), c = cos(a);

  res[0][0] = c;
  res[0][2] = -s;
  res[2][0] = s;
  res[2][2] = c;

  return res;
} /* End of 'MatrRotateY' function */

void main()
{
    // vec2 uv = vUV.st * 2.0 - 1.0;
    vec2 uv = vec2(-1.0, -1.0) + 2.0 * gl_FragCoord.xy / 1500.0;

    // uv.x = uv.x / dot(vec2(0, 1), normalize(vec2(uv.x, 1.0)));
    // uv.y = uv.y / dot(vec2(0, 1), normalize(vec2(uv.y, 1.0)));
    vec3 camera_position = vec3(Loc.x, 0, zoom / 30.0 - 30.0 + Loc.y);
    vec3 ro = camera_position;
    vec3 rd = normalize(vec3(vec4(uv, 1.0, 1.0) * MatrRotateX(AngleY) * MatrRotateY(AngleX)).xyz);

    vec3 shaded_color = ray_march(ro, rd);

    o_color = vec4(shaded_color, 1.0);
}
