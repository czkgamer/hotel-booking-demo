export const DAY=86400000;
export function addDays(date,n){return new Date(Date.parse(date+'T00:00:00Z')+n*DAY).toISOString().slice(0,10)}
export function today(){return new Date().toISOString().slice(0,10)}
export function nights(start,end){return Math.round((Date.parse(end+'T00:00:00Z')-Date.parse(start+'T00:00:00Z'))/DAY)}
export function validStay(start,end){const format=/^\d{4}-\d{2}-\d{2}$/;if(!format.test(start)||!format.test(end))throw Error('กรุณาระบุวันเข้าพักและวันออก');if(!Number.isFinite(Date.parse(start))||!Number.isFinite(Date.parse(end))||addDays(start,0)!==start||addDays(end,0)!==end)throw Error('วันที่ไม่ถูกต้อง');if(start<today())throw Error('กรุณาเลือกวันที่ตั้งแต่วันนี้เป็นต้นไป');if(nights(start,end)<1||nights(start,end)>30)throw Error('กรุณาเลือกช่วงเข้าพัก 1–30 คืน');return true}
export function overlaps(a,b,c,d){return a<d&&c<b}
export function makeState(){
 const start=addDays(today(),7),end=addDays(start,2);
 const types=[
  {id:'deluxe',name:'Deluxe',label:'พักสบาย ในแบบที่คุณชอบ',count:72,price:1650,discount:10,capacity:2,area:32,bed:'เตียงคิงไซซ์',desc:'ห้องพักบรรยากาศอบอุ่น พร้อมมุมนั่งพักผ่อน เหมาะกับการพักผ่อนของสองคน',photo:'./assets/room.png'},
  {id:'grand',name:'Grand Deluxe',label:'พื้นที่ความสุขที่กว้างขึ้น',count:48,price:2150,discount:0,capacity:3,area:40,bed:'เตียงคิงไซซ์ + โซฟา',desc:'เพิ่มพื้นที่สำหรับพักผ่อนและทำงาน พร้อมมุมนั่งเล่นส่วนตัว สำหรับวันพักที่ไม่เร่งรีบ',photo:'./assets/room.png'},
  {id:'superior',name:'Superior',label:'เรียบง่าย ครบทุกการพักผ่อน',count:36,price:1250,discount:0,capacity:2,area:28,bed:'เตียงคู่',desc:'ห้องพักสะดวกสบาย พร้อมสิ่งอำนวยความสะดวกพื้นฐาน เหมาะกับทั้งการเดินทางและวันพักผ่อน',photo:'./assets/room.png'},
  {id:'suite',name:'Suite',label:'ให้ทุกการเข้าพักพิเศษกว่าเดิม',count:12,price:3200,discount:0,capacity:4,area:58,bed:'เตียงคิงไซซ์ + เตียงเสริม',desc:'ห้องพักขนาดใหญ่พร้อมพื้นที่นั่งเล่น ให้คุณใช้เวลาพักผ่อนร่วมกันได้อย่างเป็นส่วนตัว',photo:'./assets/room.png'}
 ];
 const distribution=[{floor:3,counts:[20,12,10,2]},{floor:4,counts:[20,12,10,2]},{floor:5,counts:[18,12,10,2]},{floor:6,counts:[14,12,6,6]}];
 const rooms=[];
 for(const {floor,counts} of distribution){let number=floor*100+1;let order=0;counts.forEach((count,ti)=>{for(let i=0;i<count;i++)rooms.push({id:String(number++),floor,type:types[ti].id,order:order++,online:i<[4,2,2,1][ti],overrides:[]})})}
 const bookings=[{id:'DEMO-1001',name:'ลูกค้าตัวอย่าง A',phone:'0800000000',type:'deluxe',room:rooms.find(r=>r.type==='deluxe').id,start,end,guests:2,status:'pending',easyfo:'',payment:'unpaid',rate:1485,total:2970},{id:'DEMO-1002',name:'ลูกค้าตัวอย่าง B',phone:'0800000000',type:'superior',room:rooms.find(r=>r.type==='superior').id,start,end:addDays(start,1),guests:2,status:'pending',easyfo:'',payment:'unpaid',rate:1250,total:1250}];
 return {types,rooms,bookings,start,end,next:1003,role:'front',audit:[]};
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
 state.bookings.unshift(booking);audit(state,'ส่งคำขอจอง',booking.id+' · ห้อง '+booking.room,'ลูกค้าทดลอง');return booking;
}
export function setRoomOpen(state,id,start,end,open,reason=''){setRoomsOpen(state,[id],start,end,open,reason);return state.rooms.find(r=>r.id===id)}

