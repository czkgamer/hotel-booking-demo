# Suntara Grand — Hotel booking UI prototype

## Demo — รุ่น 20260926-members1

ตัวอย่างหน้าจอสำหรับนำเสนอระบบจองและหลังบ้าน Front พร้อมความสามารถหลักต่อไปนี้:

- **เปรียบเทียบห้อง:** เลือก 2–4 ประเภท เทียบรูป ขนาด เตียง ผู้เข้าพัก สิ่งอำนวยความสะดวก ราคา และห้องว่างในช่วงเดียวกัน แล้วจองจากตารางได้
- **ปฏิทินห้องว่าง:** ดูรายเดือนและแยกประเภท เลือกวันเข้า–ออก ระบบตรวจห้องเดียวที่ว่างครบทุกคืน จำนวนเปลี่ยนตามการเปิด–ปิดขายและการจองที่ทดลองใน Front
- **ปุ่มจองบนเว็บหลัก:** แท็บ “เว็บหลัก (ตัวอย่าง)” จำลองตำแหน่งปุ่มของโรงแรม กดแล้วเข้าสู่หน้าจอง ไม่ใช่การแก้เว็บไซต์หลักจริง
- **สถิติการจอง:** หลังบ้าน “สถิติการจอง” มีข้อมูลสมมติ 7 วัน และเหตุการณ์จาก “การทดลองครั้งนี้” แยกกัน ต้องยอมรับสถิติก่อนจึงนับเหตุการณ์ ไม่มีการส่งข้อมูลไป Google

หน้าสถิติเป็นตัวอย่างอธิบายการตั้งค่า GA4 ในข้อเสนอ ระบบจริงดูรายงานผ่าน Google Analytics ไม่ถือว่ารวมการพัฒนารายงานเชื่อม GA4 เพิ่มเติม

### ใหม่: Login, Role, สมาชิก และทะเบียนลูกค้า

Login ใช้สาธิตเท่านั้น ไม่มี API/ฐานข้อมูล/อีเมลจริง อย่ากรอกข้อมูลส่วนบุคคลหรือรหัสผ่านจริง บัญชีทั้งหมดใช้รหัส `Demo1234!`

| บัญชี | เปิดจาก | สิ่งที่ทดลองได้ |
| --- | --- | --- |
| `front@example.com` | หลังบ้าน Front | ห้องเปิดขาย การจอง ข้อมูลลูกค้าและบันทึกบริการ |
| `manager@example.com` | หลังบ้าน Front | งาน Front พร้อมราคา โปรโมชั่น รายงานและประวัติแก้ไข |
| `admin@example.com` | หลังบ้าน Front | งาน Manager พร้อมบัญชีพนักงานและข้อมูลหลักของห้อง |
| `member@example.com` | สมาชิก | โปรไฟล์และรายการ DEMO-1001 ของตนเอง |
| `member2@example.com` | สมาชิก | โปรไฟล์และรายการ DEMO-1002 ของตนเอง |

วิธีสาธิตส่วนใหม่:
1. เปิด **หลังบ้าน Front** ลองบัญชี Front แล้วออกจากระบบ ลอง Manager และ Admin เพื่อเปรียบเทียบเมนู
2. Admin → **บัญชีพนักงานและสิทธิ์** ทดลองเพิ่ม แก้สิทธิ์ หรือปิดบัญชี ห้ามปิดหรือลดสิทธิ์บัญชีตนเอง
3. เปิด **สมาชิก** เข้าบัญชี Member A ดูการจองของตนเอง แก้โปรไฟล์และการรับข่าวสาร
4. ส่งคำขอเปลี่ยนแปลง/ยกเลิก จากนั้นออกจากระบบ เข้า Front → **ข้อมูลลูกค้า** → จัดการรายการและบันทึกผลตอบกลับ
5. กลับเข้า Member A เพื่อดูคำตอบ คำขอและคำตอบไม่เปลี่ยนวัน ราคา หรือสถานะจองเอง
6. สมัครด้วยอีเมลลงท้าย `@example.com` แล้วกด **จำลองยืนยันอีเมล** ก่อน Login ไม่มีการส่งอีเมลจริง
7. จองขณะเป็นสมาชิก: ชื่อและเบอร์เติมจากโปรไฟล์ รายการเชื่อมกับบัญชีนั้น จองแบบไม่สมัครสมาชิกยังทำได้และไม่รวมประวัติกับสมาชิกจากเบอร์ซ้ำ
8. ข้อมูลลูกค้าแสดงเฉพาะรายการผ่าน Demo ไม่มีประวัติเก่าจาก Easyfo คะแนนสะสม หรือส่งแคมเปญอัตโนมัติ

