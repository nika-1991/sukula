/* საერთო SVG გენერატორი — window.FesviSVG (კანვასი 0 0 200 240) */
(function(){
  let _id=0;
  const uid=()=>++_id;

  /* ── POT ── */
  function potSVG(pot,ns){
    const raw=(pot&&pot.color)||'#A86030';
    function hexMix(h,f){
      const s=h.replace('#','');
      const p=s.length===3?s.split('').map(c=>c+c).join(''):s;
      const c=i=>Math.max(0,Math.min(255,Math.round(parseInt(p.slice(i,i+2),16)*f)));
      return '#'+[0,2,4].map(i=>c(i).toString(16).padStart(2,'0')).join('');
    }
    const hi=hexMix(raw,1.32), lo=hexMix(raw,.58), mid=hexMix(raw,.85), dk=hexMix(raw,.46);
    const gb=`pb${ns}`,gr=`pr${ns}`,gs=`ps${ns}`,gsh=`psh${ns}`,gfl=`pf${ns}`;
    let d=`<defs>
      <radialGradient id="${gb}" cx="30%" cy="22%" r="85%" gradientUnits="objectBoundingBox">
        <stop offset="0%" stop-color="${hi}"/>
        <stop offset="28%" stop-color="${raw}"/>
        <stop offset="62%" stop-color="${mid}"/>
        <stop offset="100%" stop-color="${lo}"/>
      </radialGradient>
      <radialGradient id="${gr}" cx="38%" cy="35%" r="78%" gradientUnits="objectBoundingBox">
        <stop offset="0%" stop-color="${hi}"/>
        <stop offset="55%" stop-color="${mid}"/>
        <stop offset="100%" stop-color="${dk}"/>
      </radialGradient>
      <radialGradient id="${gs}" cx="40%" cy="30%" r="70%" gradientUnits="objectBoundingBox">
        <stop offset="0%" stop-color="#5C3D22"/>
        <stop offset="50%" stop-color="#3A2412"/>
        <stop offset="100%" stop-color="#201208"/>
      </radialGradient>
      <radialGradient id="${gfl}" cx="50%" cy="50%" r="50%" gradientUnits="objectBoundingBox">
        <stop offset="0%" stop-color="${raw}" stop-opacity=".18"/>
        <stop offset="100%" stop-color="${raw}" stop-opacity="0"/>
      </radialGradient>
      <filter id="${gsh}" x="-20%" y="-10%" width="140%" height="140%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="4"/>
      </filter>
    </defs>`;
    // ground shadow
    d+=`<ellipse cx="100" cy="228" rx="54" ry="7" fill="#00000022" filter="url(#${gsh})"/>`;
    // saucer base
    d+=`<path d="M50,215 Q100,226 150,215 L153,220 Q100,232 47,220Z" fill="${dk}"/>`;
    // body (trapezoid frustum)
    d+=`<path d="M36,118 L52,208 Q100,222 148,208 L164,118Z" fill="url(#${gb})"/>`;
    // left edge highlight
    d+=`<path d="M36,118 L52,208 Q56,210 59,208 L44,118Z" fill="white" opacity=".08"/>`;
    // right edge shadow
    d+=`<path d="M164,118 L148,208 Q145,210 142,208 L156,118Z" fill="black" opacity=".1"/>`;
    // rim outer ellipse
    d+=`<ellipse cx="100" cy="118" rx="64" ry="14" fill="url(#${gr})"/>`;
    // rim highlight arc
    d+=`<path d="M42,115 Q100,108 158,115" stroke="${hi}" stroke-width="1.8" fill="none" opacity=".45" stroke-linecap="round"/>`;
    // rim inner shadow
    d+=`<ellipse cx="100" cy="118" rx="53" ry="10.5" fill="${dk}" opacity=".5"/>`;
    // soil surface
    d+=`<ellipse cx="100" cy="117" rx="49" ry="8.5" fill="url(#${gs})"/>`;
    // soil pebble texture
    for(const[sx,sy,sr,so] of [[88,115,4.2,.38],[108,114,3.6,.32],[100,112,3,.28],[80,116,2.8,.24],[118,115,2.8,.24],[94,112,2.2,.2]]){
      d+=`<circle cx="${sx}" cy="${sy}" r="${sr}" fill="#180C04" opacity="${so}"/>`;
    }
    // subtle ambient fill on body
    d+=`<path d="M36,118 L52,208 Q100,222 148,208 L164,118Z" fill="url(#${gfl})"/>`;
    return d;
  }

  /* ── PLANTS ── */
  function echeveria(ns){
    const gc=`ec${ns}`,gl=`el${ns}`,gm=`em${ns}`,gi=`ei${ns}`,gp=`ep${ns}`;
    let d=`<defs>
      <radialGradient id="${gc}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#3E7040"/><stop offset="100%" stop-color="#244030"/>
      </radialGradient>
      <radialGradient id="${gl}" cx="35%" cy="20%" r="80%">
        <stop offset="0%" stop-color="#A0D078"/><stop offset="55%" stop-color="#6CA050"/><stop offset="100%" stop-color="#3E6830"/>
      </radialGradient>
      <radialGradient id="${gm}" cx="35%" cy="20%" r="80%">
        <stop offset="0%" stop-color="#8ABE68"/><stop offset="55%" stop-color="#5A9048"/><stop offset="100%" stop-color="#386030"/>
      </radialGradient>
      <radialGradient id="${gi}" cx="35%" cy="20%" r="80%">
        <stop offset="0%" stop-color="#78AA5C"/><stop offset="100%" stop-color="#30583C"/>
      </radialGradient>
      <radialGradient id="${gp}" cx="50%" cy="80%" r="60%">
        <stop offset="0%" stop-color="#E8A8C8"/><stop offset="60%" stop-color="#C07098"/><stop offset="100%" stop-color="#C07098" stop-opacity="0"/>
      </radialGradient>
    </defs>`;
    // outer ring — 10 leaves drooping outward
    for(let i=0;i<10;i++){
      const a=i*36;
      d+=`<path d="M0,0 C-14,-22 -16,-54 0,-76 C16,-54 14,-22 0,0Z" fill="url(#${gl})" transform="translate(100,108) rotate(${a}) translate(0,-2)"/>`;
      d+=`<ellipse cx="0" cy="-62" rx="7" ry="11" fill="url(#${gp})" transform="translate(100,108) rotate(${a})"/>`;
    }
    // mid ring — 8 leaves
    for(let i=0;i<8;i++){
      const a=i*45+22;
      d+=`<path d="M0,0 C-11,-18 -12,-44 0,-60 C12,-44 11,-18 0,0Z" fill="url(#${gm})" transform="translate(100,108) rotate(${a}) translate(0,-1)"/>`;
    }
    // inner ring — 6 leaves
    for(let i=0;i<6;i++){
      const a=i*60+10;
      d+=`<path d="M0,0 C-8,-14 -9,-32 0,-44 C9,-32 8,-14 0,0Z" fill="url(#${gi})" transform="translate(100,108) rotate(${a})"/>`;
    }
    // innermost — 4
    for(let i=0;i<4;i++){
      d+=`<path d="M0,0 C-5,-9 -5,-22 0,-30 C5,-22 5,-9 0,0Z" fill="#5A8A48" transform="translate(100,108) rotate(${i*90+5})"/>`;
    }
    d+=`<circle cx="100" cy="108" r="7" fill="url(#${gc})"/>`;
    d+=`<circle cx="100" cy="108" r="3.5" fill="#2A5030"/>`;
    return d;
  }

  function cactus(ns){
    const gb=`cb${ns}`,gr=`cr${ns}`,gf=`cf${ns}`;
    let d=`<defs>
      <linearGradient id="${gb}" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#2E6830"/>
        <stop offset="22%" stop-color="#4E9A52"/>
        <stop offset="50%" stop-color="#5EAA60"/>
        <stop offset="78%" stop-color="#4A9050"/>
        <stop offset="100%" stop-color="#287028"/>
      </linearGradient>
      <radialGradient id="${gr}" cx="30%" cy="20%" r="70%">
        <stop offset="0%" stop-color="#80CC88" stop-opacity=".5"/><stop offset="100%" stop-color="#80CC88" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="${gf}" cx="50%" cy="40%" r="55%">
        <stop offset="0%" stop-color="#FFC0D4"/><stop offset="60%" stop-color="#E07898"/><stop offset="100%" stop-color="#A84868"/>
      </radialGradient>
    </defs>`;
    // main body
    d+=`<path d="M82,122 Q78,50 100,34 Q122,50 118,122 Q100,134 82,122Z" fill="url(#${gb})"/>`;
    // rib lines
    for(let y=52;y<120;y+=10){
      d+=`<path d="M83,${y} Q100,${y+4.5} 117,${y}" stroke="#287028" stroke-width="1.8" fill="none" opacity=".45"/>`;
    }
    // highlight bloom
    d+=`<path d="M82,122 Q78,50 100,34 Q122,50 118,122Z" fill="url(#${gr})"/>`;
    // areoles + spines
    for(let row=0;row<6;row++){
      const y=58+row*11;
      for(const x of [88,100,112]){
        d+=`<circle cx="${x}" cy="${y}" r="2.2" fill="#D8CC96" opacity=".75"/>`;
        for(let s=0;s<7;s++){
          const ra=(s/7)*Math.PI*2+.15;
          const len=s%2===0?6.5:4.5;
          d+=`<line x1="${x}" y1="${y}" x2="${(x+Math.cos(ra)*len).toFixed(1)}" y2="${(y+Math.sin(ra)*len*.85).toFixed(1)}" stroke="#E8E0B8" stroke-width=".9" opacity=".8"/>`;
        }
      }
    }
    // flower
    d+=`<circle cx="100" cy="34" r="15" fill="url(#${gf})"/>`;
    for(let i=0;i<8;i++){
      const a=i*45, r1=10, r2=14;
      d+=`<path d="M0,-${r1} Q3,-${(r1+r2)/2} 0,-${r2} Q-3,-${(r1+r2)/2} 0,-${r1}Z" fill="#F4B8CC" opacity=".7" transform="translate(100,34) rotate(${a})"/>`;
    }
    d+=`<circle cx="100" cy="34" r="5.5" fill="#F8D848"/>`;
    d+=`<circle cx="100" cy="34" r="2.5" fill="#D4A020"/>`;
    return d;
  }

  function aloe(ns){
    const defs_arr=[];
    const leaves=[[-46,80],[-23,96],[0,108],[23,96],[46,80]];
    let d='<defs>';
    leaves.forEach(([ang,len],i)=>{
      const bright=ang<0?1.15:1.0;
      d+=`<linearGradient id="al${ns}${i}" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#4A8840"/>
        <stop offset="30%" stop-color="${ang<0?'#72B060':'#5A9A50'}"/>
        <stop offset="70%" stop-color="#488040"/>
        <stop offset="100%" stop-color="#2E5C28"/>
      </linearGradient>`;
    });
    d+='</defs>';
    leaves.forEach(([ang,len],i)=>{
      // leaf body — plump at base, pointed at tip
      d+=`<path d="M-10,0 C-12,${-len*.2} -8,${-len*.65} 0,${-len} C8,${-len*.65} 12,${-len*.2} 10,0 Q0,9 -10,0Z" fill="url(#al${ns}${i})" transform="translate(100,120) rotate(${ang})"/>`;
      // midrib
      d+=`<path d="M0,-4 Q0.5,${-len*.5} 0,${-len*.94}" stroke="#88C870" stroke-width="1.5" fill="none" opacity=".4" stroke-linecap="round" transform="translate(100,120) rotate(${ang})"/>`;
      // spots
      for(let t=.28;t<.84;t+=.18){
        const yy=-len*t, hw=9*(1-t*.7);
        d+=`<ellipse cx="${-hw*.28}" cy="${yy}" rx="${hw*.48}" ry="${len*.038}" fill="#90D078" opacity=".42" transform="translate(100,120) rotate(${ang})"/>`;
        d+=`<ellipse cx="${hw*.28}" cy="${yy-.4}" rx="${hw*.38}" ry="${len*.03}" fill="#90D078" opacity=".32" transform="translate(100,120) rotate(${ang})"/>`;
      }
      // teeth/serrations on edge
      for(let t=.15;t<.88;t+=.12){
        const yy=-len*t, hw=10*(1-t*.7)+1;
        d+=`<path d="M${hw},${yy} L${hw+3},${yy-len*.04} L${hw+1},${yy}" fill="#3A6E30" opacity=".35" transform="translate(100,120) rotate(${ang})"/>`;
      }
      // tip
      d+=`<path d="M-2,${-len*.92} Q0,${-len} 2,${-len*.92}" fill="#CC5830" transform="translate(100,120) rotate(${ang})"/>`;
    });
    return d;
  }

  function zebra(ns){
    let d=`<defs>
      <linearGradient id="zb${ns}" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#1A4828"/>
        <stop offset="30%" stop-color="#2E6840"/>
        <stop offset="70%" stop-color="#265838"/>
        <stop offset="100%" stop-color="#142E1A"/>
      </linearGradient>
    </defs>`;
    const leaves=[[-42,48],[-21,58],[0,64],[21,58],[42,48]];
    for(const[ang,len] of leaves){
      d+=`<path d="M-7,0 C-8,${-len*.3} -3,${-len*.8} 0,${-len} C3,${-len*.8} 8,${-len*.3} 7,0 Q0,7 -7,0Z" fill="url(#zb${ns})" transform="translate(100,120) rotate(${ang})"/>`;
      // white bands
      for(let t=.18;t<.93;t+=.14){
        const yy=-len*t, hw=7*(1-t*.65)+.5;
        d+=`<rect x="${-hw}" y="${yy-.85}" width="${hw*2}" height="1.7" rx=".5" fill="#E8F4DC" opacity=".6" transform="translate(100,120) rotate(${ang})"/>`;
      }
      // window translucency at tip
      d+=`<path d="M-2,${-len*.78} C-1.5,${-len*.88} 1.5,${-len*.88} 2,${-len*.78}" stroke="#5A9860" stroke-width="1" fill="none" opacity=".3" transform="translate(100,120) rotate(${ang})"/>`;
    }
    return d;
  }

  function pearls(ns){
    let d=`<defs>
      <radialGradient id="pp${ns}" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stop-color="#C0E8A0"/>
        <stop offset="40%" stop-color="#7AB864"/>
        <stop offset="100%" stop-color="#3A6C2A"/>
      </radialGradient>
      <radialGradient id="ph${ns}" cx="30%" cy="28%" r="50%">
        <stop offset="0%" stop-color="#EEFCE6" stop-opacity=".9"/>
        <stop offset="100%" stop-color="#EEFCE6" stop-opacity="0"/>
      </radialGradient>
    </defs>`;
    const strands=[[80,116,52,210],[91,116,70,214],[100,116,100,217],[109,116,130,214],[120,116,148,210],[84,116,40,200],[116,116,160,200]];
    for(const[x0,y0,x1,y1] of strands){
      const cxm=(x0+x1)/2+(x1<100?-18:18), cym=(y0+y1)/2+18;
      for(let t=0;t<=1;t+=.09){
        const mx=(1-t)**2*x0+2*(1-t)*t*cxm+t**2*x1;
        const my=(1-t)**2*y0+2*(1-t)*t*cym+t**2*y1;
        const r=5.8;
        d+=`<circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="${r}" fill="url(#pp${ns})"/>`;
        d+=`<circle cx="${(mx-1.9).toFixed(1)}" cy="${(my-2.1).toFixed(1)}" r="2.4" fill="url(#ph${ns})"/>`;
        d+=`<circle cx="${(mx-2.6).toFixed(1)}" cy="${(my-2.8).toFixed(1)}" r=".9" fill="white" opacity=".6"/>`;
      }
    }
    // crown
    for(let i=0;i<7;i++){
      const ax=100+(i-3)*9.5, ay=109-Math.abs(i-3)*2.2;
      d+=`<circle cx="${ax}" cy="${ay}" r="6.4" fill="url(#pp${ns})"/>`;
      d+=`<circle cx="${ax-2}" cy="${ay-2.2}" r="2.6" fill="url(#ph${ns})"/>`;
      d+=`<circle cx="${ax-2.8}" cy="${ay-3}" r="1" fill="white" opacity=".55"/>`;
    }
    return d;
  }

  const PLANTS={echeveria,cactus,aloe,zebra,pearls};

  /* ── PACKAGING ── */
  function pkgBack(shape){
    if(shape==='premium'){
      return `<path d="M46,150 L154,150 L162,226 L38,226 Z" fill="#CBA877"/>`
           + `<path d="M46,150 L154,150 L152,162 L48,162 Z" fill="#B8945F"/>`;
    }
    return '';
  }
  function pkgFront(shape){
    if(shape==='kraft'){
      let s=`<path d="M48,160 Q100,171 152,160 L154,184 Q100,195 46,184 Z" fill="#C9A87C"/>`;
      s+=`<path d="M48,160 Q100,171 152,160 L154,184 Q100,195 46,184 Z" fill="#000" opacity="0.06"/>`;
      s+=`<path d="M88,172 Q78,165 82,179 Q92,177 96,172 Z" fill="#9C8B63"/>`;
      s+=`<path d="M112,172 Q122,165 118,179 Q108,177 104,172 Z" fill="#9C8B63"/>`;
      s+=`<circle cx="100" cy="173" r="3.4" fill="#7E6E48"/>`;
      s+=`<path d="M99,176 L94,191 M101,176 L106,191" stroke="#9C8B63" stroke-width="2" stroke-linecap="round"/>`;
      return s;
    }
    if(shape==='premium'){
      let s=`<rect x="93" y="150" width="14" height="76" fill="#2E6B4F"/>`;
      s+=`<rect x="38" y="180" width="124" height="13" fill="#2E6B4F"/>`;
      s+=`<rect x="93" y="150" width="14" height="76" fill="#fff" opacity="0.08"/>`;
      s+=`<path d="M100,140 Q82,128 86,146 Q98,144 100,140 Z" fill="#2E6B4F"/>`;
      s+=`<path d="M100,140 Q118,128 114,146 Q102,144 100,140 Z" fill="#2E6B4F"/>`;
      s+=`<circle cx="100" cy="142" r="4.4" fill="#235640"/>`;
      return s;
    }
    return '';
  }

  function compose(plant,pot,pkg){
    const ns=uid(), shape=pkg?pkg.shape:'plain';
    return `<svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg">`
      +pkgBack(shape)
      +potSVG(pot,ns)
      +(PLANTS[(plant&&plant.shape)]||PLANTS.echeveria)(ns)
      +pkgFront(shape)
      +`</svg>`;
  }

  function plantThumb(p){
    const ns=uid();
    return `<svg viewBox="16 24 168 120" xmlns="http://www.w3.org/2000/svg">${(PLANTS[(p&&p.shape)]||PLANTS.echeveria)(ns)}</svg>`;
  }

  function potThumb(p){
    const ns=uid();
    return `<svg viewBox="20 96 160 142" xmlns="http://www.w3.org/2000/svg">${potSVG(p,ns)}</svg>`;
  }

  function pkgThumb(p){
    const ns=uid(), shape=p?p.shape:'plain';
    return `<svg viewBox="20 96 160 142" xmlns="http://www.w3.org/2000/svg">${pkgBack(shape)+potSVG({color:'#AA6030'},ns)+pkgFront(shape)}</svg>`;
  }

  window.FesviSVG={compose,plantThumb,potThumb,pkgThumb,
    PLANT_SHAPES:Object.keys(PLANTS),PKG_SHAPES:['plain','kraft','premium']};
})();
