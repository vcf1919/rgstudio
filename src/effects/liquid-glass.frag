// Liquid glass — ported 1:1 from prototipo.html. NT (number of drops) is #defined at compile time.
precision highp float;
uniform sampler2D t0, t1;          // t0 = sketch, t1 = finished
uniform vec2 res;
uniform vec2 b[NT];
uniform float r[NT];
uniform float rmax;
uniform vec3 wave;                 // xy = centre, z = radius (0 = off)
uniform float refr, aber, spec, rim;

void main(){
  vec2 p = gl_FragCoord.xy; vec2 uv = p/res;
  float f = 0.; vec2 g = vec2(0.);
  for(int i=0;i<NT;i++){ if(r[i]<.5) continue; vec2 d=p-b[i]; float d2=dot(d,d)+1.; float rr=r[i]*r[i]; f+=rr/d2; g+=-2.*rr*d/(d2*d2); }
  float m = smoothstep(.96,1.04,f);
  vec2 n = g/(length(g)+1e-6);
  float edge = 1.-clamp((f-1.)/1.8,0.,1.);
  vec2 off = n*pow(edge,2.2)*rmax*refr/res;
  // shockwave: a refracting ring that leaves the finished web behind it
  vec2 dw = p - wave.xy; float dist = length(dw);
  float band = wave.z > 0. ? exp(-pow((dist - wave.z)/(rmax*.45), 2.)) : 0.;
  float rev  = wave.z > 0. ? smoothstep(wave.z + rmax*.12, wave.z - rmax*.12, dist) : 0.;
  vec2 woff = (dw/(dist+1e-3)) * band * rmax * .3 / res;
  vec3 sk = texture2D(t0, uv + woff).rgb;
  vec3 fn = vec3(texture2D(t1, uv + woff).r, texture2D(t1, uv + woff*(1.+.2*aber)).g, texture2D(t1, uv + woff*(1.+.4*aber)).b);
  vec3 base = mix(sk, fn, rev) + band*.10;
  vec3 glass = vec3(texture2D(t1,uv+off).r, texture2D(t1,uv+off*(1.+.12*aber)).g, texture2D(t1,uv+off*(1.+.26*aber)).b);
  vec3 N3 = normalize(vec3(-n*edge*1.6,1.));
  vec3 L = normalize(vec3(-.45,.55,.75));
  float sp = pow(max(dot(reflect(-L,N3),vec3(0.,0.,1.)),0.),60.);
  glass = glass*(1.-.05*edge) + sp*spec + pow(edge,7.)*rim;
  float sh = smoothstep(.28,.96,f)*(1.-m)*.09;
  gl_FragColor = vec4(mix(base*(1.-sh), glass, m),1.);
}
