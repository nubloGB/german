/* Raum 2 – Büro „Alpina Tech“ · Schritte plus Neu B1.1 · Lektion 5 „Eine Arbeit finden“ (KB 58–69) */
import {THREE,mat,box,rbox,cyl,sph,mesh,plane,canvasTex,rng,blob,WOOD,WOOD_D,WOOD_L,IRON,GOLD,CREAM,WHITE,BLACK,
  propChair,propOfficeChair,propPlant,propClock,propPerson,propCup} from '../core.js';

const W=9,D=7,H=3.0;
const TEAL=0x2F6F73;

function deskTop(w,d,{h=.74,top=0xF1EDE4,leg=0x2A2C31}={}){
  const g=new THREE.Group();const L=mat(leg,.5,.5);
  rbox(w,.04,d,.012,mat(top,.55),0,h,0,g);
  [-1,1].forEach(s=>{box(.04,h,d-.1,L,s*(w/2-.03),h/2,0,g)});
  box(w-.1,.34,.02,mat(0xD9D4C7,.6),0,h-.22,-d/2+.06,g);
  return g}
function textTex(w,h,draw){return canvasTex(w,h,draw)}
function bCorkboard(){
  const g=new THREE.Group();
  box(2.0,1.25,.05,WOOD_D,0,0,0,g);
  const cork=textTex(1024,640,(c,w,h)=>{const R=rng(7);c.fillStyle='#C99B66';c.fillRect(0,0,w,h);for(let i=0;i<2200;i++){c.fillStyle=`rgba(${110+R()*60},${70+R()*40},${30+R()*30},${.25+R()*.3})`;c.fillRect(R()*w,R()*h,2+R()*4,2+R()*4)}
    const paper=(x,y,pw,ph,col,rot,fn)=>{c.save();c.translate(x+pw/2,y+ph/2);c.rotate(rot);c.fillStyle='rgba(0,0,0,.18)';c.fillRect(-pw/2+5,-ph/2+6,pw,ph);c.fillStyle=col;c.fillRect(-pw/2,-ph/2,pw,ph);fn&&fn(c,pw,ph);c.fillStyle='#DE4338';c.beginPath();c.arc(0,-ph/2+12,8,0,7);c.fill();c.restore()};
    const lines=(c,pw,ph,y0,n,gap=16)=>{c.fillStyle='#9AA0A8';for(let i=0;i<n;i++)c.fillRect(-pw/2+16,y0+i*gap,pw-32-(i%3)*30,5)};
    paper(36,40,250,300,'#FFFFFF',-.04,(c,pw,ph)=>{c.fillStyle='#2F6F73';c.font='800 24px Inter,sans-serif';c.textAlign='left';c.fillText('Kassierer/in (m/w)',-pw/2+16,-ph/2+60);lines(c,pw,ph,-ph/2+90,10)});
    paper(330,34,330,340,'#FFF6C9',.03,(c,pw,ph)=>{c.fillStyle='#17181C';c.font='800 26px Inter,sans-serif';c.textAlign='left';c.fillText('Servicetechniker',-pw/2+18,-ph/2+58);c.font='600 20px Inter,sans-serif';c.fillText('für Fotovoltaik (m/w)',-pw/2+18,-ph/2+86);
      c.fillStyle='#B5483B';c.fillRect(-pw/2+18,-ph/2+104,pw-36,3);c.fillStyle='#17181C';c.font='500 21px Inter,sans-serif';c.fillText('Wir bieten: ',-pw/2+18,-ph/2+140);c.font='700 22px Inter,sans-serif';c.fillText('Die Stelle ist befristet',-pw/2+18,-ph/2+176);c.fillText('auf 3 Monate.',-pw/2+18,-ph/2+204);c.font='500 19px Inter,sans-serif';c.fillText('Berufserfahrung von Vorteil.',-pw/2+18,-ph/2+244);c.fillText('Bewerbung per E-Mail.',-pw/2+18,-ph/2+272)});
    paper(710,50,260,290,'#DDEBF7',-.05,(c,pw,ph)=>{c.fillStyle='#2F4B5E';c.font='800 24px Inter,sans-serif';c.textAlign='left';c.fillText('Altenbetreuerin',-pw/2+16,-ph/2+58);lines(c,pw,ph,-ph/2+86,9)});
    paper(70,400,250,200,'#FBE3E0',.05,(c,pw,ph)=>{c.fillStyle='#8D2A22';c.font='800 22px Inter,sans-serif';c.textAlign='left';c.fillText('Hotel Alpenblick',-pw/2+16,-ph/2+52);lines(c,pw,ph,-ph/2+80,6)});
    paper(420,420,230,190,'#E6F2E6',-.03,(c,pw,ph)=>{c.fillStyle='#14522F';c.font='800 22px Inter,sans-serif';c.textAlign='left';c.fillText('Praktikum',-pw/2+16,-ph/2+52);lines(c,pw,ph,-ph/2+80,6)});
    paper(740,380,230,220,'#FFFFFF',.04,(c,pw,ph)=>{c.fillStyle='#17181C';c.font='800 22px Inter,sans-serif';c.textAlign='left';c.fillText('Verkäufer/in',-pw/2+16,-ph/2+52);lines(c,pw,ph,-ph/2+80,7)});
  });
  const p=new THREE.Mesh(new THREE.PlaneGeometry(1.9,1.15),new THREE.MeshStandardMaterial({map:cork,roughness:1}));p.position.z=.027;g.add(p);
  return g}
