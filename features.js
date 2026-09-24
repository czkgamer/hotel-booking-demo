import {today, addDays, nights, validStay, available, rate} from './model.js?v=20260924-features2';

export const EVENT_STAGES = [
  ['search_rooms', 'ค้นหาห้องพัก'], ['view_room', 'ดูรายละเอียดห้อง'],
  ['begin_booking', 'เริ่มกรอกการจอง'], ['booking_request', 'ส่งคำขอสำเร็จ']
];

// Demo only: no browser storage, network calls, or personal data collection.
export function makeAnalytics() {
  return {
    consent: 'unset', events: [], source: 'เข้าหน้าจองโดยตรง',
    record(name, type = '') {
      if (this.consent !== 'accepted' || !EVENT_STAGES.some(([id]) => id === name)) return false;
      this.events.push({name, type, source: this.source, time: new Date().toISOString()});
      return true;
    },
    counts() { return EVENT_STAGES.map(([id]) => this.events.filter(e => e.name === id).length); }
  };
}

export function monthCells(state, type, month) {
  const first = month + '-01';
  const d = new Date(first + 'T00:00:00Z');
  const count = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  const offset = (d.getUTCDay() + 6) % 7;
  return [...Array(offset).fill(null), ...Array.from({length: count}, (_, i) => {
    const date = addDays(first, i), past = date < today();
    return {date, number: i + 1, past, free: past ? 0 : available(state, type, date, addDays(date, 1)).length};
  })];
}

