export const SquarePass = {
  name: "Square",

  uniforms: {
    time: { value: 0.0 },
    scale: { value: 0.2 },
    radius: { value: 0.1 },
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

    varying vec2 vUv;
    
    float size = 0.3;

    
    float roundedBoxSDF(vec2 CenterPosition, vec2 Size, float Radius) {
        return length(max(abs(CenterPosition)-Size+Radius,0.0))-Radius;
    }
    
    void main() {
        vec2 p = 2. * vUv - vec2(1.);
        float timeSlow = time * 0.05;
        vec2 fractalUv = vUv;

        // Create fractal coordinates
        fractalUv *= 20.0;
        fractalUv = fract(fractalUv); // Wrap around 1.0
        fractalUv = fractalUv * 2.0 - 1.0; //Normalize to [-1,1]        

        // Waves        
        p += 0.17 * cos(scale * 3.7 * p.yx + 1.23 * timeSlow * vec2(2.2,3.4));  
        p += 0.31 * cos(scale * 2.3 * p.yx + 5.5 * timeSlow * vec2(3.2,1.3));        
        //p = smoothstep(0.1, 0.6, p);
                
        // Rounded square dist
        float modSize = mix(0.03, 0.6, size + (1. - length(p)));
        float distance = roundedBoxSDF(fractalUv, vec2(modSize), radius);
        float distColor = 1. - smoothstep(0.01, 0.1, distance);
        
        // Output
        gl_FragColor = vec4(vec3(distColor), 1.);    
        //gl_FragColor = vec4(p.y + p.x, 0., 0., 1.);    
    }`,
};