รวมสมาชิกและทะเบียนลูกค้าพื้นฐานในข้อเสนอ Rev.07 ราคาเดิม 75,000 บาท โดยรายละเอียดขอบเขตและงานเพิ่มเติมยึด Word ฉบับอนุมัติ ระบบใช้งานจริงยังต้องสร้างและทดสอบเซิร์ฟเวอร์ การยืนยันตัวตน และการบังคับสิทธิ์จริง

### Front จัดการห้องและการขายในหน้าเดียว

- เลือกวันที่ก่อน กรองชั้น ประเภท สถานะ และค้นหาเลขห้องได้ในหน้าหลักเดียว
- สลับการ์ด/ตาราง กดห้องเพื่อเปิดแผงด้านข้าง ดูสถานะรายคืนและรายการจองที่เกี่ยวข้อง
- เลือกหลายห้องแล้วใช้แถบคำสั่งด้านล่าง เปิด–ปิดขายหลังตรวจเลขห้อง วัน และ Easyfo
- สถานะ “หลายแบบ” หมายถึงแต่ละคืนไม่เหมือนกัน จึงต้องดูรายละเอียดก่อนเปิดขาย
- บทบาทผู้ดูแล: จัดการข้อมูลห้อง → เพิ่มห้อง นำเข้า CSV และจัดลำดับการ์ด
- แก้ข้อมูลหลักห้องได้เฉพาะห้องที่ไม่มีประวัติจอง ยกเลิกใช้งานโดยเก็บประวัติ หรือลบได้เฉพาะห้องที่ไม่มีประวัติจอง
- จำกัดห้องที่ใช้งาน 168 ห้อง หากต้องการทดลองเพิ่ม ให้ยกเลิกใช้งานห้องที่ไม่มีจอง เช่น 320 ก่อน แล้วเพิ่ม 3A ห้องใหม่จะเริ่มปิดขาย
- ยกเลิกใช้งานต่างจากปิดซ่อมชั่วคราว: ปิดซ่อมให้ใช้ปิดขายตามวันที่และระบุเหตุผล
- Login ใน Demo ใช้บัญชีสมมติและตรวจสิทธิ์ในเบราว์เซอร์เท่านั้น ไม่ใช่การรักษาความปลอดภัยฝั่งเซิร์ฟเวอร์

### สลับภาษา TH / EN

- มีปุ่ม **TH / EN** ด้านบนทุกหน้า และในหัวหน้าต่างจอง/จัดการรายการ
- ครอบคลุมหน้าจอง รายละเอียดห้อง ตัวเลือกห้อง/ผู้ใหญ่/เด็ก ปฏิทิน เปรียบเทียบห้อง ข้อความแจ้งเตือน หลังบ้าน Front สถิติ และหน้าตัวอย่างเว็บหลัก
- เปลี่ยนภาษาโดยไม่รีเฟรช จึงเก็บวันที่ จำนวนห้อง อายุเด็ก รายการจอง และข้อมูลที่กำลังกรอกไว้
- จำเฉพาะภาษาที่เลือกในเบราว์เซอร์ ไม่บันทึกข้อมูลผู้จองลง localStorage ข้อมูลการจองใน Demo ยังคงหายเมื่อรีเฟรช
- ใช้ `?lang=en` เปิดภาษาอังกฤษ หรือ `?lang=th` เปิดภาษาไทยได้ การเปลี่ยนภาษาจะอัปเดตลิงก์นี้ด้วย
- ราคาเป็นเงินบาททั้งสองภาษา วันที่แสดงเป็น พ.ศ. ใน TH และ ค.ศ. ใน EN ส่วนหน้าต่างเลือกวันที่/ไฟล์ของเบราว์เซอร์อาจใช้ภาษาตามอุปกรณ์
- หลังบ้าน → บทบาทผู้ดูแล → ราคาและข้อมูลห้อง → แก้ไข มีช่องคำโปรยและรายละเอียด **TH / EN แยกกัน** ทดลองแก้แล้วสลับภาษาในหน้าลูกค้าได้
- ชื่อผู้จอง เลขอ้างอิง และค่าที่พิมพ์ในฟอร์มคงตามที่กรอก ไม่แปลข้อมูลบุคคลอัตโนมัติ
- คำแปลห้องและนโยบายเป็นตัวอย่าง ต้องให้โรงแรมตรวจรับก่อนเปิดใช้งานจริง
- ใบเสนอราคา Rev.07 รวม TH/EN และหน้า Front ที่จัดการห้องและการขายในหน้าเดียวแล้ว ราคาและเงื่อนไขให้ยึดเอกสารฉบับที่โรงแรมอนุมัติ

