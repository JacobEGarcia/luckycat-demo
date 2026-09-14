/* LUCKY CAT - interactive product demo scene
   v1 - glossy ceramic cat in a dark studio, brand gold accents.
   three.js r160 core only. */
(function(){
'use strict';

var C = { ink:0xF5F1E8, dark:0x14110C, dark2:0x0E0C08, gold:0xC9A227,
          goldDeep:0xA8861B, red:0xC73A24, mute:0x4A4438 };

// ---------------------------------------------------------------- renderer
var canvas = document.getElementById('stage');
var renderer = new THREE.WebGLRenderer({ canvas:canvas, antialias:true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;

var scene = new THREE.Scene();
scene.background = new THREE.Color(C.dark2);
scene.fog = new THREE.Fog(C.dark2, 14, 34);

var camera = new THREE.PerspectiveCamera(38, window.innerWidth/window.innerHeight, .1, 100);

// ------------------------------------------------- studio environment (PMREM)
(function makeEnv(){
  var env = new THREE.Scene();
  env.background = new THREE.Color(0x000000);
  function panel(x,y,z, w,h, col, intensity, rx,ry){
    var m = new THREE.Mesh(new THREE.PlaneGeometry(w,h),
      new THREE.MeshBasicMaterial({ color:new THREE.Color(col).multiplyScalar(intensity) }));
    m.position.set(x,y,z); m.rotation.x=rx||0; m.rotation.y=ry||0;
    env.add(m); return m;
  }
  panel(0, 6, 2,  6,3, 0xffffff, 9);            // big soft key above
  panel(-5, 2, 3, 3,5, 0xfff4e0, 4, 0, .8);     // warm left fill
  panel( 5, 2,-2, 2,6, C.gold,  6, 0,-.9);      // gold rim right
  panel( 0, 1,-6, 8,2, 0xfff8ee, 2);            // low back strip
  var pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(env, .04).texture;
  pm.dispose();
})();

// ---------------------------------------------------------------- materials
var MAT = {
  ceramic: new THREE.MeshStandardMaterial({ color:0xf7f4ee, roughness:.16, metalness:0, envMapIntensity:1.15 }),
  red:     new THREE.MeshStandardMaterial({ color:C.red,    roughness:.38, metalness:0, envMapIntensity:.9 }),
  gold:    new THREE.MeshStandardMaterial({ color:C.gold,   roughness:.22, metalness:1, envMapIntensity:1.4 }),
  goldSoft:new THREE.MeshStandardMaterial({ color:0xd9b23a, roughness:.35, metalness:.9, envMapIntensity:1.2 }),
  dark:    new THREE.MeshStandardMaterial({ color:0x211d16, roughness:.6,  metalness:0 }),
  eye:     new THREE.MeshStandardMaterial({ color:0x141210, roughness:.2,  metalness:.1, envMapIntensity:1 }),
  iris:    new THREE.MeshStandardMaterial({ color:0x8a6a1f, roughness:.25, metalness:.6, envMapIntensity:1.3 }),
  ped:     new THREE.MeshStandardMaterial({ color:0x1a1712, roughness:.5,  metalness:.1 }),
  floor:   new THREE.MeshStandardMaterial({ color:0x12100b, roughness:.85, metalness:0 })
};

function mesh(geo, mat, x,y,z, parent){
  var m = new THREE.Mesh(geo, mat);
  m.position.set(x||0, y||0, z||0);
  m.castShadow = true; m.receiveShadow = false;
  (parent||scene).add(m); return m;
}

// ---------------------------------------------------------------- the cat
var cat = new THREE.Group(); scene.add(cat);
var body = new THREE.Group(); cat.add(body);

// body: round bell
var bodyM = mesh(new THREE.SphereGeometry(1.5, 48, 40), MAT.ceramic, 0, 1.62, 0, body);
bodyM.scale.set(1, 1.12, .92);

// belly bib (koban pad): subtle red-teal pad behind the coin - brand red per site palette
var bib = mesh(new THREE.SphereGeometry(.62, 32, 24), MAT.red, 0, 1.52, .95, body);
bib.scale.set(.95, 1.25, .4);

// koban coin: flattened capsule-ish disc with 千万両 canvas texture
function coinTexture(){
  var cv = document.createElement('canvas'); cv.width = 256; cv.height = 320;
  var g = cv.getContext('2d');
  var grad = g.createLinearGradient(0,0,0,320);
  grad.addColorStop(0,'#e6c252'); grad.addColorStop(.5,'#c9a227'); grad.addColorStop(1,'#a8861b');
  g.fillStyle = grad; g.fillRect(0,0,256,320);
  g.fillStyle = 'rgba(70,50,8,.92)';
  g.font = '700 74px serif'; g.textAlign='center'; g.textBaseline='middle';
  g.fillText('千', 128, 72); g.fillText('万', 128, 158); g.fillText('両', 128, 244);
  var t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
var coinMat = new THREE.MeshStandardMaterial({ map:coinTexture(), roughness:.28, metalness:.85, envMapIntensity:1.5 });
var coin = mesh(new THREE.CylinderGeometry(.52,.52,.1,40), MAT.gold, 0, 1.52, 1.47, body);
coin.rotation.x = Math.PI/2;
coin.scale.set(1, 1, 1.25);
var coinFace = mesh(new THREE.CircleGeometry(.5, 40), coinMat, 0, 1.52, 1.525, body);
coinFace.scale.y = 1.25;
var coinRim = mesh(new THREE.TorusGeometry(.52,.05,12,40), MAT.gold, 0, 1.52, 1.47, body);
coinRim.scale.set(1, 1.25, 1);

// head group (petting tilts this)
var head = new THREE.Group(); head.position.set(0, 3.42, 0); cat.add(head);
var skull = mesh(new THREE.SphereGeometry(1.18, 48, 40), MAT.ceramic, 0, .1, 0, head);
skull.scale.set(1.06, .94, .94);

// muzzle + nose
var muzzle = mesh(new THREE.SphereGeometry(.42, 32, 24), MAT.ceramic, 0, -.22, .98, head);
muzzle.scale.set(1.25, .8, .7);
var nose = mesh(new THREE.SphereGeometry(.085, 16, 12), MAT.red, 0, -.1, 1.26, head);
nose.scale.set(1.25, .8, .8);
// mouth: small 'w' from two torus arcs
function arc(r, tube, a0, a1, mat){ 
  var g = new THREE.TorusGeometry(r, tube, 8, 24, a1-a0);
  var m = new THREE.Mesh(g, mat); m.rotation.z = a0; return m; }
var mouth = arc(.09,.018, Math.PI*1.15, Math.PI*1.85, MAT.eye); mouth.position.set(.085,-.3,1.22); head.add(mouth);
var mouth2 = arc(.09,.018, Math.PI*1.15, Math.PI*1.85, MAT.eye); mouth2.position.set(-.085,-.3,1.22); head.add(mouth2);

// eyes: open, gold iris + dark pupil (matches concept render)
function eye(side){
  var g = new THREE.Group(); g.position.set(.44*side, .12, .98); g.rotation.y = .32*side;
  var white = mesh(new THREE.SphereGeometry(.21, 24, 20), MAT.ceramic, 0,0,0, g);
  white.scale.z = .55;
  var iris = mesh(new THREE.SphereGeometry(.15, 24, 20), MAT.iris, 0,0,.07, g);
  iris.scale.z = .5;
  var pupil = mesh(new THREE.SphereGeometry(.088, 20, 16), MAT.eye, 0,0,.11, g);
  pupil.scale.set(.72, 1.05, .5);
  var glint = mesh(new THREE.SphereGeometry(.03, 10, 8),
    new THREE.MeshBasicMaterial({color:0xffffff}), .05,.07,.16, g);
  head.add(g); return g;
}
var eyeL = eye(-1), eyeR = eye(1);

// ears with red inner
function ear(side){
  var g = new THREE.Group();
  g.position.set(.62*side, .82, -.05); g.rotation.z = -.28*side; g.rotation.x = -.12;
  var outer = mesh(new THREE.ConeGeometry(.42,.78,4,1), MAT.ceramic, 0,.24,0, g);
  outer.rotation.y = Math.PI/4; outer.scale.z = .55;
  var inner = mesh(new THREE.ConeGeometry(.26,.5,4,1), MAT.red, 0,.2,.1, g);
  inner.rotation.y = Math.PI/4; inner.scale.z = .4;
  head.add(g); return g;
}
var earL = ear(-1), earR = ear(1);

// whiskers: 3 per side, thin dark cylinders slightly swept
function whiskers(side){
  for (var i=0;i<3;i++){
    var w = mesh(new THREE.CylinderGeometry(.012,.012,.78,6), MAT.eye, 0,0,0, head);
    w.position.set(.92*side, -.12 + (i-1)*.11, .78);
    w.rotation.z = Math.PI/2 + .1*side + (i-1)*.07*side;
    w.rotation.y = -.5*side;
  }
}
whiskers(-1); whiskers(1);

// collar + gold bell
var collar = mesh(new THREE.TorusGeometry(1.02,.15,18,48), MAT.red, 0, 2.5, .08, cat);
collar.rotation.x = Math.PI/2 - .24;
var bell = mesh(new THREE.SphereGeometry(.2, 24, 20), MAT.gold, 0, 2.32, 1.06, cat);
var bellSlit = mesh(new THREE.BoxGeometry(.22,.025,.05), MAT.dark, 0, 2.3, 1.24, cat);
var bellGlow = new THREE.PointLight(C.gold, 0, 6, 2); bellGlow.position.set(0, 2.3, 1.5); cat.add(bellGlow);

// raised beckoning arm (right side, cat's left on screen-left of render; render raises its right)
var arm = new THREE.Group(); arm.position.set(.98, 2.72, .1); cat.add(arm);
var upperArm = mesh(new THREE.CapsuleGeometry(.34, 1.15, 8, 20), MAT.ceramic, .14, .72, 0, arm);
upperArm.rotation.z = -.22;
var paw = new THREE.Group(); paw.position.set(.42, 1.5, 0); arm.add(paw);
var pawBall = mesh(new THREE.SphereGeometry(.44, 32, 24), MAT.ceramic, 0,0,0, paw);
pawBall.scale.set(.92, 1.05, .8);
// paw pads: 4 red marks
for (var p=0;p<4;p++){
  var pad = mesh(new THREE.CapsuleGeometry(.05,.11,4,10), MAT.red,
    -.18 + (p%2)*.36, (p>1?.18:-.06), .33, paw);
}
// resting left paw
var pawL = mesh(new THREE.CapsuleGeometry(.3,.6,8,18), MAT.ceramic, -1.05, 1.9, .55, cat);
pawL.rotation.z = .5; pawL.rotation.x = -.3;

// feet with red toe marks
function foot(side){
  var f = mesh(new THREE.SphereGeometry(.5, 28, 22), MAT.ceramic, .62*side, .5, 1.05, cat);
  f.scale.set(1, .72, 1.15);
  for (var t=0;t<3;t++){
    var toe = mesh(new THREE.CapsuleGeometry(.045,.11,4,10), MAT.red, .62*side + (t-1)*.18, .4, 1.56, cat);
    toe.rotation.x = .35;
  }
  return f;
}
foot(-1); foot(1);

// curled tail: tube along a curve
(function tail(){
  var pts = [];
  for (var i=0;i<=20;i++){
    var t = i/20, a = t*Math.PI*1.35;
    pts.push(new THREE.Vector3(-1.15 - Math.sin(a)*.55, .55 + t*1.35, -.55 - Math.cos(a)*.3 + t*.25));
  }
  var curve = new THREE.CatmullRomCurve3(pts);
  mesh(new THREE.TubeGeometry(curve, 32, .17, 12), MAT.ceramic, 0,0,0, cat);
})();

cat.traverse(function(o){ if (o.isMesh) o.castShadow = true; });

// ---------------------------------------------------------------- pedestal & floor
var pedestal = mesh(new THREE.CylinderGeometry(2.35, 2.5, .42, 64), MAT.ped, 0, -.21, 0);
pedestal.receiveShadow = true;
var pedTrim = mesh(new THREE.TorusGeometry(2.36,.035,10,80), MAT.goldSoft, 0, 0, 0);
pedTrim.rotation.x = Math.PI/2; pedTrim.receiveShadow = true;
var floorM = mesh(new THREE.CircleGeometry(30, 48), MAT.floor, 0, -.42, 0);
floorM.rotation.x = -Math.PI/2; floorM.receiveShadow = true; floorM.castShadow = false;

// spotlight pool under pedestal
(function pool(){
  var cv = document.createElement('canvas'); cv.width = cv.height = 256;
  var g = cv.getContext('2d');
  var gr = g.createRadialGradient(128,128,10,128,128,128);
  gr.addColorStop(0,'rgba(255,244,220,.35)'); gr.addColorStop(1,'rgba(255,244,220,0)');
  g.fillStyle = gr; g.fillRect(0,0,256,256);
  var t = new THREE.CanvasTexture(cv);
  var m = new THREE.Mesh(new THREE.CircleGeometry(4.4, 40),
    new THREE.MeshBasicMaterial({ map:t, transparent:true, depthWrite:false }));
  m.rotation.x = -Math.PI/2; m.position.y = -.415; scene.add(m);
})();

// ---------------------------------------------------------------- lights (5)
var key = new THREE.SpotLight(0xfff2df, 55, 40, .5, .45, 1.6);
key.position.set(-4.5, 8.5, 5); key.castShadow = true;
key.shadow.mapSize.set(1024,1024); key.shadow.bias = -.0004; key.shadow.radius = 6;
scene.add(key); scene.add(key.target); key.target.position.set(0,2.2,0);
var rim = new THREE.SpotLight(C.gold, 40, 40, .6, .6, 1.8);
rim.position.set(5.5, 4.5, -4); scene.add(rim); scene.add(rim.target); rim.target.position.set(0,2.5,0);
var fill = new THREE.PointLight(0xfff6e8, 6, 20, 1.8); fill.position.set(-2.5, 2, 5); scene.add(fill);
var top = new THREE.PointLight(0xffffff, 5, 14, 2); top.position.set(0, 7.5, 0); scene.add(top);
var amb = new THREE.AmbientLight(0x2a2419, 1.6); scene.add(amb);

// ---------------------------------------------------------------- dust motes
var motes;
(function dust(){
  var n = 260, pos = new Float32Array(n*3), spd = new Float32Array(n);
  for (var i=0;i<n;i++){
    pos[i*3] = (Math.random()-.5)*14;
    pos[i*3+1] = Math.random()*8 - .4;
    pos[i*3+2] = (Math.random()-.5)*14;
    spd[i] = .1 + Math.random()*.35;
  }
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  var cv = document.createElement('canvas'); cv.width = cv.height = 32;
  var ctx = cv.getContext('2d');
  var gr = ctx.createRadialGradient(16,16,0,16,16,16);
  gr.addColorStop(0,'rgba(230,200,110,1)'); gr.addColorStop(1,'rgba(230,200,110,0)');
  ctx.fillStyle = gr; ctx.fillRect(0,0,32,32);
  var tex = new THREE.CanvasTexture(cv);
  motes = new THREE.Points(g, new THREE.PointsMaterial({ size:.055, map:tex, transparent:true,
    opacity:.5, depthWrite:false, blending:THREE.AdditiveBlending }));
  motes.userData.spd = spd;
  scene.add(motes);
})();

// ---------------------------------------------------------------- sound rings (voice pulse)
var rings = [];
function ring(){
  var m = new THREE.Mesh(new THREE.TorusGeometry(1, .02, 8, 64),
    new THREE.MeshBasicMaterial({ color:C.gold, transparent:true, opacity:.85 }));
  m.position.set(0, 2.3, 1.4); m.rotation.x = Math.PI/2;
  m.scale.setScalar(.2); scene.add(m);
  rings.push({ m:m, start:-1 });
}

// ---------------------------------------------------------------- camera shots
var SHOTS = [
  { pos:new THREE.Vector3(0, 2.4, 9.4),  look:new THREE.Vector3(0, 2.3, 0),  fov:38 }, // full reveal
  { pos:new THREE.Vector3(2.6, 3.1, 5.6), look:new THREE.Vector3(.2, 3.1, 0), fov:34 }, // face
  { pos:new THREE.Vector3(-2.8, 1.7, 5.2),look:new THREE.Vector3(0, 1.6, .6), fov:36 }, // coin
  { pos:new THREE.Vector3(4.4, 4.6, 3.4), look:new THREE.Vector3(1.2, 3.6, 0),fov:32 }  // paw high
];
var shotIdx = 0;
var camPos = SHOTS[0].pos.clone(), camLook = SHOTS[0].look.clone(), camFov = SHOTS[0].fov;
var orbitYaw = 0, orbitPitch = 0, tYaw = 0, tPitch = 0;

var dots = document.getElementById('shots');
SHOTS.forEach(function(_, i){
  var b = document.createElement('button');
  b.addEventListener('click', function(){ goShot(i); });
  dots.appendChild(b);
});
function paintDots(){
  Array.prototype.forEach.call(dots.children, function(b,i){ b.classList.toggle('on', i===shotIdx); });
}
function goShot(i){
  shotIdx = Math.max(0, Math.min(SHOTS.length-1, i));
  tYaw = 0; tPitch = 0;
  paintDots();
  document.getElementById('tagline').classList.toggle('on', shotIdx===0);
}
paintDots();

// ---------------------------------------------------------------- input
var dragging = false, px = 0, py = 0, moved = 0;
canvas.addEventListener('pointerdown', function(e){ dragging = true; moved = 0; px = e.clientX; py = e.clientY; });
window.addEventListener('pointermove', function(e){
  if (!dragging) return;
  var dx = e.clientX - px, dy = e.clientY - py; px = e.clientX; py = e.clientY;
  moved += Math.abs(dx)+Math.abs(dy);
  tYaw   = Math.max(-1.1, Math.min(1.1, tYaw - dx*.004));
  tPitch = Math.max(-.5,  Math.min(.55, tPitch - dy*.003));
});
window.addEventListener('pointerup', function(e){
  if (dragging && moved < 6) clickCat(e);
  dragging = false;
});
window.addEventListener('wheel', function(e){
  if (Math.abs(e.deltaY) < 8) return;
  goShot(shotIdx + (e.deltaY > 0 ? 1 : -1));
}, { passive:true });
window.addEventListener('keydown', function(e){
  if (e.code === 'ArrowDown' || e.code === 'ArrowRight') goShot(shotIdx+1);
  if (e.code === 'ArrowUp'   || e.code === 'ArrowLeft')  goShot(shotIdx-1);
  if (e.code === 'Space'){ e.preventDefault(); speak(); }
});
window.addEventListener('resize', function(){
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------------------------------------------------------------- interactions
var ray = new THREE.Raycaster();
var beckon = { burst:0, base:.18 };       // arm wave energy
var petStart = -1;                        // pet animation start (clock time)
var speakStart = -1;                      // speak animation start (clock time)
var FORTUNES = [
  'A good idea is coming. Write it down.',
  'Fortune favors the one who ships.',
  'Something you lost will find its way back.',
  'Say yes to the small adventure.',
  'Your luck compounds daily.',
  'The next door opens inward.',
  'Someone is about to help you. Let them.'
];
var fortuneEl = document.getElementById('fortune');
var fortuneTimer = null;

function clickCat(e){
  var v = new THREE.Vector2((e.clientX/window.innerWidth)*2-1, -(e.clientY/window.innerHeight)*2+1);
  ray.setFromCamera(v, camera);
  var hits = ray.intersectObjects(cat.children, true);
  if (!hits.length) return;
  var o = hits[0].object;
  var node = o;
  var zone = 'body';
  while (node){
    if (node === paw){ zone = 'paw'; break; }
    if (node === head){ zone = 'head'; break; }
    if (node === coin || node === coinRim || node === coinFace){ zone = 'coin'; break; }
    node = node.parent;
  }
  if (zone === 'paw') beckon.burst = 1;
  else if (zone === 'head') petStart = clock.elapsedTime;
  else if (zone === 'coin') speak();
  else petStart = clock.elapsedTime;
}
document.getElementById('speak').addEventListener('click', speak);

function speak(){
  if (speakStart >= 0) return;
  speakStart = clock.elapsedTime;
  beckon.burst = Math.max(beckon.burst, .6);
  var f = FORTUNES[Math.floor(Math.random()*FORTUNES.length)];
  fortuneEl.textContent = '\u201C' + f + '\u201D';
  fortuneEl.classList.add('on');
  var tag = document.getElementById('tagline');
  tag.classList.remove('on');
  clearTimeout(fortuneTimer);
  fortuneTimer = setTimeout(function(){
    fortuneEl.classList.remove('on');
    if (shotIdx === 0) tag.classList.add('on');
  }, 4600);
}

// ---------------------------------------------------------------- loop
var clock = new THREE.Clock();
var frames = 0, fpsT = 0, fps = 0;

function tick(){
  requestAnimationFrame(tick);
  var dt = Math.min(clock.getDelta(), .05);
  var t = clock.elapsedTime;

  // beckon: slow base wave + burst decay; arm swings on z
  beckon.burst = Math.max(0, beckon.burst - dt*.5);
  var energy = beckon.base + beckon.burst*1.6;
  arm.rotation.z = -.12 + Math.sin(t*2.1) * .16 * energy;
  arm.rotation.x = Math.sin(t*2.1 + .9) * .05 * energy;

  // pet: head dips and tilts, ears wiggle
  if (petStart >= 0){
    var k = Math.min((t - petStart)/.9, 1);
    var s = Math.sin(k*Math.PI);
    head.rotation.z = .16*s;
    head.rotation.x = .12*s;
    head.position.y = 3.42 - .12*s;
    earL.rotation.z = .28 + .3*s*Math.sin(t*18);
    earR.rotation.z = -.28 - .3*s*Math.sin(t*18+1);
    if (k >= 1){ petStart = -1; head.rotation.set(0,0,0); head.position.y = 3.42;
      earL.rotation.z = .28; earR.rotation.z = -.28; }
  }

  // speak: bell glow + rings
  if (speakStart >= 0){
    var st2 = t - speakStart;
    bellGlow.intensity = 26 * Math.max(0, 1 - st2/1.4);
    if (st2 > .05 && rings.length < 1) ring();
    if (st2 > .3 && rings.length < 2) ring();
    if (st2 > .55 && rings.length < 3) ring();
    if (st2 > 1.5) speakStart = -1;
  } else {
    bellGlow.intensity *= .9;
  }
  for (var i = rings.length-1; i >= 0; i--){
    var r = rings[i];
    if (r.start < 0) r.start = t;
    var rt = t - r.start;
    r.m.scale.setScalar(.2 + rt*3.2);
    r.m.material.opacity = .85 * Math.max(0, 1 - rt/1.2);
    if (rt > 1.2){ scene.remove(r.m); r.m.geometry.dispose(); r.m.material.dispose(); rings.splice(i,1); }
  }

  // idle life: breathing, ear twitch, eye dart
  body.scale.y = 1 + Math.sin(t*1.3)*.008;
  body.scale.x = 1 + Math.sin(t*1.3)*.005;
  if (petStart < 0){
    earR.rotation.z = -.28 + Math.max(0, Math.sin(t*.7))*.04*Math.sin(t*9);
  }
  var dart = Math.sin(t*.4) * .03;
  eyeL.position.x = -.44 + dart; eyeR.position.x = .44 + dart;

  // dust drift
  var pp = motes.geometry.attributes.position.array, spd = motes.userData.spd;
  for (var m2 = 0; m2 < spd.length; m2++){
    pp[m2*3+1] += spd[m2]*dt;
    pp[m2*3]   += Math.sin(t*.5 + m2)*.0012;
    if (pp[m2*3+1] > 8) pp[m2*3+1] = -.4;
  }
  motes.geometry.attributes.position.needsUpdate = true;

  // camera: ease toward current shot + orbit offset
  var S = SHOTS[shotIdx];
  camPos.lerp(S.pos, .04); camLook.lerp(S.look, .04);
  camFov += (S.fov - camFov)*.04;
  orbitYaw += (tYaw - orbitYaw)*.07;
  orbitPitch += (tPitch - orbitPitch)*.07;
  var off = camPos.clone().sub(camLook);
  var sph = new THREE.Spherical().setFromVector3(off);
  sph.theta += orbitYaw; sph.phi = Math.max(.25, Math.min(1.75, sph.phi + orbitPitch));
  camera.position.copy(camLook).add(new THREE.Vector3().setFromSpherical(sph));
  camera.lookAt(camLook);
  camera.fov = camFov; camera.updateProjectionMatrix();

  frames++; fpsT += dt;
  if (fpsT >= 1){ fps = frames/fpsT; frames = 0; fpsT = 0; }

  renderer.render(scene, camera);
}
tick();

// fade the tagline in on load
setTimeout(function(){ document.getElementById('tagline').classList.add('on'); }, 400);

// ---------------------------------------------------------------- QA hooks
window.__LC = {
  state: function(){
    return { shot:shotIdx, fps:Math.round(fps), rings:rings.length,
      glow:Math.round(bellGlow.intensity*10)/10, beckon:Math.round(beckon.burst*100)/100,
      petting:petStart>=0, meshes:renderer.info.render.triangles, calls:renderer.info.render.calls };
  },
  shot: goShot,
  wave: function(){ beckon.burst = 1; },
  pet: function(){ petStart = clock.elapsedTime; },
  speak: speak,
  orbit: function(y,p){ tYaw = y||0; tPitch = p||0; }
};
})();
