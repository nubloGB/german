/* Deutsch Escape 3D – engine: rooms, first-person walking, tasks, training, vocab drill */
import {THREE,clamp,damp,ease,rng,mat,mesh,box,rbox,cyl,sph,canvasTex,blob,WOOD,WOOD_D,GOLD,CREAM} from './core.js';
import {OrbitControls} from './OrbitControls.js';
import restaurant from './rooms/restaurant.js';
import office from './rooms/office.js';

const ROOMS={restaurant,office};
const ROOM_ORDER=['restaurant','office'];
const Q=new URLSearchParams(location.search);
const MANUAL=Q.has('manual'), DEBUG=Q.has('debug');
let vtime=0;
const now=()=>MANUAL?vtime:performance.now();
const $=s=>document.querySelector(s);
const TOUCH=matchMedia('(pointer:coarse)').matches||Q.has('touch');
if(TOUCH)document.body.classList.add('touch');
const T=.15, EYE=1.6, RAD=.3;
const TOTAL0=5*60*1000, BONUS_MS=15000;

/* ---------- renderer / camera ---------- */
const stage=$('#stage');
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;renderer.outputColorSpace=THREE.SRGBColorSpace;
stage.appendChild(renderer.domElement);
const cv=renderer.domElement;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(62,1,.05,80);
camera.rotation.order='YXZ';
const controls=new OrbitControls(camera,cv);
controls.enableDamping=true;controls.dampingFactor=.08;controls.enablePan=false;controls.rotateSpeed=.7;controls.zoomSpeed=.8;controls.enabled=false;
let world=null;

/* ---------- state ---------- */
const S={room:null,act:'escape',view:'walk',solved:{},clues:[null,null,null,null],stars:0,started:false,elapsed:0,bonus:0,won:false,lost:false,
  wrong:{},selected:null,hover:null,planK:0,planT:0,doorOpen:0,doorT:0};
const P={x:0,z:0,yaw:0,pitch:0};
let ceilParts=[];
let R=null,OBJ={},OLIST=[],pickables=[],colliders=[],floorMesh=null,wallG={},ceiling=null,planSyms=null,WORDS=[];
let goal=null,spin=null,flight=null;
const keys=new Set();
const joy={x:0,y:0,id:null};

/* ---------- storage ---------- */
const store={get(){try{return JSON.parse(localStorage.getItem('g3d-rooms')||'{}')}catch(e){return{}}},set(v){try{localStorage.setItem('g3d-rooms',JSON.stringify(v))}catch(e){}}};
function saveProg(room,patch){const s=store.get();s[room]={...(s[room]||{}),...patch};store.set(s)}

/* ================= room construction ================= */
function clearWorld(){
  if(world){scene.remove(world);world.traverse(o=>{if(o.geometry)o.geometry.dispose();const ms=Array.isArray(o.material)?o.material:o.material?[o.material]:[];ms.forEach(m=>{if(m.map)m.map.dispose();m.dispose()})})}
  world=new THREE.Group();scene.add(world);OBJ={};OLIST=[];pickables=[];colliders=[];wallG={};
  $('#labels').innerHTML='';
}
const lx=(side,c)=>side==='back'||side==='right'?c:-c;
function makeWall(side,col){
  const {W,D,H}=R;const len=(side==='back'||side==='front')?W+2*T:D;
  const sh=new THREE.Shape();const x0=-len/2,x1=len/2;
  const door=R.door&&R.door.wall===side?R.door:null;
  if(door){const a=lx(side,door.x0),b=lx(side,door.x1);const d0=Math.min(a,b),d1=Math.max(a,b);
    sh.moveTo(x0,0);sh.lineTo(d0,0);sh.lineTo(d0,door.h);sh.lineTo(d1,door.h);sh.lineTo(d1,0);sh.lineTo(x1,0)}
  else{sh.moveTo(x0,0);sh.lineTo(x1,0)}
  sh.lineTo(x1,H);sh.lineTo(x0,H);sh.closePath();
  for(const w of (R.windows||[]).filter(w=>w.wall===side)){
    const a=lx(side,w.c-w.w/2),b=lx(side,w.c+w.w/2);const h0=Math.min(a,b),h1=Math.max(a,b);
    const p=new THREE.Path();p.moveTo(h0,w.y0);p.lineTo(h1,w.y0);p.lineTo(h1,w.y1);p.lineTo(h0,w.y1);p.closePath();sh.holes.push(p)}
  const geo=new THREE.ExtrudeGeometry(sh,{depth:T,bevelEnabled:false});geo.translate(0,0,-T);
  const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:col,roughness:.95}));m.receiveShadow=true;m.castShadow=false;
  const g=new THREE.Group();g.add(m);
  const pos={back:[0,0,-D/2],front:[0,0,D/2],left:[-W/2,0,0],right:[W/2,0,0]}[side];
  g.position.set(...pos);g.rotation.y={back:0,front:Math.PI,left:Math.PI/2,right:-Math.PI/2}[side];
  const th=R.theme;let segs=[[x0,x1]];
  if(door){const a=lx(side,door.x0),b=lx(side,door.x1);const d0=Math.min(a,b),d1=Math.max(a,b);segs=[[x0,d0],[d1,x1]]}
  const WM=mat(th.wainscot,.8),RM=mat(th.rail,.7),BM=mat(th.base,.8);
  for(const [a,b] of segs){const l=b-a,c=(a+b)/2;
    if(th.wainscotH){box(l,th.wainscotH,.03,WM,c,th.wainscotH/2,.015,g).castShadow=false;box(l,.05,.05,RM,c,th.wainscotH+.025,.025,g).castShadow=false}
    box(l,.12,.035,BM,c,.06,.0175,g).castShadow=false}
  box(len,.04,T,mat(th.base,.8),0,H+.02,-T/2,g).castShadow=false;
  world.add(g);wallG[side]=g;return g}
function buildShell(){
  const {W,D,H}=R,th=R.theme;
  const ft=canvasTex(2048,Math.round(2048*D/W),th.floor);
  floorMesh=new THREE.Mesh(new THREE.PlaneGeometry(W+2*T,D+2*T),new THREE.MeshStandardMaterial({map:ft,roughness:.62}));
  floorMesh.rotation.x=-Math.PI/2;floorMesh.receiveShadow=true;floorMesh.userData.floor=true;world.add(floorMesh);
  ceiling=new THREE.Mesh(new THREE.PlaneGeometry(W+2*T,D+2*T),new THREE.MeshStandardMaterial({color:th.ceiling,roughness:.95}));
  ceiling.rotation.x=Math.PI/2;ceiling.position.y=H;ceiling.userData.noPick=true;world.add(ceiling);
  makeWall('back',th.wallBack);makeWall('front',th.wallSide);makeWall('left',th.wallSide);makeWall('right',th.wallSide);
  world.add(new THREE.HemisphereLight(th.hemi[0],th.hemi[1],th.hemi[2]));
  const sun=new THREE.DirectionalLight(th.sun.color,th.sun.intensity);sun.position.set(...th.sun.pos);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
  const e=Math.max(W,D)/2+1.5;Object.assign(sun.shadow.camera,{left:-e,right:e,top:e,bottom:-e,near:1,far:28});sun.shadow.bias=-.0004;sun.shadow.normalBias=.035;sun.shadow.radius=4;
  world.add(sun,sun.target);
  const fill=new THREE.DirectionalLight(th.fill[0],th.fill[1]);fill.position.set(6,5,6);world.add(fill);
  (R.lights||[]).forEach(l=>{const p=new THREE.PointLight(l.color,l.i,l.d,1.6);p.position.set(...l.pos);world.add(p)});
  R._outside=null;
  if(th.outside){const t=canvasTex(256,256,th.outside.draw);const ws=R.windows.find(w=>w.wall===th.outside.wall);
    const p=new THREE.Mesh(new THREE.PlaneGeometry(ws.w+1,ws.y1-ws.y0+.8),new THREE.MeshBasicMaterial({map:t,toneMapped:false}));p.userData.noPick=true;
    const off=.9;if(th.outside.wall==='left'){p.rotation.y=Math.PI/2;p.position.set(-W/2-T-off,(ws.y0+ws.y1)/2,ws.c)}
    else if(th.outside.wall==='right'){p.rotation.y=-Math.PI/2;p.position.set(W/2+T+off,(ws.y0+ws.y1)/2,ws.c)}
    world.add(p);R._outside=p}
  planSyms=new THREE.Group();world.add(planSyms);
  const PM=c=>new THREE.MeshBasicMaterial({color:c,toneMapped:false});
  for(const w of R.windows||[]){const horiz=w.wall==='back'||w.wall==='front';const m=new THREE.Mesh(new THREE.BoxGeometry(horiz?w.w:T*.55,.02,horiz?T*.55:w.w),PM(0x8EC5E8));
    m.position.set(horiz?w.c:(w.wall==='left'?-W/2-T/2:W/2+T/2),.215,horiz?(w.wall==='back'?-D/2-T/2:D/2+T/2):w.c);m.userData.noPick=true;planSyms.add(m)}
  if(R.door){const d=R.door,m=new THREE.Mesh(new THREE.BoxGeometry(d.x1-d.x0,.02,T*.55),PM(0xB5703A));m.position.set((d.x0+d.x1)/2,.215,-D/2-T/2);m.userData.noPick=true;planSyms.add(m);
    const arc=new THREE.Mesh(new THREE.RingGeometry(d.x1-d.x0-.03,d.x1-d.x0,40,1,Math.PI/2,Math.PI/2),PM(0xB5703A));arc.rotation.x=-Math.PI/2;arc.position.set(d.x0,.22,-D/2);arc.userData.noPick=true;planSyms.add(arc)}
  planSyms.visible=false;
}

