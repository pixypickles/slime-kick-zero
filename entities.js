import {WORLD,ROLES,clamp,len,dist} from './config.js';
export class Human{
 constructor(team,roleIndex,x,y,cpu=false){this.team=team;this.roleIndex=roleIndex;this.x=x;this.y=y;this.dirX=team==='blue'?1:-1;this.dirY=0;this.cpu=cpu;this.cool=0;this.action=0;this.active=false}
 get role(){return ROLES[this.roleIndex]}
 move(dx,dy,dt){const l=len(dx,dy);if(Math.abs(dx)+Math.abs(dy)>.05){dx/=l;dy/=l;this.dirX=dx;this.dirY=dy;this.x+=dx*this.role.speed*dt;this.y+=dy*this.role.speed*dt}keepInside(this)}
 update(dt){this.cool=Math.max(0,this.cool-dt);this.action=Math.max(0,this.action-dt)}
}
export class Slime{
 constructor(){this.reset()}
 reset(){this.x=WORLD.cx;this.y=WORLD.cy;this.dirX=Math.random()>.5?1:-1;this.dirY=(Math.random()-.5)*.7;this.hop=0;this.hopT=.25;this.z=0;this.vz=0;this.forced=0;this.mood=0;this.bucket=false;this.bucketVX=0;this.bucketVY=0;this.wander=1.2}
 launch(dx,dy,power,height){const l=len(dx,dy);this.dirX=dx/l;this.dirY=dy/l;this.forced=power;this.vz=height;this.z=Math.max(this.z,1);this.hopT=.05}
 update(dt,world){this.mood=Math.max(0,this.mood-dt*.13);this.wander-=dt;if(this.wander<=0){this.wander=.8+Math.random()*1.8;if(Math.random()<.45){const a=Math.atan2(this.dirY,this.dirX)+(Math.random()-.5)*1.5;this.dirX=Math.cos(a);this.dirY=Math.sin(a)}}
  if(this.bucket){this.x+=this.bucketVX*dt;this.y+=this.bucketVY*dt;this.bucketVX*=Math.pow(.3,dt);this.bucketVY*=Math.pow(.3,dt);if(Math.hypot(this.bucketVX,this.bucketVY)<20)this.bucket=false;bounceInside(this);return}
  this.vz-=1050*dt;this.z+=this.vz*dt;if(this.z<=0){this.z=0;this.vz=0;this.hopT-=dt;if(this.hopT<=0){this.hopT=.36+Math.random()*.22;const speed=this.forced>0?this.forced:72;this.x+=this.dirX*speed*.23;this.y+=this.dirY*speed*.23;this.vz=this.forced>0?260:145;this.forced=Math.max(0,this.forced-35)}}
  for(const apple of world.apples){if(dist(this,apple)<170){const dx=apple.x-this.x,dy=apple.y-this.y,l=len(dx,dy);this.dirX=dx/l;this.dirY=dy/l;if(dist(this,apple)<34){apple.dead=true;this.mood=0}}}
  for(const puddle of world.puddles){if(dist(this,puddle)<puddle.r+45 && Math.random()<dt*.8){const dx=puddle.x-this.x,dy=puddle.y-this.y,l=len(dx,dy);this.dirX=dx/l;this.dirY=dy/l}}
  for(const pad of world.pads){if(!pad.dead&&dist(this,pad)<42&&this.z<12){this.launch(pad.team==='blue'?1:-1,0,420,650);pad.dead=true}}
  bounceInside(this)
 }
}
export function keepInside(o){const nx=(o.x-WORLD.cx)/WORLD.rx,ny=(o.y-WORLD.cy)/WORLD.ry;const q=nx*nx+ny*ny;if(q>1){const s=1/Math.sqrt(q);o.x=WORLD.cx+nx*s*WORLD.rx;o.y=WORLD.cy+ny*s*WORLD.ry}}
export function bounceInside(o){const nx=(o.x-WORLD.cx)/WORLD.rx,ny=(o.y-WORLD.cy)/WORLD.ry;const q=nx*nx+ny*ny;if(q>1){const inGoal=Math.abs(o.y-WORLD.cy)<WORLD.goalHalf;if(inGoal&&((o.x<WORLD.cx-WORLD.rx)||(o.x>WORLD.cx+WORLD.rx)))return;const s=1/Math.sqrt(q);o.x=WORLD.cx+nx*s*WORLD.rx;o.y=WORLD.cy+ny*s*WORLD.ry;const normalX=nx/WORLD.rx,normalY=ny/WORLD.ry;const dot=o.dirX*normalX+o.dirY*normalY;o.dirX-=2*dot*normalX;o.dirY-=2*dot*normalY;const l=len(o.dirX,o.dirY);o.dirX/=l;o.dirY/=l}}