function bWhiteboard(){
  const g=new THREE.Group();
  box(2.0,1.18,.04,mat(0xC9CDD2,.4,.6),0,0,0,g);
  const tex=textTex(1024,600,(c,w,h)=>{c.fillStyle='#FBFCFD';c.fillRect(0,0,w,h);c.strokeStyle='#E3E6EA';c.lineWidth=2;c.strokeRect(10,10,w-20,h-20);
    c.fillStyle='#2F6F73';c.font='800 52px Inter,sans-serif';c.textAlign='left';c.fillText('Alpina Tech',50,90);
    c.fillStyle='#17181C';c.font='700 40px Inter,sans-serif';c.fillText('Öffnungszeiten',50,170);
    c.font='600 40px Inter,sans-serif';c.fillStyle='#B5483B';c.fillText('Mo – Fr:  8 – 18 Uhr',50,235);
    c.fillStyle='#17181C';c.font='500 34px Inter,sans-serif';c.fillText('Sa / So:  geschlossen',50,290);
    c.strokeStyle='#2F6F73';c.lineWidth=5;c.beginPath();c.moveTo(540,60);c.lineTo(540,540);c.stroke();
    c.fillStyle='#17181C';c.font='700 36px Inter,sans-serif';c.fillText('Abteilungen',580,100);c.font='500 32px Inter,sans-serif';
    ['Verkauf','Technik','Personal','Kundendienst'].forEach((t,i)=>{c.fillStyle=['#2F6FDE','#2EA05A','#DE4338','#E2A12D'][i];c.beginPath();c.arc(596,152+i*62,10,0,7);c.fill();c.fillStyle='#17181C';c.fillText(t,625,164+i*62)});
    c.fillStyle='#6B6F78';c.font='500 28px Inter,sans-serif';c.fillText('Team-Meeting: Dienstag 10:00',50,420);c.fillText('Mitarbeiter: bitte pünktlich!',50,470);
  });
  const p=new THREE.Mesh(new THREE.PlaneGeometry(1.92,1.1),new THREE.MeshStandardMaterial({map:tex,roughness:.35}));p.position.z=.022;g.add(p);
  box(1.4,.035,.07,mat(0xC9CDD2,.4,.6),0,-.62,.05,g);
  [[-.4,0xDE4338],[-.3,0x2F6FDE],[-.2,0x17181C]].forEach(([x,c])=>{const m=cyl(.012,.012,.12,8,mat(c,.5),x,-.6,.07,g);m.rotation.z=Math.PI/2});
  return g}
function bCalendar(){
  const g=new THREE.Group();
  box(.6,.8,.02,mat(0xFFFFFF,.8),0,0,0,g);box(.6,.18,.022,mat(0x2F6F73,.7),0,.31,0,g);
  const tex=textTex(384,512,(c,w,h)=>{c.fillStyle='#fff';c.fillRect(0,0,w,h);c.fillStyle='#2F6F73';c.fillRect(0,0,w,100);c.textAlign='center';
    c.fillStyle='#17181C';c.font='700 28px Inter,sans-serif';
    ['Mo','Di','Mi','Do','Fr','Sa','So'].forEach((d,i)=>{c.fillStyle=i>4?'#B5483B':'#6B6F78';c.font='700 22px Inter,sans-serif';c.fillText(d,36+i*52,170)});
    for(let r=0;r<5;r++)for(let i=0;i<7;i++){const n=r*7+i-1;if(n<1||n>30)continue;const x=36+i*52,y=212+r*56;c.fillStyle=i>4?'#B5483B':'#17181C';c.font='600 24px Inter,sans-serif';
      if(n===17){c.strokeStyle='#DE4338';c.lineWidth=4;c.beginPath();c.arc(x,y-8,22,0,7);c.stroke()}
      if(n>=18&&n<=24){c.fillStyle='rgba(242,179,61,.28)';c.fillRect(x-24,y-30,48,44);c.fillStyle='#17181C'}
      c.fillText(n,x,y)}
    c.fillStyle='#fff';c.font='800 44px Inter,sans-serif';c.fillText('November',w/2,78);
    c.fillStyle='#DE4338';c.font='700 20px Inter,sans-serif';c.fillText('Vorstellungsgespräch',w/2,126);
  });
  const p=new THREE.Mesh(new THREE.PlaneGeometry(.58,.78),new THREE.MeshStandardMaterial({map:tex,roughness:.8}));p.position.z=.012;g.add(p);
  cyl(.012,.012,.5,6,IRON,0,.42,.01,g).rotation.z=Math.PI/2;
  return g}
function bComputer(){
  const g=new THREE.Group();const M=mat(0x2B2E34,.4,.5);
  box(.34,.02,.22,mat(0x9AA0A8,.4,.6),0,.01,0,g);cyl(.02,.02,.2,8,M,0,.12,-.04,g);
  const scr=box(.56,.34,.025,M,0,.34,-.06,g);scr.rotation.x=-.06;
  const tex=textTex(512,320,(c,w,h)=>{c.fillStyle='#F4F6F8';c.fillRect(0,0,w,h);c.fillStyle='#2F6F73';c.fillRect(0,0,w,34);c.fillStyle='#fff';c.font='700 18px Inter,sans-serif';c.textAlign='left';c.fillText('Neue Nachricht',14,23);
    c.fillStyle='#17181C';c.font='500 17px Inter,sans-serif';c.fillText('An:  personal@alpina-tech.ch',16,70);c.fillText('Betreff:  Bewerbung als Servicetechniker',16,100);
    c.fillStyle='#CED2D8';c.fillRect(14,114,w-28,2);
    c.fillStyle='#E2A12D';c.fillRect(16,138,w-32,34);c.fillStyle='#17181C';c.font='700 19px Inter,sans-serif';c.fillText('______________________________,',24,162);
    c.fillStyle='#6B6F78';c.font='500 17px Inter,sans-serif';['mit großem Interesse habe ich Ihre Anzeige','gelesen und bewerbe mich hiermit um','die Stelle als Servicetechniker.'].forEach((t,i)=>c.fillText(t,16,206+i*28));
    c.fillStyle='#2F6F73';c.fillRect(w-110,h-52,94,34);c.fillStyle='#fff';c.font='700 17px Inter,sans-serif';c.fillText('Senden',w-96,h-30)});
  const sc=new THREE.Mesh(new THREE.PlaneGeometry(.52,.31),new THREE.MeshBasicMaterial({map:tex,toneMapped:false}));sc.position.set(0,0,.0135);scr.add(sc);
  rbox(.4,.016,.14,.006,mat(0xDADDE2,.5),0,.012,.22,g);rbox(.06,.02,.1,.01,mat(0xDADDE2,.5),.3,.012,.22,g);
  return g}
