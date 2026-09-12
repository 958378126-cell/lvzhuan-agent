"use client";

import { useEffect, useRef } from "react";

export default function AmbientField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: "high-performance",
    });
    if (!gl) return;

    const vertex = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
    const fragment = `precision highp float;
      uniform vec2 r;uniform float t;uniform vec2 m;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.01;a*=.5;}return v;}
      void main(){
        vec2 p=(gl_FragCoord.xy-.5*r)/min(r.x,r.y);float tm=t*.012;p.x+=(m.x-.5)*.045;
        float n=fbm(p*1.15+vec2(tm*.5,-tm*.25));
        float ribbon=sin(p.x*1.8+p.y*.7+n*3.2+tm*2.0);
        float aurora=smoothstep(.35,.98,.5+.5*sin(p.y*2.4-p.x*.9+n*2.0+tm));
        float glow=exp(-2.4*length(p-vec2(-.12+sin(tm)*.12,.08)));
        float glow2=exp(-3.0*length(p-vec2(.28,-.18)));
        vec3 c=vec3(.025,.035,.047);
        c+=vec3(.18,.12,.33)*smoothstep(.3,.95,aurora)*(.12+.12*n);
        c+=vec3(.28,.09,.29)*smoothstep(.25,1.,ribbon)*.055;
        c+=vec3(.18,.36,.28)*glow*.13;c+=vec3(.55,.32,.14)*glow2*.045;c+=vec3(.025,.04,.055)*n*.18;
        float vignette=1.-smoothstep(.28,1.2,length(p)*.56);c*=.58+.18*vignette;
        gl_FragColor=vec4(pow(c,vec3(.92)),1.);
      }`;

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const vertexShader = compile(gl.VERTEX_SHADER, vertex);
    const fragmentShader = compile(gl.FRAGMENT_SHADER, fragment);
    const program = gl.createProgram();
    if (!vertexShader || !fragmentShader || !program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const resolution = gl.getUniformLocation(program, "r");
    const time = gl.getUniformLocation(program, "t");
    const pointer = gl.getUniformLocation(program, "m");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const staticField = reduced || window.matchMedia("(max-width: 720px)").matches;
    let mouseX = 0.5;
    let mouseY = 0.5;
    let start = performance.now();
    let frame = 0;

    const resize = () => {
      const density = Math.min(window.devicePixelRatio || 1, 1.6);
      canvas.width = Math.floor(window.innerWidth * density);
      canvas.height = Math.floor(window.innerHeight * density);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const move = (event: PointerEvent) => {
      mouseX = event.clientX / window.innerWidth;
      mouseY = 1 - event.clientY / window.innerHeight;
    };
    const draw = (now: number) => {
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform1f(time, staticField ? 0 : (now - start) / 1000);
      gl.uniform2f(pointer, mouseX, mouseY);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (!staticField) frame = requestAnimationFrame(draw);
    };
    const visibility = () => {
      cancelAnimationFrame(frame);
      if (!document.hidden && !staticField) {
        start = performance.now();
        frame = requestAnimationFrame(draw);
      }
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    draw(start);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("visibilitychange", visibility);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      if (buffer) gl.deleteBuffer(buffer);
    };
  }, []);

  return <canvas ref={canvasRef} className="ambient-field" aria-hidden="true" />;
}
