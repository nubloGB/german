/* Raum 1 – Restaurant „Babel“ · Schritte plus Neu B1.1 · Lektion 4 „Sprachen“ (KB 46–57) */
import {THREE,mat,box,rbox,cyl,sph,mesh,plane,canvasTex,rng,blob,WOOD,WOOD_D,WOOD_L,IRON,GOLD,CREAM,WHITE,BLACK,
  propChair,propPlant,propClock,propGlass,propBottle,propPendant,propPlate,propCandle,propPerson,propCup} from '../core.js';

const W=10,D=8,H=3.2;
const GREEN=0x2F5B4B;

function tableTop(w,d,{cloth=0xF4EFE3,h=.75}={}){
  const g=new THREE.Group();
  rbox(w,.05,d,.015,mat(WOOD_L.color.getHex(),.6),0,h,0,g);
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>box(.06,h,.06,WOOD,a*(w/2-.08),h/2,b*(d/2-.08),g));
  if(cloth!=null){const c=box(w+.12,.012,d+.12,mat(cloth,.9),0,h+.03,0,g);
    const f=box(w+.12,.28,.012,mat(cloth,.9),0,h-.1,d/2+.06,g);const f2=f.clone();f2.position.z=-d/2-.06;g.add(f2);
    const s=box(.012,.28,d+.12,mat(cloth,.9),w/2+.06,h-.1,0,g);const s2=s.clone();s2.position.x=-w/2-.06;g.add(s2)}
  return g}
function tableRound(r=.55,{cloth=0xF4EFE3,h=.75}={}){
  const g=new THREE.Group();
  cyl(.06,.09,h,10,WOOD_D,0,h/2,0,g);cyl(.28,.3,.03,16,WOOD_D,0,.015,0,g);
  cyl(r,r,.05,28,mat(WOOD_L.color.getHex(),.6),0,h,0,g);
  const c=cyl(r+.06,r+.06,.012,28,mat(cloth,.9),0,h+.03,0,g);
  const sk=mesh(new THREE.CylinderGeometry(r+.06,r+.14,.34,28,1,true),mat(cloth,.95,0,{side:THREE.DoubleSide}),0,h-.14,0,g);
  return g}
function seat(g,x,z,ry,col){const c=propChair({seat:col});c.position.set(x,0,z);c.rotation.y=ry;g.add(c);return c}

function mapTex(){
  return canvasTex(1024,560,(c,w,h)=>{
    c.fillStyle='#F2E8D2';c.fillRect(0,0,w,h);
    c.fillStyle='#CFE0E4';c.fillRect(24,24,w-48,h-48);
    const land='#9DB79B';c.fillStyle=land;
    const poly=(pts)=>{c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill()};
    poly([[130,110],[250,80],[330,100],[360,160],[330,220],[300,270],[260,300],[220,250],[170,230],[130,170]]); // N-America
    poly([[290,310],[350,300],[390,350],[370,430],[330,500],[300,430],[280,360]]);                        // S-America
    poly([[470,120],[560,95],[620,110],[600,160],[540,175],[500,170]]);                                    // Europe
    poly([[480,200],[580,190],[640,250],[620,340],[570,430],[530,420],[500,330],[470,260]]);               // Africa
    poly([[620,100],[760,70],[900,100],[930,170],[880,240],[800,260],[740,330],[690,260],[640,200]]);       // Asia
    poly([[800,380],[890,370],[920,430],[860,460],[810,430]]);                                             // Australia
    c.strokeStyle='rgba(60,90,80,.35)';c.lineWidth=2;for(let x=120;x<w-100;x+=110){c.beginPath();c.moveTo(x,34);c.lineTo(x,h-34);c.stroke()}
    for(let y=100;y<h-60;y+=100){c.beginPath();c.moveTo(34,y);c.lineTo(w-34,y);c.stroke()}
    const bub=(x,y,t,col)=>{c.font='700 26px Inter,sans-serif';const tw=c.measureText(t).width+26;
      c.fillStyle='#fff';c.strokeStyle=col;c.lineWidth=4;c.beginPath();c.roundRect(x-tw/2,y-44,tw,38,14);c.fill();c.stroke();
      c.beginPath();c.moveTo(x-6,y-6);c.lineTo(x,y+6);c.lineTo(x+6,y-6);c.closePath();c.fillStyle='#fff';c.fill();c.stroke();
      c.fillStyle=col;c.textAlign='center';c.textBaseline='middle';c.fillText(t,x,y-25);
      c.beginPath();c.arc(x,y+10,7,0,7);c.fillStyle=col;c.fill()};
    bub(520,150,'Hallo','#2F6FDE');bub(560,120,'','#fff');
    bub(595,185,'Cześć','#DE4338');bub(250,160,'Hello','#2EA05A');bub(340,360,'Hola','#B4561F');
    bub(540,300,'Salut','#6B4FA0');bub(830,170,'你好','#C23B2E');bub(700,230,'Merhaba','#1F7A8C');bub(860,410,"G'day",'#2F5B4B');
    c.fillStyle='#2F5B4B';c.font='800 30px Inter,sans-serif';c.textAlign='left';c.fillText('Sprachen der Welt',44,64);
  })}

