export const WORLD={w:1280,h:720,cx:640,cy:360,rx:535,ry:282,goalDepth:90,goalHalf:88};
export const ROLES=[
 {id:'shield',name:'盾役',tool:'盾',item:'リンゴ',speed:190},
 {id:'pole',name:'棒役',tool:'棒',item:'バケツ',speed:215},
 {id:'water',name:'水鉄砲役',tool:'水鉄砲',item:'ジャンプ台',speed:235}
];
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const len=(x,y)=>Math.hypot(x,y)||1;
export const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
