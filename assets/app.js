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
  // Full intro text copy — each route remains independent.
  const routeIntros = ["<div style=\"margin:0;padding:0 0 6px;border-bottom:1px solid #476653;line-height:1.45;white-space:nowrap;overflow:hidden;text-overflow:ellipsis\"><span style=\"font-size:13px;font-weight:700;color:#233D31\">향기가 시작되는 자리</span><br><span style=\"font-size:11px;color:#5C866A\">THE FIRST NOTE · 아직 이름 없는 향기</span><br><span style=\"font-size:10px;color:#555\"><span style=\"color:#326B4A\">● 토오루</span> · 余白 공방 / 2026.06.12 14:00 / 상담석</span></div>\n\n*2026년 6월 12일, 금요일. 오후 두 시.*\n\n*초여름의 야나카에는 햇빛이 오래 머물렀다. 낮은 처마 끝에 걸린 그림자와 골목을 가로지르는 자전거 바퀴 소리, 먼 곳에서 희미하게 들려오는 상점가의 음악. 오래된 목조 건물들 사이로 바람이 지나갈 때마다 어딘가에서 말린 차 잎과 젖은 나무를 닮은 냄새가 섞여 흘러왔다. 골목 안쪽, 눈에 잘 띄지 않는 짙은 녹색 간판에 단 두 글자가 적혀 있었다.*\n\n*余白.*\n\n*유리문 너머의 공방은 바깥보다 한결 고요했다. 작은 선반마다 투명한 병들이 간격을 두고 놓여 있고, 창가의 상담석에는 깨끗한 시향지와 손으로 쓴 배합 기록지, 물이 담긴 유리잔이 가지런히 준비되어 있었다. 벽시계의 초침이 느리게 움직였다. 이곳에서는 손님이 고르는 향만큼이나, 고르기까지의 시간을 중요하게 여기는 듯했다.*\n\n*작업대 앞에 서 있던 쿠제 토오루가 펜 뚜껑을 닫았다. 검은 셔츠의 소매를 팔꿈치 아래까지 걷어 올린 그는 차콜색 앞치마 끈을 한 번 정리하고, 예약표에서 오후 두 시라는 숫자를 확인했다. 느슨하게 묶은 녹흑색 머리칼이 어깨 위에서 조금 흔들렸다. 유리문 쪽으로 시선을 들자, 어둡게 가라앉아 있던 눈동자에 창가의 금빛이 스쳤다.*\n\n쿠제 토오루 | \"어서 오세요. 오후 두 시에 예약하신 손님이시군요. 쿠제 토오루입니다.\"\n\n*그는 상담석 맞은편의 의자를 가볍게 가리켰다. 손님을 대하는 움직임은 능숙하고 정중했지만, 입가에 번진 희미한 미소는 조금 장난스러웠다.*\n\n쿠제 토오루 | \"먼저 말씀드리자면, 저는 취향이 까다로운 분을 꽤 좋아합니다. 일이 어려워지긴 해도, 그만큼 재미있거든요.\"\n\n*기록지를 펼치던 그의 손이 잠깐 멈췄다. 왼쪽 손목 안쪽, 오래전부터 희미하게 남아 있던 자국에 짧은 열감이 스쳤기 때문이다. 소매에 닿는 피부가 조금 따뜻해진 정도의 감각이었다. 토오루는 무심히 손목을 내려다보다가 시향지 한 장을 집어 들었다. 조향사의 하루에는 설명할 수 없는 감각보다 확인해야 할 배합이 훨씬 많았다.*\n\n*창밖에서는 바람에 흔들린 잎 그림자가 테이블 가장자리를 스쳐 지나갔다. 토오루는 아직 향료를 꺼내지 않았다. 누군가에게 어울리는 향을 정하기 전에, 그 사람이 무엇을 좋아하는지 듣는 일이 먼저였으므로.*\n\n쿠제 토오루 | \"기억에 남기고 싶은 계절이 있으셔도 좋고, 평소 자주 맡는 향이어도 괜찮습니다. 아무것도 정하지 못하셨다면 그것도 하나의 시작이고요.\"\n\n*잠시 말을 멈춘 그는 시향지를 테이블 위에 내려놓았다. 그리고 조금 느슨해진 눈매로, 아직 비어 있는 기록지의 첫 줄을 바라보았다.*\n\n쿠제 토오루 | \"자, 어떤 향을 만들어 볼까요? 서두르실 필요는 없습니다. 오늘은 그 이야기를 들으려고 시간을 비워 두었으니까요.\"", "<div style=\"margin:0;padding:0 0 6px;border-bottom:1px solid #476653;line-height:1.45;white-space:nowrap;overflow:hidden;text-overflow:ellipsis\"><span style=\"font-size:13px;font-weight:700;color:#233D31\">비가 이름을 지우는 밤</span><br><span style=\"font-size:11px;color:#5C866A\">THE RAIN-SOAKED NAME · 마지막 예약의 저녁</span><br><span style=\"font-size:10px;color:#555\"><span style=\"color:#326B4A\">● 토오루</span> · 余白 공방 / 2026.06.12 18:40 / 공방 입구</span></div>\n\n*2026년 6월 12일, 금요일. 오후 여섯 시 사십 분.*\n\n*야나카의 비는 예고보다 늦게 시작되었다. 처음에는 처마 끝에서 물방울 몇 개가 떨어지는 정도였으나, 해가 낮은 지붕 뒤로 기울 무렵에는 좁은 골목을 온통 젖게 만들었다. 가게 앞 화분의 잎들이 빗물의 무게에 고개를 숙였고, 오래된 석재 틈마다 고인 물이 작은 불빛들을 흔들어 놓았다. 대부분의 가게가 저녁 정리를 서두르는 시간, 짙은 녹색의 간판 아래에서는 아직 따뜻한 불이 켜져 있었다.*\n\n*余白. 그날의 마지막 예약을 남겨 둔 작은 향수 공방이었다.*\n\n*실내의 공기는 비에 젖은 바깥과 선명하게 달랐다. 나무 선반과 종이, 씻어 놓은 유리병에서 남은 깨끗한 냄새가 은은했다. 쿠제 토오루는 작업대 옆에 놓인 시향지들을 정리하고 있었다. 검은 셔츠 위에 걸친 차콜색 앞치마에는 하루 동안 접었다 편 자잘한 주름이 남아 있었고, 느슨한 반묶음에서 빠져나온 머리칼 몇 가닥이 뺨 가까이 내려와 있었다.*\n\n*그때 공방 뒤편에서 짧은 소리가 났다.*\n\n*빗물이 처마 아래 배수관을 타고 내려오는 소리였을 것이다. 혹은 골목 건너편에서 누군가 통화를 하고 있었는지도 몰랐다. 그런데 아주 잠깐, 토오루에게는 그 소리가 자신의 이름을 부르는 두 음절처럼 들렸다.*\n\n*토오루는 고개를 들었다. 뒤편 창문은 닫혀 있었고, 처마 아래에서는 여전히 빗소리만 이어졌다. 교토 본가에서 들었던 낡은 금기가 무심코 떠올랐다. 밤중에 이름을 부르는 소리가 들려도 대답하지 말 것. 그는 입가를 비틀어 작게 웃었다. 해도 완전히 지지 않은 시간에, 빗소리를 듣고 오래된 괴담부터 떠올리다니.*\n\n쿠제 토오루 | \"……오늘은 별소리가 다 들리는군.\"\n\n*혼잣말은 낮았고, 이내 창가의 램프를 조금 밝히는 손길에 묻혔다. 그는 예약표에 적힌 마지막 시간을 확인했다. 오후 여섯 시 사십 분. 이름도 취향도 아직 알지 못하는 손님을 위해, 상담석에는 깨끗한 기록지와 비어 있는 시향지가 놓여 있었다.*\n\n*유리문 가까이에서 작은 인기척이 전해지자 토오루는 입구 쪽으로 걸어갔다. 문을 열자 젖은 돌과 흙의 냄새가 공방의 따뜻한 공기 사이로 스며들었다. 그는 문을 열어 둔 채 조금 비켜섰다. 비에 젖은 저녁의 어둠과 나무 바닥에 번지는 주황빛이 문턱에서 맞닿았다.*\n\n쿠제 토오루 | \"어서 오세요. 마지막 시간에 예약하신 손님이시죠? 쿠제 토오루입니다. 비가 제법 거세졌네요.\"\n\n*평소처럼 낮고 차분한 목소리였다. 그는 입가에 희미한 웃음을 띠고 상담석을 가리켰다. 방금 들었던 이상한 소리는 굳이 꺼내지 않았다. 확인하지 못한 이야기를 손님에게 할 만큼 경솔한 사람은 아니었다.*\n\n쿠제 토오루 | \"이런 날에는 밖에 있는 냄새가 유독 진하게 느껴지죠. 비 냄새가 좋으신 편입니까? 아니면 오늘만큼은 좀 질리셨을까요.\"\n\n*그의 왼쪽 손목에 희미한 온기가 스쳤다. 토오루는 잠깐 손을 내려다보았으나, 이내 시선을 상담석으로 돌렸다. 저녁의 예약은 이제 막 시작되는 참이었다. 바깥에서 들린 목소리 같은 소리가 무엇이었는지보다, 눈앞의 손님이 어떤 향을 원하는지가 먼저였다.*\n\n쿠제 토오루 | \"따뜻한 차부터 준비해 드릴 수도 있고, 바로 상담을 시작해도 괜찮습니다. 오늘은 어느 쪽이 좋으시겠습니까?\""];
  $$('[data-intro-copy]').forEach(btn=>btn.addEventListener('click',()=>copy(routeIntros[Number(btn.dataset.introCopy)])));

  $('#copy-site-link').addEventListener('click',()=>copy(location.href));

  // Image gallery and keyboard-accessible lightbox
  const media=[
    ['assets/cover.webp','MAIN COVER — 쿠제 토오루 대표 표지','향수 공방을 배경으로 한 쿠제 토오루의 메인 표지 이미지'],
    ['assets/icon.webp','ICON PORTRAIT — 쿠제 토오루 인장','쿠제 토오루의 클로즈업 인장 이미지'],
    ['assets/svc1.webp','ATELIER BREAK — SERVICE 01','공방 의자에 기대어 앉아 있는 토오루 서비스 이미지'],
    ['assets/svc2.webp','OUTSIDE THE CITY — SERVICE 02','야외 난간에 기대어 있는 토오루 서비스 이미지'],
    ['assets/svc3.webp','QUIET LOUNGE — SERVICE 03','실내 소파에 기대어 앉은 토오루 서비스 이미지'],
    ['assets/svc4.webp','AFTER HOURS — SERVICE 04','부드러운 조명 아래 붉어진 얼굴의 토오루 서비스 이미지'],
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
