<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';

  let canvas: HTMLCanvasElement;
  let ctx: WebGL2RenderingContext | null = null;
  let animFrame: number | null = null;
  let startTime = 0;
  let program: WebGLProgram | null = null;
  let reduced = false;

  const VERT = `#version 300 es
    in vec2 aPos;
    void main() { gl_Position = vec4(aPos, .5, 1.); }
  `;

  const FRAG = `#version 300 es
    precision highp float;
    uniform vec3 iResolution;
    uniform float iTime;
    out vec4 fragColor;

    // -- tri noise helpers from nimitz aurora --
    float hash21(vec2 n) { return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453); }
    float tri(float x) { return clamp(abs(fract(x) - .5), .01, .49); }
    vec2  tri2(vec2 p)  { return vec2(tri(p.x) + tri(p.y), tri(p.y + tri(p.x))); }

    mat2 mm2(float a) { float c = cos(a), s = sin(a); return mat2(c, s, -s, c); }

    float triNoise2d(vec2 p, float spd) {
      float z  = 1.8, z2 = 2.5, rz = 0.;
      p = mm2(p.x * .06) * p;
      vec2 bp = p;
      for (float i = 0.; i < 5.; i++) {
        vec2 dg = tri2(bp * 1.85) * .75;
        dg = mm2(iTime * spd) * dg;
        p -= dg / z2;
        bp *= 1.3; z2 *= .45; z *= .42;
        p *= 1.21 + (rz - 1.) * .02;
        rz += tri(p.x + tri(p.y)) * z;
        p = mat2(.95534, -.29552, .29552, .95534) * -p;
      }
      return clamp(1. / pow(rz * 29., 1.3), 0., .55);
    }

    vec4 aurora(vec3 ro, vec3 rd) {
      vec4 col = vec4(0.), avgCol = vec4(0.);
      for (float i = 0.; i < 50.; i++) {
        float of = .006 * hash21(iResolution.xy) * smoothstep(0., 15., i);
        float pt = ((.8 + pow(i, 1.4) * .002) - ro.y) / (rd.y * 2. + .4) - of;
        vec3  bpos = ro + pt * rd;
        float rzt  = triNoise2d(bpos.zx, .06);
        vec4  col2  = vec4((sin(1. - vec3(2.15, -.5, 1.2) + i * .043) * .5 + .5) * rzt, rzt);
        avgCol = mix(avgCol, col2, .5);
        col += avgCol * exp2(-i * .065 - 2.5) * smoothstep(0., 5., i);
      }
      col *= clamp(rd.y * 15. + .4, 0., 1.);
      return col * 1.8;
    }

    // star-field
    vec3 hash33(vec3 p) {
      p = fract(p * vec3(443.8975, 397.2973, 491.1871));
      p += dot(p.zxy, p.yxz + 19.27);
      return fract(vec3(p.x * p.y, p.z * p.x, p.y * p.z));
    }
    vec3 stars(vec3 p) {
      vec3 c = vec3(0.);
      float res = iResolution.x;
      for (float i = 0.; i < 4.; i++) {
        vec3 q  = fract(p * (.15 * res)) - .5;
        vec3 id = floor(p * (.15 * res));
        vec2 rn = hash33(id).xy;
        float c2 = 1. - smoothstep(0., .6, length(q));
        c2 *= step(rn.x, .0005 + i * i * .001);
        c += c2 * (mix(vec3(1., .49, .1), vec3(.75, .9, 1.), rn.y) * .1 + .9);
        p *= 1.3;
      }
      return c * c * .8;
    }

    vec3 bg(vec3 rd) {
      float sd = dot(normalize(vec3(-.5, -.6, .9)), rd) * .5 + .5;
      sd = pow(sd, 5.);
      return mix(vec3(.05, .1, .2), vec3(.1, .05, .2), sd) * .63;
    }

    void mainImage(out vec4 C, vec2 fc) {
      vec2 q = fc / iResolution.xy;
      vec2 p = q - .5;
      p.x *= iResolution.x / iResolution.y;

      vec3 ro = vec3(0., 0., -6.7);
      vec3 rd = normalize(vec3(p, 1.3));

      vec2 mo = vec2(0.);
      rd.yz = mm2(mo.y) * rd.yz;
      rd.xz = mm2(mo.x + sin(iTime * .05) * .2) * rd.xz;

      float fade  = smoothstep(0., .01, abs(rd.y)) * .1 + .9;
      vec3 col    = bg(rd) * fade;
      vec3 brd    = rd;

      if (rd.y > 0.) {
        vec4 aur = smoothstep(0., 1.5, aurora(ro, rd)) * fade;
        col += stars(rd);
        col = col * (1. - aur.a) + aur.rgb;
      } else {
        rd.y = abs(rd.y);
        col = bg(rd) * fade * .6;
        vec4 aur = smoothstep(0., 2.5, aurora(ro, rd));
        col += stars(rd) * .1;
        col = col * (1. - aur.a) + aur.rgb;
        vec3 pos = ro + ((.5 - ro.y) / rd.y) * rd;
        float nz2 = triNoise2d(pos.xz * vec2(.5, .7), 0.);
        col += mix(vec3(.2, .25, .5) * .08, vec3(.3, .3, .5) * .7, nz2 * .4);
      }
      C = vec4(col, 1.);
    }

    void main() { mainImage(fragColor, gl_FragCoord.xy); }
  `;

  function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('Shader error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      throw new Error('Shader compile failed');
    }
    return shader;
  }

  function setupWebGL(gl: WebGL2RenderingContext) {
    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, 3, -1, -1, 3, -1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'aPos');
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPos);
    return buf;
  }

  function render(now: number) {
    if (!ctx || !program || reduced) return;
    if (!startTime) startTime = now;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
      ctx.viewport(0, 0, w, h);
    }
    ctx.useProgram(program);
    ctx.uniform3f(ctx.getUniformLocation(program, 'iResolution'), w, h, 1);
    ctx.uniform1f(ctx.getUniformLocation(program, 'iTime'), (now - startTime) * .001);
    ctx.drawArrays(ctx.TRIANGLES, 0, 3);
    animFrame = requestAnimationFrame(render);
  }

  let observer: ResizeObserver;

  onMount(async () => {
    await tick();
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduced = mq.matches;
    if (reduced) return;

    ctx = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true });
    if (!ctx) { console.warn('WebGL2 not available'); return; }
    setupWebGL(ctx);
    animFrame = requestAnimationFrame(render);

    observer = new ResizeObserver(() => { /* render handles resize */ });
    observer.observe(canvas);
    mq.addEventListener('change', (e) => { reduced = e.matches; if (reduced) stop(); });
  });

  function stop() {
    if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
    ctx = null; program = null;
  }

  onDestroy(() => { stop(); observer?.disconnect(); });
</script>

<canvas
  bind:this={canvas}
  class="aurora-canvas"
  aria-hidden="true"
></canvas>

<style>
  .aurora-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    opacity: .55;
    mix-blend-mode: screen;
  }
</style>