function boardTex(){
  return canvasTex(768,512,(c,w,h)=>{
    c.fillStyle='#24362F';c.fillRect(0,0,w,h);
    const R=rng(4);c.globalAlpha=.06;for(let i=0;i<260;i++){c.fillStyle='#fff';c.fillRect(R()*w,R()*h,40+R()*120,2)}c.globalAlpha=1;
    c.fillStyle='#F4EEDC';c.textAlign='center';
    c.font='700 54px "Fraunces",Georgia,serif';c.fillText('Heute auf der Karte',w/2,86);
    c.strokeStyle='rgba(244,238,220,.7)';c.lineWidth=3;c.beginPath();c.moveTo(150,108);c.lineTo(w-150,108);c.stroke();
    c.font='600 40px Inter,sans-serif';c.textAlign='left';
    const rows=[['Kürbissuppe','zupa dyniowa'],['Gulasch','gulasz'],['Spaghetti','makaron'],['Apfelstrudel','szarlotka']];
    rows.forEach((r,i)=>{const y=190+i*86;c.fillStyle='#F4EEDC';c.fillText(r[0],70,y);c.fillStyle='#E9C86B';c.font='500 30px Inter,sans-serif';c.fillText(r[1],70,y+36);c.font='600 40px Inter,sans-serif';
      c.fillStyle='#F4EEDC';c.textAlign='right';c.fillText(['8.50','14.–','12.50','6.–'][i],w-70,y);c.textAlign='left'});
  })}

function menuTex(){
  return canvasTex(256,360,(c,w,h)=>{
    c.fillStyle='#F7F0DF';c.fillRect(0,0,w,h);c.strokeStyle='#8A5732';c.lineWidth=6;c.strokeRect(10,10,w-20,h-20);
    c.fillStyle='#2F5B4B';c.textAlign='center';c.font='700 34px Georgia,serif';c.fillText('Speisekarte',w/2,70);
    c.fillStyle='#8A5732';c.fillRect(60,86,w-120,3);
    c.fillStyle='#3a3a3a';c.font='500 20px Inter,sans-serif';c.textAlign='left';
    ['Suppe','Gulasch','Pasta','Salat','Strudel','Kaffee'].forEach((t,i)=>{c.fillText(t,34,130+i*34);c.fillRect(120,126+i*34,w-170,1.5);c.textAlign='right';c.fillText(['8','14','12','9','6','4'][i],w-30,130+i*34);c.textAlign='left'});
  })}
function receiptTex(){
  return canvasTex(256,360,(c,w,h)=>{
    c.fillStyle='#FFFFFF';c.fillRect(0,0,w,h);c.fillStyle='#222';c.font='700 30px Inter,sans-serif';c.textAlign='center';c.fillText('RECHNUNG',w/2,48);
    c.font='500 20px Inter,sans-serif';c.textAlign='left';const L=[['2 × Suppe','17.00'],['1 × Gulasch','14.00'],['2 × Wasser','8.00'],['Summe','39.00']];
    L.forEach((r,i)=>{const y=100+i*34;c.fillText(r[0],26,y);c.textAlign='right';c.fillText(r[1],w-26,y);c.textAlign='left'});
    c.fillRect(26,236,w-52,2);c.font='700 22px Inter,sans-serif';c.fillText('inkl. 19 % MwSt.',26,276);c.font='500 16px Inter,sans-serif';c.fillStyle='#777';c.fillText('Vielen Dank für Ihren Besuch!',26,322);
  })}

/* ---------- object builders ---------- */
function bMenu(){
  const g=new THREE.Group();
  const t=menuTex();const pm=mat(0xFFFFFF,.8);
  for(const s of [-1,1]){const p=new THREE.Mesh(new THREE.BoxGeometry(.2,.28,.012),[pm,pm,pm,pm,new THREE.MeshStandardMaterial({map:t,roughness:.8}),new THREE.MeshStandardMaterial({color:0xF1E6CC,roughness:.8})]);
    p.position.set(0,.15,s*.05);p.rotation.x=-s*.26;p.castShadow=true;g.add(p);if(s<0)p.rotation.y=Math.PI}
  return g}
function bWaiter(){
  const g=new THREE.Group();
  const p=propPerson({shirt:0xF4F2EC,pants:0x1F2024,apron:0x23312B,tie:0xB5483B,hair:0x3A2A20});g.add(p);
  const tray=cyl(.2,.2,.015,20,mat(0xB9BEC4,.3,.7),.3,1.02,.25,g);
  const gl=propGlass();gl.scale.setScalar(1.5);gl.position.set(.33,1.03,.25);g.add(gl);
  const gl2=propGlass();gl2.scale.setScalar(1.5);gl2.position.set(.24,1.03,.31);g.add(gl2);
  blob(g,.9,.9,0,0);return g}
function bBoard(){
  const g=new THREE.Group();
  box(1.4,1.0,.05,WOOD_D,0,0,0,g);
  const b=new THREE.Mesh(new THREE.PlaneGeometry(1.26,.86),new THREE.MeshStandardMaterial({map:boardTex(),roughness:.95}));b.position.z=.027;g.add(b);
  box(1.3,.03,.08,WOOD,0,-.45,.06,g);
  return g}
