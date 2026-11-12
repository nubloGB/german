/* Shared helpers & small prop builders (Three.js, low-poly look) */
import * as THREE from 'three';
import {RoundedBoxGeometry} from './RoundedBoxGeometry.js';
export {THREE};

export const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
export const damp=(v,t,k,dt)=>v+(t-v)*(1-Math.exp(-k*dt));
export const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
export function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

export const mat=(c,r=.85,m=0,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m,...o});
export function mesh(geo,m,x=0,y=0,z=0,p){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;if(p)p.add(o);return o}
export const box=(w,h,d,m,x,y,z,p)=>mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z,p);
export const rbox=(w,h,d,r,m,x,y,z,p)=>mesh(new RoundedBoxGeometry(w,h,d,3,Math.min(r,w/2-.001,h/2-.001,d/2-.001)),m,x,y,z,p);
export const cyl=(rt,rb,h,seg,m,x,y,z,p)=>mesh(new THREE.CylinderGeometry(rt,rb,h,seg),m,x,y,z,p);
export const sph=(r,m,x,y,z,p,ws=14,hs=10)=>mesh(new THREE.SphereGeometry(r,ws,hs),m,x,y,z,p);
export function canvasTex(w,h,draw,srgb=true){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);if(srgb)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t}
export function plane(w,h,m,x,y,z,p,ry=0){const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);o.position.set(x,y,z);o.rotation.y=ry;o.receiveShadow=true;if(p)p.add(o);return o}

export const WOOD=mat(0x8A5732,.7), WOOD_D=mat(0x5E3921,.7), WOOD_L=mat(0xC99B66,.7), IRON=mat(0x30333A,.5,.5);
export const GOLD=mat(0xE2B04A,.35,.8), CREAM=mat(0xF3EBDA,.8), WHITE=mat(0xF4F2EC,.7), BLACK=mat(0x1C1D21,.5,.2);

/* soft contact shadow */
let _blob;
export function blob(p,w,d,x=0,z=0,op=.9,y=.012){
  if(!_blob)_blob=canvasTex(128,128,(g)=>{const r=g.createRadialGradient(64,64,6,64,64,64);r.addColorStop(0,'rgba(20,10,0,.6)');r.addColorStop(.6,'rgba(20,10,0,.24)');r.addColorStop(1,'rgba(20,10,0,0)');g.fillStyle=r;g.fillRect(0,0,128,128)});
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({map:_blob,transparent:true,depthWrite:false,opacity:op,toneMapped:false}));
  m.rotation.x=-Math.PI/2;m.position.set(x,y,z);m.userData.noPick=true;m.raycast=()=>{};m.renderOrder=-1;p.add(m);return m}

/* ---------- shared props (each returns a THREE.Group at origin) ---------- */
export function propChair({seat=0xD6A24A,leg=WOOD,back=true,scale=1}={}){
  const g=new THREE.Group();const SE=mat(seat,.8);
  rbox(.46,.06,.46,.02,SE,0,.47,0,g);
  [[-.19,-.19],[.19,-.19],[-.19,.19],[.19,.19]].forEach(([x,z])=>box(.04,.45,.04,leg,x,.225,z,g));
  if(back){box(.04,.42,.04,leg,-.19,.7,-.2,g);box(.04,.42,.04,leg,.19,.7,-.2,g);rbox(.42,.2,.04,.015,SE,0,.78,-.2,g);box(.4,.04,.03,leg,0,.62,-.2,g)}
  g.scale.setScalar(scale);return g}
export function propOfficeChair(color=0x2F6F73){
  const g=new THREE.Group();const C=mat(color,.8),M=mat(0x2A2C31,.45,.5);
  cyl(.04,.04,.4,8,M,0,.25,0,g);
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5;const arm=box(.3,.03,.045,M,Math.cos(a)*.15,.06,Math.sin(a)*.15,g);arm.rotation.y=-a;cyl(.03,.03,.04,8,M,Math.cos(a)*.3,.03,Math.sin(a)*.3,g)}
  rbox(.5,.09,.48,.04,C,0,.5,0,g);
  const bk=rbox(.46,.52,.08,.04,C,0,.82,-.24,g);bk.rotation.x=-.08;
  [-1,1].forEach(s=>{box(.03,.2,.03,M,s*.26,.62,-.02,g);box(.06,.025,.26,M,s*.26,.73,.0,g)});
  return g}