/* door (engine-built, shared by both rooms) */
let keypadTex,keypadCtx;
function buildDoor(){
  const {D}=R,d=R.door;const g=new THREE.Group(),inner=new THREE.Group();g.add(inner);
  const cx=(d.x0+d.x1)/2,zf=-D/2+.02,FR=mat(0xF3EBDA,.8);
  box(.07,d.h+.06,.05,FR,d.x0-.035,d.h/2,zf,inner);box(.07,d.h+.06,.05,FR,d.x1+.035,d.h/2,zf,inner);box(d.x1-d.x0+.2,.08,.05,FR,cx,d.h+.04,zf,inner);
  const pivot=new THREE.Group();pivot.position.set(d.x0+.01,0,-D/2-.01);inner.add(pivot);
  const dw=d.x1-d.x0-.03;
  box(dw,d.h-.01,.05,mat(R.theme.doorColor||0x5E3921,.7),dw/2,(d.h-.01)/2,0,pivot);
  [[.55,.7,.75],[1.6,.7,.8]].forEach(([y,w,h])=>{box(w,h,.02,mat(R.theme.doorPanel||0x8A5732,.7),dw/2,y,.03,pivot);box(w-.2,h-.2,.02,mat(R.theme.doorColor||0x5E3921,.7),dw/2,y,.045,pivot)});
  mesh(new THREE.SphereGeometry(.035,10,8),GOLD,dw-.1,1.0,.06,pivot);
  const kx=d.x0-.42,ky=1.2;box(.24,.38,.04,mat(0x1E2126,.4,.3),kx,ky,-D/2+.04,inner);
  keypadTex=canvasTex(128,48,()=>{});keypadCtx=keypadTex.image.getContext('2d');
  const scr=new THREE.Mesh(new THREE.PlaneGeometry(.19,.07),new THREE.MeshBasicMaterial({map:keypadTex,toneMapped:false}));scr.position.set(kx,ky+.12,-D/2+.062);inner.add(scr);
  for(let i=0;i<9;i++)box(.045,.03,.012,mat(0xD5D8DD,.4),kx-.058+(i%3)*.058,ky+.045-Math.floor(i/3)*.045,-D/2+.066,inner);
  const led=new THREE.Mesh(new THREE.SphereGeometry(.014,8,6),new THREE.MeshBasicMaterial({color:0xDE4338,toneMapped:false}));led.position.set(kx,ky-.135,-D/2+.066);led.userData.noPick=true;led.raycast=()=>{};inner.add(led);
  const sg=canvasTex(256,96,(c,w,h)=>{c.fillStyle='#1F8A4C';c.fillRect(0,0,w,h);c.fillStyle='#fff';c.font='800 44px Inter,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('AUSGANG',w/2,h/2+2)});
  const sm=new THREE.Mesh(new THREE.PlaneGeometry(.55,.2),new THREE.MeshBasicMaterial({map:sg,toneMapped:false}));sm.position.set(cx,d.h+.3,-D/2+.03);sm.userData.noPick=true;inner.add(sm);
  const cor=new THREE.Mesh(new THREE.PlaneGeometry(d.x1-d.x0+.4,2.6),new THREE.MeshBasicMaterial({color:0x14100C,toneMapped:false}));cor.position.set(cx,1.3,-D/2-T-.5);cor.userData.noPick=true;world.add(cor);
  const dl=new THREE.PointLight(0xFFEBC4,0,7,1.5);dl.position.set(cx,1.5,-D/2-1.2);world.add(dl);
  return {g,inner,extra:{pivot,led,cor,dl}};
}
function drawKeypad(){
  if(!keypadCtx)return;const c=keypadCtx;c.fillStyle='#0F2A22';c.fillRect(0,0,128,48);c.font='700 30px Inter,monospace';c.textAlign='center';c.textBaseline='middle';
  for(let i=0;i<4;i++){const v=S.clues[i];c.fillStyle=v!=null?'#8DF0C0':'#2F5B4B';c.fillText(v!=null?String(v):'–',16+i*32,26)}
  keypadTex.needsUpdate=true}

/* registry + highlight */
const HL=new THREE.Color(0xFFC36B);
const hullMat=new THREE.MeshBasicMaterial({color:0xFFF3D0,side:THREE.BackSide,depthWrite:false});
hullMat.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>','vec3 transformed = position + normalize(normal)*0.02;')};
function registerObj(def,built){
  const {g}=built;g.updateMatrixWorld(true);
  const meshes=[];g.traverse(o=>{if(o.isMesh&&!o.userData.noPick&&o.visible)meshes.push(o)});
  meshes.forEach(m=>{m.material=Array.isArray(m.material)?m.material.map(x=>x.clone()):m.material.clone();
    if(!Array.isArray(m.material)&&m.material.emissive){m.userData.bE=m.material.emissive.clone();m.userData.bI=m.material.emissiveIntensity}
    m.userData.objId=def.id;pickables.push(m);
    if(!m.userData.glass&&!Array.isArray(m.material)&&!m.material.transparent&&!m.material.isMeshBasicMaterial&&m.geometry.type!=='PlaneGeometry'){const h=new THREE.Mesh(m.geometry,hullMat);h.userData.hull=true;h.userData.noPick=true;h.raycast=()=>{};h.visible=false;m.add(h)}});
  const bx=new THREE.Box3();meshes.forEach(m=>bx.expandByObject(m));const c=bx.getCenter(new THREE.Vector3());
  const o={...def,g,meshes,built,glow:0,pulse:0,
    anchor:def.anc?new THREE.Vector3(...def.anc):new THREE.Vector3(c.x,bx.max.y+.1,c.z),
    planAnchor:new THREE.Vector3(def.anc?def.anc[0]:c.x,.25,def.anc?def.anc[2]:c.z),
    center:def.look?new THREE.Vector3(...def.look):c};
  OBJ[def.id]=o;OLIST.push(o);return o}

function buildObjects(){
  for(const def of R.objects){
    let built;
    if(def.kind==='door'){built=buildDoor();world.add(built.g)}
    else{const g=new THREE.Group();const inner=def.build();inner.position.set(def.pos[0],def.pos[1],def.pos[2]);inner.rotation.y=def.ry||0;g.add(inner);world.add(g);built={g,inner}}
    registerObj(def,built);
  }
  R.decor&&R.decor(g=>{world.add(g);return g});
  ceilParts=world.children.filter(c=>c.userData.ceilingPart);
  colliders=R.colliders.map(c=>c.slice());
  const labels=$('#labels');
  for(const o of OLIST){
    const el=document.createElement('div');el.className='lbl';
    el.innerHTML=`<span class="a ${o.art||'verb'}">${o.art||''}</span><b>${o.de}</b><span class="pl">${o.pl}</span><span class="ck">✓</span>`;
    el.addEventListener('click',()=>selectObj(o.id));labels.appendChild(el);o.el=el;
    if(o.task){const pin=document.createElement('div');pin.className='pin '+(o.clue!=null?'':'bonus');
      pin.innerHTML=o.clue!=null?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="8" cy="15" r="4.5"/><path d="M11.5 12 21 3M17 7l3 3"/></svg>':'<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"/></svg>';
      pin.addEventListener('click',()=>selectObj(o.id));labels.appendChild(pin);o.pin=pin}
  }
  WORDS=[];for(const o of OLIST)for(const w of (o.words||[]))WORDS.push({...w,obj:o.id,noun:!!w.art});
  if(DEBUG)colliders.forEach(([x0,x1,z0,z1])=>{const m=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,.1,z1-z0),new THREE.MeshBasicMaterial({color:0xff0000,transparent:true,opacity:.35}));m.position.set((x0+x1)/2,.06,(z0+z1)/2);m.userData.noPick=true;m.raycast=()=>{};world.add(m)});
}

/* ---------- collision ---------- */
function resolve(x,z,r=RAD){
  const mx=R.W/2-r,mz=R.D/2-r;x=clamp(x,-mx,mx);z=clamp(z,-mz,mz);
  for(let it=0;it<3;it++)for(const [x0,x1,z0,z1] of colliders){
    const cx=clamp(x,x0,x1),cz=clamp(z,z0,z1);const dx=x-cx,dz=z-cz;const d2=dx*dx+dz*dz;
    if(d2>=r*r)continue;
    if(d2<1e-8){const l=x-x0,rr=x1-x,t=z-z0,b=z1-z;const m=Math.min(l,rr,t,b);if(m===l)x=x0-r;else if(m===rr)x=x1+r;else if(m===t)z=z0-r;else z=z1+r}
    else{const d=Math.sqrt(d2);x=cx+dx/d*r;z=cz+dz/d*r}
  }
  x=clamp(x,-mx,mx);z=clamp(z,-mz,mz);return {x,z}}

/* ---------- camera views ---------- */
const aspect=()=>innerWidth/innerHeight;
function walkPose(){const cp=Math.cos(P.pitch);const f=new THREE.Vector3(-Math.sin(P.yaw)*cp,Math.sin(P.pitch),-Math.cos(P.yaw)*cp);
  const pos=new THREE.Vector3(P.x,EYE,P.z);return {pos,target:pos.clone().addScaledVector(f,3),fov:innerWidth<760?72:62}}
function orbitPose(){
  const {W,D}=R;const a=aspect();const fov=38;const TANH=Math.tan(fov*Math.PI/360);
  const dir=new THREE.Vector3(.5,.72,1).normalize();
  const span=Math.max(W,D*1.2);const dd=Math.max(span*(a<1?1.25:1.0)/(2*TANH*Math.min(1,a)*.62),10);
  const t=new THREE.Vector3(0,.5,0);return {pos:t.clone().addScaledVector(dir,dd),target:t,fov}}
function planPose(){
  const {W,D}=R;const a=aspect();const fov=38;const TANH=Math.tan(fov*Math.PI/360);
  const d=Math.max((D+1.8)/(2*TANH),(W+1.8)/(2*TANH*a));
  return {pos:new THREE.Vector3(0,d,.002),target:new THREE.Vector3(0,0,0),fov}}
function camTarget(){const d=new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);return camera.position.clone().addScaledVector(d,3)}
function flyTo(v,dur=1200,cb){
  flight={p0:camera.position.clone(),t0:camTarget(),f0:camera.fov,p1:v.pos.clone(),t1:v.target.clone(),f1:v.fov??camera.fov,s:now(),d:Math.max(1,dur),cb};controls.enabled=false}
function stepFlight(){
  if(!flight)return;const k=clamp((now()-flight.s)/flight.d,0,1),e=ease(k);
  camera.position.lerpVectors(flight.p0,flight.p1,e);const t=new THREE.Vector3().lerpVectors(flight.t0,flight.t1,e);
  camera.fov=flight.f0+(flight.f1-flight.f0)*e;camera.updateProjectionMatrix();
  camera.lookAt(t);
  if(k>=1){const f=flight;flight=null;f.cb&&f.cb()}}
