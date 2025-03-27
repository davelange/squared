export const SquarePass = {
  name: "Square",

  uniforms: {
    time: { value: 0.0 },
    scale: { value: 0.2 },
    radius: { value: 0.1 },
    size: { value: 0.3 },
    width: { value: 0.1 },
    height: { value: 0.1 },
  },

  vertexShader: /* glsl */ `  
    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );            
    }`,

  fragmentShader: /* glsl */ `
    uniform float time;		
    uniform float scale;		
    uniform float radius;		
    uniform float width;		
    uniform float height;		
    uniform float size;		
    
    varying vec2 vUv;
    
    /* float roundedBoxSDF(vec2 CenterPosition, vec2 Size, float Radius) {
        return length(max(abs(CenterPosition)-Size+Radius,0.0))-Radius;
    } */

    float roundedBoxSDF(vec2 CenterPosition, vec2 Size, float Radius) {
      return length(max(abs(CenterPosition) - Size + Radius, 0.0))-Radius;
    }

    vec2 rotate45(vec2 v) {
      float angle = radians(45.0); // Convert degrees to radians
      float s = sin(angle);
      float c = cos(angle);
      
      mat2 rotationMatrix = mat2(
          c, -s,
          s,  c
      );
  
      return rotationMatrix * v;
  }
    
    void main() {
        vec2 p = 2. * vUv - vec2(1.);
        //float timeSlow = 0.0;
        float timeSlow = time * 0.05;
        vec2 resolution = vec2(width, height);
        vec2 fractalUv = vUv;
        float aspect = width / height;
        
        // Create fractal coordinates
        fractalUv *= 30.0;
        fractalUv = fract(fractalUv); // Wrap around 1.0
        fractalUv = fractalUv * 2.0 - 1.0; //Normalize to [-1,1]                        
        //fractalUv.x *= aspect;

        // Waves
        vec2 waves = p;
        waves += 0.17 * cos(scale * 0.2 * p.yx + 1.23 * timeSlow * vec2(2.2,3.4));
        waves += 0.31 * cos(scale * 0.1 * p.yx + 5.5 * timeSlow * vec2(3.2,1.3));
                
        float modSize = mix(0.03, 0.7, size + (1. - length(waves)));        
        vec2 modScale = vec2(modSize);
        vec2 dist = vec2(roundedBoxSDF(fractalUv, modScale, 0.1));        


        vec2 final = dist;
        p = rotate45(fractalUv); /*  * (1. - smoothstep(0.1, 0.8, length(waves))) */;
        
        final *= abs(p.y);

        //p = cos(scale * p.yx) + cos(scale * p.xy);
        //p += 0.17 * cos(scale * 3.7 * p.yx + 1.23 * timeSlow * vec2(2.2,3.4));  
        //p += 0.31 * cos(scale * 2.3 * p.yx + 5.5 * timeSlow * vec2(3.2,1.3));                
                
        // Rounded square dist
        //float modSize = mix(0.03, 0.7, size + (1. - length(p)));
        //float modSize = mix(0.03, 0.7, size);
        //vec2 modScale = vec2(modSize);
        //modScale.x *= 1.;
        //float distance = roundedBoxSDF(fractalUv, modScale, radius);
        //float distColor = 1. - smoothstep(0.01, 0.01, distance);

        //float distColor = 1. - smoothstep(0.01, 0.8, length(waves));
        float distColor = 1. - smoothstep(0.01, 0.04, final.x);

        vec3 finalColor = vec3(distColor * 0.98);

        // Output
        gl_FragColor = vec4(finalColor, 1.);    
    }`,
};