export function createFeatures(ctx) {
  const {getState, getSearch, setSearch, render, navigate, modal, header, dialog, toast, esc, money, fmt, icon, doc} = ctx;
  let selected = new Set(), mode = 'rooms', calendarType = 'deluxe';
  let month = getSearch().start.slice(0, 7), draft = {...getSearch()}, reportMode = 'sample';
  let analytics = makeAnalytics();
  const byId = id => getState().types.find(t => t.id === id);
  const shiftMonth = offset => {
    const [y, m] = month.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1 + offset, 1)).toISOString().slice(0, 7);
  };
  const monthName = () => new Date(month + '-01T00:00:00Z').toLocaleDateString('th-TH', {month:'long', year:'numeric', timeZone:'UTC'});
  const guestTypes = () => getState().types.filter(t => t.capacity >= getSearch().guests);
  const wideModal = html => { modal(html); dialog.classList.add('feature-wide'); };
  const scrollRooms = () => doc.querySelector('#rooms')?.scrollIntoView({behavior:'smooth', block:'start'});

  function toolbar() {
    return `<div class="feature-toolbar"><div class="feature-tabs" role="group" aria-label="วิธีเลือกห้อง"><button class="${mode==='rooms'?'active':''}" data-action="feature-mode" data-id="rooms" aria-pressed="${mode==='rooms'}">${icon('bed')} รายการห้องพัก</button><button class="${mode==='calendar'?'active':''}" data-action="feature-mode" data-id="calendar" aria-pressed="${mode==='calendar'}">${icon('calendar')} ปฏิทินห้องว่าง</button></div><button class="secondary compare-launch" data-action="feature-compare">เปรียบเทียบห้อง <span class="compare-count">${selected.size}/4</span></button></div>`;
  }
  function compareButton(id) {
    return `<button class="compare-toggle ${selected.has(id)?'selected':''}" data-action="feature-toggle" data-id="${id}" aria-pressed="${selected.has(id)}"><span aria-hidden="true">${selected.has(id)?'✓':'＋'}</span> ${selected.has(id)?'เลือกเปรียบเทียบแล้ว':'เพิ่มเพื่อเปรียบเทียบ'}</button>`;
  }
  function compareTray() {
    if (!selected.size) return '';
    return `<div class="compare-tray"><div><strong>เลือกเปรียบเทียบ ${selected.size} ประเภท</strong><p>${[...selected].map(id=>byId(id).name).join(' · ')}</p></div><div class="feature-actions"><button class="text-button" data-action="feature-clear">ล้างที่เลือก</button><button class="primary" data-action="feature-compare">เปรียบเทียบห้อง →</button></div></div>`;
  }
  function showCompare(initialize = true) {
    if (initialize && !selected.size) getState().types.slice(0,2).forEach(t=>selected.add(t.id));
    const s = getSearch(), types = getState().types.filter(t=>selected.has(t.id));
    const rows = [
      ['ขนาดห้อง', t=>`${t.area} ตร.ม.`], ['เตียง', t=>esc(t.bed)],
      ['จำนวนผู้เข้าพัก', t=>`สูงสุด ${t.capacity} ท่าน`],
      ['สิ่งอำนวยความสะดวก', ()=> 'Wi-Fi · แอร์ · ทีวี<br>ห้องน้ำส่วนตัว'],
      ['ราคา / คืน', t=>`฿${money(rate(t))}`],
      [`รวม ${nights(s.start,s.end)} คืน`, t=>`<strong>฿${money(rate(t)*nights(s.start,s.end))}</strong>`],
      ['ห้องว่างครบช่วงพัก', t=>`${available(getState(),t.id,s.start,s.end).length} ห้องออนไลน์`],
      ['เงื่อนไข', ()=> 'รอ Front ยืนยัน<br>ชำระเงินที่โรงแรม']
    ];
    wideModal(header('เปรียบเทียบห้องพัก', `${fmt(s.start)} — ${fmt(s.end)} · ${s.guests} ท่าน · ข้อมูลและราคาสมมติ`)+`<div class="modal-body compare-body"><div class="compare-picker" role="group" aria-label="เลือกประเภทห้องเปรียบเทียบ">${getState().types.map(t=>`<button class="${selected.has(t.id)?'active':''}" data-action="feature-compare-pick" data-id="${t.id}" aria-pressed="${selected.has(t.id)}">${selected.has(t.id)?'✓ ':''}${t.name}</button>`).join('')}</div><p class="feature-muted">เลือก 2–4 ประเภทเพื่อเทียบในช่วงวันเดียวกัน</p>${types.length>=2?`<div class="compare-scroll" tabindex="0" aria-label="ตารางเปรียบเทียบ เลื่อนแนวนอนเพื่อดูทุกประเภท"><table class="compare-table"><thead><tr><th scope="col">รายละเอียด</th>${types.map(t=>`<th scope="col"><img src="${esc(t.photo)}" alt="ภาพสมมติ ${t.name}"><span>${t.name}</span></th>`).join('')}</tr></thead><tbody>${rows.map(([label,value])=>`<tr><th scope="row">${label}</th>${types.map(t=>`<td>${value(t)}</td>`).join('')}</tr>`).join('')}<tr><th scope="row">เลือกห้อง</th>${types.map(t=>{const can=t.capacity>=s.guests&&available(getState(),t.id,s.start,s.end).length>0;return `<td><button class="primary" data-action="book" data-id="${t.id}" ${can?'':'disabled'}>${t.capacity<s.guests?'จำนวนผู้เข้าพักเกิน':can?'จองห้องนี้':'เต็มในช่วงนี้'}</button></td>`}).join('')}</tr></tbody></table></div>`:'<div class="empty">กรุณาเลือกอีกอย่างน้อย 1 ประเภท</div>'}<p class="feature-muted">รายละเอียดจริงจะเปลี่ยนตามข้อมูลที่โรงแรมอนุมัติ · ตารางนี้เปรียบเทียบห้องของโรงแรมเอง</p></div>`);
  }

  function calendar() {
    if (mode !== 'calendar') return '';
    const t = byId(calendarType), s = getSearch();
    let free = null, stayError = '';
    if (draft.start && draft.end) {
      try { validStay(draft.start,draft.end); free = available(getState(),t.id,draft.start,draft.end).length; }
      catch(err) { stayError = err.message; }
    }
    const canApply = free>0 && t.capacity>=s.guests;
    return `<section class="availability-calendar panel" aria-label="ปฏิทินห้องว่างออนไลน์"><div class="calendar-top"><div><div class="eyebrow">PLAN YOUR STAY</div><h3>เลือกวันที่พักผ่อน</h3><p>คลิกวันเช็กอิน แล้วเลือกวันเช็กเอาต์</p></div><label>ประเภทห้อง<select id="calendar-type">${getState().types.map(t=>`<option value="${t.id}" ${calendarType===t.id?'selected':''}>${t.name}</option>`).join('')}</select></label></div><div class="calendar-content"><div><div class="month-navigation"><button class="secondary" data-action="feature-month" data-id="-1" aria-label="เดือนก่อนหน้า" ${month<=today().slice(0,7)?'disabled':''}>‹</button><h3 aria-live="polite">${monthName()}</h3><button class="secondary" data-action="feature-month" data-id="1" aria-label="เดือนถัดไป">›</button></div><div class="calendar-weekdays" aria-hidden="true">${['จ.','อ.','พ.','พฤ.','ศ.','ส.','อา.'].map(x=>`<span>${x}</span>`).join('')}</div><div class="calendar-days">${monthCells(getState(),t.id,month).map(c=>!c?'<span class="calendar-spacer"></span>':`<button class="calendar-day ${c.past?'past':c.free?'available':'sold-out'} ${c.date===draft.start?'start-date':''} ${c.date===draft.end?'end-date':''} ${draft.start&&draft.end&&c.date>draft.start&&c.date<draft.end?'in-range':''}" data-action="feature-day" data-id="${c.date}" ${c.past?'disabled':''} aria-label="${fmt(c.date)} ${c.past?'ผ่านแล้ว':`ว่าง ${c.free} ห้องในคืนนี้`}${c.date===draft.start?' วันเช็กอิน':''}${c.date===draft.end?' วันเช็กเอาต์':''}" aria-pressed="${c.date===draft.start||c.date===draft.end}"><strong>${c.number}</strong><span>${c.past?'—':c.free?`${c.free} ห้อง`:'เต็ม'}</span></button>`).join('')}</div><div class="calendar-legend"><span><i class="legend-free"></i>พร้อมขาย</span><span><i class="legend-selected"></i>วันที่เลือก</span><span><i class="legend-full"></i>เต็ม / ปิดขาย</span></div></div><aside class="stay-preview"><div class="eyebrow">YOUR SELECTION</div><h3>${t.name}</h3><div class="stay-dates"><div><span>เช็กอิน</span><strong>${draft.start?fmt(draft.start):'เลือกวันเข้า'}</strong></div><div><span>เช็กเอาต์</span><strong>${draft.end?fmt(draft.end):'เลือกวันออก'}</strong></div></div><p>${draft.start&&draft.end&&!stayError?`${nights(draft.start,draft.end)} คืน · ${s.guests} ท่าน`:'เลือกช่วงเข้าพัก 1–30 คืน'}</p><div class="stay-price">${draft.start&&draft.end&&!stayError?`฿${money(rate(t)*nights(draft.start,draft.end))}`:'—'}<small>ยอดรวมตัวอย่าง / 1 ห้อง</small></div><p class="stay-availability" role="status">${stayError||(!draft.end?'รอเลือกวันเช็กเอาต์':t.capacity<s.guests?`รองรับสูงสุด ${t.capacity} ท่าน กรุณาปรับจำนวนผู้เข้าพัก`:free?`ว่างครบทุกคืน ${free} ห้อง`:'ไม่มีห้องเดียวที่ว่างครบทุกคืน กรุณาเปลี่ยนวัน')}</p><button class="primary" data-action="feature-use-dates" ${canApply?'':'disabled'}>ใช้ช่วงวันที่นี้ ${icon('arrow')}</button><button class="text-button" data-action="feature-clear-dates">เลือกวันใหม่</button><p class="feature-muted">ตัวเลขในปฏิทินเป็นจำนวนห้องต่อคืน ระบบตรวจห้องเดียวที่ว่างครบช่วงอีกครั้งก่อนรับจอง ไม่รวมคืนวันเช็กเอาต์</p></aside></div><div class="calendar-note">${icon('info')} แสดงเฉพาะห้องที่ Front เปิดขายออนไลน์ ข้อมูลจาก Easyfo และช่องทางอื่นยังไม่ซิงก์อัตโนมัติ</div></section>`;
  }

  function consentBanner() {
    if (analytics.consent !== 'unset') return '';
    return `<aside class="demo-consent" aria-label="ตัวอย่างการตั้งค่าสถิติ"><div><strong>ทดลองการยินยอมเก็บสถิติ</strong><p>เลือกยอมรับเพื่อดูเหตุการณ์จากการทดลองในหลังบ้าน Demo นี้ไม่ส่งข้อมูลไป Google และจองได้แม้ปฏิเสธ</p></div><div class="feature-actions"><button class="secondary" data-action="feature-consent" data-id="rejected">ปฏิเสธสถิติ</button><button class="secondary" data-action="feature-consent" data-id="accepted">ยอมรับสถิติ</button></div></aside>`;
  }
  function showConsent() {
    modal(header('การตั้งค่าสถิติการใช้งาน','ใช้ทดลองขั้นตอนการยินยอม ไม่ส่งข้อมูลออกจาก Demo')+`<div class="modal-body"><p>เมื่อยอมรับ จะนับการค้นหา ดูห้อง เริ่มกรอก และส่งคำขอสำเร็จ โดยไม่เก็บชื่อ เบอร์โทร อีเมล หรือเลขจองในสถิติ</p><div class="status-help">สถานะปัจจุบัน: ${analytics.consent==='accepted'?'ยอมรับ':analytics.consent==='rejected'?'ปฏิเสธ':'ยังไม่เลือก'} · เปลี่ยนใจได้ทุกเวลาและใช้งานจองได้ตามปกติ</div><div class="modal-actions"><button class="secondary" data-action="feature-consent" data-id="rejected">ปฏิเสธสถิติ</button><button class="secondary" data-action="feature-consent" data-id="accepted">ยอมรับสถิติ</button></div></div>`);
  }

  function widgetPage() {
    return `<section class="widget-demo container"><div class="section-heading"><div><div class="eyebrow">BOOK DIRECT</div><h1>ปุ่มจองบนเว็บไซต์หลัก</h1><p>ตัวอย่างตำแหน่งปุ่ม ไม่ใช่เว็บไซต์หลักจริงของโรงแรม</p></div><span class="outline-pill">ฟีเจอร์ในข้อเสนอ Rev.02</span></div><div class="website-example"><div class="website-address"><span aria-hidden="true">◉</span> ตัวอย่างหน้าเว็บไซต์โรงแรม</div><div class="website-brand"><img src="./assets/suntara-logo.png" width="74" height="72" alt="Suntara Grand"><span>SUNTARA GRAND<small>A SPACE FOR YOUR NEXT STAY</small></span></div><div class="widget-hero"><div><div class="eyebrow">WELCOME TO SUNTARA GRAND</div><h2>ให้วันพักผ่อน<br>เป็นวันของคุณ</h2><p>พบห้องพักที่เหมาะกับการเดินทาง<br>เลือกวันและส่งคำขอจองกับโรงแรมโดยตรง</p><a class="primary widget-booking-button" href="#rooms" data-action="feature-widget-book">จองห้องพัก ${icon('arrow')}</a><span class="widget-pay-note">ชำระเงินเมื่อมาถึงโรงแรม</span></div><img src="./assets/room.png" alt="ภาพห้องพักสมมติ"></div></div><div class="widget-explainer"><div><strong>01 · คลิกปุ่มบนเว็บหลัก</strong><p>ใช้สีและโลโก้ของโรงแรม</p></div><div><strong>02 · เลือกวันและประเภทห้อง</strong><p>เปิดหน้าจองที่ใช้ข้อมูลเดียวกับ Front</p></div><div><strong>03 · ส่งคำขอและรอยืนยัน</strong><p>Front ลง Easyfo แล้วจึงยืนยัน</p></div></div><p class="feature-muted">ข้อเสนอรวมปุ่ม 1 รูปแบบ ในเว็บไซต์เดิม 1 แห่ง ผ่านลิงก์ไปหน้าจอง รองรับการวางบน WordPress/Joomla เมื่อมีสิทธิ์แก้ไขเว็บไซต์</p></section>${consentBanner()}`;
  }

  function analyticsPage() {
    const sample = reportMode === 'sample';
    const counts = sample ? [1280,964,241,96] : analytics.counts();
    const totals = Math.max(...counts,1);
    const requests = counts[3], ratio = counts[0] ? (requests/counts[0]*100).toFixed(1)+'%' : '—';
    const sources = sample ? [['เข้าหน้าจองโดยตรง',42],['เว็บไซต์หลัก (ปุ่มจอง)',35],['ค้นหาบน Google',19]] : [...new Set(analytics.events.filter(e=>e.name==='booking_request').map(e=>e.source))].map(source=>[source,analytics.events.filter(e=>e.name==='booking_request'&&e.source===source).length]);
    return `<div class="page-title"><div><div class="eyebrow">BOOKING INSIGHTS</div><h1>สถิติการจอง</h1><p>ตัวอย่างการวัดผล 4 ขั้นตอนตามขอบเขต GA4</p></div><span class="sample-tag">ยังไม่เชื่อม Google Analytics</span></div><div class="analytics-disclosure">ในระบบจริงดูสถิติผ่าน Google Analytics หน้านี้ใช้สาธิตข้อมูลและเหตุการณ์ ไม่รวมการพัฒนารายงานเชื่อม GA4 เพิ่มเติม</div><div class="report-controls"><div class="feature-tabs" role="group" aria-label="ชุดข้อมูลรายงาน"><button class="${sample?'active':''}" data-action="feature-report" data-id="sample" aria-pressed="${sample}">ข้อมูลตัวอย่าง 7 วัน</button><button class="${!sample?'active':''}" data-action="feature-report" data-id="session" aria-pressed="${!sample}">การทดลองครั้งนี้</button></div><button class="text-button" data-action="feature-manage-consent">ตั้งค่าสถิติ</button></div><p class="report-context">${sample?'ตัวเลขสมมติสำหรับนำเสนอ ไม่ใช่ยอดของโรงแรม':`เฉพาะเหตุการณ์ที่ทดลองหลังยอมรับสถิติ · ปัจจุบัน${analytics.consent==='accepted'?'ยอมรับ':'ยังไม่ยอมรับ'} · รีเฟรชแล้วเริ่มใหม่`}</p><div class="stats analytics-stats">${[[counts[0],'ค้นหาห้องพัก','ครั้ง'],[counts[1],'ดูรายละเอียดห้อง','ครั้ง'],[requests,'ส่งคำขอสำเร็จ','ครั้ง'],[ratio,'คำขอ ÷ การค้นหา','สัดส่วนจำนวนครั้ง']].map(([v,label,unit])=>`<div class="stat"><div class="stat-label">${label}</div><div class="stat-number">${typeof v==='number'?money(v):v}</div><div class="stat-foot">${unit}</div></div>`).join('')}</div><div class="analytics-columns"><section class="panel"><div class="panel-head"><div><h2>เส้นทางการส่งคำขอ</h2><p>นับจำนวนเหตุการณ์ ไม่ใช่ผู้ใช้ที่ไม่ซ้ำกัน</p></div></div><ol class="funnel-list">${EVENT_STAGES.map(([id,label],i)=>`<li><div class="funnel-label"><span><b>${String(i+1).padStart(2,'0')}</b>${label}</span><strong>${money(counts[i])} ครั้ง</strong></div><div class="funnel-track"><div style="width:${counts[i]/totals*100}%"></div></div></li>`).join('')}</ol><p class="analytics-footnote">ส่งคำขอสำเร็จยังไม่ใช่การยืนยันห้องหรือการรับชำระเงิน</p></section><section class="panel"><div class="panel-head"><div><h2>ที่มาของคำขอ</h2><p>${sample?'ตัวอย่างแหล่งที่มา':'จากเหตุการณ์ส่งคำขอที่ทดลอง'}</p></div></div><div class="source-list">${sources.map(([name,count])=>`<div><span>${esc(name)}</span><strong>${money(count)} <small>ครั้ง</small></strong></div>`).join('')||'<div class="empty">ยังไม่มีคำขอที่เก็บสถิติ<br>ยอมรับสถิติแล้วทดลองจองได้จากหน้าลูกค้า</div>'}</div></section></div>${sample?`<div class="analytics-try"><div><strong>อยากเห็นตัวเลขเปลี่ยนตามที่ทดลอง?</strong><p>ยอมรับสถิติ แล้วค้นหา ดูห้อง และส่งคำขอจอง จากนั้นเปิดแท็บ “การทดลองครั้งนี้”</p></div><button class="primary" data-action="feature-try-flow">ไปทดลองหน้าลูกค้า →</button></div>`:`<section class="panel event-panel"><div class="panel-head"><h2>เหตุการณ์ล่าสุด</h2><span class="outline-pill">${analytics.events.length} เหตุการณ์</span></div><div class="table-scroll"><table><thead><tr><th>เวลา</th><th>เหตุการณ์</th><th>ประเภทห้อง</th><th>ที่มา</th></tr></thead><tbody>${analytics.events.slice(-12).reverse().map(e=>`<tr><td>${new Date(e.time).toLocaleTimeString('th-TH')}</td><td>${EVENT_STAGES.find(([id])=>id===e.name)[1]}</td><td>${byId(e.type)?.name||'ทุกประเภท'}</td><td>${esc(e.source)}</td></tr>`).join('')||'<tr><td colspan="4" class="events-empty">ยังไม่มีเหตุการณ์ ลองยอมรับสถิติแล้วทดลองจอง</td></tr>'}</tbody></table></div></section>`}<p class="feature-muted">ยอดจองยืนยันให้ตรวจจาก “รายการจอง” · Demo ไม่ส่งข้อมูลไป Google ไม่มีการติดตามผู้เยี่ยมชมจริง</p>`;
  }

  function handleAction(action, id) {
    if (!action.startsWith('feature-')) return false;
    switch(action) {
      case 'feature-mode': mode=id==='calendar'?'calendar':'rooms'; if(mode==='calendar'){draft={...getSearch()};month=draft.start.slice(0,7);if(getSearch().type&&getSearch().type!=='all')calendarType=getSearch().type;} render();scrollRooms();break;
      case 'feature-toggle': selected.has(id)?selected.delete(id):selected.add(id);render();doc.querySelector(`[data-action="feature-toggle"][data-id="${id}"]`)?.focus();break;
      case 'feature-clear': selected.clear();render();break;
      case 'feature-compare': showCompare();render();break;
      case 'feature-compare-pick': selected.has(id)?selected.delete(id):selected.add(id);showCompare(false);render();doc.querySelector(`[data-action="feature-compare-pick"][data-id="${id}"]`)?.focus();break;
      case 'feature-month': {const next=shiftMonth(Number(id));if(next>=today().slice(0,7))month=next;render();doc.querySelector(`[data-action="feature-month"][data-id="${id}"]`)?.focus();break;}
      case 'feature-day': {
        if(id<today()) break;
        if(draft.start&&!draft.end&&id>draft.start) draft.end=id;
        else {if(!available(getState(),calendarType,id,addDays(id,1)).length){toast('คืนนี้ไม่มีห้องเปิดขาย กรุณาเลือกวันเข้าอื่น');break;}draft={start:id,end:''};}
        render();doc.querySelector(`[data-action="feature-day"][data-id="${id}"]`)?.focus();break;
      }
      case 'feature-clear-dates': draft={start:'',end:''};render();break;
      case 'feature-use-dates': {
        validStay(draft.start,draft.end);
        if(byId(calendarType).capacity<getSearch().guests||!available(getState(),calendarType,draft.start,draft.end).length) throw Error('ห้องไม่ตรงกับช่วงวันหรือจำนวนผู้เข้าพัก');
        setSearch({...getSearch(),start:draft.start,end:draft.end,type:calendarType}); analytics.record('search_rooms',calendarType);mode='rooms';render();scrollRooms();toast('เลือกวันแล้ว พร้อมดูรายละเอียดหรือจองห้อง');break;
      }
      case 'feature-consent': analytics.consent=id==='accepted'?'accepted':'rejected';dialog.close();render();toast(id==='accepted'?'เปิดการนับเหตุการณ์ใน Demo แล้ว':'ปิดการนับเหตุการณ์ ยังทดลองจองได้ตามปกติ');break;
      case 'feature-manage-consent': showConsent();break;
      case 'feature-widget-book': analytics.source='เว็บไซต์หลัก (ปุ่มจอง)';mode='rooms';navigate('guest');scrollRooms();break;
      case 'feature-report': reportMode=id==='session'?'session':'sample';render();break;
      case 'feature-try-flow': navigate('guest');if(analytics.consent!=='accepted')showConsent();break;
    }
    return true;
  }
  return {
    toolbar, compareButton, compareTray, showCompare, calendar, widgetPage, analyticsPage, consentBanner,
    handleAction, record:(name,type)=>analytics.record(name,type),
    afterSearch(){mode='rooms';analytics.record('search_rooms',getSearch().type==='all'?'':getSearch().type);},
    setCalendarType(id){if(byId(id)){calendarType=id;render();}},
    reset(){selected.clear();mode='rooms';calendarType='deluxe';month=getSearch().start.slice(0,7);draft={...getSearch()};reportMode='sample';analytics=makeAnalytics();},
    get analytics(){return analytics;}
  };
}
