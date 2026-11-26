// English as a Skill landing page (SkillsIRL). Loaded by the page after it mounts.
(function(){
if(window.__easInit)return;window.__easInit=true;
var root=document.querySelector('.eas');if(!root)return;
// height of the site's sticky header, so pinned sections sit just below it
var NAV=0;function measureNav(){NAV=0;var els=document.querySelectorAll('body *');for(var i=0;i<els.length&&i<400;i++){var el=els[i];if(root.contains(el))break;var cs=getComputedStyle(el);if((cs.position==='sticky'||cs.position==='fixed')&&el.offsetHeight>30&&el.offsetHeight<200&&el.id!=='gw-loader'){NAV=Math.max(NAV,Math.round(el.offsetHeight));}}root.style.setProperty('--navh',NAV+'px')}measureNav();addEventListener('resize',measureNav);

var WA='https://wa.me/917400454654?text=';
function wa(t){return WA+encodeURIComponent(t)}
document.querySelectorAll('a[href="WA_LEVEL"]').forEach(function(a){a.href=wa("Hi Grow Wings, I'd like a free level check for English as a Skill.")});
document.querySelectorAll('a[href="WA_Q"]').forEach(function(a){a.href=wa("Hi Grow Wings, I have a question about English as a Skill.")});
document.querySelectorAll('a[href="WA_SEAT"]').forEach(function(a){a.href=wa("Hi Grow Wings, I'd like to reserve a seat in the English as a Skill course.")});
document.querySelectorAll('a[href="CONTACT_TEAM"]').forEach(function(a){a.href='/contact?topic=corporates&program=SpeakUp!'});



// timeline: one module per scroll step (desktop); reveal on view (mobile)
(function(){
  var sec=document.getElementById('modules'),fill=document.getElementById('tlfill'),items=[].slice.call(document.querySelectorAll('.tl-item'));
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce){items.forEach(function(i){i.classList.add('on')});return}
  function mobile(){return innerWidth<=1100}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&mobile())e.target.classList.add('on')})},{threshold:.6});
  items.forEach(function(i){io.observe(i)});
  function onScroll(){
    if(mobile())return;
    var r=sec.getBoundingClientRect(),total=sec.offsetHeight-(innerHeight-NAV);
    var p=Math.min(1,Math.max(0,(NAV-r.top)/total));
    var n=Math.min(6,Math.floor(p*6.6+0.35));
    items.forEach(function(it,k){it.classList.toggle('on',k<n)});
    fill.style.transform='scaleX('+Math.max(0,(n-1)/5)+')';
  }
  addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);onScroll();
})();
// video testimonial: play with sound on tap
(function(){var v=document.getElementById('tvid'),c=document.getElementById('vcard'),b=document.getElementById('vplay');
 b.addEventListener('click',function(){v.controls=true;v.play();c.classList.add('playing')});
 v.addEventListener('ended',function(){c.classList.remove('playing');v.controls=false;v.load()});})();