function bPhone(){
  const g=new THREE.Group();const M=mat(0x23262B,.5,.2);
  rbox(.2,.06,.24,.02,M,0,.03,0,g);
  for(let i=0;i<12;i++)box(.028,.01,.028,mat(0xD5D8DD,.4),-.05+(i%3)*.05,.065,.02+Math.floor(i/4)*.04-.02,g);
  const hs=rbox(.07,.045,.26,.02,M,0,.1,-.0,g);hs.rotation.x=.0;
  const hs2=rbox(.07,.05,.07,.02,M,0,.075,-.115,g);const hs3=rbox(.07,.05,.07,.02,M,0,.075,.115,g);
  const led=new THREE.Mesh(new THREE.SphereGeometry(.01,8,6),new THREE.MeshBasicMaterial({color:0x4CD38A,toneMapped:false}));led.position.set(.08,.065,-.08);led.userData.noPick=true;g.add(led);
  return g}
function bPrinter(){
  const g=new THREE.Group();const B=mat(0xE9EAEC,.5);
  rbox(.55,.22,.45,.03,B,0,.11,0,g);rbox(.5,.08,.4,.02,mat(0xC9CDD2,.5),0,.26,0,g);
  box(.36,.01,.26,mat(0xFFFFFF,.8),0,.31,.1,g).rotation.x=-.25;
  const scr=box(.12,.05,.01,mat(0x2B2E34,.4),.17,.22,.226,g);box(.1,.03,.005,mat(0x9ED9C9,.3),.17,.22,.232,g);
  const out=new THREE.Mesh(new THREE.BoxGeometry(.34,.004,.22),[mat(0xFFFFFF,.8),mat(0xFFFFFF,.8),new THREE.MeshStandardMaterial({map:textTex(256,160,(c,w,h)=>{c.fillStyle='#fff';c.fillRect(0,0,w,h);c.fillStyle='#17181C';c.font='800 26px Inter,sans-serif';c.fillText('LEBENSLAUF',14,40);c.fillStyle='#9AA0A8';for(let i=0;i<6;i++)c.fillRect(14,60+i*16,w-30-(i%3)*30,5)}),roughness:.9}),mat(0xFFFFFF,.8),mat(0xFFFFFF,.8),mat(0xFFFFFF,.8)]);
  out.position.set(0,.14,.28);out.rotation.x=.12;out.castShadow=true;g.add(out);
  box(.38,.02,.1,mat(0xB9BEC4,.5),0,.12,.2,g);
  const led=new THREE.Mesh(new THREE.SphereGeometry(.01,8,6),new THREE.MeshBasicMaterial({color:0x4CD38A,toneMapped:false}));led.position.set(.23,.18,.226);led.userData.noPick=true;g.add(led);
  return g}
function bCoffee(){
  const g=new THREE.Group();const B=mat(0x2B2E34,.4,.4);
  rbox(.3,.42,.38,.03,B,0,.21,0,g);rbox(.3,.08,.38,.02,mat(0xC9CDD2,.4,.7),0,.46,0,g);
  box(.22,.03,.12,mat(0x1A1B1F,.5),0,.14,.2,g);cyl(.012,.012,.1,8,IRON,0,.3,.18,g);
  const jug=new THREE.Mesh(new THREE.CylinderGeometry(.065,.055,.14,14),new THREE.MeshStandardMaterial({color:0xDDEFF8,roughness:.1,transparent:true,opacity:.55}));jug.position.set(0,.07+.04,.2);jug.castShadow=true;g.add(jug);
  cyl(.055,.055,.06,14,mat(0x4A2C1A,.5),0,.08,.2,g);
  const led=new THREE.Mesh(new THREE.SphereGeometry(.01,8,6),new THREE.MeshBasicMaterial({color:0xDE4338,toneMapped:false}));led.position.set(.1,.4,.195);led.userData.noPick=true;g.add(led);
  [-.2,-.3].forEach((x,i)=>{const c=propCup(i?0xE2B04A:0xF1E9D6);c.position.set(x-.12,.0,.2);g.add(c)});
  return g}
function bFolder(){
  const g=new THREE.Group();
  rbox(.3,.03,.4,.01,mat(0x2F4B8C,.6),0,.016,0,g);
  const pm=mat(0xFFFFFF,.8);
  const sheet=new THREE.Mesh(new THREE.BoxGeometry(.26,.006,.34),[pm,pm,new THREE.MeshStandardMaterial({map:textTex(256,320,(c,w,h)=>{c.fillStyle='#fff';c.fillRect(0,0,w,h);c.fillStyle='#17181C';c.font='800 30px Inter,sans-serif';c.fillText('Lebenslauf',20,50);c.fillStyle='#9AA0A8';for(let i=0;i<12;i++)c.fillRect(20,76+i*18,w-40-(i%4)*28,6);c.fillStyle='#d8dde3';c.fillRect(w-90,20,70,84)}),roughness:.9}),pm,pm,pm]);sheet.position.set(.01,.04,0);sheet.rotation.y=.06;sheet.castShadow=true;g.add(sheet);
  const lab=new THREE.Mesh(new THREE.PlaneGeometry(.18,.06),new THREE.MeshBasicMaterial({map:textTex(256,86,(c,w,h)=>{c.fillStyle='#F4EFE3';c.fillRect(0,0,w,h);c.fillStyle='#2F4B8C';c.font='800 34px Inter,sans-serif';c.textAlign='center';c.fillText('Bewerbung',w/2,56)}),toneMapped:false}));lab.rotation.x=-Math.PI/2;lab.position.set(0,.0335,-.15);lab.userData.noPick=false;g.add(lab);
  return g}
