'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const defaultSheet=`[Intro]
Am            G                  C

[Verse 1]
Am            G                  C
I was scared of dentists and the dark

Am            G                  C
… paste the next lyric line here …

[Chorus]
Am            G                  C
… paste your chorus lyrics here …

[Bridge]
Am            G
… paste your bridge lyrics here …
C             Fmaj7
… continue the bridge here …`;
const shapes={Am:{frets:[-1,0,2,2,1,0],fingers:[0,0,2,3,1,0]},G:{frets:[3,2,0,0,0,3],fingers:[2,1,0,0,0,3]},C:{frets:[-1,3,2,0,1,0],fingers:[0,3,2,0,1,0]},Fmaj7:{frets:[-1,-1,3,2,1,0],fingers:[0,0,3,2,1,0]}};
const arrows=['↓','·','↓','↑','·','↑','↓','↑'], counts=['1','&','2','&','3','&','4','&'];
const storageKey='guitar-inline-sheet-v2';
let source=defaultSheet;
try{const stored=localStorage.getItem(storageKey);if(stored&&stored.trim()&&stored.length<=120000){source=stored;}}catch{}
let sections=[], sequence=[];
const state={playing:false,focus:false,step:0,index:0,tempo:102,timer:null,finished:false,highlighted:false};
function announce(s){$('#status').textContent=s;}
function esc(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function chordTokens(line){
  const matches=[...line.matchAll(/\S+/g)].filter(m=>m[0]!=='|');
  return matches.length&&matches.every(m=>/^[A-G](?:#|b)?(?:m(?:aj)?|maj|dim|aug|sus[24]?|add\d+)?\d*(?:\/[A-G](?:#|b)?)?$/.test(m[0]))?matches.map(m=>({name:m[0],pos:m.index})):null;
}
function parseSheet(text){
  const result=[];let section=null,pending=null;
  const ensure=()=>{if(!section){section={name:'Song',rows:[]};result.push(section);}return section;};
  const flush=()=>{if(pending){ensure().rows.push({chords:pending,lyric:''});pending=null;}};
  text.replace(/\r/g,'').split('\n').forEach(raw=>{
    const line=raw.replace(/\t/g,'    ').trimEnd();
    const heading=line.match(/^\s*\[([^\]]+)\]\s*$/);
    if(heading){flush();section={name:heading[1],rows:[]};result.push(section);return;}
    if(!line.trim()){flush();return;}
    const chords=chordTokens(line);
    if(chords){flush();pending=chords;return;}
    if(pending){ensure().rows.push({chords:pending,lyric:line});pending=null;}
    else ensure().rows.push({chords:[],lyric:line});
  });flush();return result;
}
function diagram(name){
  const shape=shapes[name];if(!shape)return '<span class="unsupported">Diagram not included</span>';
  let svg=`<svg class="fretboard" viewBox="0 0 66 91" role="img" aria-label="${esc(name)} fingering, low E to high e: ${shape.frets.map(v=>v<0?'muted':v).join(', ')}">`;
  for(let f=0;f<=4;f++)svg+=`<line x1="6" y1="${18+f*14}" x2="56" y2="${18+f*14}" stroke="${f?'#bbb':'#333'}" stroke-width="${f?'.7':'2'}"/>`;
  for(let i=0;i<6;i++){
    const x=6+i*10,f=shape.frets[i];svg+=`<line x1="${x}" y1="18" x2="${x}" y2="74" stroke="#999" stroke-width=".7"/>`;
    if(f<=0)svg+=`<text x="${x}" y="11" text-anchor="middle" font-size="10" fill="#777">${f<0?'×':'○'}</text>`;
    else svg+=`<circle cx="${x}" cy="${18+(f-.5)*14}" r="5.3" fill="#303030"/><text x="${x}" y="${20.8+(f-.5)*14}" text-anchor="middle" font-family="Arial,sans-serif" font-size="8" fill="white">${shape.fingers[i]}</text>`;
    svg+=`<text x="${x}" y="87" text-anchor="middle" font-family="Arial,sans-serif" font-size="6" fill="#888">${['E','A','D','G','B','e'][i]}</text>`;
  }return svg+'</svg>';
}
function render(resetPosition=true){
  sections=parseSheet(source);sequence=[];
  $('#song-sheet').innerHTML=sections.map((section,si)=>`<section class="song-section" id="section-${si}" aria-labelledby="heading-${si}"><header class="section-heading"><h2 id="heading-${si}">[${esc(section.name)}]</h2></header>${section.rows.map((row,ri)=>{
    if(!row.chords.length)return `<div class="sheet-line-wrap"><div class="plain-line">${esc(row.lyric)}</div></div>`;
    const id=`line-${si}-${ri}`,cols=Math.max(row.lyric.length,...row.chords.map(c=>c.pos+14));
    // Stack guides in separate lanes when source chord changes are close together.
    const lanes=(key,width)=>{const ends=[];row.chords.forEach(c=>{let lane=ends.findIndex(end=>end<=c.pos);if(lane<0)lane=ends.length;ends[lane]=c.pos+width;c[key]=lane;});return ends.length;};
    const charWidth=Number($('#sheet-size').value)*.6;
    const diagramLanes=lanes('diagramLane',Math.ceil(75/charWidth)),rhythmLanes=lanes('rhythmLane',Math.ceil(112/charWidth));
    row.chords.forEach((chord,ci)=>sequence.push({si,ri,ci,chord:chord.name,id,pos:chord.pos}));
    const anchors=(callback)=>row.chords.map((chord,ci)=>callback(chord,`${id}-${ci}`)).join('');
    return `<div class="sheet-line-wrap"><div class="sheet-line ${!row.lyric?'instrumental':''}" id="${id}" style="--cols:${cols}"><div class="diagram-line" style="height:${diagramLanes*93}px">${anchors((c,k)=>`<div class="anchor diagram-anchor" data-anchor="${k}" style="--pos:${c.pos};top:${c.diagramLane*93}px">${diagram(c.name)}</div>`)}</div><div class="chord-line">${anchors((c,k)=>`<button type="button" class="anchor chord-anchor" data-anchor="${k}" style="--pos:${c.pos}" aria-pressed="false" aria-label="Select ${esc(c.name)}, ${esc(section.name)}, line ${ri+1}">${esc(c.name)}</button>`)}</div><p class="lyric-line ${row.lyric.startsWith('…')?'placeholder-line':''}">${row.lyric?esc(row.lyric):' '}</p><div class="rhythm-line" style="height:${rhythmLanes*49}px">${anchors((c,k)=>`<div class="rhythm-anchor" data-anchor="${k}" style="--pos:${c.pos};top:${c.rhythmLane*49}px" role="img" aria-label="${esc(c.name)} practice strumming: down, silent, down, up, silent, up, down, up"><div class="rhythm-counts">${counts.map(v=>`<span>${v}</span>`).join('')}</div><div class="rhythm-arrows">${arrows.map((v,i)=>`<span class="${v==='·'?'rest':''}" data-step="${i}">${v}</span>`).join('')}</div></div>`)}</div></div></div>`;
  }).join('')||'<p class="section-empty">No lines in this section.</p>'}</section>`).join('');
  $('#excerpt-note').hidden=source!==defaultSheet;
  if(resetPosition){state.index=0;state.step=0;state.finished=false;state.highlighted=false;}updatePosition();
}
function updatePosition(){
  $$('.is-active').forEach(e=>e.classList.remove('is-active'));$$('.beat-now').forEach(e=>e.classList.remove('beat-now'));$$('.active-line').forEach(e=>e.classList.remove('active-line'));
  $$('.chord-anchor').forEach(e=>e.setAttribute('aria-pressed','false'));
  $('#clear-highlight').disabled=!state.highlighted;
  const entry=sequence[state.index];
  if(!entry){$('#play-position').textContent='Add a chord line to begin';$('#play').disabled=true;$('#next').disabled=true;return;}
  $('#play').disabled=false;
  $('#next').disabled=!sequence.some(e=>e.si>entry.si);
  $('#play-position').textContent=state.finished?'Finished · Play to restart':`${sections[entry.si].name} · ${state.highlighted?entry.chord+' · '+counts[state.step]+(state.playing?'':' · Paused'):'Visual guide'}`;
  if(state.highlighted){
    $(`.chord-anchor[data-anchor="${entry.id}-${entry.ci}"]`).setAttribute('aria-pressed','true');
    $(`[id="${entry.id}"]`).classList.add('active-line');
    $$(`[data-anchor="${entry.id}-${entry.ci}"]`).forEach(e=>e.classList.add('is-active'));
    $(`[data-anchor="${entry.id}-${entry.ci}"] .rhythm-arrows [data-step="${state.step}"]`).classList.add('beat-now');
  }
}
function scrollActive(){
  if(!$('#follow').checked)return;
  const entry=sequence[state.index];if(!entry)return;
  const line=$(`#${entry.id}`), bounds=line.getBoundingClientRect(), top=state.focus?50:$('.toolbar').offsetHeight+18,bottom=innerHeight-$('.practice-bar').offsetHeight-15;
  const behavior=matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth';
  if(bounds.top<top||bounds.bottom>bottom)window.scrollTo({top:scrollY+bounds.top-top,behavior});
  const wrap=line.parentElement, current=$(`.chord-anchor[data-anchor="${entry.id}-${entry.ci}"]`), r=current.getBoundingClientRect(), wr=wrap.getBoundingClientRect();
  if(r.left<wr.left||r.right>wr.right)wrap.scrollTo({left:Math.max(0,current.offsetLeft-20),behavior});
}
function schedule(){clearTimeout(state.timer);state.timer=setTimeout(tick,60000/state.tempo/2);}
function tick(){
  if(!state.playing)return;
  state.step++;
  if(state.step===8){state.step=0;state.index++;if(state.index>=sequence.length){state.index=sequence.length-1;state.step=7;state.finished=true;stop();announce('Visual guide finished.');return;}}
  updatePosition();if(state.step===0)scrollActive();schedule();
}
function start(){if(!sequence.length)return;if(state.finished){state.index=0;state.step=0;state.finished=false;}state.playing=true;state.highlighted=true;$('#play').textContent='Ⅱ';$('#play').setAttribute('aria-label','Pause visual guide');updatePosition();scrollActive();schedule();}
function stop(){state.playing=false;clearTimeout(state.timer);state.timer=null;$('#play').textContent='▶';$('#play').setAttribute('aria-label','Start visual guide');updatePosition();}
function nextSection(){
  const current=sequence[state.index];if(!current)return;
  const next=sequence.findIndex(e=>e.si>current.si);if(next<0)return;
  state.index=next;state.step=0;state.finished=false;state.highlighted=true;updatePosition();
  $(`#section-${sequence[next].si}`).scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
  if(state.playing)schedule();announce(`${sections[sequence[next].si].name} selected.`);
}
function setFocus(value){state.focus=value;document.body.classList.toggle('focus',value);$('#focus-toggle').setAttribute('aria-pressed',String(value));$('#focus-exit').hidden=!value;if(value)$('#focus-exit').focus({preventScroll:true});else $('#focus-toggle').focus({preventScroll:true});}
function openEditor(){stop();$('#sheet-input').value=source;$('#editor-error').textContent='';$('#editor').showModal();}
function applyText(text,save=true){
  stop();source=text;try{if(save)localStorage.setItem(storageKey,text);else localStorage.removeItem(storageKey);}catch{announce('Applied for this session. Browser storage is unavailable.');}render();$('#editor').close();window.scrollTo({top:0,behavior:'instant'});
}
function applyCustomization(){
  const diagrams=$('#show-diagrams').checked,rhythm=$('#show-rhythm').checked;
  document.body.classList.toggle('beginner',diagrams||rhythm);
  document.body.classList.toggle('hide-diagrams',!diagrams);
  document.body.classList.toggle('hide-rhythm',!rhythm);
  document.body.classList.toggle('compact-spacing',$('#sheet-spacing').value==='compact');
  $('#beginner-toggle').checked=diagrams||rhythm;
  $('#beginner-toggle').indeterminate=diagrams!==rhythm;
  document.documentElement.style.setProperty('--sheet-size',$('#sheet-size').value+'px');
  $('#sheet-size-value').textContent=$('#sheet-size').value+' px';
}
$('#beginner-toggle').addEventListener('change',e=>{
  $('#show-diagrams').checked=e.target.checked;$('#show-rhythm').checked=e.target.checked;
  applyCustomization();announce(e.target.checked?'Beginner guides shown.':'Standard chord-and-lyric sheet.');
});
['#show-diagrams','#show-rhythm','#sheet-spacing'].forEach(id=>$(id).addEventListener('change',applyCustomization));
$('#sheet-size').addEventListener('input',()=>{stop();applyCustomization();render(false);});
$('#customize-reset').addEventListener('click',()=>{
  stop();$('#sheet-size').value='16';$('#sheet-spacing').value='comfortable';
  $('#show-diagrams').checked=true;$('#show-rhythm').checked=true;
  applyCustomization();render(false);announce('Default sheet appearance restored.');
});
// Fit each complete line to the printed page without changing chord-to-lyric alignment.
window.addEventListener('beforeprint',()=>{
  stop();
  $$('.sheet-line,.plain-line').forEach(line=>{
    line.style.zoom='';
    const available=$('.paper').clientWidth;
    const width=Math.max(line.scrollWidth,line.getBoundingClientRect().width);
    if(width>available){
      line.style.zoom=String(available/width);
      // Font metrics can round when zoomed; remeasure the actual printed bounds.
      for(let attempt=0;attempt<3;attempt++){
        const printedWidth=line.getBoundingClientRect().width;
        if(printedWidth<=available)break;
        line.style.zoom=String(Number(line.style.zoom)*available/printedWidth*.99);
      }
    }
  });
});
window.addEventListener('afterprint',()=>$$('.sheet-line,.plain-line').forEach(line=>line.style.zoom=''));

