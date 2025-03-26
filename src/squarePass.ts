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
    
    float roundedBoxSDF(vec2 CenterPosition, vec2 Size, float Radius) {
        return length(max(abs(CenterPosition)-Size+Radius,0.0))-Radius;
    }
    
    void main() {
        vec2 p = 2. * vUv - vec2(1.);
        float timeSlow = time * 0.05;
        vec2 resolution = vec2(width, height);
        vec2 fractalUv = vUv;
        float aspect = width / height;
        
        // Create fractal coordinates
        fractalUv *= 20.0;
        fractalUv = fract(fractalUv); // Wrap around 1.0
        fractalUv = fractalUv * 2.0 - 1.0; //Normalize to [-1,1]        

        fractalUv.x *= aspect;

        // Waves        
        p += 0.17 * cos(scale * 3.7 * p.yx + 1.23 * timeSlow * vec2(2.2,3.4));  
        p += 0.31 * cos(scale * 2.3 * p.yx + 5.5 * timeSlow * vec2(3.2,1.3));                
                
        // Rounded square dist
         float modSize = mix(0.03, 0.6, size + (1. - length(p)));
         float distance = roundedBoxSDF(fractalUv, vec2(modSize), radius);
         float distColor = 1. - smoothstep(0.01, 0.1, distance);

        vec3 finalColor = vec3(distColor);

        // Output
        gl_FragColor = vec4(finalColor, 1.);    
    }`,
};
