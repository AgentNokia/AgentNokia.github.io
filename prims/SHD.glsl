vec3 Shade( vec3 P, vec3 N )
        {
          vec3 L = normalize(vec3(1, 2, 3));
          vec3 LC = vec3(1, 0, 0);
          vec3 color = vec3(0);

          color = v_color.rgb;
            
          color *= max(0.0, dot(N, L)) * LC;


          return color;
        }