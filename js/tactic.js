const DATA_SRC='data/tactics.json';
function getParam(name){return new URL(location.href).searchParams.get(name);}
const mapName=getParam('map')||'', siteName=getParam('site')||'', mode=(getParam('mode')||'attack').toLowerCase();
console.log('mapName:', mapName, 'siteName:', siteName, 'mode:', mode); // Debug log
document.getElementById('metaMap').textContent=mapName;
document.getElementById('metaSite').textContent=siteName;
document.getElementById('metaMode').textContent=mode;

const metaInfo = document.getElementById('metaInfo');
// Remove tactic title from meta info
// const tacticTitle = document.createElement('div');
// tacticTitle.innerHTML = '<dt>Taktika:</dt> <dd id="metaTactic"></dd>';
// metaInfo.appendChild(tacticTitle);

const stepsList=document.getElementById('stepsList');
const recommendedList=document.getElementById('recommendedList');
const darkToggle=document.getElementById('darkToggle');
const tacticSelect=document.getElementById('tacticSelect');

let currentTactics = [];

(async function(){
  const pref=localStorage.getItem('r6_dark');
  if(pref==='1'){document.body.classList.add('dark-mode'); darkToggle.setAttribute('aria-pressed','true');}
  darkToggle.addEventListener('click',()=>{
    const on=document.body.classList.toggle('dark-mode');
    localStorage.setItem('r6_dark',on?'1':'0');
    darkToggle.setAttribute('aria-pressed',on?'true':'false');
  });
})();

tacticSelect.addEventListener('change', function(){
  const selectedIndex = this.selectedIndex;
  if (selectedIndex >= 0 && currentTactics.length > selectedIndex) {
    const selectedTactic = currentTactics[selectedIndex];
    renderContent(selectedTactic.content, selectedTactic.siteObj);
    // Update meta tactic name
    const tacticName = mode === 'attack' ? selectedTactic.content[0]?.title : selectedTactic.content?.title;
    if (tacticName) {
      document.getElementById('metaTactic').textContent = tacticName;
    }
  }
});

async function loadTactic(){
  console.log('Loading tactics...'); // Debug log
  try{
    const res=await fetch(DATA_SRC,{cache:'no-cache'});
     const data=await res.json();
     console.log('Data fetched:', data); // Debug log
    const mapObj=data.maps?.[mapName];
    const siteObj=mapObj?.sites?.[siteName];
    const content=siteObj?.[mode];
    
     console.log('Tactics found:', content); // Debug log
     if(!content){
      stepsList.innerHTML='<li>Nincs adat.</li>'; 
      return;
    }
    
    // Handle multiple tactics for the same site
    currentTactics = [];
    tacticSelect.innerHTML = '';
    
    if(mode==='attack'){
      // For attack mode, content is an array of tactics
      if(Array.isArray(content)){
        content.forEach((tactic, index) => {
          currentTactics.push({
            name: tactic.title || `Taktika ${index + 1}`,
            content: [tactic],
            siteObj: siteObj
          });
          
          const option = document.createElement('option');
          option.value = index;
          option.textContent = tactic.title || `Taktika ${index + 1}`;
          tacticSelect.appendChild(option);
        });
      } else {
        // Fallback for single tactic
        currentTactics.push({
          name: 'Taktika 1',
          content: content,
          siteObj: siteObj
        });
        
        const option = document.createElement('option');
        option.value = 0;
        option.textContent = 'Taktika 1';
        tacticSelect.appendChild(option);
      }
    } else {
      // For defense mode, content is an array of tactics
      if(Array.isArray(content)){
        content.forEach((tactic, index) => {
          currentTactics.push({
            name: tactic.title || `Védekezés ${index + 1}`,
            content: tactic,
            siteObj: siteObj
          });
          
          const option = document.createElement('option');
          option.value = index;
          option.textContent = tactic.title || `Védekezés ${index + 1}`;
          tacticSelect.appendChild(option);
        });
      } else {
        // Fallback for single tactic
        currentTactics.push({
          name: content.title || 'Védekezés',
          content: content,
          siteObj: siteObj
        });
        
        const option = document.createElement('option');
        option.value = 0;
        option.textContent = content.title || 'Védekezés';
        tacticSelect.appendChild(option);
      }
    }
    
    // Display the first tactic by default
    if (currentTactics.length > 0) {
      renderContent(currentTactics[0].content, currentTactics[0].siteObj);
      // Set tactic name in meta info
      const tacticName = mode === 'attack' ? currentTactics[0].content[0]?.title : currentTactics[0].content?.title;
      if (tacticName) {
        document.getElementById('metaTactic').textContent = tacticName;
      }
    }
  }catch(e){console.error(e);}
}