function syncPFromCamera(){
  const d=new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);
  P.x=camera.position.x;P.z=camera.position.z;P.yaw=Math.atan2(-d.x,-d.z);P.pitch=Math.asin(clamp(d.y,-1,1))}
function setView(v,silent){
  const prev=S.view;if(v===prev&&!flight)return;
  if(S.selected&&!silent&&!(S.act==='train'&&TR.on))closeCard(true);
  S.view=v;document.body.dataset.view=v;spin=null;goal=null;$('#goal').classList.remove('show');
  document.querySelectorAll('#views [data-view]').forEach(b=>b.classList.toggle('on',b.dataset.view===v));
  S.planT=v==='plan'?1:0;
  $('#plantag').classList.toggle('show',v==='plan');
  if(v==='plan')$('#plantag').textContent='Grundriss · '+R.size+' · rzut pokoju – kliknij przedmiot, by otworzyć zadanie';
  controls.autoRotate=false;
  const pose=v==='walk'?walkPose():v==='orbit'?orbitPose():planPose();const tgt=pose.target.clone();
  const cb=()=>{
    if(v==='walk'){controls.enabled=false;syncPFromCamera()}
    else{controls.target.copy(tgt);
      if(v==='plan'){controls.enableRotate=false;controls.minPolarAngle=0;controls.maxPolarAngle=.02;controls.minDistance=1;controls.maxDistance=60}
      else{controls.enableRotate=true;controls.minPolarAngle=.15;controls.maxPolarAngle=1.5;controls.minDistance=3;controls.maxDistance=34}
      controls.enabled=true;controls.update()}};
  flyTo(pose,silent?1:1300,cb);
  if(!silent){if(v==='plan')caption('Plan-Ansicht','Rzut pokoju z góry – widzisz wszystkie przedmioty.',4200);
    else if(v==='orbit')caption('Übersicht','Obracaj pokój myszką / palcem, przybliżaj kółkiem.',4200);
    else defaultCaption()}
}
const shift={x:0,y:0,tx:0,ty:0};
function applyShift(){const W_=innerWidth,H_=innerHeight;if(Math.abs(shift.x)<.5&&Math.abs(shift.y)<.5){if(camera.view&&camera.view.enabled)camera.clearViewOffset()}else camera.setViewOffset(W_,H_,shift.x,shift.y,W_,H_)}
function cardShift(open){if(!open){shift.tx=0;shift.ty=0;return}if(innerWidth<=760){shift.tx=0;shift.ty=innerHeight*.2}else{shift.tx=190;shift.ty=0}}

function standSpot(o){
  const c=o.center;let dx=P.x-c.x,dz=P.z-c.z;let dist=Math.hypot(dx,dz);
  const want=o.dist||(o.flat?3.0:2.3);
  if(dist<1e-3){dx=0;dz=1;dist=1}
  const lo=o.flat?1.8:1.2,hi=o.flat?3.6:3.0;
  if(dist>=lo&&dist<=hi)return {x:P.x,z:P.z};
  return resolve(c.x+dx/dist*want,c.z+dz/dist*want)}
function objView(o){
  if(S.view==='walk'){const s=standSpot(o);return {pos:new THREE.Vector3(s.x,EYE,s.z),target:o.center.clone(),fov:walkPose().fov}}
  if(S.view==='orbit'){const c=o.center;const v=new THREE.Vector3(c.x*.85,0,c.z*.85).sub(new THREE.Vector3(0,0,0));
    const from=new THREE.Vector3(0,0,0);const dir=c.clone().sub(from);dir.y=0;if(dir.lengthSq()<.01)dir.set(0,0,-1);dir.normalize();
    const p2=c.clone().addScaledVector(dir,-3.4).setY(Math.max(2.2,c.y+1.0));return {pos:p2,target:c.clone(),fov:38}}
  return null}
function focusObj(id,dur=1000,cb){
  const o=OBJ[id];if(!o)return;const v=objView(o);
  if(S.view==='plan'||!v){o.pulse=now()+2600;cb&&cb();return}
  if(S.view==='orbit'){flyTo(v,dur,()=>{controls.target.copy(o.center);controls.enabled=true;controls.update();cb&&cb()});return}
  flyTo(v,dur,()=>{syncPFromCamera();cb&&cb()})}

/* ================= HUD ================= */
const fmt=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
const totalMs=()=>TOTAL0+S.bonus;
function buildSlots(){const el=$('#slots');el.innerHTML='';for(let i=0;i<4;i++){const d=document.createElement('div');d.className='slot'+(S.clues[i]!=null?' f':'');d.textContent=S.clues[i]!=null?S.clues[i]:'·';el.appendChild(d)}}
function updateHUD(newIdx){
  buildSlots();if(newIdx!=null)$('#slots').children[newIdx].classList.add('new');
  const n=S.clues.filter(v=>v!=null).length;$('#hcount').textContent=n+'/4';[...$('#hdots').children].forEach((d,i)=>d.classList.toggle('f',i<n));
  $('#stars').textContent=S.stars;drawKeypad();
  for(const o of OLIST){const done=!!S.solved[o.id];o.el.classList.toggle('done',done);if(o.pin)o.pin.classList.toggle('done',done)}
}
let capTimer=0;
function caption(t,sub,ms=0){const c=$('#cap');c.innerHTML=t+(sub?`<small>${sub}</small>`:'');c.classList.remove('hide');clearTimeout(capTimer);if(ms)capTimer=setTimeout(()=>{if(!S.selected)defaultCaption();else c.classList.add('hide')},ms)}
function defaultCaption(){clearTimeout(capTimer);const c=$('#cap');
  if(S.act==='escape')c.innerHTML=(TOUCH?'Joystick = gehen · Finger ziehen = umschauen · Gegenstand antippen.':'WASD / Pfeile = gehen · Maus ziehen = 360° umschauen · Gegenstand anklicken.')+`<small>${TOUCH?'Joystick – chodzenie, przeciągnij – rozglądanie się, dotknij przedmiotu.':'WASD / strzałki – chodzenie · przeciągnij myszką – rozglądanie · kliknij przedmiot.'} Znajdź 4 wskazówki do kodu.</small>`;
  else if(S.act==='words')c.innerHTML='Wörter-Modus: alle Wörter mit Artikel.<small>Kliknij nazwę przedmiotu albo ćwicz karteczki.</small>';
  else c.innerHTML='Training: Aufgaben ohne Zeitdruck.<small>Trening – bez limitu czasu, błędy wracają.</small>';
  c.classList.toggle('hide',!!S.selected||S.won||!card.classList.contains('hidden'))}
let toastT=0;
function toast(t,ms=2600){const e=$('#toast');e.textContent=t;e.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>e.classList.remove('show'),ms)}
function floatText(text,pos){const v=pos.clone().project(camera);const x=(v.x*.5+.5)*innerWidth,y=(-v.y*.5+.5)*innerHeight;const e=document.createElement('div');e.className='float';e.textContent=text;e.style.left=x+'px';e.style.top=y+'px';document.body.appendChild(e);setTimeout(()=>e.remove(),1500)}

/* ================= cards ================= */
const card=$('#card');
const KEY='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C98A00" stroke-width="2.4" stroke-linecap="round"><circle cx="8" cy="15" r="4.5"/><path d="M11.5 12 21 3"/></svg>';
const STAR='<svg width="14" height="14" viewBox="0 0 24 24" fill="#F2B33D"><path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"/></svg>';
const XSVG='<svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M5 5l14 14M19 5 5 19"/></svg>';
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const artChip=(a,cls='')=>`<span class="art ${a||'verb'} ${cls}">${a||'Verb'}</span>`;
function head(o){return `<div class="ch">${artChip(o.art)}<div><h2>${o.de}</h2><p>${o.pl}</p></div><button class="x" data-act="close" aria-label="Schließen">${XSVG}</button></div>`}
function wordList(o){const ws=o.words||[];if(!ws.length)return '';
  return `<div class="wl">${ws.map(w=>`<div class="w">${artChip(w.art)}<div>${w.de}${w.plu?`<small>${w.plu}</small>`:''}</div><span class="pl2">${w.pl}</span></div>`).join('')}</div>`}
function ctxBox(t){return t.ctx?`<div class="ctx"><b>Du siehst · widzisz</b>${t.ctx[0]}<small>${t.ctx[1]}</small></div>`:''}
function showCard(html){card.innerHTML=html;card.classList.remove('hidden');card.scrollTop=0;document.body.classList.add('cardopen');cardShift(true);$('#cap').classList.add('hide')}

let TS=null;
function earnLine(o){if(S.solved[o.id]||S.act!=='escape')return '';return o.clue!=null?`<div class="earn">${KEY}Löse das Rätsel – und erhalte einen Hinweis für den Türcode.</div>`:`<div class="earn">${STAR}Bonus-Aufgabe: +1 Stern und +15 Sekunden Zeit</div>`}
function solvedView(o){const t=o.task;let h=head(o)+`<div class="tag" style="background:#E8F6EE;color:#14522F">✓ Gelöst</div><div class="fb ok" style="margin-top:12px">${t.explain}</div>`;
  if(o.clue!=null)h+=`<div class="reward"><div class="dig">${R.code[o.clue]}</div><div>Hinweis ${S.clues.filter(v=>v!=null).length}/4<small>Ziffer ${o.clue+1} des Türcodes</small></div></div>`;
  h+=`<div class="mini"><b>Wörter hier · słówka tutaj</b></div>`+wordList(o);
  return h+`<button class="cta" data-act="close" style="margin-top:12px">Weiter erkunden</button>`}