function bBoss(){
  const g=new THREE.Group();
  const p=propPerson({shirt:0xF4F2EC,pants:0x34495E,jacket:0x34495E,hairStyle:'bun',hair:0x4A3224,skin:0xD9A37F,seated:true});g.add(p);
  return g}
function bDesk(){const g=new THREE.Group();g.add(deskTop(1.6,.75));
  const l=mesh(new THREE.CylinderGeometry(.05,.06,.32,12),mat(0xD9722A,.6),-.6,.92,-.1,g);
  const nameplate=box(.2,.05,.04,mat(0xC9CDD2,.4,.6),.45,.8,.25,g);
  box(.3,.012,.2,mat(0x2F6F73,.8),-.45,.766,.2,g);
  return g}
function bDeskB(){const g=new THREE.Group();g.add(deskTop(1.8,.9,{top:0xC99B66,leg:0x5E3921}));
  const lamp=new THREE.Group();cyl(.07,.08,.02,14,IRON,0,.01,0,lamp);const ar=cyl(.01,.01,.34,6,IRON,0,.19,0,lamp);ar.rotation.z=.3;
  const sh=new THREE.Mesh(new THREE.ConeGeometry(.09,.1,16,1,true),new THREE.MeshStandardMaterial({color:0x2F6F73,roughness:.5,side:THREE.DoubleSide}));sh.position.set(.1,.38,0);sh.rotation.z=-.5;lamp.add(sh);lamp.position.set(.72,.76,-.28);g.add(lamp);
  const nm=new THREE.Mesh(new THREE.PlaneGeometry(.26,.07),new THREE.MeshBasicMaterial({map:textTex(256,70,(c,w,h)=>{c.fillStyle='#F4F2EC';c.fillRect(0,0,w,h);c.fillStyle='#17181C';c.font='700 28px Inter,sans-serif';c.textAlign='center';c.fillText('S. Seiffert · Personal',w/2,44)}),toneMapped:false}));nm.position.set(-.35,.766,.25);nm.rotation.x=-Math.PI/2;nm.userData.noPick=true;g.add(nm);
  return g}
function bChairGuest(){const g=new THREE.Group();const c=propChair({seat:0x2F6F73});g.add(c);return g}
function bPlant(){return propPlant({h:1.05})}
function bCabinet(){
  const g=new THREE.Group();const M=mat(0xB9BEC4,.4,.5);
  box(.45,1.9,1.2,M,0,.95,0,g);
  for(let i=0;i<4;i++){box(.02,.4,1.1,mat(0xA3A8AF,.4,.5),.235,.28+i*.45,0,g);box(.02,.05,.3,IRON,.25,.28+i*.45,0,g);box(.02,.1,.45,mat(0xF4F2EC,.7),.25,.38+i*.45,0,g)}
  blob(g,1.0,1.7,0,0,.7);
  return g}
function bSideboard(len){const g=new THREE.Group();box(.55,.82,len,mat(0xE9E4D8,.7),0,.41,0,g);rbox(.6,.05,len+.04,.015,mat(0xB98A56,.6),0,.845,0,g);blob(g,1.1,len+.5,0,0,.6);return g}
function bWindowDecor(){
  const g=new THREE.Group();const FR=mat(0xF4F4F2,.7);const z0=0.0,z1=2.0,y0=.95,y1=2.4,c=1.0;const w=z1-z0,h=y1-y0;
  const f=(bw,bh,bd,x,y,zz)=>box(bd,bh,bw,FR,x,y,zz,g);
  f(w+.14,.07,.05,0,y1+.035,c);f(w+.14,.07,.05,0,y0-.035,c);f(.07,h,.05,0,(y0+y1)/2,z0-.035);f(.07,h,.05,0,(y0+y1)/2,z1+.035);
  box(.22,.04,w+.2,FR,.08,y0-.06,c,g);
  const glass=new THREE.MeshStandardMaterial({color:0xCFE6F5,roughness:.1,transparent:true,opacity:.18,side:THREE.DoubleSide,depthWrite:false});
  const gl=new THREE.Mesh(new THREE.PlaneGeometry(w,h),glass);gl.rotation.y=Math.PI/2;gl.position.set(0,(y0+y1)/2,c);g.add(gl);
  f(.04,h,.04,0,(y0+y1)/2,c);
  // vertical blinds
  const B=mat(0xE9EEF0,.8);for(let i=0;i<14;i++){box(.015,1.55,.12,B,.1,2.55-.775,z0-.0+(i+.5)*(w/14)-.0,g).rotation.x=0;}
  g.children.slice(-14).forEach((b,i)=>{b.rotation.y=.5})
  return g}

