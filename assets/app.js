(() => {
  'use strict';
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const toastEl = $('#toast');
  let toastTimer;
  const announce = (message) => {
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
  };
  const copy = async (value) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        const el = document.createElement('textarea');
        el.value = value;
        el.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0';
        document.body.append(el);
        el.select();
        const ok = document.execCommand('copy');
        el.remove();
        if (!ok) throw Error('clipboard blocked');
      }
      announce('클립보드에 복사했어요.');
    } catch (err) {
      announce('자동 복사가 제한되어 있어요. 텍스트를 직접 선택해 주세요.');
    }
  };

  // Navigation and theme
  const menuBtn = $('#menu-toggle');
  const mobileMenu = $('#mobile-menu');
  const closeMenu = () => { mobileMenu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); };
  menuBtn.addEventListener('click', () => {
    const shouldOpen = mobileMenu.hidden;
    mobileMenu.hidden = !shouldOpen;
    menuBtn.setAttribute('aria-expanded', String(shouldOpen));
  });
  $$('a', mobileMenu).forEach(a => a.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => { if (innerWidth > 940) closeMenu(); });
  const root = document.documentElement;
  try { if (localStorage.getItem('yohaku-theme') === 'paper') root.dataset.theme = 'paper'; } catch(e) {}
  const themeButton = $('#theme-toggle');
  const updateThemeButton = () => { themeButton.textContent = root.dataset.theme === 'paper' ? '☾' : '◐'; themeButton.title = root.dataset.theme === 'paper' ? '어두운 테마로' : '밝은 테마로'; };
  updateThemeButton();
  themeButton.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'paper' ? 'dark' : 'paper';
    try { localStorage.setItem('yohaku-theme', root.dataset.theme); } catch(e) {}
    updateThemeButton();
  });
  const backBtn = $('#back-to-top');
  const progress = $('#scroll-progress');
  const onScroll = () => {
    const y = window.scrollY;
    const total = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (total > 0 ? (y / total * 100) : 0) + '%';
    backBtn.classList.toggle('visible', y > 650);
  };
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();
  backBtn.addEventListener('click', () => scrollTo({top:0,behavior:'smooth'}));
  if ('IntersectionObserver' in window) {
    const navLinks = $$('.desktop-nav a');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
        }
      });
    }, {rootMargin:'-20% 0px -65% 0px'});
    $$('main section[id]').forEach(section => observer.observe(section));
  }

  // World guide accordions
  const worldAccordions = $$('.accordion', $('#world-accordion'));
  $('#world-expand').addEventListener('click', () => worldAccordions.filter(d=>d.style.display!=='none').forEach(d => d.open=true));
  $('#world-collapse').addEventListener('click', () => worldAccordions.forEach(d => d.open=false));
  $('#world-search').addEventListener('input', event => {
    const term = event.target.value.trim().toLocaleLowerCase();
    let count = 0;
    worldAccordions.forEach(d => {
      const found = !term || ((d.dataset.search || '') + ' ' + d.textContent).toLocaleLowerCase().includes(term);
      d.style.display = found ? '' : 'none';
      if (found) count++;
    });
    $('#world-empty').hidden = count !== 0;
  });

  // Public lorebook: confidential S/A entries are never included in the page data.
  const data = Array.isArray(window.YOHAKU_PUBLIC_LORE) ? window.YOHAKU_PUBLIC_LORE : [];
  $('#lore-total').textContent = String(data.length);
  const labelByCategory = {places:'지역·공간',perfume:'조향·업무',name:'향명각인',mystery:'괴담·조사',toru:'토오루·일상',family:'가문·가족'};
  let selectedCategory = 'all', currentQuery = '', visibleLimit = 12;
  const loreGrid = $('#lore-grid');
  const createElement = (tag,className,txt) => {
    const el = document.createElement(tag);
    if (className) el.className=className;
    if (txt!==undefined) el.textContent=txt;
    return el;
  };
  const toggleLore = (card,button,textEl,body) => {
    const opened = card.classList.toggle('open');
    textEl.hidden = !opened;
    if (opened) textEl.textContent = body;
    button.textContent = opened ? '접기 −' : '기록 펼치기 +';
    button.setAttribute('aria-expanded', String(opened));
  };
  function renderLore() {
    const found = data.filter(item => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (!currentQuery) return true;
      return [item.id,item.title,item.body,item.keywords.join(' ')].join(' ').toLocaleLowerCase().includes(currentQuery);
    });
    loreGrid.replaceChildren();
    found.slice(0, visibleLimit).forEach(item => {
      const card = createElement('article','lore-card');
      const top = createElement('div','lore-code');
      top.append(createElement('span','',item.id));
      top.append(createElement('span','',labelByCategory[item.category] || '공개 로어'));
      card.append(top);
      card.append(createElement('h3','',item.title));
      const teaser = item.spoiler ? '이 항목에는 토오루의 과거에 관한 약한 스포일러가 포함되어 있어요. 내용을 펼치기 전 참고해 주세요.' : item.body.slice(0,107) + (item.body.length>107?'…':'');
      card.append(createElement('p','lore-teaser',teaser));
      const content=createElement('div','lore-body');
      content.hidden=true;
      card.append(content);
      const bottom=createElement('div','lore-bottom');
      const toggle=createElement('button','lore-toggle',item.spoiler?'스포일러 보기 +':'기록 펼치기 +');
      toggle.type='button';toggle.setAttribute('aria-expanded','false');
      toggle.addEventListener('click',()=>toggleLore(card,toggle,content,item.body));
      bottom.append(toggle);
      if (item.draft) bottom.append(createElement('span','lore-draft','설정 시안'));
      if (item.spoiler) bottom.append(createElement('span','lore-draft','과거 스포일러'));
      card.append(bottom);
      loreGrid.append(card);
    });
    $('#lore-status').textContent = `공개 기록 ${found.length}개 중 ${Math.min(found.length, visibleLimit)}개 표시`;
    const more = $('#lore-more');
    more.hidden = found.length <= visibleLimit;
    more.textContent = `기록 더 펼치기 (${found.length - visibleLimit}개 남음) ↓`;
    if (!found.length) loreGrid.append(createElement('p','empty-state','조건에 맞는 공개 기록이 없습니다.'));
  }
  $('#lore-search').addEventListener('input', event => { currentQuery=event.target.value.trim().toLocaleLowerCase();visibleLimit=12;renderLore(); });
  $$('#lore-filters button').forEach(btn => btn.addEventListener('click', () => {
    selectedCategory=btn.dataset.category;
    visibleLimit=12;
    $$('#lore-filters button').forEach(b => b.classList.toggle('active', b===btn));
    renderLore();
  }));
  $('#lore-more').addEventListener('click', () => {visibleLimit+=12;renderLore();});
  $('#lore-collapse').addEventListener('click', () => {
    $$('.lore-card.open',loreGrid).forEach(card => {
      card.classList.remove('open');
      $('.lore-body',card).hidden=true;
      const btn=$('.lore-toggle',card);
      btn.setAttribute('aria-expanded','false');
      btn.textContent = '기록 펼치기 +';
    });
  });
  renderLore();

  // Spoiler gate
  const reveal=$('#memory-reveal'), spoiler=$('#memory-spoiler');
  reveal.addEventListener('click',()=>{
    const next=spoiler.hidden;
    spoiler.hidden=!next;
    reveal.setAttribute('aria-expanded',String(next));
    $('span',reveal).textContent=next?'−':'+';
  });

  // Character profile builder - processed locally only
  const form=$('#persona-form'),preview=$('#persona-preview');
  const readForm=()=>Object.fromEntries(new FormData(form).entries());
  const draft=()=>{
    const v=readForm();
    const rows=[
      '[{{user}} 프로필 — 余白 플레이 초안]',
      '이름: '+(v.name.trim()||'미정'),
      '나이: '+(v.age.trim()||'미정'),
      '직업: '+(v.job.trim()||'미정'),
      '성격: '+(v.personality.trim()||'미정'),
      '향수 의뢰 이유: '+(v.reason.trim()||'미정'),
      '향 취향: '+(v.scent.trim()||'미정'),
      '향명각인: '+v.mark,
      '기타: '+(v.extra.trim()||'미정'),
      '',
      '첫 시작: 2026년 6월 12일 14:00, 도쿄 야나카의 余白 공방. {{char}}와 초면.',
      '{{user}}의 행동·감정·대사는 실제 입력으로 결정.'
    ];
    return rows.join('\n');
  };
  const refresh=()=>{preview.textContent=draft();};
  form.addEventListener('input',refresh);form.addEventListener('change',refresh);
  form.addEventListener('reset',()=>setTimeout(refresh,0));refresh();
  const examples=[
    {name:'',age:'26세',job:'출판사 신입 편집자',personality:'조용하고 낯을 가리지만 좋아하는 주제에는 말이 많아짐',reason:'새 직장을 시작한 기념으로 나만의 향을 만들고 싶음',scent:'화이트티와 책 냄새 / 지나치게 달콤한 향은 불호'},
    {name:'',age:'29세',job:'프리랜서 사진가',personality:'호기심이 많고 즉흥적인 편, 사적인 이야기는 조심스러움',reason:'여름의 비 냄새 같은 향수를 의뢰함',scent:'빗물·흙·그린 노트 / 강한 바닐라향은 불호'},
    {name:'',age:'24세',job:'서점 직원',personality:'성실하고 느긋하며 작은 물건을 오래 아낌',reason:'소중한 사람에게 선물할 향을 찾음',scent:'시더우드·아이리스 / 매운 향신료 계열은 불호'},
    {name:'',age:'31세',job:'도쿄 직장인',personality:'차분해 보이지만 엉뚱한 농담을 즐김',reason:'별다른 계기 없이 독특한 향수를 만들어 보고 싶음',scent:'시트러스·무화과 / 강한 파우더리 향은 불호'},
    {name:'',age:'27세',job:'대학원생',personality:'매사 신중하고 관찰력이 좋음',reason:'과거에 맡았던 여름 향기를 다시 찾고 싶음',scent:'초록 잎·나무·차 향 / 과한 앰버향은 불호'}
  ];
  let exampleIndex=-1;
  $('#persona-random').addEventListener('click',()=>{
    exampleIndex=(exampleIndex+1)%examples.length;
    const x=examples[exampleIndex];
    for(const [key,val] of Object.entries(x)){
      const field=form.elements.namedItem(key);
      if(field) field.value=val;
    }
    form.elements.namedItem('mark').selectedIndex=0;
    form.elements.namedItem('extra').value='';
    refresh();
    announce('예시 캐릭터 설정을 불러왔어요. 자유롭게 수정하세요.');
  });
  $('#persona-copy').addEventListener('click',()=>copy(draft()));
  $$('[data-copy]').forEach(b=>b.addEventListener('click',()=>copy(b.dataset.copy)));
  $('#copy-site-link').addEventListener('click',()=>copy(location.href));

  // Image gallery and keyboard-accessible lightbox
  const media=[
    ['assets/yohaku-main.webp','THE FIRST NOTE — 향기가 시작되는 자리','녹색 향수병과 조향 노트, 열쇠와 흰 꽃'],
    ['assets/yohaku-mystery.webp','THE ERASED NAME — 지워진 이름의 계보','지워진 가문 기록과 회중시계, 파란 아이리스'],
    ['assets/yohaku-memory.webp','THE UNFINISHED SUMMER — 완성되지 못한 약속','미완성 향수와 열린 노트, 흰 꽃']
  ];
  const dialog=$('#lightbox');
  let activeImage=0;
  const showImage=(index)=>{
    activeImage=(index+media.length)%media.length;
    const [src,label,alt]=media[activeImage];
    $('#lightbox-image').src=src;
    $('#lightbox-image').alt=alt;
    $('#lightbox-caption').textContent=label;
  };
  $$('.gallery-card').forEach(btn=>btn.addEventListener('click',()=>{
    showImage(Number(btn.dataset.image));
    if(typeof dialog.showModal==='function')dialog.showModal();
    else dialog.setAttribute('open','');
  }));
  const closeDialog=()=>{if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');};
  $('#lightbox-close').addEventListener('click',closeDialog);
  $('#lightbox-prev').addEventListener('click',()=>showImage(activeImage-1));
  $('#lightbox-next').addEventListener('click',()=>showImage(activeImage+1));
  dialog.addEventListener('click',event=>{if(event.target===dialog)closeDialog();});
  document.addEventListener('keydown',event=>{
    if(!dialog.open)return;
    if(event.key==='ArrowLeft')showImage(activeImage-1);
    if(event.key==='ArrowRight')showImage(activeImage+1);
  });
})();