function taskBody(t){
  let h='';
  if(t.type==='choice'){const stack=t.ab||t.options.some(v=>v.length>20);
    h+=`<div class="prompt">${t.prompt}</div><div class="sub">${t.sub||''}</div><div class="opts${stack?' stack':''}">${t.options.map((v,i)=>`<button class="opt" data-act="ans" data-v="${esc(v)}">${stack?`<i class="l">${(t.ab?'AB':'ABCD')[i]}</i>`:''}${esc(v)}</button>`).join('')}</div>`}
  else if(t.type==='gaps'){TS.fill=t.ans.map(()=>null);h+=`<div class="prompt" style="font-size:17px">${t.prompt}</div><div class="sub">${t.sub||''}</div><div class="gapline" id="gapline"></div><div class="bank" id="bank"></div><button class="cta" id="chk" data-act="check" disabled>Prüfen · Sprawdź</button>`}
  else if(t.type==='type'){h+=`<div class="prompt" style="font-size:17px">${t.prompt}</div><div class="sub">${t.sub||''}</div><div class="gapline" id="gapline"></div><button class="cta" id="chk" data-act="check">Prüfen · Sprawdź</button>`}
  else if(t.type==='order'){TS.pick=[];h+=`<div class="prompt" style="font-size:17px">${t.prompt}</div><div class="sub">${t.sub||''}</div><div class="ansline" id="ansline"></div><div class="bank" id="bank"></div><div class="row"><button class="cta sec" data-act="clear" style="margin-top:12px">Löschen</button><button class="cta" id="chk" data-act="check" disabled>Prüfen · Sprawdź</button></div>`}
  return h}
function renderTask(o,mode){
  S.selected=o.id;const t=o.task;TS={o,mode,done:false,tries:0,fill:null,pick:null};
  let h='';
  if(mode==='train'){const n=TR.total;h+=`<div class="phead"><b>Training</b> ${TR.done}/${n}${TR.round>1?' · Wiederholung':''}<button class="x" data-act="stopTrain" aria-label="Beenden">${XSVG}</button></div><div class="prog-bar"><i style="width:${(TR.done/n)*100}%"></i></div>`}
  h+=(mode==='train'?`<div class="ch" style="margin-top:12px">${artChip(o.art)}<div><h2>${o.de}</h2><p>${o.pl}</p></div></div>`:head(o));
  h+=`<div class="tag">${t.tag}</div>`+ctxBox(t)+taskBody(t);
  h+=`<div class="fb" id="fb"></div>`+(mode==='train'?`<button class="cta sec" data-act="tip" id="tipb" style="margin-top:10px;height:38px;font-size:13px">💡 Hinweis · podpowiedź</button>`:earnLine(o));
  h+=`<div class="src">${t.src||''}</div>`;
  showCard(h);
  if(t.type==='gaps')drawGaps();
  if(t.type==='type')drawTypeGap();
  if(t.type==='order')drawOrder();
}
function drawGaps(){const t=TS.o.task;
  $('#gapline').innerHTML=t.tpl.split('{}').map((s,k,a)=>s+(k<a.length-1?`<span class="gap${TS.fill[k]!=null?' f':''}" data-act="ungap" data-i="${k}">${TS.fill[k]??''}</span>`:'')).join('');
  $('#bank').innerHTML=t.bank.map(w=>`<button class="tile${TS.fill.includes(w)?' used':''}" data-act="tile" data-v="${w}" ${TS.fill.includes(w)?'disabled':''}>${w}</button>`).join('');
  const c=$('#chk');if(c)c.disabled=TS.fill.some(v=>v==null)}
function drawTypeGap(){const t=TS.o.task;
  $('#gapline').innerHTML=t.tpl.split('{}').map((s,k,a)=>s+(k<a.length-1?`<input class="gapin" id="gin" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Lücke">`:'')).join('');
  const i=$('#gin');if(i){i.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();doCheck()}e.stopPropagation()});if(!TOUCH&&!MANUAL)setTimeout(()=>i.focus(),50)}}
function drawOrder(){const t=TS.o.task;
  $('#bank').innerHTML=t.words.map((w,i)=>`<button class="tile${TS.pick.includes(i)?' used':''}" data-act="pick" data-i="${i}" ${TS.pick.includes(i)?'disabled':''}>${w}</button>`).join('');
  $('#ansline').innerHTML=TS.pick.length?TS.pick.map((ix,k)=>`<button class="tile" data-act="unpick" data-k="${k}">${t.words[ix]}</button>`).join(''):'<span class="ph">Kliknij słowa poniżej…</span>';
  $('#chk').disabled=TS.pick.length!==t.words.length}
const norm=s=>String(s).toLowerCase().replace(/[.,!?„“"']/g,'').replace(/\s+/g,' ').trim();
function evalTask(){const o=TS.o,t=o.task;
  if(t.type==='gaps'){const r=t.ans.every((v,i)=>TS.fill[i]===v);[...document.querySelectorAll('.gap')].forEach((g,i)=>{g.classList.remove('bad','ok');g.classList.add(TS.fill[i]===t.ans[i]?'ok':'bad')});return r}
  if(t.type==='type'){const i=$('#gin');const r=t.ans.some(a=>norm(a)===norm(i.value));i.classList.remove('ok','bad');i.classList.add(r?'ok':'bad');return r}
  if(t.type==='order'){const s=TS.pick.map(ix=>t.words[ix]).join(' ');const r=norm(s)===norm(t.ans);const a=$('#ansline');a.classList.remove('ok','bad');a.classList.add(r?'ok':'bad');return r}
  return null}
function doCheck(){if(!TS||TS.done)return;const r=evalTask();if(r==null)return;if(TS.mode==='train')trainResult(r);else gameResult(r)}
function answerChoice(b){if(!TS||TS.done)return;const t=TS.o.task;const ok=b.dataset.v===t.ans;
  if(ok){b.classList.add('ok');card.querySelectorAll('.opt').forEach(x=>x.disabled=true)}else{b.classList.add('bad');b.disabled=true}
  if(TS.mode==='train'){card.querySelectorAll('.opt').forEach(x=>{x.disabled=true;if(x.dataset.v===t.ans)x.classList.add('ok')});trainResult(ok)}else gameResult(ok)}
function gameResult(ok){const o=TS.o;TS.tries++;if(ok){TS.done=true;solve(o)}else wrong(o)}
function wrong(o){S.wrong[o.id]=(S.wrong[o.id]||0)+1;const fb=$('#fb');const t=o.task;
  fb.className='fb bad';fb.innerHTML=`<b>Noch nicht.</b> Versuch es nochmal.${S.wrong[o.id]>=2&&t.hint?'<br>💡 '+t.hint:''}`}
function solve(o){
  S.solved[o.id]=true;S.stars++;const t=o.task;let newIdx=null;
  if(o.clue!=null){S.clues[o.clue]=R.code[o.clue];newIdx=o.clue}else{S.bonus+=BONUS_MS}
  updateHUD(newIdx);
  const fb=$('#fb');fb.className='fb ok';fb.innerHTML=t.explain;
  const n=S.clues.filter(v=>v!=null).length,all=n===4&&o.clue!=null;
  const extra=o.clue!=null?`<div class="reward"><div class="dig">${R.code[o.clue]}</div><div>Hinweis ${n}/4 gefunden!<small>Ziffer ${o.clue+1} des Türcodes</small></div></div>`:`<div class="reward"><div class="dig" style="font-size:16px">+15s</div><div>Bonus-Aufgabe gelöst!<small>+1 Stern · 15 Sekunden extra</small></div></div>`;
  const e=card.querySelector('.earn');if(e)e.remove();const chk=$('#chk');if(chk)chk.remove();
  fb.insertAdjacentHTML('afterend',extra+`<div class="mini"><b>Wörter hier · słówka tutaj</b></div>`+wordList(o)+`<button class="cta go" data-act="${all?'todoor':'close'}">${all?'Zur Tür →':'Weiter'}</button>`);
  floatText(o.clue!=null?'+1 ★':'+1 ★ · +15 s',o.anchor);
  if(all){setTimeout(()=>toast('Alle 4 Hinweise! Gib den Code an der Tür ein.',3200),500);OBJ.door.pulse=now()+6000}
}
let doorInput='';
function renderDoor(){
  const o=OBJ.door,n=S.clues.filter(v=>v!=null).length;S.selected='door';TS=null;
  showCard(head(o)+`<div class="tag">Türcode · kod do drzwi</div><div class="prompt">${n<4?'Die Tür ist verschlossen.':'Alle Hinweise gefunden!'}<div class="sub">${n<4?`Noch ${4-n} Hinweis${4-n>1?'e':''} fehlt. Drzwi są zamknięte – znajdź wszystkie wskazówki.`:'Wpisz 4-cyfrowy kod – cyfry widzisz na pasku u góry.'}</div></div>
  <div class="codebig" id="codebig">${[0,1,2,3].map(()=>`<div class="e">·</div>`).join('')}</div>
  <div class="pad">${[1,2,3,4,5,6,7,8,9,'⌫',0,'OK'].map(k=>`<button data-act="pad" data-v="${k}">${k}</button>`).join('')}</div><div class="fb" id="fb"></div>`);
  doorInput=''}
function paintDoorInput(){[...document.querySelectorAll('#codebig div')].forEach((d,i)=>{const c=doorInput[i];d.textContent=c??'·';d.classList.toggle('e',c==null)})}
function padKey(k){
  if(k==='⌫'){doorInput=doorInput.slice(0,-1);paintDoorInput();return}
  if(k==='OK'){if(doorInput.length===4)submitCode();return}
  if(doorInput.length>=4)return;doorInput+=k;paintDoorInput();if(doorInput.length===4)setTimeout(submitCode,MANUAL?0:200)}
function submitCode(){
  if(doorInput===R.code.join('')){win()}
  else{const fb=$('#fb');if(!fb)return;fb.className='fb bad';fb.innerHTML=S.clues.some(v=>v==null)?'<b>Falscher Code.</b> Es fehlen noch Hinweise – schau dich im Raum um.':'<b>Falscher Code.</b> Prüfe die Ziffern oben im Türcode.';const cb=$('#codebig');cb.classList.remove('shake');void cb.offsetWidth;cb.classList.add('shake');doorInput='';paintDoorInput()}}

function selectObj(id,opts={}){
  if(S.won&&S.act==='escape')return;
  const o=OBJ[id];if(!o)return;
  if(S.act==='train'&&TR.on&&TR.cur&&TR.cur!==id){toast('Training: erst die markierte Aufgabe lösen.',1800);return}
  spin=null;goal=null;$('#goal').classList.remove('show');S.hover=null;
  if(S.act==='words'){D=null;showWordCard(o);focusObj(id,1000);return}
  if(S.act==='train'){if(!(TR.on&&TR.cur===id)){toast('Starte das Training – die Aufgaben kommen der Reihe nach.',2200)}return}
  if(id==='door'){renderDoor();focusObj(id,1000);return}
  if(!o.task){showWordCard(o);focusObj(id,1000);return}
  if(!S.started&&!S.lost){S.started=true;$('#timerp').title='Zeit läuft'}
  if(S.solved[id]){S.selected=id;showCard(solvedView(o))}else renderTask(o,'game');
  focusObj(id,1000);
}
function showWordCard(o){
  S.selected=o.id;TS=null;
  showCard(head(o)+`<div class="tag">Wörter · słowa</div><div class="mini" style="margin-top:8px">Wörter, die zu diesem Gegenstand gehören:<br><i>słówka związane z tym przedmiotem</i></div>`+wordList(o)+
    `<div class="row" style="margin-top:12px"><button class="cta sec" data-act="drillobj" data-id="${o.id}">Üben</button><button class="cta" data-act="close">Weiter</button></div>`)}
function closeCard(silent){
  S.selected=null;TS=null;card.classList.add('hidden');document.body.classList.remove('cardopen');cardShift(false);
  if(!silent)defaultCaption()}
card.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;const act=b.dataset.act;
  if(act==='close'){if(S.act==='words'){drillHome();S.selected=null;return}closeCard();return}
  if(act==='todoor'){selectObj('door');return}
  if(act==='ans'){answerChoice(b);return}
  if(act==='tile'&&TS){const k=TS.fill.indexOf(null);if(k>=0){TS.fill[k]=b.dataset.v;drawGaps()}return}
  if(act==='ungap'&&TS){const k=+b.dataset.i;if(TS.fill[k]!=null){TS.fill[k]=null;drawGaps()}return}
  if(act==='pick'&&TS){TS.pick.push(+b.dataset.i);drawOrder();return}
  if(act==='unpick'&&TS){TS.pick.splice(+b.dataset.k,1);drawOrder();return}
  if(act==='clear'&&TS){TS.pick=[];drawOrder();return}
  if(act==='check'){doCheck();return}
  if(act==='pad'){padKey(b.dataset.v);return}
  if(act==='tip'&&TS){const fb=$('#fb');fb.className='fb';fb.style.display='block';fb.style.background='#FFF6DD';fb.style.color='#6B4700';fb.innerHTML='💡 '+(TS.o.task.hint||'');return}
  if(act==='stopTrain'){trainStop();return}
  if(act==='trainNext'){trainNext();return}
  if(act==='trainStart'){trainStart();return}
  if(act==='drillobj'){drillStart('cards',WORDS.filter(w=>w.obj===b.dataset.id));return}
  if(act==='dstart'){drillStart(b.dataset.kind,WORDS.filter(w=>b.dataset.kind==='art'?w.noun:true));return}
  if(act==='dflip'){D.flip=!D.flip;drawDrill();return}
  if(act==='dknow'){drillKnow(true);return}
  if(act==='dagain'){drillKnow(false);return}
  if(act==='dart'){drillArt(b.dataset.v,b);return}
  if(act==='dnext'){drillNext();return}
  if(act==='dwrongs'){const wl=D.wrongList.slice();drillStart(D.kind,wl);return}
  if(act==='dend'){drillHome();return}
  if(act==='goescape'){setAct('escape');return}
});
addEventListener('keydown',e=>{
  if(e.target&&e.target.tagName==='INPUT')return;
  if(e.key==='Escape'&&S.selected&&S.act==='escape'){closeCard();return}
  if(S.selected==='door'){if(/^[0-9]$/.test(e.key))padKey(e.key);if(e.key==='Backspace')padKey('⌫');if(e.key==='Enter')padKey('OK');return}
  keys.add(e.key.toLowerCase())});
addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
addEventListener('blur',()=>keys.clear());

/* ================= TRAINING ================= */
const TR={on:false,queue:[],retry:[],total:0,done:0,first:0,round:1,cur:null,results:{},wrongOnce:{}};
function trainHome(){
  S.selected=null;TS=null;TR.on=false;TR.cur=null;
  const n=OLIST.filter(o=>o.task).length;
  showCard(`<div class="phead"><b>Training</b> · bez limitu czasu<button class="x" data-act="goescape" aria-label="Zu Escape" title="Zum Escape">${XSVG}</button></div>
  <div class="ch" style="margin-top:12px"><div><h2>${R.name}</h2><p>Kapitel ${R.chapter} · ${R.chapterName}</p></div></div>
  <div class="mini" style="margin-top:12px">Alle <b>${n} Aufgaben</b> des Kapitels – jede gehört zu einem Gegenstand im Raum. Die Kamera zeigt dir, worum es geht. Keine Zeit, kein Türcode. <b>Falsche Aufgaben kommen am Ende nochmal</b>, bis du alle richtig hast.<br><i>${n} zadań z rozdziału – każde jest przy przedmiocie w pokoju. Błędne wracają na końcu.</i></div>
  <div class="mini">Formate wie im Buch: Multiple Choice · A oder B · Lücken füllen · Satz bauen · Eintippen.</div>
  <button class="cta" data-act="trainStart" style="margin-top:14px">Training starten · start</button>`);
}
function trainStart(){
  const ids=OLIST.filter(o=>o.task).map(o=>o.id);
  TR.on=true;TR.queue=ids.slice();TR.retry=[];TR.total=ids.length;TR.done=0;TR.first=0;TR.round=1;TR.results={};TR.wrongOnce={};
  S.stars=0;updateHUD();trainNext(true)}
function trainNext(first){
  if(!TR.queue.length){
    if(TR.retry.length){TR.queue=TR.retry;TR.retry=[];TR.round++;TR.total=TR.queue.length;TR.done=0;toast('Wiederholung: '+TR.queue.length+' Aufgabe'+(TR.queue.length>1?'n':''),2400)}
    else{trainEnd();return}}
  const id=TR.queue.shift();TR.cur=id;
  $('#progt').textContent=`Training ${TR.round>1?'(Wiederholung) ':''}${TR.done}/${TR.total}`;
  const o=OBJ[id];S.hover=null;
  renderTask(o,'train');
  focusObj(id,first?1100:900);o.pulse=now()+3000}
function trainResult(ok){
  TS.done=true;const o=TS.o,t=o.task;const fb=$('#fb');
  if(TR.results[o.id]===undefined)TR.results[o.id]=ok&&!TR.wrongOnce[o.id];
  if(ok&&!TR.wrongOnce[o.id])TR.first++;
  if(ok){fb.className='fb ok';fb.innerHTML=t.explain;TR.done++;S.stars++;$('#stars').textContent=S.stars;floatText('+1 ★',o.anchor)}
  else{TR.wrongOnce[o.id]=true;TR.retry.push(o.id);fb.className='fb bad';fb.innerHTML=`<b>Nicht ganz.</b> Richtig:<br>${t.explain}<br><span style="opacity:.8">Die Aufgabe kommt am Ende nochmal.</span>`;
    if(t.type==='gaps'){TS.fill=t.ans.slice();drawGaps();const c=$('#chk');if(c)c.disabled=true}
    if(t.type==='order'){TS.pick=t.ans.split(' ').map(w=>t.words.findIndex((x,i)=>x===w&&!TS.pick.includes(i)));drawOrder()}
    if(t.type==='type'){const i=$('#gin');if(i){i.value=t.ans[0];i.classList.remove('bad')}}}
  $('#progt').textContent=`Training ${TR.round>1?'(Wiederholung) ':''}${TR.done}/${TR.total}`;
  const bar=card.querySelector('.prog-bar i');if(bar)bar.style.width=(TR.done/TR.total*100)+'%';
  const tb=$('#tipb');if(tb)tb.remove();const chk=$('#chk');if(chk)chk.remove();
  const last=!TR.queue.length&&!TR.retry.length;
  fb.insertAdjacentHTML('afterend',`<div class="mini"><b>Wörter hier · słówka tutaj</b></div>`+wordList(o)+`<button class="cta ${ok?'go':''}" data-act="trainNext" style="margin-top:12px">${last?'Ergebnis ansehen':'Weiter →'}</button>`);
  setTimeout(()=>card.scrollTo({top:card.scrollHeight,behavior:MANUAL?'auto':'smooth'}),30)}
function trainEnd(){
  TR.cur=null;S.selected=null;const n=Object.keys(TR.results).length,f=TR.first;
  saveProg(R.id,{trained:f,trainedOf:n,trainedAt:Date.now()});
  showCard(`<div class="phead"><b>Training</b> · fertig<button class="x" data-act="stopTrain" aria-label="Schließen">${XSVG}</button></div>
  <div class="big-stat">${f}<span style="font-size:22px;color:var(--mu)"> / ${n}</span></div>
  <div class="mini" style="text-align:center"><b>beim ersten Versuch richtig</b><br><i>poprawnie za pierwszym razem</i></div>
  <div class="mini" style="text-align:center">${f===n?'Perfekt! 🎉 Jetzt bist du bereit für den Escape.':'Alle Aufgaben sind jetzt gelöst – die schwierigen hast du wiederholt.'}</div>
  <div class="row" style="margin-top:14px"><button class="cta sec" data-act="stopTrain">Nochmal</button><button class="cta" data-act="goescape">Escape starten</button></div>`);
  TR.on=false}
function trainStop(){TR.on=false;TR.cur=null;trainHome()}

/* ================= WORD DRILL ================= */
let D=null;
function drillHome(){
  D=null;S.selected=null;TS=null;
  const nn=WORDS.filter(w=>w.noun).length;
  showCard(`<div class="phead"><b>Wörter</b> · ${WORDS.length} Wörter im Raum<button class="x" data-act="goescape" aria-label="Zu Escape" title="Zum Escape">${XSVG}</button></div>
  <div class="ch" style="margin-top:12px"><div><h2>${R.name}</h2><p>Kapitel ${R.chapter} · ${R.chapterName}</p></div></div>
  <div class="mini" style="margin-top:10px">Alle Wörter hängen an Gegenständen im Raum. Jede Karte zeigt dir das passende Objekt. Tippe auf einen Gegenstand, um seine Wörter zu sehen.<br><i>Wszystkie słówka są przypisane do przedmiotów. Kliknij przedmiot, żeby zobaczyć jego słówka.</i></div>
  <button class="cta" data-act="dstart" data-kind="cards" style="margin-top:14px">Karteikarten · fiszki (${WORDS.length})</button>
  <button class="cta sec" data-act="dstart" data-kind="art" style="margin-top:8px">Artikel-Quiz · der / die / das (${nn})</button>`);
  $('#progt').textContent='Wörter'}
