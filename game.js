import {WORLD,ROLES,dist,len} from './config.js';
import {Human,Slime} from './entities.js';
import {Input} from './input.js';
import {draw} from './render.js';
const canvas=document.querySelector('#gameCanvas'),ctx=canvas.getContext('2d');
const startScreen=document.querySelector('#startScreen'),gameScreen=document.querySelector('#gameScreen');
const ui={blue:document.querySelector('#blueScore'),red:document.querySelector('#redScore'),role:document.querySelector('#roleLabel'),a:document.querySelector('#buttonA span'),c:document.querySelector('#buttonC span'),msg:document.querySelector('#message')};
const input=new Input();
const g={humans:[],slime:new Slime(),apples:[],pads:[],puddles:[{x:450,y:240,r:62},{x:790,y:485,r:75}],trees:[{x:350,y:170,r:38},{x:890,y:190,r:45},{x:1000,y:500,r:39},{x:275,y:510,r:42}],grass:[],score:{blue:0,red:0},active:0,last:0,running:false};
for(let i=0;i<38;i++)g.grass.push({x:150+Math.random()*980,y:110+Math.random()*500});
function resetTeams(){g.humans=[];for(let i=0;i<3;i++){g.humans.push(new Human('blue',i,360,290+i*72,false));g.humans.push(new Human('red',i,920,290+i*72,true))}g.active=0;setActive()}
function setActive(){g.humans.filter(h=>h.team==='blue').forEach((h,i)=>h.active=i===g.active);const h=player();ui.role.textContent=h.role.name;ui.a.textContent=h.role.tool;ui.c.textContent=h.role.item}
function player(){return g.humans.filter(h=>h.team==='blue')[g.active]}
function start(){startScreen.classList.add('hidden');gameScreen.classList.remove('hidden');g.score.blue=g.score.red=0;ui.blue.textContent=ui.red.textContent='0';resetTeams();g.slime.reset();g.running=true;g.last=performance.now();requestAnimationFrame(loop)}
function flash(t){ui.msg.textContent=t;ui.msg.classList.remove('hidden');setTimeout(()=>ui.msg.classList.add('hidden'),850)}
function useA(h){if(h.cool>0)return;h.action=.25;const s=g.slime,dx=s.x-h.x,dy=s.y-h.y,d=dist(h,s),facing=(dx*h.dirX+dy*h.dirY)/(len(dx,dy));if(h.role.id==='shield'){h.cool=.25;if(d<108&&facing>.15&&s.z<45){const side=Math.sign(h.dirX*dy-h.dirY*dx)||1;const a=Math.atan2(s.dirY,s.dirX)+side*Math.PI/2;s.dirX=Math.cos(a);s.dirY=Math.sin(a);s.hopT=.12}}else if(h.role.id==='pole'){h.cool=.62;if(d<122&&facing>.15){s.mood+=.7;s.launch(h.dirX,h.dirY,235,380);if(s.mood>1.7){h.cool=2.1;flash('ネバネバ！')}}}else{h.cool=.28;if(d<310&&facing>.55){if(Math.random()<.5)s.launch(h.dirX,h.dirY,120,205);else{s.hopT=.05;s.mood=Math.max(0,s.mood-.15)}}}}
function useC(h){if(h.cool>0)return;h.cool=.7;const x=h.x+h.dirX*65,y=h.y+h.dirY*65;if(h.role.id==='shield'){g.apples=g.apples.filter(a=>a.team!==h.team);g.apples.push({x,y,team:h.team})}else if(h.role.id==='pole'){if(dist({x,y},g.slime)<60&&!g.slime.bucket){g.slime.bucket=true;g.slime.bucketVX=h.dirX*360;g.slime.bucketVY=h.dirY*360}else{flash('スライムの近くで使おう')}}else{g.pads=g.pads.filter(p=>p.team!==h.team);g.pads.push({x,y,team:h.team})}}
function cpu(h,dt){const s=g.slime,goalX=h.team==='red'?WORLD.cx-WORLD.rx:WORLD.cx+WORLD.rx;let tx=s.x,ty=s.y;if(h.role.id==='shield'){tx=s.x+(goalX<s.x?-75:75);ty=s.y}else if(h.role.id==='pole'){tx=s.x-(goalX<s.x?-85:85);ty=s.y}else{tx=s.x-(goalX<s.x?-170:170);ty=s.y+(h.roleIndex-1)*70}const dx=tx-h.x,dy=ty-h.y;h.move(dx,dy,dt);if(dist(h,s)<(h.role.id==='water'?300:125)&&Math.random()<dt*1.4){h.dirX=(s.x-h.x)/len(s.x-h.x,s.y-h.y);h.dirY=(s.y-h.y)/len(s.x-h.x,s.y-h.y);useA(h)}if(Math.random()<dt*.04)useC(h)}
function score(team){g.score[team]++;ui[team].textContent=g.score[team];flash(team==='blue'?'青の村に到着！':'赤の村に到着！');if(g.score[team]>=3){flash(team==='blue'?'青チームの勝ち！':'赤チームの勝ち！');g.running=false;setTimeout(start,1700)}else{g.slime.reset();resetTeams()}}
function update(dt){const h=player(),a=input.axis();h.move(a.x,a.y,dt);for(const p of g.humans){p.update(dt);if(p.cpu)cpu(p,dt)}g.slime.update(dt,g);g.apples=g.apples.filter(a=>!a.dead);g.pads=g.pads.filter(p=>!p.dead);if(g.slime.x<WORLD.cx-WORLD.rx-WORLD.goalDepth&&Math.abs(g.slime.y-WORLD.cy)<WORLD.goalHalf)score('blue');if(g.slime.x>WORLD.cx+WORLD.rx+WORLD.goalDepth&&Math.abs(g.slime.y-WORLD.cy)<WORLD.goalHalf)score('red')}
function loop(t){if(!g.running)return;const dt=Math.min(.033,(t-g.last)/1000);g.last=t;update(dt);draw(ctx,g);requestAnimationFrame(loop)}
function bind(id,fn){const b=document.querySelector(id);b.addEventListener('pointerdown',e=>{e.preventDefault();b.classList.add('pressed');fn()});['pointerup','pointercancel','pointerleave'].forEach(k=>b.addEventListener(k,()=>b.classList.remove('pressed')))}
bind('#buttonA',()=>useA(player()));bind('#buttonB',()=>{g.active=(g.active+1)%3;setActive()});bind('#buttonC',()=>useC(player()));
addEventListener('keydown',e=>{if(e.repeat)return;if(e.key.toLowerCase()==='j')useA(player());if(e.key.toLowerCase()==='k'){g.active=(g.active+1)%3;setActive()}if(e.key.toLowerCase()==='l')useC(player())});
document.querySelector('#startButton').addEventListener('click',start);document.querySelector('#restartButton').addEventListener('click',start);
function fit(){const r=innerWidth/innerHeight,w=WORLD.w,h=WORLD.h;if(r>w/h){canvas.style.width='auto';canvas.style.height='100%'}else{canvas.style.width='100%';canvas.style.height='auto'}}addEventListener('resize',fit);fit();