export function saveEasyfo(state,id,reference){const b=state.bookings.find(b=>b.id===id);if(!b||b.status==='cancelled')throw Error('ไม่สามารถลงรายการนี้ได้');if(typeof reference!=='string'||!reference.trim())throw Error('กรุณาระบุเลขอ้างอิงจาก Easyfo');b.easyfo=reference.trim().slice(0,60);audit(state,'บันทึก Easyfo',b.id+' · '+b.easyfo);return b}
export function confirmBooking(state,id){const b=state.bookings.find(b=>b.id===id);if(!b||b.status!=='pending')throw Error('รายการนี้ไม่ได้รอยืนยัน');if(!b.easyfo)throw Error('กรุณายืนยันการลงข้อมูล Easyfo ก่อน');b.status='confirmed';audit(state,'ยืนยันการจอง',b.id+' · ห้อง '+b.room);return b}
export function cancelBooking(state,id){const b=state.bookings.find(b=>b.id===id);if(!b||b.status==='cancelled')throw Error('รายการนี้ถูกยกเลิกแล้ว');b.status='cancelled';audit(state,'ยกเลิกการจอง',b.id+' · ห้อง '+b.room);return b}
export const FLOORS=[3,4,5,6];
export const CLOSE_REASONS=['ขายผ่านช่องทางอื่น','ปิดซ่อม','กันห้องไว้','ยังไม่เปิดขาย'];
export function audit(state,action,detail,actor){state.audit.unshift({time:new Date().toISOString(),actor:actor||(state.role==='admin'?'ผู้ดูแล Demo':'Front Demo'),action,detail})}
export function requireAdmin(state){if(state.role!=='admin')throw Error('กรุณาสลับเป็นบทบาทผู้ดูแลเพื่อทดลองตั้งค่า')}
export function setRoomsOpen(state,ids,start,end,open,reason=''){
 validStay(start,end);if(!Array.isArray(ids)||!ids.length)throw Error('กรุณาเลือกห้อง');
 if(!open&&!reason.trim())throw Error('กรุณาระบุเหตุผลที่ปิดขาย');
 const unique=[...new Set(ids)];const targets=unique.map(id=>{const r=state.rooms.find(r=>r.id===id);if(!r)throw Error('ไม่พบห้อง '+id);if(state.bookings.some(b=>b.room===id&&b.status!=='cancelled'&&overlaps(start,end,b.start,b.end)))throw Error('ห้อง '+id+' มีรายการจอง จึงยังไม่ได้เปลี่ยนสถานะห้องที่เลือกทั้งหมด');return r});
 const note=(reason.trim()||(open?'ตรวจสอบห้องว่างใน Easyfo แล้ว':'ปิดขาย')).slice(0,200);
 for(const room of targets)room.overrides.push({start,end,open:!!open,reason:note});
 audit(state,open?'เปิดขายออนไลน์':'ปิดขายออนไลน์','ห้อง '+unique.join(', ')+' · '+start+' ถึง '+end+' (ไม่รวมคืนเช็กเอาต์) · '+note);return targets;
}
export function closeReason(room,date){let entry=null;for(const o of room.overrides)if(o.start<=date&&date<o.end)entry=o;return entry?(entry.open?'':entry.reason||'ปิดขาย'):room.online?'':'ยังไม่เปิดขาย'}
export function moveBooking(state,id,targetId,easyfoUpdated=false){
 const b=state.bookings.find(b=>b.id===id);if(!b||b.status==='cancelled')throw Error('รายการนี้ไม่สามารถย้ายห้องได้');
 const target=state.rooms.find(r=>r.id===targetId);if(!target||target.type!==b.type)throw Error('เลือกห้องประเภทเดียวกับรายการจอง');
 if(target.id===b.room)throw Error('กรุณาเลือกห้องใหม่');
 if(roomStatus(state,target,b.start,b.end)!=='open')throw Error('ห้องใหม่ไม่ว่างตลอดช่วงเข้าพัก');
 if(b.easyfo&&!easyfoUpdated)throw Error('กรุณายืนยันว่าปรับเลขห้องใน Easyfo แล้ว');
 const before=b.room;b.room=targetId;audit(state,'ย้ายห้อง',b.id+' · '+before+' → '+targetId+' · วันพักและราคาเดิม'+(b.easyfo?' · พนักงานระบุว่าปรับ Easyfo แล้ว':''));return b;
}
function validateRoom(state,row){const id=String(row.id??'').trim(),floor=Number(row.floor),type=String(row.type??'');if(!/^[A-Za-z0-9-]{1,12}$/.test(id))throw Error('เลขห้องต้องเป็นตัวอักษรอังกฤษ ตัวเลข หรือขีด ไม่เกิน 12 ตัว');if(!FLOORS.includes(floor))throw Error('ชั้นห้องพักต้องเป็น 3, 4, 5 หรือ 6');if(!state.types.some(t=>t.id===type))throw Error('ประเภทห้องไม่ถูกต้อง');return {id,floor,type}}
function countTypes(state){for(const t of state.types)t.count=state.rooms.filter(r=>r.type===t.id).length}
export function updateRoom(state,id,values){requireAdmin(state);const room=state.rooms.find(r=>r.id===id);if(!room)throw Error('ไม่พบห้อง');const next=validateRoom(state,values);if(state.rooms.some(r=>r.id===next.id&&r!==room))throw Error('เลขห้องซ้ำกับห้องอื่น');const changed=room.id!==next.id||room.floor!==next.floor||room.type!==next.type;if(changed&&state.bookings.some(b=>b.room===id&&b.status!=='cancelled'))throw Error('ห้องมีรายการจองอยู่ กรุณาย้ายหรือยกเลิกรายการก่อนแก้ข้อมูลหลัก');if(changed){const previous=room.id+' / ชั้น '+room.floor+' / '+room.type;if(room.floor!==next.floor)room.order=Math.max(-1,...state.rooms.filter(r=>r.floor===next.floor).map(r=>r.order))+1;Object.assign(room,next);countTypes(state);audit(state,'แก้ข้อมูลห้อง',previous+' → '+room.id+' / ชั้น '+room.floor+' / '+room.type)}return room}
export function saveRoomOrder(state,floor,ids){requireAdmin(state);const rooms=state.rooms.filter(r=>r.floor===floor);if(ids.length!==rooms.length||new Set(ids).size!==ids.length||ids.some(id=>!rooms.some(r=>r.id===id)))throw Error('ลำดับห้องไม่ครบหรือมีห้องต่างชั้น');ids.forEach((id,i)=>{rooms.find(r=>r.id===id).order=i});audit(state,'จัดลำดับผังห้อง','ชั้น '+floor+' · '+ids.join(', ')+' · เปลี่ยนเฉพาะตำแหน่งแสดงผล')}
export function parseRoomCSV(text){
 if(typeof text!=='string'||!text.trim())throw Error('กรุณาเลือกไฟล์หรือวางข้อมูล');if(text.length>500000)throw Error('ข้อมูลมีขนาดใหญ่เกินไป');
 text=text.replace(/^\uFEFF/,'');const first=text.split(/\r?\n/)[0];const delimiter=first.includes('\t')?'\t':first.includes(';')?';':',';
 const rows=[];let row=[],field='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++}else quoted=!quoted}else if(c===delimiter&&!quoted){row.push(field.trim());field=''}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field.trim());if(row.some(Boolean))rows.push(row);row=[];field=''}else field+=c}
 if(quoted)throw Error('เครื่องหมายคำพูดใน CSV ไม่ครบ');row.push(field.trim());if(row.some(Boolean))rows.push(row);
 const head=rows.shift()?.map(v=>v.toLowerCase());if(!head)throw Error('ไม่มีข้อมูล');const find=aliases=>head.findIndex(v=>aliases.includes(v));const ni=find(['room_number','room','เลขห้อง']),fi=find(['floor','ชั้น']),ti=find(['room_type','type','ประเภทห้อง']);if([ni,fi,ti].some(i=>i<0))throw Error('ต้องมีหัวคอลัมน์ room_number, floor, room_type');
 const types={'deluxe':'deluxe','grand deluxe':'grand','grand':'grand','superior':'superior','suite':'suite'};
 return rows.map((r,i)=>{if(r.length!==head.length)throw Error('จำนวนคอลัมน์ไม่ครบที่แถว '+(i+2));return {id:r[ni],floor:Number(r[fi]),type:types[r[ti]?.toLowerCase()]||r[ti]}});
}
export function validateRoomImport(state,rows){requireAdmin(state);if(!Array.isArray(rows)||rows.length!==168)throw Error('ชุดข้อมูลต้องมี 168 ห้อง ตามจำนวนโรงแรม');const clean=rows.map(r=>validateRoom(state,r));if(new Set(clean.map(r=>r.id)).size!==clean.length)throw Error('มีเลขห้องซ้ำในไฟล์');for(const b of state.bookings.filter(b=>b.status!=='cancelled')){const old=state.rooms.find(r=>r.id===b.room),next=clean.find(r=>r.id===b.room);if(!next||next.type!==b.type||next.floor!==old.floor)throw Error('ห้อง '+b.room+' มีรายการจองอยู่ ต้องคงเลขห้อง ชั้น และประเภทเดิมในไฟล์')}return clean}
export function importRooms(state,rows){const clean=validateRoomImport(state,rows);const orders={};const rooms=clean.map(r=>{const old=state.rooms.find(x=>x.id===r.id);return {...r,order:orders[r.floor]=(orders[r.floor]??-1)+1,online:old?.online??false,overrides:old?.overrides.map(x=>({...x}))??[]}});state.rooms=rooms;countTypes(state);audit(state,'นำเข้ารายชื่อห้อง','168 ห้อง · คงรายการจองและสถานะขายเดิมของเลขห้องที่ตรงกัน · ห้องใหม่เริ่มปิดขาย');return rooms}