$('#focus-toggle').addEventListener('click',()=>setFocus(!state.focus));$('#focus-exit').addEventListener('click',()=>setFocus(false));
$('#edit-open').addEventListener('click',openEditor);$('#paste-link').addEventListener('click',openEditor);
$('#editor-cancel').addEventListener('click',()=>$('#editor').close());
$('#editor-save').addEventListener('click',()=>{const text=$('#sheet-input').value;if(!text.trim()){$('#editor-error').textContent='Paste a sheet before applying.';return;}if(text.length>120000||text.split('\n').some(l=>l.length>2000)){$('#editor-error').textContent='Please use a shorter sheet (up to 120,000 characters and 2,000 per line).';return;}applyText(text);announce('Sheet updated. Chord spacing preserved.');});
$('#reset').addEventListener('click',()=>{applyText(defaultSheet,false);state.tempo=102;$('#tempo').value='102';$('#bpm').textContent='102';announce('Default sheet restored.');});
$('#guide-open').addEventListener('click',()=>$('#guide').showModal());$('#print').addEventListener('click',()=>{stop();window.print();});
function selectPosition(index,step=0){
  if(index<0)return;
  state.index=index;state.step=step;state.finished=false;state.highlighted=true;
  updatePosition();if(state.playing)schedule();
  const entry=sequence[index];announce(`${sections[entry.si].name}, ${entry.chord}, beat ${counts[step]} selected.`);
}
$('#song-sheet').addEventListener('click',e=>{
  const anchor=e.target.closest('[data-anchor]');
  if(anchor){
    const index=sequence.findIndex(entry=>`${entry.id}-${entry.ci}`===anchor.dataset.anchor);
    const beat=e.target.closest('[data-step]');
    selectPosition(index,beat?Number(beat.dataset.step):0);return;
  }
  const lyric=e.target.closest('.lyric-line');
  if(!lyric)return;
  const line=lyric.closest('.sheet-line');
  const entries=sequence.map((entry,index)=>({entry,index})).filter(({entry})=>entry.id===line.id);
  const chosen=entries.filter(({entry})=>$(`.chord-anchor[data-anchor="${entry.id}-${entry.ci}"]`).getBoundingClientRect().left<=e.clientX).pop()||entries[0];
  if(chosen)selectPosition(chosen.index);
});
$('#clear-highlight').addEventListener('click',()=>{
  stop();state.highlighted=false;updatePosition();announce('Highlight cleared. Play resumes from this position.');
});
$('#play').addEventListener('click',()=>state.playing?stop():start());$('#next').addEventListener('click',nextSection);
$('#tempo').addEventListener('input',e=>{state.tempo=Number(e.target.value);$('#bpm').textContent=state.tempo;if(state.playing)schedule();});
document.addEventListener('keydown',e=>{
  if($('#editor').open||$('#guide').open||e.target.closest('input,textarea,select')||e.metaKey||e.ctrlKey||e.altKey)return;
  if(e.key==='Escape'&&state.focus){setFocus(false);return;}
  if(e.code==='Space'&&!e.target.closest('button,a')){e.preventDefault();state.playing?stop():start();}
  if(e.key.toLowerCase()==='b'){$('#beginner-toggle').checked=!$('#beginner-toggle').checked;$('#beginner-toggle').dispatchEvent(new Event('change'));}
  if(e.key.toLowerCase()==='f')setFocus(!state.focus);
});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state.playing)stop();});
render();