### ตัวเลือกผู้เข้าพักแบบใหม่

- กด “ห้องและผู้เข้าพัก” เพื่อเพิ่ม–ลดห้อง ผู้ใหญ่ และเด็ก แล้วเลือกอายุเด็กแต่ละคน ณ วันเช็กอิน
- ตัวอย่างรองรับ 1–5 ห้องประเภทเดียวกันต่อครั้ง ผู้ใหญ่อายุ 18 ปีขึ้นไป เด็ก 0–17 ปี ต้องมีผู้ใหญ่ 1 คนต่อห้อง การเพิ่มห้องจะเพิ่มผู้ใหญ่ให้ถึงขั้นต่ำโดยอัตโนมัติ
- กดเสร็จสิ้น แล้วกดค้นหาห้องพัก ระบบตรวจจำนวนห้องว่างตลอดช่วงพักและความจุรวม คิดราคาต่อห้อง × จำนวนคืน × จำนวนห้อง
- เด็กนับรวมในความจุห้อง ราคายังไม่คิดค่าบริการเด็กหรือเตียงเสริม ไม่ได้หมายความว่าโรงแรมให้เด็กพักฟรี เกณฑ์อายุ ราคา และนโยบายจริงรอโรงแรมยืนยัน
- เมื่อจองหลายห้อง ระบบตัวอย่างกันห้องครบทุกห้องพร้อมกัน แยกรายการแต่ละห้องและแสดงเลขกลุ่มให้ Front ตรวจสอบได้ การยืนยัน ย้าย หรือยกเลิกทำแยกแต่ละห้อง
- หน้าเปรียบเทียบห้อง ปฏิทิน สรุปการจอง และรายละเอียด Front ใช้จำนวนห้อง/ผู้เข้าพักเดียวกัน
- รายการใน Demo ใช้เพื่ออธิบายการทำงาน ขอบเขต ราคา และเงื่อนไขระบบจริงให้ยึดใบเสนอราคาที่ทั้งสองฝ่ายอนุมัติ

### วิธีสาธิตกับผู้บริหาร

1. หน้าจองลูกค้า: เลือกยอมรับสถิติทดลอง แล้วค้นหาวันพักและประเภทห้อง
2. เปิดปฏิทิน เลือกวันเข้าและวันออก กด “ใช้ช่วงวันที่นี้”
3. กด “เปรียบเทียบห้อง” เลือกอย่างน้อย 2 ประเภท ดูยอดรวม และกดจองห้องที่รองรับผู้เข้าพัก
4. ส่งคำขอด้วยข้อมูลสมมติที่มีให้ ไปดูฝั่ง Front ลงเลขอ้างอิง Easyfo สมมติ แล้วกดยืนยัน
5. เปิด “สถิติการจอง → การทดลองครั้งนี้” ดูเหตุการณ์การค้นหา ดูห้อง เริ่มกรอก และส่งคำขอ
6. เปิด “เว็บหลัก (ตัวอย่าง)” กดปุ่มจอง และลองอีกครั้งเพื่อดูที่มาเป็นเว็บไซต์หลัก
7. ทดลองปฏิเสธสถิติ แล้วค้นหาหรือจองเพิ่ม: การจองยังทำได้ แต่จำนวนเหตุการณ์จะไม่เพิ่ม
8. กด “เริ่มตัวอย่างใหม่” เพื่อคืนข้อมูลทั้งหมด หรือรีเฟรชหน้าเว็บเพื่อเริ่มใหม่