function shuffle(a){const r=rng(Math.floor(now())%99991+7);const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
function drillStart(kind,words){
  if(S.act!=='words')setAct('words',true);
  const deck=kind==='art'?words.filter(w=>w.noun):words;
  if(!deck.length){drillHome();return}
  D={kind,q:shuffle(deck),total:deck.length,known:0,first:0,flip:false,wrongList:[],wrongSet:new Set(),answered:false};
  drillShow()}
function drillShow(){
  const w=D.q[0];D.flip=false;D.answered=false;drawDrill();S.hover=null;
  const o=OBJ[w.obj];if(o){o.pulse=now()+2500;focusObj(w.obj,900)}}
function drawDrill(){
  const w=D.q[0];const done=D.total-D.q.length;
  const hd=`<div class="phead"><b>${D.kind==='art'?'Artikel-Quiz':'Karteikarten'}</b> ${done}/${D.total}<button class="x" data-act="dend" aria-label="Beenden">${XSVG}</button></div><div class="prog-bar"><i style="width:${done/D.total*100}%"></i></div>`;
  $('#progt').textContent=`Wörter ${done}/${D.total}`;
  const obj=OBJ[w.obj];const objline=`<div class="mini" style="margin-top:10px">Siehst du es? → <b>${obj.art?obj.art+' ':''}${obj.de}</b> im Raum <i>(${obj.pl})</i></div>`;
  if(D.kind==='cards'){
    const front=D.flip?`<div><div class="big">${w.noun?`<span class="artbig ${w.art}">${w.art}</span>`:''}${w.de}</div>${w.plu?`<div class="tapt">${w.plu}</div>`:''}<div class="pl3">${w.pl}</div></div>`:`<div><div class="big">${w.de}</div><div class="tapt">${w.noun?'Welcher Artikel? ':''}Tippen zum Umdrehen · <i>dotknij, aby odwrócić</i></div></div>`;
    showCard(hd+`<div class="fcard" data-act="dflip">${front}</div>`+(D.flip?`<div class="row" style="margin-top:12px"><button class="cta sec" data-act="dagain">↻ Nochmal</button><button class="cta go" data-act="dknow">✓ Wusste ich</button></div>`:`<button class="cta sec" data-act="dflip" style="margin-top:12px">Umdrehen · odwróć</button>`)+objline);
  }else{
    showCard(hd+`<div class="fcard" style="cursor:default"><div><div class="big" id="dword">___ ${w.de}</div><div class="pl3">${w.pl}</div></div></div>
    <div class="opts">${['der','die','das'].map(a=>`<button class="opt art-${a}" data-act="dart" data-v="${a}">${a}</button>`).join('')}</div><div class="fb" id="fb"></div>`+objline);
  }
  S.selected=null}
function drillKnow(k){const w=D.q.shift();if(k){D.known++;if(!D.wrongSet.has(w.de))D.first++}else{D.q.push(w);if(!D.wrongSet.has(w.de)){D.wrongSet.add(w.de);D.wrongList.push(w)}}
  if(!D.q.length){drillEnd();return}drillShow()}
function drillArt(v,b){
  if(D.answered)return;const w=D.q[0];const ok=v===w.art;D.answered=true;
  card.querySelectorAll('.opt').forEach(x=>{x.disabled=true;if(x.dataset.v===w.art)x.classList.add('ok')});
  const fb=$('#fb');$('#dword').innerHTML=`<span class="artbig ${w.art}">${w.art}</span>${w.de}`;
  if(ok){b.classList.add('ok');if(!D.wrongSet.has(w.de))D.first++;fb.className='fb ok';fb.innerHTML=`<b>${w.art} ${w.de}</b>${w.plu?` · ${w.plu}`:''}`;D.q.shift();
    const dd=D;setTimeout(()=>{if(D===dd&&D.answered)afterArt()},MANUAL?0:850)}
  else{b.classList.add('bad');fb.className='fb bad';fb.innerHTML=`<b>Richtig: ${w.art} ${w.de}</b>${w.plu?` · ${w.plu}`:''}<br>Das Wort kommt nochmal.`;D.wrongSet.add(w.de);if(!D.wrongList.includes(w))D.wrongList.push(w);D.q.shift();D.q.push(w);
    fb.insertAdjacentHTML('afterend',`<button class="cta" data-act="dnext" style="margin-top:12px">Weiter →</button>`)}}
function afterArt(){if(!D)return;if(!D.q.length){drillEnd();return}drillShow()}
function drillNext(){if(!D.q.length){drillEnd();return}drillShow()}
function drillEnd(){
  const n=D.total,f=D.first;const key=D.kind==='art'?'artQuiz':'cards';saveProg(R.id,{[key]:f,[key+'Of']:n});
  showCard(`<div class="phead"><b>${D.kind==='art'?'Artikel-Quiz':'Karteikarten'}</b> · fertig<button class="x" data-act="dend" aria-label="Schließen">${XSVG}</button></div>
  <div class="big-stat">${f}<span style="font-size:22px;color:var(--mu)"> / ${n}</span></div>
  <div class="mini" style="text-align:center"><b>${D.kind==='art'?'Artikel beim ersten Versuch richtig':'Wörter sofort gewusst'}</b></div>
  ${D.wrongList.length?`<div class="mini"><b>Zum Wiederholen · do powtórki:</b><br>${D.wrongList.map(w=>(w.art?w.art+' ':'')+w.de).join(' · ')}</div>`:'<div class="mini" style="text-align:center">Alle Wörter sitzen! 🎉</div>'}
  <div class="row" style="margin-top:14px">${D.wrongList.length?`<button class="cta sec" data-act="dwrongs">Nur Fehler</button>`:''}<button class="cta" data-act="dend">Zurück</button></div>`)}

/* ================= ACTIVITY / GAME FLOW ================= */
function setAct(a,silent){
  S.act=a;document.body.dataset.act=a;
  document.querySelectorAll('#acts [data-act]').forEach(b=>b.classList.toggle('on',b.dataset.act===a));
  if(!silent){
    S.selected=null;TS=null;D=null;TR.on=false;TR.cur=null;
    if(a==='escape'){closeCard(true);updateHUD();defaultCaption()}
    if(a==='train'){trainHome();$('#progt').textContent='Training'}
    if(a==='words'){drillHome()}
    updateHUD();
  }
}
function win(){
  S.won=true;S.doorT=1;const used=S.elapsed;S.solved.door=true;closeCard(true);$('#cap').classList.add('hide');updateHUD();
  const prev=(store.get()[R.id]||{}).best;saveProg(R.id,{won:true,best:Math.min(used,prev||1e12)});
  if(S.view!=='walk'){setView('walk',true)}
  const d=R.door;flyTo({pos:new THREE.Vector3((d.x0+d.x1)/2-.5,EYE,-R.D/2+2.4),target:new THREE.Vector3((d.x0+d.x1)/2,1.1,-R.D/2-1),fov:walkPose().fov},1800,()=>{syncPFromCamera()});
  setTimeout(()=>{
    if(!S.won)return;const nxt=ROOM_ORDER[ROOM_ORDER.indexOf(R.id)+1];const nr=nxt&&ROOMS[nxt];
    $('#modalbox').innerHTML=`<div style="font-size:42px">🎉</div><h1>Geschafft!</h1><p>Die Tür ist offen – du hast das ${R.title} verlassen.<br>Drzwi otwarte – wyszedłeś z pokoju!</p>
    <div class="stats"><div><b>${fmt(used)}</b>Zeit · czas</div><div><b>${S.stars}</b>Sterne · gwiazdki</div><div><b>${Object.keys(S.solved).length-1}/${OLIST.filter(o=>o.task).length}</b>Aufgaben · zadania</div></div>
    ${nr?`<button class="cta" style="margin-top:20px" id="nextroom">Weiter zum ${nr.title} →</button>`:''}
    <div class="row"><button class="cta sec" id="trainbtn" style="margin-top:10px">Training</button><button class="cta sec" id="again" style="margin-top:10px">Nochmal spielen</button></div>`;
    $('#modal').classList.add('show');$('#again').onclick=()=>restart();$('#trainbtn').onclick=()=>{restart();setAct('train')};
    const nb=$('#nextroom');if(nb)nb.onclick=()=>{$('#modal').classList.remove('show');loadRoom(nxt,{brief:true})};confetti()},MANUAL?400:2200);
}
function lose(){S.lost=true;closeCard(true);$('#modalbox').innerHTML=`<div style="font-size:40px">⏰</div><h1>Zeit abgelaufen</h1><p>Die Zeit ist vorbei – ${S.clues.filter(v=>v!=null).length} von 4 Hinweisen gefunden.<br>Czas minął. Spróbuj jeszcze raz albo poćwicz w trybie Training.</p>
  <div class="row"><button class="cta sec" id="trainbtn" style="margin-top:20px">Training</button><button class="cta" id="again" style="margin-top:20px">Nochmal versuchen</button></div>`;
  $('#modal').classList.add('show');$('#again').onclick=()=>restart();$('#trainbtn').onclick=()=>{restart();setAct('train')}}
function confetti(){const cols=['#F2B33D','#DE4338','#2F6FDE','#2EA05A','#FF9D45','#8A5BA0'];for(let i=0;i<70;i++){const e=document.createElement('div');e.className='conf';e.style.left=Math.random()*100+'vw';e.style.background=cols[i%cols.length];e.style.animationDuration=2.2+Math.random()*2+'s';e.style.animationDelay=Math.random()*.6+'s';e.style.borderRadius=i%3?'2px':'50%';document.body.appendChild(e);setTimeout(()=>e.remove(),5200)}}
function resetState(){
  S.solved={};S.clues=[null,null,null,null];S.stars=0;S.started=false;S.won=false;S.lost=false;S.wrong={};S.selected=null;S.elapsed=0;S.bonus=0;S.doorT=0;S.doorOpen=0;
  TS=null;D=null;TR.on=false;TR.cur=null;
  $('#modal').classList.remove('show');card.classList.add('hidden');document.body.classList.remove('cardopen');cardShift(false);
  $('#timer').textContent='5:00';$('#timerp').classList.remove('warn');$('#timerp').title='5 Minuten · startet beim ersten Rätsel';
}
function restart(){
  resetState();placeStart();setAct('escape',true);updateHUD();
  S.view='walk';document.body.dataset.view='walk';document.querySelectorAll('#views [data-view]').forEach(b=>b.classList.toggle('on',b.dataset.view==='walk'));S.planT=0;$('#plantag').classList.remove('show');
  flyTo(walkPose(),1100,()=>{controls.enabled=false});defaultCaption()}
function hint(){
  if(S.won||S.lost||S.act!=='escape')return;
  if(!S.started){S.started=true}
  const nx=OLIST.filter(o=>o.clue!=null).sort((a,b)=>a.clue-b.clue).find(o=>!S.solved[o.id]);
  if(S.selected)closeCard(true);
  const o=nx||OBJ.door;focusObj(o.id,1100);o.pulse=now()+4200;
  caption('Hinweis: '+(nx?o.hintTxt:'Alle Hinweise gefunden – ab zur Tür!'),nx?'Podpowiedź: sprawdź zaznaczony przedmiot ('+(o.art||'')+' '+o.de+').':'Wpisz kod na panelu przy drzwiach.',5200)}
function placeStart(){const s=R.start;P.x=s.x;P.z=s.z;P.yaw=s.yaw||0;P.pitch=-.05;goal=null}

/* ================= room loading ================= */
function loadRoom(id,opts={}){
  R=ROOMS[id];S.room=id;
  clearWorld();buildShell();buildObjects();
  document.body.style.background=`radial-gradient(120% 90% at 50% 38%,${R.theme.bg[0]} 0%,${R.theme.bg[1]} 55%,${R.theme.bg[2]} 100%)`;
  resetState();placeStart();
  S.view='walk';document.body.dataset.view='walk';document.querySelectorAll('#views [data-view]').forEach(b=>b.classList.toggle('on',b.dataset.view==='walk'));
  $('#plantag').classList.remove('show');
  flight=null;const wp=walkPose();camera.fov=wp.fov;camera.updateProjectionMatrix();camera.position.copy(wp.pos);camera.lookAt(wp.target);controls.enabled=false;S.planK=0;S.planT=0;
  $('#roomtag').innerHTML=`${R.name}<span>Kapitel ${R.chapter} · ${R.chapterName}</span>`;
  const act=opts.act||'escape';setAct(act,true);
  updateHUD();
  $('#home').classList.add('hide');
  if(opts.brief)showBrief();
  else{if(act==='train')trainHome();if(act==='words')drillHome();if(act==='escape')defaultCaption()}
  updateObjs(0,now());
}
function showBrief(){
  const n=OLIST.filter(o=>o.task).length;
  $('#modalbox').innerHTML=`<div class="brief"><span class="chap">Kapitel ${R.chapter} · ${R.chapterName}</span><h1>${R.name}</h1>
  <p style="margin-top:8px">${R.story[0]}<br><i style="color:var(--mu);font-style:normal">${R.story[1]}</i></p>
  <div class="ctrl"><b>Gehen</b><span class="d"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> oder Pfeile · Klick auf den Boden = hingehen</span><span class="t">Joystick unten links · auf den Boden tippen = hingehen</span>
   <b>360°</b><span class="d">Maus ziehen = umschauen · Knopf „360°“ = Rundblick</span><span class="t">Finger ziehen = umschauen · Knopf „360°“ = Rundblick</span>
   <b>Aufgabe</b><span>Gegenstand ${TOUCH?'antippen':'anklicken'} · ${n} Aufgaben, ${R.objects.filter(o=>o.clue!=null).length} davon mit Code-Ziffer</span></div>
  <div class="acts">
   <button class="pri" data-go="escape"><span class="ic">🔑</span><span>Escape starten<small>5 Minuten · 4 Hinweise → Türcode · 5 min, kod do drzwi</small></span></button>
   <button data-go="train"><span class="ic">🎯</span><span>Training<small>alle Aufgaben ohne Zeit, Fehler wiederholen · trening</small></span></button>
   <button data-go="words"><span class="ic">🔤</span><span>Wörter<small>Karteikarten & Artikel-Quiz · słówka</small></span></button>
  </div></div>`;
  $('#modal').classList.add('show');
  $('#modalbox').querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{$('#modal').classList.remove('show');setAct(b.dataset.go);if(b.dataset.go==='escape')defaultCaption()});
}
function buildHome(){
  const prog=store.get();
  $('#roomcards').innerHTML=ROOM_ORDER.map(id=>{const r=ROOMS[id],p=prog[id]||{};
    const chips=[];if(p.won)chips.push(`<span class="ok">✓ Escape geschafft${p.best?` · ${fmt(p.best)}`:''}</span>`);if(p.trainedOf)chips.push(`<span class="${p.trained===p.trainedOf?'ok':''}">Training ${p.trained}/${p.trainedOf}</span>`);if(p.artQuizOf)chips.push(`<span>Artikel ${p.artQuiz}/${p.artQuizOf}</span>`);
    return `<button class="rc" data-room="${id}"><div class="img" style="background-image:url(thumbs/${id}.jpg)"><span class="badge">Kapitel ${r.chapter}</span></div>
    <div class="body"><h2>${r.name}</h2><div class="sub">${r.chapterName} · ${r.bookRef}</div>
    <p>${r.blurb}<i>${r.blurbPl}</i></p><div class="chips"><span>${r.objects.filter(o=>o.task).length} Aufgaben</span><span>${r.objects.reduce((n,o)=>n+(o.words||[]).length,0)} Wörter</span><span>5 Min. Escape</span>${chips.join('')}</div>
    <div class="go">Raum betreten <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div></div></button>`}).join('');
  document.querySelectorAll('#roomcards [data-room]').forEach(b=>b.onclick=()=>loadRoom(b.dataset.room,{brief:true}));
}
$('#btnHome').addEventListener('click',()=>{if(S.selected)closeCard(true);buildHome();$('#modal').classList.remove('show');$('#home').classList.remove('hide')});

