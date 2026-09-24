export const DAY=86400000;
export function addDays(date,n){return new Date(Date.parse(date+'T00:00:00Z')+n*DAY).toISOString().slice(0,10)}
export function today(){return new Date().toISOString().slice(0,10)}
export function nights(start,end){return Math.round((Date.parse(end+'T00:00:00Z')-Date.parse(start+'T00:00:00Z'))/DAY)}
export function validStay(start,end){const format=/^\d{4}-\d{2}-\d{2}$/;if(!format.test(start)||!format.test(end))throw Error('กรุณาระบุวันเข้าพักและวันออก');if(!Number.isFinite(Date.parse(start))||!Number.isFinite(Date.parse(end))||addDays(start,0)!==start||addDays(end,0)!==end)throw Error('วันที่ไม่ถูกต้อง');if(start<today())throw Error('กรุณาเลือกวันที่ตั้งแต่วันนี้เป็นต้นไป');if(nights(start,end)<1||nights(start,end)>30)throw Error('กรุณาเลือกช่วงเข้าพัก 1–30 คืน');return true}
export function overlaps(a,b,c,d){return a<d&&c<b}
export function makeState(){
 const start=addDays(today(),7),end=addDays(start,2);
 const types=[
  {id:'deluxe',name:'Deluxe',label:'พักสบาย ในแบบที่คุณชอบ',count:72,online:12,first:101,price:1650,discount:10,capacity:2,area:32,bed:'เตียงคิงไซซ์',desc:'ห้องพักบรรยากาศอบอุ่น พร้อมมุมนั่งพักผ่อน เหมาะกับการพักผ่อนของสองคน',photo:'./assets/room.png'},
  {id:'grand',name:'Grand Deluxe',label:'พื้นที่ความสุขที่กว้างขึ้น',count:48,online:8,first:201,price:2150,discount:0,capacity:3,area:40,bed:'เตียงคิงไซซ์ + โซฟา',desc:'เพิ่มพื้นที่สำหรับพักผ่อนและทำงาน พร้อมมุมนั่งเล่นส่วนตัว สำหรับวันพักที่ไม่เร่งรีบ',photo:'./assets/room.png'},
  {id:'superior',name:'Superior',label:'เรียบง่าย ครบทุกการพักผ่อน',count:36,online:10,first:301,price:1250,discount:0,capacity:2,area:28,bed:'เตียงคู่',desc:'ห้องพักสะดวกสบาย พร้อมสิ่งอำนวยความสะดวกพื้นฐาน เหมาะกับทั้งการเดินทางและวันพักผ่อน',photo:'./assets/room.png'},
  {id:'suite',name:'Suite',label:'ให้ทุกการเข้าพักพิเศษกว่าเดิม',count:12,online:4,first:401,price:3200,discount:0,capacity:4,area:58,bed:'เตียงคิงไซซ์ + เตียงเสริม',desc:'ห้องพักขนาดใหญ่พร้อมพื้นที่นั่งเล่น ให้คุณใช้เวลาพักผ่อนร่วมกันได้อย่างเป็นส่วนตัว',photo:'./assets/room.png'}
 ];
 const rooms=types.flatMap(t=>Array.from({length:t.count},(_,i)=>({id:String(t.first+i),type:t.id,online:i<t.online,overrides:[]})));
 const bookings=[{id:'DEMO-1001',name:'ลูกค้าตัวอย่าง A',phone:'0800000000',type:'deluxe',room:'101',start,end,guests:2,status:'pending',easyfo:'',payment:'unpaid',rate:1485,total:2970},{id:'DEMO-1002',name:'ลูกค้าตัวอย่าง B',phone:'0800000000',type:'superior',room:'301',start,end:addDays(start,1),guests:2,status:'pending',easyfo:'',payment:'unpaid',rate:1250,total:1250}];
 return {types,rooms,bookings,start,end,next:1003};
}
export function isOpen(room,date){let value=room.online;for(const o of room.overrides)if(o.start<=date&&date<o.end)value=o.open;return value}
export function roomStatus(state,room,start,end){const b=state.bookings.find(b=>b.room===room.id&&b.status!=='cancelled'&&overlaps(start,end,b.start,b.end));if(b)return b.status;for(let d=start;d<end;d=addDays(d,1))if(!isOpen(room,d))return 'closed';return 'open'}
export function available(state,type,start,end){validStay(start,end);return state.rooms.filter(r=>r.type===type&&roomStatus(state,r,start,end)==='open')}
export function rate(type){return Math.round(type.price*(1-type.discount/100))}
export function createBooking(state,input){
 validStay(input.start,input.end);const type=state.types.find(t=>t.id===input.type);if(!type)throw Error('ไม่พบประเภทห้อง');
 const guests=Number(input.guests);if(!Number.isInteger(guests)||guests<1||guests>type.capacity)throw Error('จำนวนผู้เข้าพักเกินความจุของห้อง');
 if(typeof input.name!=='string'||!input.name.trim())throw Error('กรุณาระบุชื่อผู้จอง');if(!/^0\d{8,9}$/.test(input.phone||''))throw Error('กรุณาระบุเบอร์โทรศัพท์ 9–10 หลัก');
 const room=available(state,type.id,input.start,input.end)[0];if(!room)throw Error('ห้องประเภทนี้เต็มแล้ว กรุณาเลือกประเภทหรือวันอื่น');
 const booking={id:'DEMO-'+state.next++,name:input.name.trim().slice(0,80),phone:input.phone,type:type.id,room:room.id,start:input.start,end:input.end,guests,status:'pending',easyfo:'',payment:'unpaid',rate:rate(type),total:rate(type)*nights(input.start,input.end)};
 state.bookings.unshift(booking);return booking;
}
export function setRoomOpen(state,id,start,end,open){validStay(start,end);const room=state.rooms.find(r=>r.id===id);if(!room)throw Error('ไม่พบห้อง');if(state.bookings.some(b=>b.room===id&&b.status!=='cancelled'&&overlaps(start,end,b.start,b.end)))throw Error('ห้องมีรายการจองอยู่ กรุณาจัดการรายการจองก่อน');room.overrides.push({start,end,open:!!open});return room}
export function saveEasyfo(state,id,reference){const b=state.bookings.find(b=>b.id===id);if(!b||b.status==='cancelled')throw Error('ไม่สามารถลงรายการนี้ได้');if(typeof reference!=='string'||!reference.trim())throw Error('กรุณาระบุเลขอ้างอิงจาก Easyfo');b.easyfo=reference.trim().slice(0,60);return b}
export function confirmBooking(state,id){const b=state.bookings.find(b=>b.id===id);if(!b||b.status!=='pending')throw Error('รายการนี้ไม่ได้รอยืนยัน');if(!b.easyfo)throw Error('กรุณายืนยันการลงข้อมูล Easyfo ก่อน');b.status='confirmed';return b}
export function cancelBooking(state,id){const b=state.bookings.find(b=>b.id===id);if(!b||b.status==='cancelled')throw Error('รายการนี้ถูกยกเลิกแล้ว');b.status='cancelled';return b}
