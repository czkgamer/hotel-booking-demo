import {partyOf,validateParty,PARTY_LIMITS} from './party.js?v=20260926-members1';

export function createGuestPicker({doc,icon}) {
  let draft=partyOf();
  const label={rooms:'ห้อง',adults:'ผู้ใหญ่',children:'เด็ก'};
  function row(key,hint){
    const min=key==='rooms'?1:key==='adults'?draft.rooms:0;
    return `<div class="guest-step-row"><div><strong>${label[key]}</strong><small>${hint}</small></div><div class="guest-stepper"><button type="button" data-guest-step="${key}" data-delta="-1" aria-label="ลดจำนวน${label[key]}" ${draft[key]<=min?'disabled':''}>−</button><output aria-live="polite" aria-label="จำนวน${label[key]}">${draft[key]}</output><button type="button" data-guest-step="${key}" data-delta="1" aria-label="เพิ่มจำนวน${label[key]}" ${draft[key]>=PARTY_LIMITS[key]?'disabled':''}>+</button></div></div>`;
  }
  function panel(){return `<div class="guest-panel-head"><strong id="guest-panel-title">ห้องและผู้เข้าพัก</strong><button type="button" class="guest-close" data-guest-close aria-label="ปิดตัวเลือกผู้เข้าพัก">×</button></div>${row('rooms','เลือกได้ 1–5 ห้องต่อครั้ง')}${row('adults','อายุ 18 ปีขึ้นไป')}${row('children','อายุ 0–17 ปี')}${draft.children?`<div class="child-ages"><p>กรุณาระบุอายุเด็ก ณ วันเช็กอินให้ครบทุกคน</p><div class="child-age-grid">${draft.childAges.map((age,i)=>`<label for="child-age-${i}">อายุเด็กคนที่ ${i+1}<select id="child-age-${i}" data-child-age="${i}" aria-required="true"><option value="" ${age===null?'selected':''}>เลือกอายุ</option>${Array.from({length:18},(_,n)=>`<option value="${n}" ${age===n?'selected':''}>${n===0?'ต่ำกว่า 1 ปี':n+' ปี'}</option>`).join('')}</select></label>`).join('')}</div></div>`:''}<p class="guest-policy">ผู้ใหญ่อย่างน้อย 1 คนต่อห้อง<br>เกณฑ์อายุเป็นตัวอย่าง รอโรงแรมยืนยันนโยบายเด็กและค่าใช้จ่ายเพิ่มเติม</p><div id="guest-error" class="form-error" role="alert"></div><button type="button" class="primary guest-done" data-guest-done>เสร็จสิ้น ${icon('check',16)}</button>`;}
  const summary=()=>`<span>${icon('users',22)}</span><span><strong>ผู้ใหญ่ ${draft.adults} คน · เด็ก ${draft.children} คน</strong><small>${draft.rooms} ห้อง</small></span><span class="guest-chevron" aria-hidden="true">⌄</span>`;
  function field(value){draft=partyOf(value);return `<div class="guest-field"><span class="guest-field-label" id="guest-field-label">ห้องและผู้เข้าพัก</span><details id="guest-picker" class="guest-picker"><summary aria-labelledby="guest-field-label guest-summary" aria-controls="guest-panel"><span id="guest-summary" class="guest-summary">${summary()}</span></summary><div id="guest-panel" class="guest-panel" role="group" aria-labelledby="guest-panel-title">${panel()}</div></details></div>`;}
  function close(){const details=doc.querySelector('#guest-picker');if(details){details.open=false;details.querySelector('summary')?.focus();}}
  function repaint(focus){doc.querySelector('#guest-panel').innerHTML=panel();doc.querySelector('#guest-summary').innerHTML=summary();const target=doc.querySelector(focus);if(target&&!target.disabled)target.focus();else doc.querySelector('#guest-panel-title')?.parentElement?.querySelector('button')?.focus();}
  function value(){try{return validateParty(draft);}catch(err){const details=doc.querySelector('#guest-picker');if(details){details.open=true;doc.querySelector('#guest-error').textContent=err.message;const missing=draft.childAges.indexOf(null);doc.querySelector(missing>=0?`#child-age-${missing}`:'[data-guest-done]')?.focus();}throw err;}}
  function click(e){
    const step=e.target.closest('[data-guest-step]');
    if(step){const key=step.dataset.guestStep,delta=Number(step.dataset.delta),min=key==='rooms'?1:key==='adults'?draft.rooms:0;draft[key]=Math.max(min,Math.min(PARTY_LIMITS[key],draft[key]+delta));if(key==='rooms')draft.adults=Math.max(draft.rooms,draft.adults);draft.childAges=Array.from({length:draft.children},(_,i)=>draft.childAges[i]??null);repaint(`[data-guest-step="${key}"][data-delta="${delta}"]`);return true;}
    if(e.target.closest('[data-guest-done]')){value();close();return true;}
    if(e.target.closest('[data-guest-close]')){close();return true;}
    const details=doc.querySelector('#guest-picker');if(details?.open&&!details.contains(e.target))details.open=false;
    return false;
  }
  function change(e){if(e.target.dataset.childAge!==undefined){draft.childAges[Number(e.target.dataset.childAge)]=e.target.value===''?null:Number(e.target.value);doc.querySelector('#guest-error').textContent='';return true;}return false;}
  function keydown(e){if(e.key==='Escape'&&doc.querySelector('#guest-picker')?.open){e.preventDefault();close();}}
  function focusout(e){const details=doc.querySelector('#guest-picker');if(details?.open&&e.relatedTarget&&!details.contains(e.relatedTarget))details.open=false;}
  return {field,value,click,change,keydown,focusout};
}