/* ================= toolbar wiring ================= */
document.querySelectorAll('#acts [data-act]').forEach(b=>b.addEventListener('click',()=>setAct(b.dataset.act)));
document.querySelectorAll('#views [data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
$('#btnSpin').addEventListener('click',()=>{
  if(S.view==='walk'){if(S.selected&&S.act==='escape')closeCard(true);spin={y0:P.yaw,t0:now(),d:5200};caption('360° Rundblick','Obrót dookoła – przeciągnij, żeby przerwać.',5200)}
  else{controls.autoRotate=!controls.autoRotate;controls.autoRotateSpeed=2.2;caption(controls.autoRotate?'Automatisch drehen':'Drehen gestoppt','',2000)}});
$('#btnHint').addEventListener('click',hint);
$('#btnRestart').addEventListener('click',()=>{
  if(S.act==='escape')restart();else if(S.act==='train'){trainHome()}else drillHome()});

/* ================= input: look / click / walk ================= */
const ray=new THREE.Raycaster();const ptr=new THREE.Vector2();
function pickAt(cx,cy){
  const r=cv.getBoundingClientRect();ptr.set(((cx-r.left)/r.width)*2-1,-((cy-r.top)/r.height)*2+1);
  ray.setFromCamera(ptr,camera);
  const hits=ray.intersectObjects(world.children,true);
  for(const h of hits){const ob=h.object;if(ob.userData.noPick||ob.userData.hull||ob.isPoints)continue;
    let vis=true;ob.traverseAncestors(a=>{if(!a.visible)vis=false});if(!vis||!ob.visible)continue;
    if(ob.userData.objId)return {id:ob.userData.objId,point:h.point};
    if(ob.userData.floor)return {floor:true,point:h.point};
    if(ob.material&&!Array.isArray(ob.material)&&ob.material.transparent&&ob.material.opacity<.6)continue;
    return {block:true}}
  return null}
const ptrs=new Map();let down=null;
cv.addEventListener('pointerdown',e=>{try{cv.setPointerCapture(e.pointerId)}catch(_){}ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});down={x:e.clientX,y:e.clientY,t:now(),id:e.pointerId,moved:0};spin=null});
cv.addEventListener('pointermove',e=>{
  const p=ptrs.get(e.pointerId);
  if(p){const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
    if(down&&down.id===e.pointerId){down.moved+=Math.abs(dx)+Math.abs(dy)}
    if(S.view==='walk'&&!flight&&down&&e.pointerId===down.id&&down.moved>4){const k=e.pointerType==='touch'?.0045:.0034;P.yaw+=dx*k;P.pitch=clamp(P.pitch+dy*k,-1.05,1.05);goal=null;$('#goal').classList.remove('show')}
    return}
  if(e.pointerType==='touch'||S.selected||flight)return;
  const h=pickAt(e.clientX,e.clientY);S.hover=h&&h.id?h.id:null;cv.style.cursor=h&&h.id?'pointer':(S.view==='walk'?(h&&h.floor?'crosshair':'grab'):'grab')});
cv.addEventListener('pointerup',e=>{
  ptrs.delete(e.pointerId);
  if(!down||down.id!==e.pointerId)return;const d=down;down=null;
  if(d.moved>6||now()-d.t>600)return;
  const h=pickAt(e.clientX,e.clientY);if(!h)return;
  if(h.id){if(!(S.won&&S.act==='escape'))selectObj(h.id)}
  else if(h.floor&&S.view==='walk'&&!flight&&!S.selected){setGoal(h.point.x,h.point.z)}});
cv.addEventListener('pointercancel',e=>{ptrs.delete(e.pointerId);down=null});
cv.addEventListener('pointerleave',()=>{S.hover=null});
function setGoal(x,z){const r=resolve(x,z);goal={x:r.x,z:r.z,stuck:0};$('#goal').classList.add('show')}
const joyEl=$('#joy'),knob=$('#knob');
function joyMove(e){const r=joyEl.getBoundingClientRect();let dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);const m=Math.hypot(dx,dy),max=r.width/2-10;if(m>max){dx*=max/m;dy*=max/m}
  knob.style.transform=`translate(${dx}px,${dy}px)`;joy.x=dx/max;joy.y=dy/max;goal=null;$('#goal').classList.remove('show')}