// how it works: dot travels the loop (alternating in/outside class), then rises into a spiral
(function(){
  var sec=document.getElementById('how'),dot=document.getElementById('hwdot'),nodesG=document.getElementById('hwnodes'),trail=document.getElementById('hwtrail');
  var loop=document.getElementById('hwloop'),spiral=document.getElementById('hwspiral'),wk=document.getElementById('hwwk');
  var cards=[].slice.call(document.querySelectorAll('.hw-card')),end=document.getElementById('hwend'),rail=document.getElementById('hwrail');
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var C=210,R=140,NS='http://www.w3.org/2000/svg';
  var ang=[135,225,315,405],kind=['in','out','in','out'],lab=['In class','Outside class','In class','Outside class'];
  function pt(deg,r){r=r||R;var a=deg*Math.PI/180;return [C+r*Math.cos(a),C+r*Math.sin(a)]}
  var nodes=[],labels=[];
  ang.forEach(function(d,k){var p=pt(d),c=document.createElementNS(NS,'circle');c.setAttribute('cx',p[0]);c.setAttribute('cy',p[1]);c.setAttribute('r',13);c.setAttribute('class','hw-node '+kind[k]);nodesG.appendChild(c);nodes.push(c);
    var q=pt(d,R+34),t=document.createElementNS(NS,'text');t.setAttribute('x',q[0]);t.setAttribute('y',q[1]+4);t.setAttribute('text-anchor',Math.cos(d*Math.PI/180)<0?'end':'start');t.setAttribute('class','hw-nl');t.textContent=lab[k];nodesG.appendChild(t);labels.push(t)});
  function arc(d0,d1){if(d1-d0<.5)return '';var p0=pt(d0),p1=pt(d1),large=d1-d0>180?1:0;return 'M'+p0[0]+' '+p0[1]+'A'+R+' '+R+' 0 '+large+' 1 '+p1[0]+' '+p1[1]}
  // helix starts at the last node (45deg), tilted ellipse rx=R, ry=34, rising from y=330 to 70
  var back=document.getElementById('hwback'),front=document.getElementById('hwfront'),T0=Math.PI/4;
  function hel(t){var T=T0+t*3*2*Math.PI;return [C+R*Math.cos(T),330-260*t+34*Math.sin(T),Math.sin(T)]}
  var segs=[],N=240;for(var i=0;i<N;i++){var a=hel(i/N),b=hel((i+1)/N);var l=document.createElementNS(NS,'line');l.setAttribute('x1',a[0]);l.setAttribute('y1',a[1]);l.setAttribute('x2',b[0]);l.setAttribute('y2',b[1]);var f=(a[2]+b[2])/2>0;l.setAttribute('stroke',f?'#33999b':'#c9dedd');l.setAttribute('stroke-width',f?3.5:2.5);l.setAttribute('stroke-linecap','round');(f?front:back).appendChild(l);segs.push(l)}
  function setDot(x,y){dot.setAttribute('cx',x);dot.setAttribute('cy',y)}
  function render(p){
    var lapEnd=.72;
    if(p<lapEnd){
      sec.classList.remove('done');loop.style.opacity=1;spiral.setAttribute('opacity',0);
      var q=p/lapEnd,stop=Math.min(3,Math.floor(q*4)),within=q*4-stop,move=stop<3?Math.max(0,(within-.55)/.45):0;
      var d=ang[stop]+90*move,xy=pt(d);setDot(xy[0],xy[1]);trail.setAttribute('d',arc(135,d));
      nodes.forEach(function(n,k){n.classList.toggle('on',k<=stop)});labels.forEach(function(n,k){n.classList.toggle('on',k===stop)});
      cards.forEach(function(c,k){c.classList.toggle('on',k===stop)});
      wk.textContent='Week '+Math.max(1,Math.round(1+q*5));
      segs.forEach(function(s){s.style.opacity=0});
    }else{
      var t=Math.min(1,(p-lapEnd)/(1-lapEnd));sec.classList.add('done');
      loop.style.opacity=Math.max(0,1-t*3);spiral.setAttribute('opacity',Math.min(1,t*2.5));
      var g=Math.min(1,t*1.25),shown=Math.floor(N*g);segs.forEach(function(s,k){s.style.opacity=k<shown?1:0});
      var n3=pt(45),h=hel(g),blend=Math.min(1,t*6);setDot(n3[0]+(h[0]-n3[0])*blend,n3[1]+(h[1]-n3[1])*blend);
    }
  }
  function small(){return innerWidth<=1024}
  // tablet/mobile: cards appear one by one, the centre line grows with them
  var shownCount=0;
  function grow(){var last=cards[shownCount-1];if(!last){rail.style.height='0';return}rail.style.height=(last.offsetTop+last.offsetHeight/2)+'px'}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&small()){e.target.classList.add('on');var i=cards.indexOf(e.target);if(i>=0)shownCount=Math.max(shownCount,i+1);else end.classList.add('on');grow()}})},{threshold:.5});
  cards.concat([end]).forEach(function(c){io.observe(c)});
  function onScroll(){
    if(reduce){cards.forEach(function(c){c.classList.add('on')});return}
    if(small())return;
    var r=sec.getBoundingClientRect(),total=sec.offsetHeight-(innerHeight-NAV);
    render(Math.min(1,Math.max(0,(NAV-r.top)/total)));
  }
  addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);onScroll();
})();
// waitlist: no backend yet, so hand the details to WhatsApp
(function(){var f=document.getElementById('wlform'),m=document.getElementById('wlmsg');
 f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f),n=(d.get('name')||'').trim(),p=(d.get('phone')||'').trim();
  if(!n||!p){m.textContent='Please add your name and WhatsApp number.';return}
  var t='Hi Grow Wings, please add me to the English as a Skill waitlist.\nName: '+n+'\nWhatsApp: '+p+(d.get('email')?'\nEmail: '+d.get('email'):'')+'\nGoal: '+d.get('goal');
  window.open('https://wa.me/917400454654?text='+encodeURIComponent(t),'_blank','noopener');m.textContent='Thanks! Send the WhatsApp message that just opened and you’re on the list.'})})();