export function propPlant({pot=0xC4673F,leaf=0x3E8A55,h=1,kind='cone'}={}){
  const g=new THREE.Group();const TERRA=mat(pot,.85);
  cyl(.26,.19,.34,10,TERRA,0,.17,0,g);cyl(.275,.275,.04,10,mat(0xB05A34,.8),0,.35,0,g);cyl(.23,.23,.02,10,mat(0x3a2a1e,1),0,.345,0,g);
  cyl(.04,.05,.5*h,6,WOOD_D,0,.6*h,0,g);
  [[.5,.5,.55],[.42,.45,.88],[.34,.4,1.18],[.26,.36,1.46],[.17,.3,1.7]].forEach(([r,hh,y],i)=>{const c=mesh(new THREE.ConeGeometry(r,hh,7),mat(i%2?leaf-0x081008:leaf,.85,0,{flatShading:true}),0,y*h,0,g);c.rotation.y=i*.7});
  return g}
export function propClock(R=.28,hh=3,mm=15,frame=WOOD_D){
  const g=new THREE.Group();
  const face=canvasTex(256,256,(c)=>{c.fillStyle='#FBF8F0';c.beginPath();c.arc(128,128,126,0,7);c.fill();c.strokeStyle='#17181C';c.fillStyle='#17181C';
    for(let i=0;i<60;i++){const a=i*Math.PI/30,l=i%5?6:14;c.lineWidth=i%5?1.5:3.5;c.beginPath();c.moveTo(128+Math.sin(a)*(118-l),128-Math.cos(a)*(118-l));c.lineTo(128+Math.sin(a)*118,128-Math.cos(a)*118);c.stroke()}
    c.font='700 30px Inter,sans-serif';c.textAlign='center';c.textBaseline='middle';[[12,0],[3,90],[6,180],[9,270]].forEach(([n,d])=>{const a=d*Math.PI/180;c.fillText(n,128+Math.sin(a)*84,128-Math.cos(a)*84)})});
  mesh(new THREE.TorusGeometry(R,.035,10,32),frame,0,0,0,g);
  const fm=new THREE.Mesh(new THREE.CircleGeometry(R,32),new THREE.MeshStandardMaterial({map:face,roughness:.6}));fm.position.z=.012;fm.receiveShadow=true;g.add(fm);
  const hand=(len,wd,ang,z)=>{const p=new THREE.Group();p.rotation.z=-ang;p.position.z=z;box(wd,len,.012,mat(0x17181C,.5),0,len/2-.02,0,p);g.add(p)};
  hand(R*.5,.022,(hh%12+mm/60)*Math.PI/6,.03);hand(R*.75,.014,mm*Math.PI/30,.04);
  const pin=mesh(new THREE.CylinderGeometry(.018,.018,.03,10),GOLD,0,0,.05,g);pin.rotation.x=Math.PI/2;
  return g}
export function propGlass(){
  const g=new THREE.Group();
  const gl=new THREE.MeshStandardMaterial({color:0xDDEFF8,roughness:.08,transparent:true,opacity:.42,metalness:.1});
  const c=new THREE.Mesh(new THREE.CylinderGeometry(.045,.032,.11,14,1,true),gl);c.position.y=.055;c.castShadow=true;g.add(c);
  cyl(.03,.03,.012,14,gl,0,.006,0,g);
  cyl(.04,.03,.045,14,mat(0xB5483B,.4,0,{transparent:true,opacity:.85}),0,.03,0,g);
  return g}
export function propBottle(col=0x2F6A4A){
  const g=new THREE.Group();const m=mat(col,.2,.1);
  cyl(.04,.04,.2,12,m,0,.1,0,g);cyl(.016,.04,.07,12,m,0,.235,0,g);cyl(.016,.016,.06,10,m,0,.3,0,g);cyl(.018,.018,.012,10,GOLD,0,.335,0,g);
  cyl(.0405,.0405,.08,12,mat(0xF1E9D6,.8),0,.1,0,g);
  return g}
