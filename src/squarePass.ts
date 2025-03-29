export const SquarePass = {
  name: "Square",

  uniforms: {
    time: { value: 0.0 },
    waveScale: { value: 0.2 },
    squareSizeMin: { value: 0.03 },
    squareSizeMax: { value: 0.6 },
    radius: { value: 0.1 },
    size: { value: 0.3 },
    width: { value: 0.1 },
    height: { value: 0.1 },
    showAreas: { value: false },
  },

  vertexShader: /* glsl */ `  
    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );            
    }`,

  fragmentShader: /* glsl */ `
    uniform float time;		
    uniform float waveScale;		
    uniform float radius;		
    uniform float width;		
    uniform float height;		
    uniform float size;		
    uniform float squareSizeMin;		
    uniform float squareSizeMax;		
    uniform bool showAreas;		
    
    varying vec2 vUv;    

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
        waves += 0.17 * cos(waveScale * 3.7 * waves.yx + 1.23 * timeSlow * vec2(2.2,3.4));  
        waves += 0.31 * cos(waveScale * 2.3 * waves.yx + 5.5 * timeSlow * vec2(3.2,1.3));  
        float distFromWave = smoothstep(-0.1, 0.9, 1. - length(waves));
                
        float modSize = mix(squareSizeMin, squareSizeMax,  distFromWave);        
        vec2 modScale = vec2(modSize);
        vec2 dist = vec2(roundedBoxSDF(fractalUv, modScale, radius));        

        vec2 final = dist;        

        float upperLimit = mix(0.1, 0.99, final.y) ;
        float distColor = 1. - smoothstep(0.01, upperLimit, final.x);

        if(showAreas) {
          distColor = 1. - length(waves);
        }
        
        vec3 finalColor = vec3(abs(distColor) * 0.98);
        //finalColor.r = upperLimit;

        // Output
        gl_FragColor = vec4(finalColor, 1.);    
    }`,
};