### อัปเดต GitHub Pages เดิม

1. แตก ZIP ชุดนี้ลงโฟลเดอร์ใหม่
2. เปิด Repository `hotel-booking-demo` → **Add file → Upload files**
3. อัปโหลดไฟล์ด้านในทั้งหมดและโฟลเดอร์ `assets` ไว้ระดับเดียวกับ `index.html` โดยแทนที่ไฟล์เดิม อย่าอัปโหลด ZIP ทั้งก้อนหรือเพิ่มโฟลเดอร์ครอบอีกชั้น
4. ชุดนี้ต้องมี `index.html`, `app.js`, `model.js`, `style.css`, `features.js`, `features.css`, `party.js`, `guest-picker.js`, `guests.css`, `i18n.js`, `translations-en.js`, `languages.css`, `front-workspace.css`, **`accounts-model.js`, `accounts-ui.js`, `accounts.css`** พร้อม `assets` และ `README.md`
5. กด **Commit changes** แล้วรอ GitHub Pages เผยแพร่เสร็จ
6. เปิดลิงก์เดิมแล้วกด **Ctrl + Shift + R** ถ้ายังเป็นหน้าเดิมให้ลองหน้าต่างไม่ระบุตัวตน

URL ของ CSS/JavaScript ใช้รหัสรุ่นใหม่เพื่อให้โหลดไฟล์ตรงกัน กำหนดขนาดโลโก้ใน HTML ไว้ด้วย จึงไม่ขยายเต็มหน้าถ้า CSS ยังไม่พร้อม

ไฟล์นี้ใช้ผ่านเว็บเซิร์ฟเวอร์ เช่น GitHub Pages การดับเบิลคลิก `index.html` โดยตรงอาจถูกเบราว์เซอร์บล็อก JavaScript modules

### ขอบเขต Demo

ข้อมูลทุกอย่างอยู่ในหน้าที่เปิดเท่านั้น ไม่แชร์ระหว่างเครื่องและหายเมื่อรีเฟรช ข้อมูลห้อง ราคา รูป และรายงานเป็นข้อมูลสมมติ ไม่มีการรับจอง ส่งอีเมล รับชำระ หรือเชื่อม EASYFO/Google จริง Login และบัญชีสมาชิกเป็นตัวอย่างในเบราว์เซอร์ ไม่มีระบบรักษาความปลอดภัยจริง ใช้ข้อมูลสมมติเท่านั้น

ระบบรีวิว แพ็กเกจเสริม การชำระเงินออนไลน์ Rate shopper และการเชื่อม EASYFO อัตโนมัติยังไม่รวมใน Demo รุ่นนี้ ตามรายการตัวเลือกเพิ่มเติมในใบเสนอราคา

### การตรวจสอบ

ผ่านการตรวจไวยากรณ์ JavaScript การทดสอบตรรกะและการสลับภาษา 29 กรณี และการสร้าง HTML จำลองครบทุกหน้า รวมฟีเจอร์ใหม่ 4 รายการ ตรวจเส้นทางไฟล์สำหรับ GitHub Pages แล้ว ยังไม่ได้ตรวจภาพหน้าจอด้วยเบราว์เซอร์จริงในสภาพแวดล้อมนี้

Thai/English, responsive, static prototype for Suntara Grand with 168 sample rooms and four room types. It demonstrates a guest booking flow and a Front desk workspace. All sample room counts, room numbers, images, descriptions, prices, and guests are fictional.

## Presentation path

The supplied Suntara Grand logo is included unchanged. Floors 3–6 have a fictional distribution of 44, 44, 42 and 38 rooms. Room types are independent of floor. These values are presentation data, not a verified room list.