function bBill(){
  const g=new THREE.Group();
  rbox(.34,.02,.25,.01,mat(0x2A2220,.7),0,.012,0,g);
  const pm=mat(0xFFFFFF,.8);
  const r=new THREE.Mesh(new THREE.BoxGeometry(.16,.006,.22),[pm,pm,new THREE.MeshStandardMaterial({map:receiptTex(),roughness:.9}),pm,pm,pm]);r.position.set(-.05,.03,0);r.rotation.y=.12;r.castShadow=true;g.add(r);
  cyl(.022,.022,.004,12,GOLD,.1,.027,.05,g);cyl(.022,.022,.004,12,mat(0xC9CDD2,.3,.8),.12,.027,.08,g);
  const pen=cyl(.006,.006,.14,6,BLACK,.1,.03,-.06,g);pen.rotation.z=Math.PI/2;pen.rotation.y=.5;
  return g}
function bTable(){
  const g=new THREE.Group();
  g.add(tableTop(1.8,.9));
  // reserved sign
  const sg=new THREE.Group();sg.position.set(0,.8,0);g.add(sg);
  const tex=canvasTex(256,160,(c,w,h)=>{c.fillStyle='#F7F0DF';c.fillRect(0,0,w,h);c.strokeStyle='#B5483B';c.lineWidth=8;c.strokeRect(8,8,w-16,h-16);c.fillStyle='#B5483B';c.font='800 44px Inter,sans-serif';c.textAlign='center';c.fillText('Reserviert',w/2,78);c.font='500 22px Inter,sans-serif';c.fillStyle='#555';c.fillText('Geburtstagsfeier',w/2,120)});
  const pm=mat(0xFFFFFF,.8);
  const pl=new THREE.Mesh(new THREE.BoxGeometry(.22,.14,.01),[pm,pm,pm,pm,new THREE.MeshStandardMaterial({map:tex,roughness:.8}),pm]);pl.position.set(0,.07,0);pl.rotation.x=-.18;pl.castShadow=true;sg.add(pl);
  [[-.55,-.2],[.55,-.2],[-.55,.2],[.55,.2]].forEach(([x,z])=>{const p=propPlate();p.position.set(x,.8,z);g.add(p);const gl=propGlass();gl.position.set(x+.15,.8,z-.06);g.add(gl)});
  const c=propCandle();c.position.set(.0,.8,.25);g.add(c);
  const v=cyl(.045,.04,.14,10,mat(0x8FB0C9,.4),-.25,.88,.0,g);
  [[.0,.14,0xE2B04A],[.03,.17,0xDE4338],[-.03,.16,0xF4F2EC]].forEach(([dx,dy,c2])=>sph(.03,mat(c2,.8),-.25+dx,.97+dy*.3,dx*.4,g,8,6));
  blob(g,2.6,1.6,0,0,.7);
  return g}
function bTableB(){const g=new THREE.Group();g.add(tableRound(.55));blob(g,2.2,2.2,0,0,.7);return g}
function bTableC(){const g=new THREE.Group();g.add(tableTop(1.2,.8));const p=propPlate();p.position.set(-.3,.8,0);g.add(p);const p2=propPlate();p2.position.set(.3,.8,0);g.add(p2);const c=propCandle();c.position.set(0,.8,0);g.add(c);blob(g,2,1.6,0,0,.65);return g}
function bTableD(){const g=new THREE.Group();g.add(tableTop(1.2,.8,{cloth:0xE9DDC2}));const p=propPlate(0xF7F4EC,'soup');p.position.set(-.34,.8,0);g.add(p);const c=propCup();c.position.set(.2,.8,.2);g.add(c);blob(g,2,1.6,0,0,.65);return g}
function bChairs(){
  const g=new THREE.Group();
  const cols=[0xD6A24A,0xC4673F,0xD6A24A,0x8FA9A0];
  seat(g,-.45,-.72,0,cols[0]);seat(g,.45,-.72,0,cols[1]);seat(g,-.45,.72,Math.PI,cols[2]);seat(g,.45,.72,Math.PI,cols[3]);
  return g}
function bBar(){
  const g=new THREE.Group();
  const L=3.5;
  box(.7,1.0,L,mat(0x2F5B4B,.7),0,.5,0,g);
  for(let i=0;i<7;i++)box(.02,.7,.4,mat(0x244A3C,.7),-.356,.52,-L/2+.3+i*.5,g);
  rbox(.84,.07,L+.1,.02,mat(0xB98A56,.5),-.02,1.03,0,g);
  box(.08,.04,L,GOLD,-.4,.2,0,g).castShadow=false;
  // till
  rbox(.34,.12,.3,.02,mat(0x2A2C31,.5,.4),-.02,1.13,-.9,g);
  const sc=box(.26,.1,.01,mat(0x9ED9C9,.4),-.02,1.27,-.95,g);sc.rotation.x=-.4;
  box(.3,.03,.2,mat(0xC9CDD2,.3,.8),-.02,1.2,-.84,g);
  // espresso machine
  rbox(.38,.3,.3,.04,mat(0xC9CDD2,.3,.8),0,1.2,.9,g);cyl(.03,.03,.1,8,IRON,-.1,1.04+.07,1.05,g);
  [-1,1].forEach(s=>cyl(.04,.035,.06,10,mat(0xF1E9D6,.6),.0,1.082,.5+s*.1,g));
  // back shelves
  [1.25,1.65,2.05].forEach(y=>box(.28,.04,3.3,WOOD,.62,y,0,g));
  box(.04,1.1,3.3,WOOD_D,.78,1.6,0,g);
  const R=rng(9);const cols=[0x2F6A4A,0xB5483B,0x3E6B8C,0xE2B04A,0x6B4FA0,0x8FA9A0,0x7A4B2A];
  [1.27,1.67,2.07].forEach((y,ri)=>{for(let i=0;i<14;i++){const b=propBottle(cols[Math.floor(R()*cols.length)]);b.scale.setScalar(.85+R()*.3);b.position.set(.64,y+.02,-1.5+i*.23+R()*.04);g.add(b)}});
  blob(g,1.7,L+.4,.1,0,.6);
  return g}