// faq
var F=[
 ['Are the sessions recorded?','No. The course is practice-based: after every class we send you exactly what to practise, so you keep improving between sessions.'],
 ['What if I miss a session?','Do that session’s practice tasks and tell your facilitator. They’ll help you catch up in the next class.'],
 ['Do I get a certificate?','Yes. You get a certificate when you complete the course.'],
 ['How does the level check work?','A short call where we chat with you in English and ask a few questions. It takes about 15 minutes and is free.'],
 ['What do I need to join?','A laptop or phone with Zoom and a steady internet connection. A quiet spot helps.'],
 ['What if it isn’t for me?','Cancel before your first session for a full refund. After the first week, we can move you to a later batch instead.'],
 ['Can my company sign up a team?','Yes. We run the course for companies as SpeakUp!, with group pricing and progress reports for HR. Talk to us to get a quote.']
];
var faq=document.getElementById('faq');
faq.innerHTML=F.map(function(f){return '<div class="fq"><button aria-expanded="false">'+f[0]+'<span aria-hidden="true">+</span></button><p>'+f[1]+'</p></div>'}).join('');
faq.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var q=b.parentNode;q.classList.toggle('on');b.setAttribute('aria-expanded',q.classList.contains('on'))});

// story: pinned horizontal scroll with pop-ins
(function(){
  var story=document.getElementById('story'),track=document.getElementById('track'),dotsEl=document.getElementById('dots');
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,N=4;
  var P=[0,.08,.18,.42,.52,.82,.91,1],X=[0,0,1,1,2,2,3,3];
  var el={};document.querySelectorAll('[data-k]').forEach(function(e){el[e.dataset.k]=e});
  dotsEl.innerHTML=[0,1,2,3].map(function(i){return '<button class="dot" data-i="'+i+'" aria-label="Scene '+(i+1)+'"><i></i></button>'}).join('');
  function mobile(){return innerWidth<=860}
  function ss(t){return t*t*(3-2*t)}
  function on(k,v){if(el[k])el[k].classList.toggle('on',v)}
  function dots(i){dotsEl.querySelectorAll('.dot').forEach(function(d,k){d.classList.toggle('on',k===i)});story.classList.toggle('lightui',i===3)}
  function local(p,a,b){return Math.min(1,Math.max(0,(p-a)/(b-a)))}
  function apply(p){
    var x=0;for(var i=0;i<P.length-1;i++){if(p>=P[i]&&p<=P[i+1]){var t=(p-P[i])/(P[i+1]-P[i]||1);x=X[i]+(X[i+1]-X[i])*ss(t);break}}
    if(p>=1)x=3;
    track.style.transform='translateX('+(-x*25)+'%)';
    var w=local(p,.18,.42);on('c2a',w>.02);on('c2b',w>.18);on('w0',w>.38);on('w1',w>.56);on('w2',w>.74);
    var q=local(p,.52,.82);on('c3',q>.02);on('p0',q>.2);on('t0',q>.26);on('p1',q>.45);on('t1',q>.51);on('p2',q>.7);on('t2',q>.76);
    on('s3',p>.91);dots(Math.round(x));
  }
  function onScroll(){
    if(reduce)return;
    if(mobile())return;
    var r=story.getBoundingClientRect(),total=story.offsetHeight-(innerHeight-NAV);
    var raw=(NAV-r.top)/total;on('g0',raw>-0.06);on('s0a',raw>-0.05);on('s0b',raw>-0.02);
    apply(Math.min(1,Math.max(0,raw)));
  }
  // mobile: play each scene's pops when it is swiped into view
  var cur=-1;
  function mScene(){
    var i=Math.round(track.scrollLeft/track.clientWidth);if(i===cur)return;cur=i;dots(i);
    var seq={0:['g0','s0a','s0b'],1:['c2a','c2b','w0','w1','w2'],2:['c3','p0','t0','p1','t1','p2','t2'],3:['s3']}[i]||[];
    seq.forEach(function(k,j){setTimeout(function(){on(k,true)},250+j*450)});
  }
  // keep the thought-bubble words scrambling once they are showing
  var chars='abcdefghijklmnopqrstuvwxyz';
  ['w0','w1','w2'].forEach(function(k,j){var e=el[k],final=e.textContent;if(reduce)return;
    setInterval(function(){if(!e.classList.contains('on'))return;var t=0,id=setInterval(function(){t++;e.textContent=final.split('').map(function(c,i){return /[a-zA-Z]/.test(c)&&i>=t?chars[Math.floor(Math.random()*26)]:c}).join('');if(t>=final.length){clearInterval(id);e.textContent=final}},55)},2600+j*500)});
  if(reduce){Object.keys(el).forEach(function(k){on(k,true)});return}
  dotsEl.addEventListener('click',function(e){var d=e.target.closest('.dot');if(!d)return;var i=+d.dataset.i;
    if(mobile()){track.scrollTo({left:i*track.clientWidth,behavior:'smooth'});return}
    var targets=[0.04,0.40,0.80,0.97],total=story.offsetHeight-(innerHeight-NAV);
    window.scrollTo({top:story.offsetTop-NAV+total*targets[i],behavior:'smooth'})});
  addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);
  track.addEventListener('scroll',function(){if(mobile())mScene()},{passive:true});
  if(mobile())mScene();else onScroll();
})();

})();