joyEl.addEventListener('pointerdown',e=>{joy.id=e.pointerId;try{joyEl.setPointerCapture(e.pointerId)}catch(_){}joyMove(e);e.stopPropagation()});
joyEl.addEventListener('pointermove',e=>{if(joy.id===e.pointerId)joyMove(e)});
const joyEnd=e=>{if(joy.id===e.pointerId){joy.id=null;joy.x=joy.y=0;knob.style.transform=''}};
joyEl.addEventListener('pointerup',joyEnd);joyEl.addEventListener('pointercancel',joyEnd);

/* ================= per-frame ================= */
const tmp=new THREE.Vector3();
function updateWalk(dt){
  if(S.view!=='walk'||flight)return;
  if(spin){const k=(now()-spin.t0)/spin.d;if(k>=1){P.yaw=spin.y0+Math.PI*2;spin=null}else P.yaw=spin.y0+Math.PI*2*ease(k)}
  if(!card.classList.contains('hidden')&&window.innerWidth<=760)return;
  let f=0,s=0,t=0;
  if(keys.has('w')||keys.has('arrowup'))f+=1;if(keys.has('s')||keys.has('arrowdown'))f-=1;
  if(keys.has('a'))s-=1;if(keys.has('d'))s+=1;
  if(keys.has('arrowleft')||keys.has('q'))t+=1;if(keys.has('arrowright')||keys.has('e'))t-=1;
  if(joy.id!==null){f-=joy.y;s+=joy.x}
  if(t)P.yaw+=t*1.9*dt;
  if(f||s){goal=null;$('#goal').classList.remove('show')}
  let vx=0,vz=0;const sp=2.1*(keys.has('shift')?1.8:1);
  if(f||s){const l=Math.hypot(f,s);const mag=Math.min(1,l);vx=((-Math.sin(P.yaw))*f+Math.cos(P.yaw)*s)/l*mag*sp;vz=((-Math.cos(P.yaw))*f+(-Math.sin(P.yaw))*s)/l*mag*sp}
  else if(goal){const dx=goal.x-P.x,dz=goal.z-P.z,d=Math.hypot(dx,dz);if(d<.12){goal=null;$('#goal').classList.remove('show')}else{vx=dx/d*sp;vz=dz/d*sp}}
  if(vx||vz){const r=resolve(P.x+vx*dt,P.z+vz*dt);
    if(goal){const moved=Math.hypot(r.x-P.x,r.z-P.z);if(moved<Math.hypot(vx,vz)*dt*.25){goal.stuck+=dt;if(goal.stuck>.5){goal=null;$('#goal').classList.remove('show')}}else goal.stuck=0}
    P.x=r.x;P.z=r.z}
  if(goal){tmp.set(goal.x,0,goal.z).project(camera);const g=$('#goal');g.style.left=((tmp.x*.5+.5)*innerWidth)+'px';g.style.top=((-tmp.y*.5+.5)*innerHeight)+'px'}
}
function camFromP(){
  if(S.view!=='walk'||flight)return;
  camera.position.set(P.x,EYE,P.z);camera.rotation.set(P.pitch,P.yaw,0,'YXZ')}
let cfT=0,cfLast=null;
function centerFocus(){if(++cfT%6===0){const h=pickAt(innerWidth/2,innerHeight/2);cfLast=h&&h.id?h.id:null}return cfLast}
function updateLabels(){
  const W_=innerWidth,H_=innerHeight,plan=S.view==='plan',words=S.act==='words'||plan;
  const focus=(TOUCH&&S.view==='walk'&&!S.selected&&!flight)?centerFocus():null;
  const open=!card.classList.contains('hidden');
  for(const o of OLIST){
    const wantLbl=!S.won&&!S.lost&&(words||(S.hover===o.id&&!S.selected)||(focus===o.id));
    tmp.copy(plan?o.planAnchor:o.anchor).project(camera);const x=(tmp.x*.5+.5)*W_,y=(-tmp.y*.5+.5)*H_;
    const inview=tmp.z<1&&x>-60&&x<W_+60&&y>-60&&y<H_+60;
    const showL=wantLbl&&inview&&!(S.selected===o.id&&!words);
    o.el.classList.toggle('show',showL);o.el.classList.toggle('click',showL&&words);
    const tr=`translate(${x.toFixed(1)}px,${(y-(plan?2:10)).toFixed(1)}px) translate(-50%,-100%)`;o.el.style.setProperty('--t',tr);o.el.style.transform=tr;
    o.el.classList.toggle('pulse',o.pulse>now()&&showL);
    if(o.pin){
      let show=false;
      if(S.act==='escape'&&!S.won&&!S.lost&&!open)show=true;
      if(S.act==='train'&&TR.cur===o.id&&TR.on)show=true;
      if(S.act==='escape'&&plan&&!S.won)show=true;
      tmp.copy(plan?o.planAnchor:o.anchor).project(camera);const px=(tmp.x*.5+.5)*W_,py=(-tmp.y*.5+.5)*H_;
      const dist=camera.position.distanceTo(o.anchor);
      const vis=show&&tmp.z<1&&px>-30&&px<W_+30&&py>-30&&py<H_+30&&(plan||S.view==='orbit'||dist<14)&&!(wantLbl&&showL&&S.hover===o.id);
      o.pin.classList.toggle('show',vis);o.pin.classList.toggle('cur',vis&&TR.cur===o.id&&TR.on);
      o.pin.style.transform=`translate(${px.toFixed(1)}px,${(py+(plan?0:26)).toFixed(1)}px)`;
    }
  }
}
function updateObjs(dt,t){
  for(const o of OLIST){
    let tgt=(S.hover===o.id||S.selected===o.id)?1:0;
    if(S.act==='train'&&TR.on&&TR.cur===o.id)tgt=Math.max(tgt,.3);
    if(o.pulse>t)tgt=Math.max(tgt,.5+.5*Math.sin(t/180));
    o.glow=damp(o.glow,tgt,14,dt);const on=o.glow>.04;
    for(const m of o.meshes){for(const c of m.children)if(c.userData.hull)c.visible=on;
      if(m.userData.bE){m.material.emissive.copy(m.userData.bE).lerp(HL,o.glow*.07);m.material.emissiveIntensity=m.userData.bI+o.glow*.12}}}
}
function update(dt,t){
  if(!R)return;
  if(S.started&&!S.won&&!S.lost&&S.act==='escape'){S.elapsed+=dt*1000;const rem=Math.max(0,totalMs()-S.elapsed);$('#timer').textContent=fmt(rem);$('#timerp').classList.toggle('warn',rem<60000);if(rem<=0)lose()}
  S.planK=damp(S.planK,S.planT,4.2,dt);S.doorOpen=damp(S.doorOpen,S.doorT,2.4,dt);
  const dr=OBJ.door&&OBJ.door.built.extra;
  if(dr){dr.pivot.rotation.y=1.75*S.doorOpen;const open=clamp(S.doorOpen*1.4,0,1);dr.cor.material.color.setRGB(.08+open*.97,.06+open*.84,.05+open*.55);dr.dl.intensity=open*14;
    dr.led.material.color.set(S.doorT?0x4CD38A:(S.clues.every(v=>v!=null)?0xF2B33D:0xDE4338))}
  const pk=ease(S.planK);
  for(const side in wallG)wallG[side].scale.y=Math.max(.02,1-pk*.95);
  for(const o of OLIST)if(o.flat&&o.id!=='door')o.g.scale.y=Math.max(.02,1-pk*.95);
  if(OBJ.door)OBJ.door.g.scale.y=Math.max(.02,1-pk*.95);
  planSyms.visible=pk>.5;
  if(R._outside)R._outside.visible=pk<.5;
  const cx=camera.position.x,cz=camera.position.z,{W,D}=R;
  wallG.back.visible=cz>-D/2-T+.05;wallG.front.visible=cz<D/2+T-.05;wallG.left.visible=cx>-W/2-T+.05;wallG.right.visible=cx<W/2+T-.05;
  ceiling.visible=S.view==='walk'&&!flight&&S.planK<.1;for(const c of ceilParts)c.visible=ceiling.visible;
  shift.x=damp(shift.x,shift.tx,6,dt);shift.y=damp(shift.y,shift.ty,6,dt);applyShift();
  updateObjs(dt,t);
}
let last=now();
function frame(){const t=now();const dt=Math.min(.1,Math.max(0,(t-last)/1000));last=t;
  stepFlight();updateWalk(dt);camFromP();if(!flight&&controls.enabled)controls.update();update(dt,t);renderer.render(scene,camera);updateLabels()}
function loop(){requestAnimationFrame(loop);frame()}
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()}
addEventListener('resize',()=>{resize();if(R){cardShift(!card.classList.contains('hidden'))}});
resize();

/* ================= init ================= */
buildHome();
{const hs=(location.hash||'').slice(1),rq=Q.get('room');const sr=ROOMS[hs]?hs:ROOMS[rq]?rq:null;
  if(sr){loadRoom(sr,{brief:!Q.has('nobrief'),act:Q.get('act')||undefined})}
  else{loadRoom('restaurant');$('#home').classList.remove('hide')}}
window.__game={S,P,OBJ:()=>OBJ,THREE,camera,controls,ROOMS,loadRoom,selectObj,closeCard,setView,setAct,restart,hint,solve:id=>{selectObj(id);solve(OBJ[id])},
  answer:v=>{const b=[...card.querySelectorAll('[data-act="ans"]')].find(x=>x.dataset.v===v);b&&b.click()},
  step:ms=>{vtime+=ms;frame()},manual:MANUAL,now,padKey,flight:()=>flight,resolve,trainStart,TR,WORDS:()=>WORDS,drillStart,get D(){return D},setHover:id=>{S.hover=id},R:()=>R,colliders:()=>colliders,setGoal,win,keys,joy};
window.__ready=true;
if(MANUAL){frame()}else{loop()}