function bStools(){
  const g=new THREE.Group();
  [-1.1,-.2,.7].forEach(z=>{const s=new THREE.Group();s.position.set(0,0,z);
    cyl(.17,.17,.06,16,mat(0xC4673F,.8),0,.72,0,s);cyl(.025,.025,.7,8,IRON,0,.36,0,s);cyl(.2,.2,.02,16,IRON,0,.01,0,s);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.14,.01,6,16),IRON.clone());ring.rotation.x=Math.PI/2;ring.position.y=.28;s.add(ring);g.add(s)});
  return g}
function bLamp(){
  const g=new THREE.Group();const p=propPendant({shade:0xF7C46E,cord:H-2.15,r:.34});p.position.y=H;g.add(p);return g}
function bPlant(){return propPlant({h:1.05})}
function bGlass(){
  const g=new THREE.Group();
  const a=propGlass();a.scale.setScalar(1.7);g.add(a);
  const b=propGlass();b.scale.setScalar(1.7);b.position.set(.16,0,.06);g.add(b);
  const bo=propBottle(0x3E6B8C);bo.scale.setScalar(1.2);bo.position.set(-.12,0,-.05);g.add(bo);
  return g}
function bWindow(){
  const g=new THREE.Group();const FR=mat(0xF7F2E7,.7);
  const z0=-2.2,z1=.8,y0=1.05,y1=2.5;const w=z1-z0,h=y1-y0,c=(z0+z1)/2;
  // local: window on left wall, group rotated so +x of group = world +z? we build in group-space with face toward +x
  const f=(bw,bh,bd,x,y,zz)=>box(bd,bh,bw,FR,x,y,zz,g);
  f(w+.16,.07,.05,0,y1+.035,c);f(w+.16,.07,.05,0,y0-.035,c);f(.08,h,.05,0,(y0+y1)/2,z0-.04);f(.08,h,.05,0,(y0+y1)/2,z1+.04);
  box(.26,.05,w+.3,FR,.1,y0-.07,c,g);
  const glass=new THREE.MeshStandardMaterial({color:0xCFE6F5,roughness:.1,transparent:true,opacity:.18,side:THREE.DoubleSide,depthWrite:false});
  const gl=new THREE.Mesh(new THREE.PlaneGeometry(w,h),glass);gl.rotation.y=Math.PI/2;gl.position.set(0,(y0+y1)/2,c);gl.userData.glass=true;g.add(gl);
  f(.04,h,.04,0,(y0+y1)/2,c);f(w,.04,.04,0,(y0+y1)/2,c);
  const CUR=mat(0xB5483B,.95);
  box(.04,.04,w+1.0,GOLD,.14,2.7,c,g);
  const curt=(a,b)=>{const n=9,sw=(b-a)/n;for(let i=0;i<n;i++){const ch=2.0-Math.sin(i*1.7)*.03;box(.05+(i%2?.04:0),ch,sw*.95,CUR,.15+(i%2?.04:0),2.68-ch/2,a+sw*(i+.5),g)}};
  curt(z0-.5,z0+.1);curt(z1-.1,z1+.5);
  return g}
function bWorldmap(){
  const g=new THREE.Group();
  box(2.5,1.5,.05,WOOD_D,0,0,0,g);
  const p=new THREE.Mesh(new THREE.PlaneGeometry(2.38,1.38),new THREE.MeshStandardMaterial({map:mapTex(),roughness:.9}));p.position.z=.027;g.add(p);
  return g}
function bClock(){return propClock(.27,8,15)}

