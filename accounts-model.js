// Demonstration only: browser memory, public sample credentials, no real authentication.
export const DEMO_PASSWORD='Demo1234!';
export const PERMISSIONS={
 admin:['inventory','bookings','settings','customers','analytics','audit','guide','users','rooms'],
 manager:['inventory','bookings','settings','customers','analytics','audit','guide'],
 front:['inventory','bookings','customers','guide'],
 member:[],guest:[]
};
export const can=(role,permission)=>(PERMISSIONS[role]||[]).includes(permission);
export function createAccountState(bookings=[]){
 const staff=[{id:'S1',name:'Admin Demo',email:'admin@example.com',role:'admin',active:true},{id:'S2',name:'Manager Demo',email:'manager@example.com',role:'manager',active:true},{id:'S3',name:'Front Demo',email:'front@example.com',role:'front',active:true}];
 const customers=[{id:'C1',name:'Member Demo A',email:'member@example.com',phone:'0800000000',language:'th',notes:'',consent:true,consentLog:[],member:true,verified:true},{id:'C2',name:'Member Demo B',email:'member2@example.com',phone:'0800000001',language:'en',notes:'',consent:false,consentLog:[],member:true,verified:true}];
 bookings.forEach((b,i)=>{const c=customers[i%2];b.customerId=c.id;b.name=c.name;b.email=c.email;b.phone=c.phone;});
 return {staff,customers,session:null,next:3,requests:[],events:[]};
}
export function currentAccount(a){if(!a.session)return null;return (a.session.kind==='staff'?a.staff:a.customers).find(x=>x.id===a.session.id)||null;}
export function roleOf(a){const u=currentAccount(a);return !u?'guest':a.session.kind==='member'?'member':u.active?u.role:'guest';}
export function assertPermission(a,permission){if(!can(roleOf(a),permission))throw Error('บัญชีนี้ไม่มีสิทธิ์ทำรายการ');}
const noteEvent=(a,action,detail)=>a.events.unshift({time:new Date().toISOString(),actor:currentAccount(a)?.name||'Guest Demo',action,detail});
function validateContact(v){if(!String(v.name||'').trim())throw Error('กรุณาระบุชื่อ');if(!/^[^\s@]+@example\.com$/i.test(v.email||''))throw Error('ตัวอย่างนี้ใช้อีเมล @example.com เท่านั้น');if(!/^0\d{8,9}$/.test(v.phone||''))throw Error('กรุณาระบุเบอร์โทรศัพท์ 9–10 หลัก');}
export function loginDemo(a,kind,email,password){
 const list=kind==='staff'?a.staff:a.customers;const u=list.find(x=>x.email.toLowerCase()===String(email).trim().toLowerCase());
 if(!u||password!==DEMO_PASSWORD||(kind==='staff'&&!u.active)||(kind==='member'&&(!u.member||!u.verified)))throw Error('เข้าสู่ระบบไม่สำเร็จ โปรดตรวจบัญชีตัวอย่างและการยืนยันอีเมล');
 a.session={kind,id:u.id};noteEvent(a,'เข้าสู่ระบบตัวอย่าง',u.role||'member');return u;
}
export function logoutDemo(a){noteEvent(a,'ออกจากระบบตัวอย่าง','');a.session=null;}
export function registerMember(a,v){
 validateContact(v);if(v.password!==DEMO_PASSWORD)throw Error('ใช้รหัสตัวอย่าง Demo1234!');
 if(a.customers.some(x=>x.member&&x.email.toLowerCase()===v.email.toLowerCase()))throw Error('อีเมลสมาชิกนี้มีอยู่แล้ว');
 const c={id:'C'+a.next++,name:v.name.trim().slice(0,80),email:v.email.trim().toLowerCase(),phone:v.phone,language:v.language==='en'?'en':'th',notes:'',consent:!!v.consent,consentLog:[{value:!!v.consent,time:new Date().toISOString(),policy:'demo-v1'}],member:true,verified:false};a.customers.push(c);return c;
}
export function verifyDemo(a,id){const c=a.customers.find(c=>c.id===id&&c.member);if(!c)throw Error('ไม่พบสมาชิก');c.verified=true;return c;}
export function updateProfile(a,v){const c=currentAccount(a);if(roleOf(a)!=='member')throw Error('กรุณาเข้าสู่ระบบสมาชิก');validateContact({...v,email:c.email});c.name=v.name.trim().slice(0,80);c.phone=v.phone;c.language=v.language==='en'?'en':'th';if(c.consent!==!!v.consent){c.consent=!!v.consent;c.consentLog.push({value:c.consent,time:new Date().toISOString(),policy:'demo-v1'});}return c;}
export function ownBookings(a,bookings){const u=currentAccount(a);return roleOf(a)==='member'?bookings.filter(b=>b.customerId===u.id):[];}
export function attachBookingCustomer(a,result,values){
 let c=roleOf(a)==='member'?currentAccount(a):null;
 // No automatic merge by phone/email: an unverified booking never claims a member's history.
 if(!c){c={id:'C'+a.next++,name:values.name,email:values.email||'guest@example.com',phone:values.phone,language:'th',notes:'',consent:false,consentLog:[],member:false,verified:false};a.customers.push(c);}
 result.bookings.forEach(b=>{b.customerId=c.id;b.email=c.email;});return c;
}
export function requestBookingChange(a,bookings,id,kind,message){
 const b=ownBookings(a,bookings).find(b=>b.id===id);if(!b||b.status==='cancelled')throw Error('ไม่สามารถส่งคำขอสำหรับรายการนี้');
 if(!['change','cancel'].includes(kind)||!String(message||'').trim())throw Error('กรุณาระบุรายละเอียดคำขอ');
 if(a.requests.some(r=>r.bookingId===id&&r.status==='pending'))throw Error('รายการนี้มีคำขอรอพนักงานอยู่แล้ว');
 const r={id:'REQ-'+(a.requests.length+1),bookingId:id,customerId:b.customerId,kind,message:message.trim().slice(0,500),status:'pending',time:new Date().toISOString(),reply:''};a.requests.unshift(r);return r;
}
export function resolveRequest(a,id,reply){assertPermission(a,'bookings');const r=a.requests.find(r=>r.id===id);if(!r||r.status!=='pending'||!String(reply||'').trim())throw Error('กรุณาระบุผลการดำเนินการ');r.status='resolved';r.reply=reply.trim().slice(0,500);noteEvent(a,'บันทึกผลคำขอลูกค้า',r.bookingId);return r;}
export function saveCustomerNote(a,id,notes){assertPermission(a,'customers');const c=a.customers.find(c=>c.id===id);if(!c)throw Error('ไม่พบลูกค้า');c.notes=String(notes).slice(0,500);noteEvent(a,'แก้ไขบันทึกการบริการ',id);}
export function saveStaff(a,id,v){assertPermission(a,'users');const old=a.staff.find(x=>x.id===id);if(!String(v.name||'').trim()||!/^[^\s@]+@example\.com$/i.test(v.email||''))throw Error('กรุณาระบุชื่อและอีเมล @example.com');if(!['admin','manager','front'].includes(v.role))throw Error('สิทธิ์ไม่ถูกต้อง');if(a.staff.some(x=>x.id!==id&&x.email.toLowerCase()===v.email.toLowerCase()))throw Error('อีเมลพนักงานซ้ำ');const active=!!v.active;if(old?.id===a.session.id&&(!active||v.role!=='admin'))throw Error('ไม่สามารถลดสิทธิ์หรือปิดบัญชีของตนเอง');if(old?.role==='admin'&&old.active&&(!active||v.role!=='admin')&&a.staff.filter(x=>x.role==='admin'&&x.active).length===1)throw Error('ต้องมี Admin ที่ใช้งานได้อย่างน้อยหนึ่งบัญชี');const u=old||{id:'S'+(a.staff.length+1)};Object.assign(u,{name:v.name.trim().slice(0,80),email:v.email.trim().toLowerCase(),role:v.role,active});if(!old)a.staff.push(u);noteEvent(a,old?'แก้ไขบัญชีพนักงาน':'เพิ่มบัญชีพนักงาน',u.name+' · '+u.role);return u;}
