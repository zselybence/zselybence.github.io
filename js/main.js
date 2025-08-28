const DATA_SRC = 'data/tactics.json';
const mapListEl = document.getElementById('mapList');
const searchEl = document.getElementById('mapSearch');
const darkToggle = document.getElementById('darkToggle');

(function initDark(){
  const pref = localStorage.getItem('r6_dark');
  if(pref==='1'){
    document.body.classList.add('dark-mode');
    darkToggle.setAttribute('aria-pressed','true');
  }
  darkToggle.addEventListener('click',()=>{
    const on = document.body.classList.toggle('dark-mode');
    localStorage.setItem('r6_dark', on?'1':'0');
    darkToggle.setAttribute('aria-pressed',on?'true':'false');
  });
})();

async function loadData(){
  try{
    const res = await fetch(DATA_SRC,{cache:'no-cache'});
    if(!res.ok) throw new Error('Nem lehet betölteni a taktika adatokat.');
    const json = await res.json();
    renderMapList(json);
  }catch(e){console.error(e);}
}

function renderMapList(data){
  mapListEl.innerHTML='';
  const maps = Object.keys(data.maps||{}).sort();
  maps.forEach(mapName=>{
    const mapObj = data.maps[mapName];
    const li = document.createElement('li');
    const mapTitle = document.createElement('strong');
    mapTitle.textContent = mapName;
    li.appendChild(mapTitle);

    const sitesUl = document.createElement('ul');
    sitesUl.className='site-list';

    Object.keys(mapObj.sites||{}).sort().forEach(siteName=>{
      const siteLi = document.createElement('li');
      const attackA = document.createElement('a');
      attackA.href=`tactic.html?map=${encodeURIComponent(mapName)}&site=${encodeURIComponent(siteName)}&mode=attack`;
      attackA.textContent='Támadás';
      attackA.className='button';

      const defA = document.createElement('a');
      defA.href=`tactic.html?map=${encodeURIComponent(mapName)}&site=${encodeURIComponent(siteName)}&mode=defense`;
      defA.textContent='Védekezés';
      defA.className='button';

      siteLi.appendChild(attackA);
      siteLi.appendChild(defA);
      const siteLabel = document.createElement('div');
      siteLabel.textContent = siteName;
      siteLabel.style.fontSize = '0.9rem';
      siteLabel.style.marginBottom='4px';
      siteLi.insertBefore(siteLabel, attackA);

      sitesUl.appendChild(siteLi);
    });
    li.appendChild(sitesUl);
    mapListEl.appendChild(li);
  });
}

searchEl.addEventListener('input',function(){
  const q = this.value.trim().toLowerCase();
  document.querySelectorAll('#mapList > li').forEach(mapLi=>{
    let mapMatch = mapLi.firstChild.textContent.toLowerCase().includes(q);
    let anySiteMatch = false;
    mapLi.querySelectorAll('.site-list li').forEach(siteLi=>{
      const siteName = siteLi.querySelector('div').textContent.toLowerCase();
      const show = siteName.includes(q) || mapMatch;
      siteLi.style.display = show ? '' : 'none';
      if(show) anySiteMatch = true;
    });
    mapLi.style.display = (mapMatch || anySiteMatch) ? '' : 'none';
  });
});

loadData();