1. Guest: choose dates, inspect a room, and submit a sample request using the prefilled fictional details.
2. Open that booking in Front: enter a sample Easyfo reference, save it, then confirm the booking.
3. Front inventory: select dates, floor, type or room-number filter. Select one or many unreserved rooms, review the summary, provide a closure reason or acknowledge the Easyfo check, then apply the change.
4. Sign in with admin@example.com or manager@example.com to edit rates and content. Use Demo1234! for all sample accounts. This is simulated authentication only.
5. As Admin, open Manage room records from Rooms and sales: edit room metadata only when there is no booking history, import an Excel-exported UTF-8 CSV after preview, or reorder room cards with drag/drop or arrow buttons and save. Reordering affects display order only.
6. Move a pending or confirmed booking to another same-type room that is available for the full stay. Existing Easyfo references require manual-update acknowledgement. Price and dates remain unchanged.
7. View the in-memory audit log. Refreshing resets all sample state.

Guest searches and Front inventory use the same in-memory state. The checkout date is exclusive. Pending and confirmed reservations both consume the same room for the full stay. Booked rooms cannot be overwritten by availability changes. Existing bookings retain their price snapshot. Cancellation releases the reservation and restores the underlying sale availability.

The prototype intentionally resets on refresh. There is no database, staff authentication, real payment, notification delivery, or Easyfo API. Easyfo records must be entered manually; other-channel bookings do not automatically update the website. Production reliability, concurrent transaction safety, authorization, audit trails, personal-data controls, monitoring, backups, and operating policies require the later backend project.

## Catalog import

The included CSV contains `room_number,floor,room_type`. Exactly 168 unique room numbers are required, floors are 3–6, and only the four configured types are accepted. Import preserves existing bookings and matching room sale availability. All reservation history, including cancelled bookings, protects room number, floor and type. New room numbers start closed for sale. Missing or invalid rows reject the whole import.

## Validation

`npm run check` ใช้ได้จาก Repository ที่มี package.json และไฟล์ทดสอบเท่านั้น ชุด ZIP สำหรับ GitHub Pages มีเฉพาะไฟล์เว็บและ README ไม่ได้รวมชุดทดสอบ

`npm run check`: JavaScript syntax plus domain tests for inventory reservation, date boundaries, last-room booking, cancellation, confirmation gating, price snapshots and input rejection, atomic bulk changes, room moves, metadata guards, display-only reordering and catalog imports. A minimal DOM substitute exercises all render sections and the main dialogs; it is not a browser visual test.

Static asset references checked locally. No compatible managed browser preview was available for this static project, so responsive layouts were implemented but not browser-visually verified. WebMCP uses feature detection and exposes navigation/search only; live WebMCP validation was unavailable for the same preview limitation. Normal UI use does not require it.

The guest-room picture is an original AI-generated illustrative asset. Sarabun regular/bold are bundled locally. No third-party runtime calls are needed for the prototype.

The language preference is device-local. Booking data remains in memory. This demo does not use an external translation service. English UI copy is in `translations-en.js`; room headlines and descriptions have independent Thai and English fields.

## การตรวจสอบรุ่นนี้

ผ่านการทดสอบตรรกะการจอง สองภาษา และวงจรเพิ่ม/แก้ไข/ยกเลิกใช้งาน/ลบห้อง รวมการเรนเดอร์โครงสร้างหน้าจอ แต่ยังไม่ได้ตรวจภาพจริงด้วยเบราว์เซอร์อัตโนมัติในสภาพแวดล้อมนี้
ก่อนส่งโรงแรม ให้เปิด GitHub Pages บนคอมพิวเตอร์และมือถือ ทดลอง TH/EN จองห้อง เปิด–ปิดขาย และเข้าสู่ระบบบัญชี Admin ตัวอย่าง
ตัวอย่างมีบัญชีจำลอง แต่ยังไม่มีฐานข้อมูล Login ฝั่งเซิร์ฟเวอร์ การส่งอีเมล การชำระออนไลน์ หรือการเชื่อม Easyfo จริง ข้อมูลที่ทดลองหายเมื่อรีเฟรช

ไฟล์รุ่นนี้ต้องอัปโหลดทั้งชุด รวม front-workspace.css, languages.css, i18n.js, translations-en.js และ assets เพื่อให้รูปแบบตรงกัน
