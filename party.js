// Guest policy is illustrative. Children occupy capacity; no free-child policy is assumed.
export const PARTY_LIMITS = {rooms:5, adults:20, children:10};
export const DEFAULT_PARTY = {rooms:1, adults:2, children:0, childAges:[], guests:2};
export function partyOf(value = DEFAULT_PARTY) {
  const adults = value.adults ?? value.guests ?? 2;
  const childAges = [...(value.childAges ?? [])];
  const children = value.children ?? childAges.length;
  return {rooms:value.rooms ?? 1, adults, children, childAges, guests:adults+children};
}
export function validateParty(value) {
  const p = partyOf(value);
  if (!Number.isInteger(p.rooms) || p.rooms<1 || p.rooms>PARTY_LIMITS.rooms) throw Error('กรุณาเลือกจำนวนห้อง 1–5 ห้อง');
  if (!Number.isInteger(p.adults) || p.adults<p.rooms || p.adults>PARTY_LIMITS.adults) throw Error('ต้องมีผู้ใหญ่อย่างน้อย 1 คนต่อห้อง');
  if (!Number.isInteger(p.children) || p.children<0 || p.children>PARTY_LIMITS.children) throw Error('กรุณาเลือกจำนวนเด็ก 0–10 คน');
  if (p.childAges.length!==p.children || p.childAges.some(a=>!Number.isInteger(a)||a<0||a>17)) throw Error('กรุณาเลือกอายุเด็กทุกคน (0–17 ปี)');
  return p;
}
export function canFit(type, value) {
  const p=partyOf(value);
  return p.adults>=p.rooms && p.guests<=type.capacity*p.rooms;
}
export function partySummary(value, ages=false) {
  const p=partyOf(value);
  return `ผู้ใหญ่ ${p.adults} คน · เด็ก ${p.children} คน${ages&&p.children?` (อายุ ${p.childAges.map(a=>a===0?'ต่ำกว่า 1':a).join(', ')} ปี)`:''} · ${p.rooms} ห้อง`;
}
export function allocateParty(type, value) {
  const p=validateParty(value);
  if(!canFit(type,p))throw Error('จำนวนผู้เข้าพักเกินความจุรวมของห้องที่เลือก');
  const result=Array.from({length:p.rooms},()=>({adults:1,children:0,childAges:[],guests:1}));
  const next=()=>result.reduce((a,b)=>b.guests<a.guests?b:a);
  for(let i=p.rooms;i<p.adults;i++){const room=next();room.adults++;room.guests++;}
  for(const age of p.childAges){const room=next();room.children++;room.childAges.push(age);room.guests++;}
  return result;
}