export function propPendant({shade=0xF7C46E,cord=1,r=.26}={}){
  const g=new THREE.Group();
  cyl(.006,.006,cord,6,BLACK,0,-cord/2,0,g);
  const s=new THREE.Mesh(new THREE.ConeGeometry(r,.2,20,1,true),new THREE.MeshStandardMaterial({color:shade,roughness:.5,emissive:0xFFA83C,emissiveIntensity:.55,side:THREE.DoubleSide}));s.position.y=-cord-.1;s.castShadow=false;g.add(s);
  const b=new THREE.Mesh(new THREE.SphereGeometry(.055,12,10),new THREE.MeshBasicMaterial({color:0xFFE9B0}));b.position.y=-cord-.17;b.userData.noPick=true;b.raycast=()=>{};g.add(b);
  return g}
export function propCup(col=0xF1E9D6){const g=new THREE.Group();cyl(.04,.032,.07,12,mat(col,.6),0,.035,0,g);return g}
export function propPlate(col=0xF7F4EC,food=null){
  const g=new THREE.Group();cyl(.13,.1,.018,20,mat(col,.4),0,.009,0,g);cyl(.085,.085,.006,20,mat(0xE9E4D8,.4),0,.02,0,g);
  if(food==='soup'){cyl(.075,.07,.012,18,mat(0xD9722A,.5),0,.024,0,g)}
  return g}
export function propCandle(){const g=new THREE.Group();cyl(.035,.035,.09,10,mat(0xF1E9D6,.7),0,.045,0,g);
  const f=new THREE.Mesh(new THREE.SphereGeometry(.016,8,6),new THREE.MeshBasicMaterial({color:0xFFD27A,toneMapped:false}));f.scale.set(.8,1.5,.8);f.position.y=.11;f.userData.noPick=true;f.raycast=()=>{};g.add(f);return g}

/* low-poly person (waiter / interviewer) */
export function propPerson({skin=0xE8B796,shirt=0xF4F2EC,pants=0x24262B,hair=0x3A2A20,apron=null,tie=null,skirt=false,seated=false,hairStyle='short',jacket=null}={}){
  const g=new THREE.Group();
  const S=mat(skin,.8),SH=mat(shirt,.8),PA=mat(pants,.85),HA=mat(hair,.9),JA=jacket?mat(jacket,.85):null;
  const legH=seated?.48:.82,y0=seated?0:0;
  if(seated){
    [-1,1].forEach(s=>{rbox(.15,.14,.5,.05,PA,s*.1,.5,.2,g);rbox(.13,.5,.14,.05,PA,s*.1,.25,.44,g);rbox(.13,.07,.24,.03,BLACK,s*.1,.04,.5,g)});
  }else{
    [-1,1].forEach(s=>{rbox(.16,legH,.17,.05,skirt?S:PA,s*.1,legH/2,0,g);rbox(.16,.07,.26,.03,BLACK,s*.1,.035,.04,g)});
    if(skirt){const sk=mesh(new THREE.CylinderGeometry(.2,.27,.32,12),PA,0,.8,0,g);sk.castShadow=true}
  }
  const ty=seated?.48+.3:legH+.28;
  const torso=rbox(.46,.58,.28,.08,JA||SH,0,ty+(seated?0:0),0,g);
  if(JA){rbox(.2,.5,.02,.01,SH,0,ty+.02,.145,g)}
  if(apron){rbox(.4,.5,.02,.01,mat(apron,.8),0,ty-.08,.15,g);}
  if(tie){box(.05,.26,.015,mat(tie,.7),0,ty+.12,.158,g)}
  [-1,1].forEach(s=>{const a=rbox(.11,.5,.12,.045,JA||SH,s*.3,ty-.02,0,g);a.rotation.z=s*.08;sph(.055,S,s*.32,ty-.3,0,g)});
  cyl(.06,.07,.1,10,S,0,ty+.34,0,g);
  const head=sph(.14,S,0,ty+.5,0,g,18,14);head.scale.set(1,1.08,1);
  [-1,1].forEach(s=>{sph(.018,BLACK,s*.05,ty+.52,.125,g,6,6)});
  box(.07,.012,.01,mat(0xA3574A,.6),0,ty+.45,.135,g);
  if(hairStyle==='long'){const h=sph(.155,HA,0,ty+.53,-.02,g,16,12);h.scale.set(1,1,1.0);rbox(.3,.4,.12,.06,HA,0,ty+.34,-.12,g)}
  else if(hairStyle==='bun'){const h=sph(.15,HA,0,ty+.55,-.02,g,16,12);sph(.07,HA,0,ty+.7,-.08,g,10,8)}
  else {const h=sph(.152,HA,0,ty+.55,-.015,g,16,12);h.scale.set(1,.85,1)}
  return g}
