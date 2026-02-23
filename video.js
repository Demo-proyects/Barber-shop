(function(){
  const srcs = [
    'https://bouzen.org/wp-content/uploads/2026/02/baber-1.mp4',
    'https://bouzen.org/wp-content/uploads/2026/02/barber-3.mp4',
    'https://bouzen.org/wp-content/uploads/2026/02/barber-2.mp4'
  ];
  const $ = id => document.getElementById(id);
  const player=$('vd-player'), playZone=$('vd-play-zone'), playBtn=$('vd-play-btn'),
        iPlay=$('vd-icon-play'), iPause=$('vd-icon-pause'),
        iSnd=$('vd-icon-sound'), iMut=$('vd-icon-muted'),
        fill=$('vd-progress-fill'), track=$('vd-progress-track'), loader=$('vd-loader');
  const thumbs = document.querySelectorAll('.vs-thumb');
  let current = 1;

  const tog = (el,show) => el.classList.toggle('hidden',!show);
  const setPlay = on => { tog(iPlay,!on); tog(iPause,on); playBtn.style.opacity=on?'0':'1'; playBtn.style.transform=on?'scale(.85)':'scale(1)'; };
  const setThumbs = idx => thumbs.forEach((t,i) => t.classList.toggle('is-active', i===idx));

  function load(idx, play=true){
    current=idx; player.src=srcs[idx]; fill.style.width='0%';
    loader.classList.remove('hidden'); player.load();
    setThumbs(idx);
    if(play) player.play().then(()=>{loader.classList.add('hidden');setPlay(true);}).catch(()=>{loader.classList.add('hidden');setPlay(false);});
    else { loader.classList.add('hidden'); setPlay(false); }
  }

  load(1, false);

  playZone.addEventListener('click', ()=> player.paused ? (player.play(),setPlay(true)) : (player.pause(),setPlay(false)));
  ['mouseenter','mouseleave'].forEach(ev => playZone.addEventListener(ev, ()=>{ if(!player.paused){ playBtn.style.opacity=ev==='mouseenter'?'1':'0'; playBtn.style.transform=ev==='mouseenter'?'scale(1)':'scale(.85)'; }}));
  player.addEventListener('timeupdate', ()=> { if(player.duration) fill.style.width=(player.currentTime/player.duration*100)+'%'; });
  player.addEventListener('ended', ()=>{ setPlay(false); playBtn.style.opacity='1'; playBtn.style.transform='scale(1)'; });
  track.addEventListener('click', e=>{ const r=track.getBoundingClientRect(); player.currentTime=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*player.duration; });
  $('vd-mute').addEventListener('click', e=>{ e.stopPropagation(); player.muted=!player.muted; tog(iSnd,!player.muted); tog(iMut,player.muted); });

  thumbs.forEach((t,i)=> t.addEventListener('click', ()=>{ swiper.slideTo(i); load(i); }));

  const swiper = new Swiper('.vs-swiper',{
    slidesPerView:'auto', spaceBetween:14, centeredSlides:true,
    initialSlide:1, grabCursor:true,
    pagination:{el:'.vs-pagination',clickable:true},
    on:{ slideChange(s){ load(s.activeIndex); } }
  });

  [['vd-prev','slidePrev'],['vd-next','slideNext'],['vd-prev-mob','slidePrev'],['vd-next-mob','slideNext']]
    .forEach(([id,fn])=>{ const el=$(id); if(el) el.addEventListener('click',()=>swiper[fn]()); });

  if(window.gsap&&window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.create({ trigger:'#videos-section', start:'top 82%', once:true, onEnter:()=>{
      gsap.from('.videos-heading-block',{opacity:0,y:28,duration:.85,ease:'power3.out'});
      gsap.from('.vs-arrows',{opacity:0,x:24,duration:.7,delay:.2,ease:'power2.out'});
      gsap.from('.vs-player-wrap',{opacity:0,y:38,scale:.97,duration:1,delay:.1,ease:'power3.out'});
      gsap.from('.vs-thumb',{opacity:0,y:22,stagger:.1,delay:.3,duration:.7,ease:'power2.out'});
    }});
  }
})();