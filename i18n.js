import {EN} from './translations-en.js?v=20260926-members1';

// Presentation-only localization for the static demo. Booking state, form values,
// room IDs and CSV field names always keep their original values.
const STORAGE_KEY='suntara-demo-language-v1';
const THAI=/[\u0e00-\u0e7f]/;
const escapeRegex=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const keys=Object.keys(EN).sort((a,b)=>b.length-a.length);
const phrases=new RegExp(keys.map(escapeRegex).join('|'),'g');
const shortMonths=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
const longMonths=['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
const enShort=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const enLong=['January','February','March','April','May','June','July','August','September','October','November','December'];
const shortDate=new RegExp('(\\d{1,2})\\s+('+shortMonths.map(escapeRegex).join('|')+')\\s+(\\d{2,4})','g');
const monthDate=new RegExp('('+longMonths.join('|')+')\\s+(\\d{4})','g');
const year=y=>String(Number(y)>=2400?Number(y)-543:2000+((Number(y)-43+100)%100));
export function translateText(value,locale='en'){
  const source=String(value??'');
  if(locale!=='en')return source;
  let out=source.replace(shortDate,(_,day,month,y)=>`${day} ${enShort[shortMonths.indexOf(month)]} ${year(y)}`)
    .replace(monthDate,(_,month,y)=>`${enLong[longMonths.indexOf(month)]} ${Number(y)-543}`);
  // Audit timestamps use a numeric Buddhist year in Thai.
  out=out.replace(/\b(\d{1,2})\/(\d{1,2})\/(25\d{2}|[5-9]\d)(?=\s|,|$)/g,(_,day,month,y)=>`${day}/${month}/${year(y)}`);
  out=out.replace(/ผู้ใหญ่ (\d+) คน · เด็ก (\d+) คน/g,(_,a,c)=>`${a} ${a==='1'?'adult':'adults'} · ${c} ${c==='1'?'child':'children'}`);
  if(THAI.test(out))out=out.replace(phrases,key=>EN[key]);
  if(source.trim()==='ห้อง')out=out.replace('Room','Rooms');
  return out.replace(/\b(\d+) Room\b/g,(_,n)=>`${n} ${n==='1'?'room':'rooms'}`)
    .replace(/\b1 rooms\b/g,'1 room').replace(/\b1 nights\b/g,'1 night').replace(/\b1 years\b/g,'1 year');
}
export function localeSwitcher(){return '<div class="language-switch" role="group" aria-label="Language / ภาษา" translate="no"><button type="button" data-locale="th" lang="th" aria-label="ภาษาไทย" aria-pressed="true">TH</button><button type="button" data-locale="en" lang="en" aria-label="English" aria-pressed="false">EN</button></div>';}

export function initLocale(doc=globalThis.document){
  if(!doc?.createTreeWalker)return null;
  const win=doc.defaultView||globalThis.window;
  const roots=new WeakMap(),attrs=new WeakMap();
  let locale='th';
  try{locale=new URL(win.location.href).searchParams.get('lang')||win.localStorage.getItem(STORAGE_KEY)||'th';}catch{}
  if(locale!=='en')locale='th';
  const skip=el=>el?.closest?.('script,style,textarea,input,[translate="no"],[data-user-content]');
  const observer=new win.MutationObserver(()=>refresh());
  const observe=()=>observer.observe(doc.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['title','placeholder','alt','aria-label']});
  function transform(originals,node,read,write){
    const current=read(),old=originals.get(node);
    const original=old&&current===old.rendered?old.original:current;
    const rendered=translateText(original,locale);
    if(current!==rendered)write(rendered);
    originals.set(node,{original,rendered});
  }
  function refresh(){
    observer.disconnect();
    // Options without explicit values derive their value from their visible text.
    // Freeze that value before translating the label so business logic is stable.
    doc.querySelectorAll('option:not([value])').forEach(el=>el.setAttribute('value',el.textContent));
    const walker=doc.createTreeWalker(doc.body,4);
    let node;while((node=walker.nextNode())){
      if(!skip(node.parentElement))transform(roots,node,()=>node.nodeValue,value=>{node.nodeValue=value;});
    }
    doc.querySelectorAll('[title],[placeholder],[alt],[aria-label]').forEach(el=>{
      if(el.closest('[translate="no"]'))return;
      let map=attrs.get(el);if(!map){map=new Map();attrs.set(el,map);}
      for(const name of ['title','placeholder','alt','aria-label'])if(el.hasAttribute(name)){
        transform(map,name,()=>el.getAttribute(name),value=>el.setAttribute(name,value));
      }
    });
    doc.documentElement.lang=locale;
    doc.title=locale==='en'?'Suntara Grand · Hotel booking demo':'Suntara Grand · ระบบจองห้องพัก';
    const description=doc.querySelector('meta[name="description"]');
    if(description)description.content=locale==='en'?'Explore the Suntara Grand hotel booking and Front Desk demo in English or Thai. Illustrative data; no real reservations.':'ทดลองระบบจองห้องพัก Suntara Grand และหลังบ้าน Front ภาษาไทยและอังกฤษ ใช้ข้อมูลสมมติ ไม่รับจองจริง';
    doc.querySelectorAll('[data-locale]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.locale===locale)));
    doc.querySelectorAll('[data-roomcopy-th]').forEach(el=>{
      const copy=el.getAttribute(locale==='en'?'data-roomcopy-en':'data-roomcopy-th');
      if(copy!==null&&el.textContent!==copy)el.textContent=copy;
    });
    observe();
  }
  function setLocale(next){
    if(next!=='th'&&next!=='en')return;
    locale=next;
    try{win.localStorage.setItem(STORAGE_KEY,locale);}catch{}
    try{const url=new URL(win.location.href);url.searchParams.set('lang',locale);win.history?.replaceState(null,'',url);}catch{}
    refresh();
  }
  // No rerender or reload: dates, guest counts, selections, unsaved text and
  // open dialogs remain intact when the presentation language changes.
  doc.addEventListener('click',e=>{const b=e.target.closest?.('[data-locale]');if(b){e.preventDefault();setLocale(b.dataset.locale);}});
  refresh();
  return {setLocale,getLocale:()=>locale,refresh,disconnect:()=>observer.disconnect()};
}
