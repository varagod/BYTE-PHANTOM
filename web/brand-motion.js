
(function(){
"use strict";
const intro=document.getElementById("bootIntro");if(!intro)return;
const canvas=document.getElementById("matrixRain"),ctx=canvas&&canvas.getContext("2d",{alpha:true}),output=document.getElementById("bootMessages"),progress=document.getElementById("bootProgressBar"),status=document.getElementById("bootStatus"),ascii=document.getElementById("bootAscii");
const reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches,glyphs="01アイウエオカキクケコサシスセソ<>[]{}#$%&/\\\\";
let width=0,height=0,drops=[],raf=0,last=0,closed=false,asciiTimer=0;
function resize(){if(!canvas||!ctx)return;const ratio=Math.min(window.devicePixelRatio||1,1.4);width=Math.max(1,window.innerWidth);height=Math.max(1,window.innerHeight);canvas.width=Math.floor(width*ratio);canvas.height=Math.floor(height*ratio);canvas.style.width=width+"px";canvas.style.height=height+"px";ctx.setTransform(ratio,0,0,ratio,0,0);drops=Array.from({length:Math.ceil(width/15)},()=>Math.random()*-height/15);ctx.clearRect(0,0,width,height);}
function draw(time){if(closed||!ctx)return;raf=requestAnimationFrame(draw);if(time-last<(reduced?180:48))return;last=time;ctx.fillStyle="rgba(1,3,8,.105)";ctx.fillRect(0,0,width,height);ctx.font="12px monospace";for(let i=0;i<drops.length;i++){const y=drops[i]*15,ch=glyphs.charAt(Math.floor(Math.random()*glyphs.length)),h=Math.random();ctx.fillStyle=h>.92?"rgba(184,103,255,.88)":h>.78?"rgba(57,233,255,.78)":"rgba(53,255,124,.76)";ctx.fillText(ch,i*15,y);if(y>height&&Math.random()>.976)drops[i]=-Math.random()*18;drops[i]+=reduced?.22:.64+Math.random()*.75;}}
function addLine(line){if(!output)return;const row=document.createElement("div");row.className="boot-log-line";row.textContent="[OK] "+line;output.appendChild(row);while(output.children.length>5)output.removeChild(output.firstChild);}
function finish(){if(closed)return;closed=true;if(raf)cancelAnimationFrame(raf);if(asciiTimer)window.clearInterval(asciiTimer);intro.classList.add("boot-exit");window.setTimeout(()=>{if(intro.parentNode)intro.parentNode.removeChild(intro);},900);}
const asciiFrames=[
"        .-========-.\\n     .-'  .----.  '-.\\n    /   /  /##\\\\  \\\\   \\\\n   |   |  |#()#|  |   |\\n   |   |   \\\\__/   |   |\\n    \\\\   \\\\       /   /\\n     '-. '------' .-'\\n        '-.____.-'",
"        .-========-.\\n     .-'  .----.  '-.\\n    /   /  /@@\\\\  \\\\   \\\\n   |   |  |#<>#|  |   |\\n   |   |   \\\\__/   |   |\\n    \\\\   \\\\  ||   /   /\\n     '-. '------' .-'\\n        '-.____.-'",
"        .-========-.\\n     .-'  .----.  '-.\\n    /   /  /##\\\\  \\\\   \\\\n   |   |  |()()|  |   |\\n   |   |   \\\\__/   |   |\\n    \\\\   \\\\  //   /   /\\n     '-. '------' .-'\\n        '-.____.-'"
];
let frame=0;if(ascii){ascii.textContent=asciiFrames[0];asciiTimer=window.setInterval(()=>{frame=(frame+1)%asciiFrames.length;ascii.textContent=asciiFrames[frame];},reduced?600:240);}
const lines=["Waking the phantom kernel...","Mounting encrypted interface modules [14/14]","Rendering signal map and ghost identity...","Audio matrix standing by / user gesture required","Local sandbox secured / external routes disabled","BYTE PHANTOM core is ready."];
resize();if(ctx)raf=requestAnimationFrame(draw);window.addEventListener("resize",resize,{passive:true});
const duration=reduced?1800:6600;let value=0;const timer=window.setInterval(()=>{value=Math.min(100,value+(reduced?8:1.6));if(progress)progress.style.width=value+"%";if(status)status.textContent="INITIALIZING CORE "+String(Math.round(value)).padStart(2,"0")+"%";if(value>=100)window.clearInterval(timer);},reduced?45:95);
lines.forEach((line,i)=>window.setTimeout(()=>addLine(line),reduced?i*170:350+i*850));
const skip=document.getElementById("skipBoot");if(skip)skip.addEventListener("click",()=>{window.clearInterval(timer);finish();});
window.setTimeout(()=>{window.clearInterval(timer);finish();},duration);
})();
