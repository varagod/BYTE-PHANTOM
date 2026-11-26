/* BYTE PHANTOM — persistent ambient matrix signal */
(function(){
"use strict";
const canvas=document.getElementById("ambientMatrix");if(!canvas)return;
const ctx=canvas.getContext("2d",{alpha:true});if(!ctx)return;
const glyphs="アイウエオカキクケコサシスセソタチツテトナニヌネノ012345789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>/\\{}[]$#";
let width=0,height=0,columns=[],dpr=1;
const reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function resize(){dpr=Math.min(window.devicePixelRatio||1,1.5);width=innerWidth;height=innerHeight;canvas.width=Math.floor(width*dpr);canvas.height=Math.floor(height*dpr);canvas.style.width=width+"px";canvas.style.height=height+"px";ctx.setTransform(dpr,0,0,dpr,0,0);columns=Array.from({length:Math.ceil(width/17)},()=>Math.random()*(height/17))}
function draw(){if(document.body.classList.contains("no-effects")){requestAnimationFrame(draw);return}ctx.fillStyle="rgba(5,9,12,.105)";ctx.fillRect(0,0,width,height);ctx.font="11px Consolas,monospace";for(let i=0;i<columns.length;i++){const y=columns[i]*17;const ch=glyphs.charAt(Math.floor(Math.random()*glyphs.length));ctx.fillStyle=Math.random()>.985?"rgba(166,139,255,.62)":i%7===0?"rgba(91,210,221,.45)":"rgba(69,211,135,.37)";ctx.fillText(ch,i*17,y);if(y>height&&Math.random()>.975)columns[i]=0;else columns[i]+=reduced?0:(Math.random()>.92?1.5:.48)}requestAnimationFrame(draw)}
addEventListener("resize",resize,{passive:true});resize();ctx.clearRect(0,0,width,height);if(!reduced)requestAnimationFrame(draw);
})();