export default {
  id:'restaurant',
  name:'Restaurant „Babel“',
  title:'Restaurant',
  chapter:4,
  chapterName:'Sprachen',
  bookRef:'Schritte plus Neu B1.1 · Lektion 4 · KB 46–57',
  pl:'restauracja „Babel” · lekcja 4',
  blurb:'Konjunktiv II, wegen + Genitiv, Gründe & Folgen, höflich nachfragen',
  blurbPl:'tryb przypuszczający, wegen + dopełniacz, przyczyny i skutki, grzeczne dopytywanie',
  W,D,H,
  size:'10 × 8 m',
  story:['Du bist Gast im mehrsprachigen Restaurant „Babel“. Die Tür ist verschlossen – löse die Aufgaben an den Gegenständen (Kapitel 4: höflich fragen, absagen, Gründe, wegen …) und finde den Türcode.','Jesteś gościem wielojęzycznej restauracji „Babel”. Drzwi są zamknięte – rozwiązuj zadania z rozdziału 4 przy przedmiotach i odkryj kod.'],
  door:{x0:3.0,x1:4.1,h:2.15,wall:'back'},
  windows:[{wall:'left',c:-.7,w:3.0,y0:1.05,y1:2.5}],
  start:{x:-1.2,z:3.0,yaw:0},
  code:[4,8,2,6],
  theme:{
    wallBack:0xEADFC9,wallSide:0xEFE3CC,wainscot:GREEN,wainscotH:1.0,rail:0xD9C7A0,base:0xF3EBDA,ceiling:0xF3EAD8,
    floor:(g,w,h)=>{const rows=26,rh=h/rows,R=rng(11);g.fillStyle='#3a2415';g.fillRect(0,0,w,h);
      for(let r=0;r<rows;r++){let x=-R()*520;while(x<w){const len=420+R()*520;const l=38+R()*10,hh=24+R()*8,s=34+R()*10;
        g.fillStyle=`hsl(${hh} ${s}% ${l}%)`;g.fillRect(x+2,r*rh+2,len-4,rh-4);g.globalAlpha=.16;g.strokeStyle='#3a1f10';g.lineWidth=1.4;
        for(let k=0;k<4;k++){const y=r*rh+5+R()*(rh-10);g.beginPath();g.moveTo(x+6,y);g.bezierCurveTo(x+len*.3,y+R()*4-2,x+len*.6,y+R()*4-2,x+len-6,y+R()*3);g.stroke()}
        g.globalAlpha=1;x+=len}}},
    sun:{pos:[-7,8,1],color:0xFFD7A3,intensity:2.2},hemi:[0xFFF1DC,0x8A6A4C,1.0],fill:[0xCFDDFF,.55],
    bg:['#F7F0E3','#E8DCC7','#CFC0A8'],
    outside:{wall:'left',draw:(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#1F2E52');gr.addColorStop(.6,'#5F77A3');gr.addColorStop(1,'#C9A98C');g.fillStyle=gr;g.fillRect(0,0,w,h);
      const R=rng(5);for(let i=0;i<22;i++){g.fillStyle='rgba(255,214,140,.9)';g.fillRect(R()*w,h*.55+R()*h*.4,3,3)}g.fillStyle='#232B3E';for(let i=0;i<10;i++){const bw=24+R()*34,bh=30+R()*90;g.fillRect(i*30-6,h-bh,bw,bh)}}}
  },
  lights:[{pos:[.6,2.0,.45],color:0xFFB25E,i:7,d:7},{pos:[-2.6,2.0,-1.5],color:0xFFB25E,i:6,d:7},{pos:[2.2,2.0,2.0],color:0xFFB25E,i:5,d:7},{pos:[4.0,2.2,-1.1],color:0xFFC77A,i:4,d:6}],
  /* decor (not clickable), colliders given explicitly */
  decor(add){
    const pend=(x,z)=>{const p=propPendant({shade:0xE9D8B4,cord:H-2.2,r:.26});p.position.set(x,H,z);add(p)};
    pend(-2.6,-1.5);pend(2.2,2.0);
    const tc=bTableC();tc.position.set(-2.6,0,2.0);add(tc);
    const sc=new THREE.Group();sc.position.set(-2.6,0,2.0);seat(sc,-.0,-.7,0,0x8FA9A0);seat(sc,0,.7,Math.PI,0xD6A24A);add(sc);
    const tb=bTableB();tb.position.set(.6,0,.45);add(tb);
    const cb=new THREE.Group();cb.position.set(.6,0,.45);seat(cb,.0,-.85,0,0xC4673F);seat(cb,.75,.45,-Math.PI/2-.4,0xD6A24A);seat(cb,-.75,.4,Math.PI/2+.4,0x8FA9A0);add(cb);
    const td=bTableD();td.position.set(2.2,0,2.0);add(td);
    const cd=new THREE.Group();cd.position.set(2.2,0,2.0);seat(cd,.3,-.7,0,0x8FA9A0);seat(cd,-.3,.7,Math.PI,0xC4673F);add(cd);
    const pl2=propPlant({h:.9,leaf:0x4B9560});pl2.position.set(4.45,0,3.35);add(pl2);
    // rug under entrance & wall details
    const rug=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.2),new THREE.MeshStandardMaterial({color:0x7A2F27,roughness:1}));rug.rotation.x=-Math.PI/2;rug.position.set(3.5,.012,-3.2);rug.receiveShadow=true;add(rug);
    // coat rack by the door
    const cr=new THREE.Group();cyl(.03,.04,1.7,8,WOOD_D,0,.85,0,cr);cyl(.18,.2,.04,12,WOOD_D,0,.02,0,cr);[0,1,2,3].forEach(i=>{const a=i*Math.PI/2;const h=cyl(.012,.012,.16,6,GOLD,Math.cos(a)*.08,1.62,Math.sin(a)*.08,cr);h.rotation.z=Math.cos(a)*1.0;h.rotation.x=-Math.sin(a)*1.0});
    const coat=rbox(.3,.7,.1,.04,mat(0x3E6B8C,.9),.1,1.28,0,cr);cr.position.set(2.45,0,-3.55);add(cr);
    // menu board near the bar? chalk A-frame
    // framed pictures
    const fr=(x,y,col)=>{const f=new THREE.Group();box(.5,.62,.04,WOOD_D,0,0,0,f);const p=new THREE.Mesh(new THREE.PlaneGeometry(.4,.52),new THREE.MeshStandardMaterial({color:col,roughness:.9}));p.position.z=.022;f.add(p);f.position.set(x,y,-D/2+.03);add(f)};
    fr(-4.1,1.75,0xE9C86B);fr(-4.1+0,1.75,0xE9C86B);
  },
  colliders:[
    [-3.55,-1.65,-2.5,-.5],      // table A + chairs
    [-.35,1.55,-.5,1.45],        // table B
    [-3.35,-1.85,1.3,2.7],       // table C
    [1.55,2.85,1.25,2.75],       // table D
    [3.35,4.95,-2.85,.75],       // bar + stools
    [-1.0,-.2,-3.05,-2.35],      // waiter
    [-4.9,-4.1,-3.95,-3.2],      // plant
    [4.1,4.9,2.95,3.9],          // plant 2
    [2.2,2.7,-3.9,-3.3],         // coat rack
  ],
  objects:[
    {id:'door',de:'Tür',art:'die',pl:'drzwi',kind:'door',anc:[3.55,2.45,-3.85],look:[3.55,1.1,-4],flat:true},
    {id:'menu',de:'Speisekarte',art:'die',pl:'karta dań',build:bMenu,pos:[.6,.78,.45],ry:.2,anc:[.6,1.15,.45],look:[.6,.95,.45],clue:0,
      hintTxt:'Auf dem runden Tisch steht etwas zum Lesen …',
      words:[{de:'Speisekarte',art:'die',pl:'karta dań'},{de:'Gericht',art:'das',pl:'danie',plu:'die Gerichte'},{de:'Vorschlag',art:'der',pl:'propozycja',plu:'die Vorschläge'}],
      task:{type:'choice',tag:'Höflich bitten · Konjunktiv II',src:'KB 50 (C2) · Test Teil 3',
        ctx:['Du möchtest bestellen, hast aber noch keine Speisekarte.','Chcesz zamówić, ale nie masz jeszcze karty dań.'],
        prompt:'Entschuldigung, ___ Sie mir bitte die Speisekarte bringen?',sub:'Przepraszam, czy mógłby Pan przynieść mi kartę dań?',
        options:['könnten','konnten','könnte','kannst'],ans:'könnten',
        hint:'Grzecznie = Konjunktiv II. Sie → könnten (nie „konnten” = czas przeszły).',
        explain:'<b>Könnten Sie …?</b> – Konjunktiv II brzmi grzeczniej niż „Können Sie …?”. <i>konnten</i> to czas przeszły (Präteritum).'}},
    {id:'waiter',de:'Kellner',art:'der',pl:'kelner',build:bWaiter,pos:[-.6,0,-2.7],ry:0,anc:[-.6,1.95,-2.7],look:[-.6,1.25,-2.7],clue:1,
      hintTxt:'Jemand trägt Gläser und spricht sehr schnell …',
      words:[{de:'Kellner',art:'der',pl:'kelner'},{de:'Ausdruck',art:'der',pl:'wyrażenie',plu:'die Ausdrücke'},{de:'Kompliment',art:'das',pl:'komplement',plu:'die Komplimente'}],
      task:{type:'choice',ab:true,tag:'Höflich nachfragen · A oder B?',src:'KB 50 (C1b)',
        ctx:['Der Kellner spricht sehr schnell. Du hast ihn nicht verstanden.','Kelner mówi bardzo szybko. Nie zrozumiałeś go.'],
        prompt:'Welche Bitte ist höflicher?',sub:'Która prośba jest grzeczniejsza?',
        options:['Sagen Sie das noch mal.','Könnten Sie das bitte wiederholen?'],ans:'Könnten Sie das bitte wiederholen?',
        hint:'Szukaj: Könnten Sie … bitte …? – Konjunktiv II + bitte.',
        explain:'<b>Könnten Sie das bitte wiederholen?</b> – grzecznie: Konjunktiv II + <i>bitte</i>. „Sagen Sie das noch mal.” to rozkaz.'}},
    {id:'board',de:'Tafel',art:'die',pl:'tablica',build:bBoard,pos:[1.7,1.7,-D/2+.03],ry:0,anc:[1.7,2.35,-3.8],look:[1.7,1.7,-4],flat:true,clue:2,
      hintTxt:'An der Wand steht das Tagesgericht – auf Deutsch und Polnisch …',
      words:[{de:'Tafel',art:'die',pl:'tablica'},{de:'Tipp',art:'der',pl:'wskazówka',plu:'die Tipps'},{de:'Kärtchen',art:'das',pl:'karteczka',plu:'die Kärtchen'}],
      task:{type:'gaps',tag:'Gründe & Folgen · weil / deshalb / denn',src:'KB 49 (B2c, B3)',
        ctx:['Auf der Tafel steht: „Heute: Kürbissuppe“. Du hast großen Hunger.','Na tablicy: „Dziś: zupa dyniowa”. Jesteś bardzo głodny.'],
        prompt:'Warum nimmst du die Suppe?',sub:'Dlaczego bierzesz zupę? Uzupełnij zdanie.',
        tpl:'Ich nehme die Suppe, {} ich Hunger {}.',bank:['deshalb','habe','weil','denn'],ans:['weil','habe'],
        hint:'„weil” wysyła czasownik na sam koniec: …, weil ich Hunger habe.',
        explain:'<b>…, weil ich Hunger habe.</b> – po <i>weil</i> czasownik stoi na końcu. (deshalb → czasownik na 2. miejscu; denn → szyk zwykły.)'}},
    {id:'bill',de:'Rechnung',art:'die',pl:'rachunek',build:bBill,pos:[2.2,.78,2.0],ry:-.3,anc:[2.2,1.15,2.0],look:[2.2,.82,2.0],clue:3,
      hintTxt:'Am Ende des Essens liegt etwas in einer Mappe auf dem Tisch …',
      words:[{de:'Rechnung',art:'die',pl:'rachunek',plu:'die Rechnungen'},{de:'Abkürzung',art:'die',pl:'skrót',plu:'die Abkürzungen'},{de:'Bedeutung',art:'die',pl:'znaczenie',plu:'die Bedeutungen'}],
      task:{type:'choice',tag:'Abkürzungen · Zwischendurch',src:'KB 56 (Abkürzungsspiel)',
        ctx:['Auf der Rechnung steht: „inkl. 19 % MwSt.“','Na rachunku: „w tym 19 % MwSt.”'],
        prompt:'MwSt. ist die …',sub:'Co oznacza ten skrót?',
        options:['Mehrwertsteuer','Monatsstunde','Mittwochsteuer','Mietwohnungssteuer'],ans:'Mehrwertsteuer',
        hint:'To podatek, który płacisz przy każdym zakupie: VAT.',
        explain:'<b>MwSt. = Mehrwertsteuer</b> (VAT). Inne skróty z KB 56: z.B. = zum Beispiel, usw. = und so weiter, MfG = Mit freundlichen Grüßen.'}},
    {id:'table',de:'Tisch',art:'der',pl:'stół',build:bTable,pos:[-2.6,0,-1.5],ry:0,anc:[-2.6,1.4,-1.5],look:[-2.6,.9,-1.5],
      hintTxt:'Ein Tisch trägt ein rotes Schild …',
      words:[{de:'Tisch',art:'der',pl:'stół',plu:'die Tische'},{de:'Termin',art:'der',pl:'termin',plu:'die Termine'},{de:'Einladung',art:'die',pl:'zaproszenie',plu:'die Einladungen'}],
      task:{type:'choice',tag:'wegen + Genitiv',src:'KB 49 (B1), KB 54 (Grammatik 2)',
        ctx:['Auf dem Tisch steht ein Schild: „Reserviert – Geburtstagsfeier“.','Na stole stoi tabliczka: „Zarezerwowane – urodziny”.'],
        prompt:'Warum ist der Tisch reserviert? Antworten Sie mit wegen. (→ der Geburtstag)',sub:'Dlaczego stół jest zarezerwowany? Odpowiedz z „wegen”.',
        options:['Wegen des Geburtstags.','Wegen der Geburtstag.','Wegen die Geburtstag.','Wegen den Geburtstag.'],ans:'Wegen des Geburtstags.',
        hint:'wegen + Genitiv. der Geburtstag (m.) → des Geburtstags.',
        explain:'<b>wegen des Geburtstags</b> – wegen + dopełniacz; rodzaj męski: <i>des</i> + końcówka -s. (Dla f.: wegen der Feier.)'}},
    {id:'worldmap',de:'Weltkarte',art:'die',pl:'mapa świata',build:bWorldmap,pos:[-2.0,1.75,-D/2+.03],ry:0,anc:[-2.0,2.7,-3.8],look:[-2.0,1.75,-4],flat:true,
      hintTxt:'Eine große Karte mit vielen „Hallo“ in vielen Sprachen …',
      words:[{de:'Weltkarte',art:'die',pl:'mapa świata'},{de:'Sprache',art:'die',pl:'język',plu:'die Sprachen'},{de:'Muttersprache',art:'die',pl:'język ojczysty',plu:'die Muttersprachen'},{de:'Fremdsprache',art:'die',pl:'język obcy',plu:'die Fremdsprachen'}],
      task:{type:'choice',tag:'Wortschatz · Sprachen',src:'KB 51–53 · Test Teil 1',
        ctx:['Auf der Karte stecken Fähnchen und „Hallo“ in vielen Sprachen.','Na mapie są chorągiewki i „cześć” w wielu językach.'],
        prompt:'Wer von klein auf zwei Sprachen spricht, ist …',sub:'Kto od dziecka mówi dwoma językami, jest …',
        options:['zweisprachig','ausländisch','fremdsprachig','einsprachig'],ans:'zweisprachig',
        hint:'zwei Sprachen = zwei-sprachig.',
        explain:'<b>zweisprachig</b> = dwujęzyczny. einsprachig = jednojęzyczny. Mehrsprachigkeit = wielojęzyczność.'}},
    {id:'bar',de:'Theke',art:'die',pl:'lada barowa',build:bBar,pos:[4.35,0,-1.1],ry:0,anc:[4.2,1.6,-.4],look:[4.2,1.1,-1.1],
      hintTxt:'Hinter der Theke stehen viele Flaschen und eine Kasse …',
      words:[{de:'Theke',art:'die',pl:'lada barowa'},{de:'Sprachkurs',art:'der',pl:'kurs językowy',plu:'die Sprachkurse'},{de:'nachfragen',art:'',pl:'dopytać, zapytać'}],
      task:{type:'order',tag:'Höflich nachfragen · Satz bauen',src:'KB 50 (C2) · Test Teil 3 (Ordnen)',
        ctx:['Du stehst an der Theke und suchst die Toilette. Du fragst höflich.','Stoisz przy ladzie i szukasz toalety. Pytasz grzecznie.'],
        prompt:'Ułóż zdanie: „Czy może mi Pan powiedzieć, gdzie jest toaleta?”',sub:'Kliknij słowa we właściwej kolejności.',
        words:['die','Sie','ist?','wo','Toilette','mir','Können','sagen,'],ans:'Können Sie mir sagen, wo die Toilette ist?',
        hint:'Pytanie główne: Können Sie mir sagen, … Po „wo” czasownik na końcu.',
        explain:'<b>Können Sie mir sagen, wo die Toilette ist?</b> – w zdaniu pobocznym (po <i>wo</i>) czasownik <i>ist</i> stoi na końcu.'}},
    {id:'clock',de:'Uhr',art:'die',pl:'zegar',build:bClock,pos:[1.7,2.78,-D/2+.04],ry:0,anc:[1.7,3.15,-3.8],look:[1.7,2.78,-4],flat:true,
      hintTxt:'Die Uhr zeigt kurz nach acht. Eine Einladung wartet …',
      words:[{de:'Uhr',art:'die',pl:'zegar'},{de:'Grund',art:'der',pl:'powód',plu:'die Gründe'},{de:'absagen',art:'',pl:'odwołać, odmówić'}],
      task:{type:'choice',tag:'Höflich absagen',src:'KB 48 (A3) · Test Teil 3',
        ctx:['Die Uhr zeigt Viertel nach acht. Freunde laden dich zu einer Party ein, aber du hast keine Zeit.','Zegar pokazuje 8:15. Znajomi zapraszają Cię na imprezę, ale nie masz czasu.'],
        prompt:'Vielen Dank für die Einladung! Ich wäre gern ___, aber leider habe ich keine Zeit.',sub:'Bardzo dziękuję za zaproszenie! Chętnie bym tam był, ale niestety nie mam czasu.',
        options:['dabei','darauf','davon','dafür'],ans:'dabei',
        hint:'dabei sein = być obecnym, uczestniczyć.',
        explain:'<b>Ich wäre gern dabei</b> – dabei sein = uczestniczyć. Grzeczna odmowa: podziękuj → powód → życzenia (KB 48).'}},
    {id:'window',de:'Fenster',art:'das',pl:'okno',build:bWindow,pos:[-W/2+.03,0,0],ry:0,flat:true,anc:[-4.8,2.9,-.7],look:[-4.9,1.7,-.7],
      hintTxt:'Draußen regnet es …',
      words:[{de:'Fenster',art:'das',pl:'okno'},{de:'Hitze',art:'die',pl:'upał'}],
      task:{type:'type',tag:'Irreale Bedingungen · Konjunktiv II',src:'KB 48 (A1, A4), KB 54 (Grammatik 1)',
        ctx:['Draußen regnet es. Ihr müsst drinnen sitzen.','Na zewnątrz pada. Musicie siedzieć w środku.'],
        prompt:'Wenn es nicht regnen ___, könnten wir draußen essen.',sub:'Gdyby nie padało, moglibyśmy jeść na zewnątrz. Wpisz brakujące słowo.',
        tpl:'Wenn es nicht regnen {}, könnten wir draußen essen.',ans:['würde'],
        hint:'Konjunktiv II od „werden” + bezokolicznik: würde regnen.',
        explain:'<b>Wenn es nicht regnen würde, …</b> – irreale Bedingung: <i>würde</i> + bezokolicznik (albo: Wenn es nicht so viel regnete).'}},
    {id:'chair',de:'Stuhl',art:'der',pl:'krzesło',build:bChairs,pos:[-2.6,0,-1.5],ry:0,anc:[-3.05,1.25,-2.22],look:[-3.05,.6,-2.22],
      hintTxt:'Ein Freund sitzt müde am Tisch …',
      words:[{de:'Stuhl',art:'der',pl:'krzesło',plu:'die Stühle'},{de:'Fehler',art:'der',pl:'błąd',plu:'die Fehler'}],
      task:{type:'choice',tag:'Ratschläge geben · an deiner Stelle',src:'KB 48 (A2, A4)',
        ctx:['Dein Freund sitzt müde auf dem Stuhl. Du gibst ihm einen Rat.','Twój znajomy siedzi zmęczony na krześle. Dajesz mu radę.'],
        prompt:'„Ich bin so müde.“ – „An deiner Stelle ___ ich früher ins Bett gehen.“',sub:'„Jestem taki zmęczony.” – „Na twoim miejscu poszedłbym wcześniej spać.”',
        options:['würde','wäre','hätte','wurde'],ans:'würde',
        hint:'An deiner Stelle würde ich … – klasyczna rada.',
        explain:'<b>An deiner Stelle würde ich …</b> – rada = <i>würde</i> + bezokolicznik. Albo: Du solltest …, Wenn ich du wäre, …'}},
    {id:'lamp',de:'Lampe',art:'die',pl:'lampa',build:bLamp,pos:[.6,0,.45],ry:0,anc:[.6,2.35,.45],look:[.6,2.1,.45],
      words:[{de:'Lampe',art:'die',pl:'lampa',plu:'die Lampen'}]},
    {id:'glass',de:'Glas',art:'das',pl:'szklanka',build:bGlass,pos:[.25,.8,.8],ry:.4,anc:[.3,1.12,.8],look:[.3,.88,.8],
      words:[{de:'Glas',art:'das',pl:'szklanka',plu:'die Gläser'}]},
    {id:'plant',de:'Pflanze',art:'die',pl:'roślina',build:bPlant,pos:[-4.5,0,-3.55],ry:0,anc:[-4.5,2.2,-3.55],look:[-4.5,1.2,-3.55],
      words:[{de:'Pflanze',art:'die',pl:'roślina',plu:'die Pflanzen'}]},
  ]
};