function renderContent(content,siteObj){
  stepsList.innerHTML=''; recommendedList.innerHTML='';
  let setupArray=[], recOps=[];
  if(mode==='attack'){ setupArray=Array.isArray(content)?content:[];
    if(setupArray.length===0){stepsList.innerHTML='<li>Nincs taktika.</li>'}
    else{
      setupArray.forEach(tac=>{
        // For attack mode, we don't display the operator on the first step
        // The operator is already in the recommended operators list
        (tac.steps||[]).forEach((step,idx)=>{
          const stepLi=document.createElement('li'); stepLi.innerHTML=`<div>${idx + 1}. ${step.text||''}</div>`; // Add step number
          
          // Create a container for images
          const imgContainer = document.createElement('div');
          imgContainer.style.display = 'flex'; // Use flexbox to align images side by side
          
          // Primary image
          const img = document.createElement('img'); 
          img.loading = 'lazy'; 
          img.src = `assets/${mapName}/${siteName}/${tac.title || 'unknown'}/${step.img || idx + 1}.png`; 
          img.alt = `Step ${idx + 1} - Image 1`;
          img.onerror = () => { img.style.display = 'none' };
          img.style.width = '50%'; // Set width to half
          imgContainer.appendChild(img);
          
          // Secondary image (if exists)
          if (step.img2) {
            const img2 = document.createElement('img'); 
            img2.loading = 'lazy'; 
            img2.src = `assets/${mapName}/${siteName}/${tac.title || 'unknown'}/${step.img2}.png`; 
            img2.alt = `Step ${idx + 1} - Image 2`;
            img2.onerror = () => { img2.style.display = 'none' };
            img2.style.width = '50%'; // Set width to half
            img2.style.marginLeft = '10px'; // Add space between images
            imgContainer.appendChild(img2);
          }
          
          stepLi.appendChild(imgContainer); // Append the image container to the step list item
          
          stepsList.appendChild(stepLi);
        });
      });
    }
    recOps=siteObj.recommendedOperators||setupArray.map(a=>a.operator).filter(op => op !== undefined)||['Any Operator'];
  } else { // defense
    setupArray=content.setup||content||[];
    const tacticName = content.title || 'defense';
    // For defense mode, we don't display the operator on the first step
    // The operator is already in the recommended operators list
    setupArray.forEach((step,idx)=>{
      const li=document.createElement('li'); li.innerHTML=`<div>${idx + 1}. ${step.text||''}</div>`; // Add step number
      
      // Create a container for images
      const imgContainer = document.createElement('div');
      imgContainer.style.display = 'flex'; // Use flexbox to align images side by side
      
      // Primary image
      const img = document.createElement('img'); 
      img.loading = 'lazy'; 
      img.src = `assets/${mapName}/${siteName}/${tacticName}/${step.img || idx + 1}.png`; 
      img.alt = `Step ${idx + 1} - Image 1`;
      img.onerror = () => { img.style.display = 'none' };
      img.style.width = '50%'; // Set width to half
      imgContainer.appendChild(img);
      
      // Secondary image (if exists)
      if (step.img2) {
        const img2 = document.createElement('img'); 
        img2.loading = 'lazy'; 
        img2.src = `assets/${mapName}/${siteName}/${tacticName}/${step.img2}.png`; 
        img2.alt = `Step ${idx + 1} - Image 2`;
        img2.onerror = () => { img2.style.display = 'none' };
        img2.style.width = '50%'; // Set width to half
        imgContainer.appendChild(img2);
      }
      
      li.appendChild(imgContainer); // Append the image container to the step list item
      stepsList.appendChild(li);
    });
    recOps=content.recommendedOperators||siteObj.recommendedOperators||[content.operator || 'Any Operator'];
  }
  
  // Flatten the array of operators if they are stored as arrays
    const flattenedRecOps = recOps.flatMap(op => Array.isArray(op) ? op : [op]).map(op => op.replace(/"/g, '')); // Remove quotation marks
  
  flattenedRecOps.forEach((op, index) => {
    const li = document.createElement('li');
    li.textContent = op;
    recommendedList.appendChild(li);
  });
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