export default {
  id:'office',
  name:'Büro „Alpina Tech“',
  title:'Büro',
  chapter:5,
  chapterName:'Eine Arbeit finden',
  bookRef:'Schritte plus Neu B1.1 · Lektion 5 · KB 58–69',
  pl:'biuro „Alpina Tech” · lekcja 5',
  blurb:'Stellenanzeigen, Bewerbung, Vorstellungsgespräch, zu + Infinitiv, während / innerhalb / außerhalb',
  blurbPl:'ogłoszenia o pracę, podanie, rozmowa kwalifikacyjna, zu + bezokolicznik, während + dopełniacz',
  W,D,H,
  size:'9 × 7 m',
  story:['Du hast ein Vorstellungsgespräch bei der Firma „Alpina Tech“ – doch die Bürotür fällt hinter dir ins Schloss! Löse die Aufgaben an den Gegenständen (Kapitel 5: Bewerbung, Stellenanzeige, zu + Infinitiv, während …) und finde den Türcode.','Masz rozmowę kwalifikacyjną w firmie „Alpina Tech” – a drzwi biura się zatrzasnęły! Rozwiąż zadania z rozdziału 5 przy przedmiotach i znajdź kod.'],
  door:{x0:2.9,x1:3.9,h:2.15,wall:'back'},
  windows:[{wall:'left',c:1.0,w:2.0,y0:.95,y1:2.4}],
  start:{x:-.6,z:2.8,yaw:0},
  code:[3,9,5,1],
  theme:{
    wallBack:TEAL,wallSide:0xE8EEF0,wainscot:0xD5DEE2,wainscotH:0,rail:0xC4CFD4,base:0xF4F6F7,ceiling:0xF6F7F7,doorColor:0xB98A56,doorPanel:0xD9B27D,
    floor:(g,w,h)=>{const R=rng(21);g.fillStyle='#B9AC98';g.fillRect(0,0,w,h);const s=w/18;
      for(let y=0;y<h/s;y++)for(let x=0;x<18;x++){const l=62+R()*5;g.fillStyle=`hsl(34 18% ${l}%)`;g.fillRect(x*s+2,y*s+2,s-4,s-4)}},
    sun:{pos:[-8,7,2],color:0xFFF0D2,intensity:2.3},hemi:[0xF1F6FF,0x8C8F96,1.05],fill:[0xDDE8FF,.6],
    bg:['#F2F4F5','#DCE3E6','#B8C3C9'],
    outside:{wall:'left',draw:(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#8EB7E0');gr.addColorStop(.7,'#CFE3F2');gr.addColorStop(1,'#E8E2D4');g.fillStyle=gr;g.fillRect(0,0,w,h);
      const R=rng(8);g.fillStyle='#9AA7B5';for(let i=0;i<9;i++){const bw=24+R()*34,bh=40+R()*110;g.fillRect(i*30-4,h-bh,bw,bh);g.fillStyle='rgba(255,255,255,.5)';for(let k=0;k<6;k++)g.fillRect(i*30+4,h-bh+8+k*16,6,6);g.fillStyle='#9AA7B5'}
      g.fillStyle='#6E8B5B';g.fillRect(0,h-26,w,26)}}
  },
  lights:[{pos:[-1.6,2.6,.2],color:0xF1F6FF,i:5,d:8},{pos:[1.4,2.6,.5],color:0xF1F6FF,i:5,d:8},{pos:[2.8,2.6,2.0],color:0xFFF3E0,i:3.5,d:8}],
  decor(add){
    // window frame + blinds
    const wd=bWindowDecor();wd.position.set(-W/2+.03,0,0);add(wd);
    // desk A (applicant workplace, along the left wall)
    const oc=propOfficeChair(0x2F6F73);oc.position.set(-3.3,0,.9);oc.rotation.y=-Math.PI/2;add(oc);
    // desk B (Chefin) with chair + rug
    const rug=new THREE.Mesh(new THREE.PlaneGeometry(3.2,2.2),new THREE.MeshStandardMaterial({color:0x56788C,roughness:1}));rug.rotation.x=-Math.PI/2;rug.position.set(1.4,.012,-.3);rug.receiveShadow=true;add(rug);
    const rug2=new THREE.Mesh(new THREE.PlaneGeometry(2.8,1.8),new THREE.MeshStandardMaterial({color:0x6F93A8,roughness:1}));rug2.rotation.x=-Math.PI/2;rug2.position.set(1.4,.014,-.3);add(rug2);
    const db=bDeskB();db.position.set(1.3,0,-.7);add(db);
    const bc=propOfficeChair(0x2A2C31);bc.position.set(1.3,0,-1.6);bc.rotation.y=0;add(bc);
    const gc=propChair({seat:0x2F6F73});gc.position.set(1.9,0,.45);gc.rotation.y=Math.PI+.1;add(gc);
    // sideboard w/ printer area handled by objects; coffee counter
    const cc=bSideboard(1.3);cc.position.set(4.2,0,-1.0);add(cc);
    const wc=new THREE.Group();const wcb=box(.34,.85,.34,mat(0xDDE4EA,.5),0,.425,0,wc);const wt=cyl(.14,.14,.3,14,new THREE.MeshStandardMaterial({color:0x9DD3F2,roughness:.1,transparent:true,opacity:.6}),0,1.05,0,wc);wc.position.set(4.2,0,-2.7);add(wc);
    const sb=bSideboard(1.8);sb.position.set(4.2,0,1.3);add(sb);
    // ceiling light panels
    [[-1.8,.3],[1.4,.3],[-1.8,-2.2],[1.4,-2.2],[2.6,2.2],[-1.8,2.4]].forEach(([x,z])=>{const p=new THREE.Mesh(new THREE.BoxGeometry(1.2,.03,.5),new THREE.MeshBasicMaterial({color:0xFFFFFF,toneMapped:false}));p.position.set(x,H-.015,z);p.userData.noPick=true;p.userData.ceilingPart=true;add(p)});
    // wall sign
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(1.1,.3),new THREE.MeshBasicMaterial({map:textTex(512,140,(c,w,h)=>{c.fillStyle='#F4F6F7';c.fillRect(0,0,w,h);c.fillStyle='#2F6F73';c.font='800 62px Inter,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('Alpina Tech',w/2,h/2+4)}),toneMapped:false}));sg.position.set(W/2-.02,2.0,-1.0);sg.rotation.y=-Math.PI/2;sg.userData.noPick=true;add(sg);
    const sgn=new THREE.Mesh(new THREE.PlaneGeometry(.9,.26),new THREE.MeshBasicMaterial({map:textTex(512,150,(c,w,h)=>{c.fillStyle='#F4F6F7';c.fillRect(0,0,w,h);c.fillStyle='#2F6F73';c.font='700 56px Inter,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('Kaffeeküche',w/2,h/2+4)}),toneMapped:false}));sgn.position.set(W/2-.02,1.65,-1.0);sgn.rotation.y=-Math.PI/2;sgn.userData.noPick=true;add(sgn);
    // shelf plant on cabinet side
    const pl=propPlant({h:.75,leaf:0x4B9560});pl.position.set(-4.2,0,3.0);add(pl);
  },
  colliders:[
    [-4.55,-3.62,-.05,1.85],   // desk A
    [-3.62,-2.95,.5,1.3],      // chair A
    [.1,2.6,-2.05,-.1],        // desk B + chefin
    [.8,2.7,.15,.85],          // guest chairs
    [3.9,4.55,-1.7,-.3],       // coffee counter
    [3.95,4.55,-3.0,-2.4],     // water cooler
    [3.9,4.55,.35,2.25],       // printer sideboard
    [-4.55,-4.0,-3.55,-2.2],   // cabinet
    [-4.45,-3.95,2.7,3.5],     // plant
    [3.7,4.55,2.9,3.55],       // plant 2
  ],
  objects:[
    {id:'door',de:'Tür',art:'die',pl:'drzwi',kind:'door',anc:[3.4,2.55,-3.35],look:[3.4,1.1,-3.5],flat:true},
    {id:'computer',de:'Computer',art:'der',pl:'komputer',build:bComputer,pos:[-4.2,.76,.62],ry:Math.PI/2,anc:[-4.1,1.35,.62],look:[-4.2,1.0,.62],clue:0,
      hintTxt:'Auf dem Schreibtisch am Fenster wartet eine halbfertige E-Mail …',
      words:[{de:'Computer',art:'der',pl:'komputer',plu:'die Computer'},{de:'Bewerbung',art:'die',pl:'podanie o pracę',plu:'die Bewerbungen'},{de:'E-Mail',art:'die',pl:'e-mail',plu:'die E-Mails'}],
      task:{type:'choice',tag:'Bewerbungsschreiben · formeller Brief',src:'KB 61 (A3, A4), KB 66–67',
        ctx:['Auf dem Bildschirm: eine E-Mail an die Firma. Die Anrede fehlt noch – du kennst den Namen nicht.','Na ekranie: e-mail do firmy. Brakuje jeszcze zwrotu – nie znasz nazwiska.'],
        prompt:'Wie beginnt man einen formellen Brief an eine Firma, wenn man den Namen nicht kennt?',sub:'Jak zaczyna się oficjalny list, gdy nie znasz nazwiska?',
        options:['Sehr geehrte Damen und Herren,','Hallo ihr Lieben,','Liebe Firma,','Hi Chef,'],ans:'Sehr geehrte Damen und Herren,',
        hint:'Formalnie, do wielu osób: „Sehr geehrte Damen und Herren,”. Koniec listu: Mit freundlichen Grüßen.',
        explain:'<b>Sehr geehrte Damen und Herren,</b> – formalny początek listu do firmy. Koniec: <i>Mit freundlichen Grüßen</i> (MfG).'}},
    {id:'pinboard',de:'Pinnwand',art:'die',pl:'tablica korkowa',build:bCorkboard,pos:[-3.0,1.7,-D/2+.03],ry:0,anc:[-3.0,2.5,-3.3],look:[-3.0,1.7,-3.5],flat:true,clue:1,
      hintTxt:'An der Pinnwand hängen Stellenanzeigen …',
      words:[{de:'Pinnwand',art:'die',pl:'tablica korkowa'},{de:'Stellenanzeige',art:'die',pl:'ogłoszenie o pracę',plu:'die Stellenanzeigen'},{de:'Branche',art:'die',pl:'branża',plu:'die Branchen'}],
      task:{type:'choice',tag:'Stellenanzeigen verstehen',src:'KB 60 (A1, A2)',
        ctx:['Eine Anzeige an der Pinnwand: „Die Stelle ist befristet auf 3 Monate.“','Ogłoszenie na tablicy: „Stanowisko jest na czas określony – 3 miesiące.”'],
        prompt:'„Die Stelle ist befristet auf 3 Monate.“ Das bedeutet:',sub:'Co to znaczy?',
        options:['Die Stelle gibt es nur drei Monate lang.','Die Stelle gibt es für immer.','Die Stelle beginnt in drei Monaten.','Die Stelle ist drei Kilometer entfernt.'],ans:'Die Stelle gibt es nur drei Monate lang.',
        hint:'befristet = ograniczone w czasie (na czas określony).',
        explain:'<b>befristet</b> = na czas określony. „Die Stelle gibt es nur drei Monate lang.” Przeciwieństwo: unbefristet (bezterminowo).'}},
    {id:'boss',de:'Chefin',art:'die',pl:'szefowa',build:bBoss,pos:[1.3,0,-1.6],ry:0,anc:[1.3,1.95,-1.6],look:[1.3,1.2,-1.6],clue:2,dist:2.8,
      hintTxt:'Hinter dem großen Schreibtisch sitzt jemand und wartet auf dich …',
      words:[{de:'Chefin',art:'die',pl:'szefowa',plu:'die Chefinnen'},{de:'Vorstellungsgespräch',art:'das',pl:'rozmowa kwalifikacyjna',plu:'die Vorstellungsgespräche'},{de:'Gehalt',art:'das',pl:'wynagrodzenie',plu:'die Gehälter'}],
      task:{type:'choice',tag:'Vorstellungsgespräch · Begrüßung',src:'KB 62–63 (B1–B4)',
        ctx:['Frau Seiffert, die Personalchefin, begrüßt dich: „Guten Tag, Herr Meier. Kommen Sie doch bitte herein. Schön, dass Sie da sind.“','Pani Seiffert, szefowa działu kadr, wita Cię: „Dzień dobry… Proszę wejść. Miło, że Pan jest.”'],
        prompt:'Was antwortet der Bewerber?',sub:'Co odpowiada kandydat?',
        options:['Danke für die Einladung zum Gespräch.','Ich habe keine Frage an Sie.','Ich war im Verkauf tätig.','Bis zum nächsten Mal.'],ans:'Danke für die Einladung zum Gespräch.',
        hint:'Na powitanie: podziękuj za zaproszenie.',
        explain:'<b>Danke für die Einladung zum Gespräch.</b> – grzeczna odpowiedź na powitanie. („Ich war im Verkauf tätig” pasuje do pytania o doświadczenie.)'}},
    {id:'calendar',dist:2.4,de:'Kalender',art:'der',pl:'kalendarz',build:bCalendar,pos:[-W/2+.03,1.55,-1.6],ry:Math.PI/2,anc:[-4.35,2.2,-1.6],look:[-4.4,1.55,-1.6],flat:true,clue:3,
      hintTxt:'An der Wand hängt ein Kalender mit einer roten Markierung …',
      words:[{de:'Kalender',art:'der',pl:'kalendarz',plu:'die Kalender'},{de:'Zeitpunkt',art:'der',pl:'moment, termin',plu:'die Zeitpunkte'}],
      task:{type:'order',tag:'innerhalb + Genitiv · Satz bauen',src:'KB 62 (B1), 63 · Test Teil 3 (Ordnen)',
        ctx:['Im Kalender ist die Woche markiert, in der die Firma anruft. Frau Seiffert verabschiedet sich.','W kalendarzu zaznaczono tydzień, w którym firma się odezwie. Pani Seiffert żegna się z Tobą.'],
        prompt:'Ułóż zdanie: „Odezwiemy się do Państwa w ciągu następnego tygodnia.”',sub:'Kliknij słowa we właściwej kolejności.',
        words:['Woche','bei','Wir','nächsten','innerhalb','Ihnen.','uns','der','melden'],ans:'Wir melden uns innerhalb der nächsten Woche bei Ihnen.',
        hint:'Czasownik na 2. miejscu: Wir melden uns … innerhalb + Genitiv (der nächsten Woche).',
        explain:'<b>Wir melden uns innerhalb der nächsten Woche bei Ihnen.</b> – innerhalb + Genitiv (f.: <i>der</i> nächsten Woche).'}},
    {id:'phone',de:'Telefon',art:'das',pl:'telefon',build:bPhone,pos:[-4.2,.76,1.5],ry:Math.PI/2,anc:[-4.15,1.05,1.5],look:[-4.2,.82,1.5],
      hintTxt:'Auf dem Schreibtisch steht auch ein Telefon …',
      words:[{de:'Telefon',art:'das',pl:'telefon',plu:'die Telefone'},{de:'Firma',art:'die',pl:'firma',plu:'die Firmen'},{de:'anrufen',art:'',pl:'zadzwonić'}],
      task:{type:'type',tag:'Infinitiv mit zu · trennbare Verben',src:'KB 58, 60, 66 (Grammatik 1)',
        ctx:['Du willst morgen früh bei der Firma nachfragen – das Telefon steht schon bereit.','Chcesz jutro rano zadzwonić do firmy – telefon już czeka.'],
        prompt:'Vergiss nicht, morgen früh den Chef ___! (anrufen)',sub:'Nie zapomnij jutro rano zadzwonić do szefa! Wpisz formę z „zu”.',
        tpl:'Vergiss nicht, morgen früh den Chef {}! (anrufen)',ans:['anzurufen'],
        hint:'Czasownik rozdzielny: zu wchodzi między przedrostek i rdzeń: an + zu + rufen.',
        explain:'<b>anzurufen</b> – przy czasownikach rozdzielnych <i>zu</i> stoi między przedrostkiem a rdzeniem i pisze się razem: an|zu|rufen.'}},
    {id:'clock',de:'Uhr',art:'die',pl:'zegar',build:()=>propClock(.27,19,10),pos:[1.7,2.2,-D/2+.04],ry:0,anc:[1.7,2.65,-3.3],look:[1.7,2.2,-3.5],flat:true,
      hintTxt:'Die Uhr zeigt 19:10 – das Büro ist längst zu …',
      words:[{de:'Uhr',art:'die',pl:'zegar'},{de:'Öffnungszeiten',art:'die',pl:'godziny otwarcia',plu:'(Pl.)'}],
      task:{type:'type',tag:'außerhalb + Genitiv',src:'KB 62 (B1), 66 · Test Teil 2 (Lücke)',
        ctx:['Die Uhr zeigt 19:10. Du rufst die Firma an – auf dem Anrufbeantworter hörst du eine Ansage.','Zegar pokazuje 19:10. Dzwonisz do firmy – na automatycznej sekretarce słyszysz komunikat.'],
        prompt:'Leider rufen Sie außerhalb ___ Öffnungszeiten an. (die)',sub:'Niestety dzwonią Państwo poza godzinami otwarcia. Wpisz rodzajnik.',
        tpl:'Leider rufen Sie außerhalb {} Öffnungszeiten an. (die)',ans:['der'],
        hint:'außerhalb + Genitiv. die Öffnungszeiten (Pl.) → der Öffnungszeiten.',
        explain:'<b>außerhalb der Öffnungszeiten</b> – außerhalb / innerhalb / während + Genitiv. Liczba mnoga w dopełniaczu: <i>der</i>.'}},
    {id:'printer',de:'Drucker',art:'der',pl:'drukarka',build:bPrinter,pos:[4.2,.87,1.3],ry:-Math.PI/2,anc:[4.2,1.35,1.3],look:[4.2,1.0,1.3],
      hintTxt:'Etwas druckt gerade deinen Lebenslauf …',
      words:[{de:'Drucker',art:'der',pl:'drukarka',plu:'die Drucker'},{de:'Unterlagen',art:'die',pl:'dokumenty',plu:'(Pl.)'},{de:'Zeugnis',art:'das',pl:'świadectwo',plu:'die Zeugnisse'}],
      task:{type:'choice',tag:'brauchen … zu + Infinitiv',src:'KB 60 (A2), 66 (Grammatik 1)',
        ctx:['Der Drucker druckt deinen Lebenslauf. In der Anzeige steht: „Rufen Sie uns einfach an.“','Drukarka drukuje Twoje CV. W ogłoszeniu: „Proszę po prostu zadzwonić.”'],
        prompt:'Sie brauchen keine schriftliche Bewerbung ___ schicken.',sub:'Nie musi Pan wysyłać pisemnego podania.',
        options:['zu','um','dass','für'],ans:'zu',
        hint:'brauchen (nicht/kein/nur) + zu + bezokolicznik na końcu.',
        explain:'<b>… keine Bewerbung zu schicken</b> – brauchen + <i>zu</i> + bezokolicznik. „Sie brauchen keine … zu schicken” = „Sie müssen keine … schicken”.'}},
    {id:'whiteboard',de:'Whiteboard',art:'das',pl:'tablica biała',build:bWhiteboard,pos:[-.4,1.65,-D/2+.03],ry:0,anc:[-.4,2.4,-3.3],look:[-.4,1.65,-3.5],flat:true,
      hintTxt:'Auf der weißen Tafel stehen die Öffnungszeiten …',
      words:[{de:'Whiteboard',art:'das',pl:'tablica biała'},{de:'Abteilung',art:'die',pl:'dział',plu:'die Abteilungen'},{de:'Mitarbeiter',art:'der',pl:'pracownik',plu:'die Mitarbeiter'}],
      task:{type:'choice',tag:'Wann? Wie lange? Ab wann?',src:'KB 62 (B2), 66',
        ctx:['Auf dem Whiteboard steht: „Mo – Fr: 8 – 18 Uhr“.','Na tablicy: „Pn – Pt: 8 – 18”.'],
        prompt:'Wir sind von Montag ___ Freitag für Sie da.',sub:'Jesteśmy dla Państwa od poniedziałku do piątku.',
        options:['bis','vor','bei','an'],ans:'bis',
        hint:'Wie lange? → von … bis …',
        explain:'<b>von Montag bis Freitag</b> – <i>bis</i> odpowiada na pytanie „Wie lange?” (do kiedy). „vor/bei” → Wann?; „ab/von … an” → Ab wann?'}},
    {id:'coffee',de:'Kaffeemaschine',art:'die',pl:'ekspres do kawy',build:bCoffee,pos:[4.25,.87,-1.0],ry:-Math.PI/2,anc:[4.2,1.5,-1.0],look:[4.2,1.1,-1.0],
      hintTxt:'In der Kaffeeküche treffen sich die Kollegen …',
      words:[{de:'Kaffeemaschine',art:'die',pl:'ekspres do kawy',plu:'die Kaffeemaschinen'},{de:'Kantine',art:'die',pl:'stołówka',plu:'die Kantinen'}],
      task:{type:'choice',tag:'während + Genitiv',src:'KB 62 (B1), 66 (Grammatik 2)',
        ctx:['Bei der Kaffeemaschine plaudern die Kollegen – immer in der Pause.','Przy ekspresie plotkują koledzy – zawsze w przerwie.'],
        prompt:'Während ___ Mittagspause (die) trinken viele Mitarbeiter einen Kaffee.',sub:'Podczas przerwy obiadowej wielu pracowników pije kawę.',
        options:['der','des','dem','die'],ans:'der',
        hint:'während + Genitiv. die Pause (f.) → der Pause.',
        explain:'<b>während der Mittagspause</b> – während + Genitiv; f.: <i>der</i>. (m./n.: des + -s: während des Gesprächs.)'}},
    {id:'folder',de:'Bewerbungsmappe',art:'die',pl:'teczka z podaniem',build:bFolder,pos:[.9,.77,-.45],ry:.15,anc:[.9,1.05,-.45],look:[.9,.8,-.45],
      hintTxt:'Auf dem Chefschreibtisch liegt eine blaue Mappe …',
      words:[{de:'Mappe',art:'die',pl:'teczka',plu:'die Mappen'},{de:'Lebenslauf',art:'der',pl:'życiorys, CV',plu:'die Lebensläufe'},{de:'Zuverlässigkeit',art:'die',pl:'rzetelność'}],
      task:{type:'choice',tag:'Wortschatz · Fähigkeiten',src:'KB 60 (A2) · Test Teil 1',
        ctx:['In der Mappe: Lebenslauf und Zeugnisse. Die Chefin fragt nach deinen Stärken.','W teczce: CV i świadectwa. Szefowa pyta o Twoje mocne strony.'],
        prompt:'Er arbeitet gern selbstständig und ist sehr ___. Man kann sich auf ihn verlassen.',sub:'On chętnie pracuje samodzielnie i jest bardzo rzetelny. Można na nim polegać.',
        options:['zuverlässig','zufrieden','zuständig','zusammen'],ans:'zuverlässig',
        hint:'Można na nim polegać = zuverlässig.',
        explain:'<b>zuverlässig</b> = rzetelny, niezawodny (die Zuverlässigkeit). zufrieden = zadowolony; zuständig = odpowiedzialny/kompetentny za coś.'}},
    {id:'desk',de:'Schreibtisch',art:'der',pl:'biurko',build:bDesk,pos:[-4.12,0,.9],ry:Math.PI/2,anc:[-4.1,.95,1.35],look:[-4.12,.74,1.3],
      words:[{de:'Schreibtisch',art:'der',pl:'biurko',plu:'die Schreibtische'},{de:'Auftrag',art:'der',pl:'zlecenie',plu:'die Aufträge'}]},
    {id:'chair',de:'Stuhl',art:'der',pl:'krzesło',build:bChairGuest,pos:[.9,0,.5],ry:Math.PI-.1,anc:[.9,1.15,.5],look:[.9,.6,.5],
      words:[{de:'Stuhl',art:'der',pl:'krzesło',plu:'die Stühle'}]},
    {id:'plant',de:'Pflanze',art:'die',pl:'roślina',build:bPlant,pos:[4.0,0,3.2],ry:0,anc:[4.0,2.2,3.2],look:[4.0,1.2,3.2],
      words:[{de:'Pflanze',art:'die',pl:'roślina',plu:'die Pflanzen'}]},
    {id:'cabinet',de:'Aktenschrank',art:'der',pl:'szafa na akta',build:bCabinet,pos:[-4.27,0,-2.9],ry:0,anc:[-4.1,2.1,-2.9],look:[-4.2,1.2,-2.9],
      words:[{de:'Aktenschrank',art:'der',pl:'szafa na akta',plu:'die Aktenschränke'}]},
  ]
};
