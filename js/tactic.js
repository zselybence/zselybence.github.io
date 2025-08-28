const DATA_SRC='data/tactics.json';
function getParam(name){return new URL(location.href).searchParams.get(name);}
const mapName=getParam('map')||'', siteName=getParam('site')||'', mode=(getParam('mode')||'attack').toLowerCase();
document.getElementById('metaMap').textContent=mapName;
document.getElementById('metaSite').textContent=siteName;
document.getElementById('metaMode').textContent=mode;

const stepsList=document.getElementById('stepsList');
const recommendedList=document.getElementById('recommendedList');
const darkToggle=document.getElementById('darkToggle');
const searchEl=document.getElementById('mapSearch');

(async function(){
  const pref=localStorage.getItem('r6_dark');
  if(pref==='1'){document.body.classList.add('dark-mode'); darkToggle.setAttribute('aria-pressed','true');}
  darkToggle.addEventListener('click',()=>{
    const on=document.body.classList.toggle('dark-mode');
    localStorage.setItem('r6_dark',on?'1':'0');
    darkToggle.setAttribute('aria-pressed',on?'true':'false');
  });
})();

searchEl.addEventListener('input', function(){
  const q = this.value.trim().toLowerCase();
  filterStepsAndOperators(q);
});

async function loadTactic(){
  try{
    const res=await fetch(DATA_SRC,{cache:'no-cache'});
    const data=await res.json();
    const mapObj=data.maps?.[mapName];
    const siteObj=mapObj?.sites?.[siteName];
    const content=siteObj?.[mode];
    if(!content){stepsList.innerHTML='<li>Nincs adat.</li>'; return;}
    renderContent(content,siteObj);
  }catch(e){console.error(e);}
}

function renderContent(content,siteObj){
  stepsList.innerHTML=''; recommendedList.innerHTML='';
  let setupArray=[], recOps=[];
  if(mode==='attack'){ setupArray=Array.isArray(content)?content:[];
    if(setupArray.length===0){stepsList.innerHTML='<li>Nincs taktika.</li>'}
    else{
      setupArray.forEach(tac=>{
        const li=document.createElement('li'); li.innerHTML=`<strong>${tac.operator||'Any Operator'}</strong> — ${tac.title||''}`; stepsList.appendChild(li);
        (tac.steps||[]).forEach((step,idx)=>{
          const stepLi=document.createElement('li'); stepLi.innerHTML=`<div>${step.text||''}</div>`;
          const img=document.createElement('img'); img.loading='lazy'; img.src=`assets/${mapName}/${siteName}/${mode}/${step.img||idx+1}.png`; img.alt=`Step ${idx+1}`;
          img.onerror=()=>{img.style.display='none'};
          stepLi.appendChild(img); stepsList.appendChild(stepLi);
        });
      });
    }
    recOps=siteObj.recommendedOperators||setupArray.map(a=>a.operator)||['Any Operator'];
  } else { // defense
    setupArray=content.setup||content||[];
    setupArray.forEach((step,idx)=>{
      const li=document.createElement('li'); li.innerHTML=`<div>${step.text||''}</div>`;
      const img=document.createElement('img'); img.loading='lazy'; img.src=`assets/${mapName}/${siteName}/${mode}/${step.img||idx+1}.png`; img.alt=`Step ${idx+1}`;
      img.onerror=()=>{img.style.display='none'};
      li.appendChild(img); stepsList.appendChild(li);
    });
    recOps=content.recommendedOperators||siteObj.recommendedOperators||['Any Operator'];
  }
  recOps.forEach(op=>{const li=document.createElement('li'); li.textContent=op; recommendedList.appendChild(li);});
}

function filterStepsAndOperators(query){
  if(!query){
    // Show all steps and operators
    Array.from(stepsList.children).forEach(li => li.style.display = '');
    Array.from(recommendedList.children).forEach(li => li.style.display = '');
    return;
  }
  const q = query.toLowerCase();

  // Filter steps
  Array.from(stepsList.children).forEach(li => {
    const text = li.textContent.toLowerCase();
    li.style.display = text.includes(q) ? '' : 'none';
  });

  // Filter recommended operators
  Array.from(recommendedList.children).forEach(li => {
    const text = li.textContent.toLowerCase();
    li.style.display = text.includes(q) ? '' : 'none';
  });
}

loadTactic();
