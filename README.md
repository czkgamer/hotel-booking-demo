# Suntara Grand — Hotel booking UI prototype

## Demo ตามใบเสนอราคา Rev.02 — รุ่น 20260924-features2

เพิ่มหน้าตัวอย่าง 4 ฟีเจอร์ในข้อเสนอราคา 59,000 บาท:

- **เปรียบเทียบห้อง:** เลือก 2–4 ประเภท เทียบรูป ขนาด เตียง ผู้เข้าพัก สิ่งอำนวยความสะดวก ราคา และห้องว่างในช่วงเดียวกัน แล้วจองจากตารางได้
- **ปฏิทินห้องว่าง:** ดูรายเดือนและแยกประเภท เลือกวันเข้า–ออก ระบบตรวจห้องเดียวที่ว่างครบทุกคืน จำนวนเปลี่ยนตามการเปิด–ปิดขายและการจองที่ทดลองใน Front
- **ปุ่มจองบนเว็บหลัก:** แท็บ “เว็บหลัก (ตัวอย่าง)” จำลองตำแหน่งปุ่มของโรงแรม กดแล้วเข้าสู่หน้าจอง ไม่ใช่การแก้เว็บไซต์หลักจริง
- **สถิติการจอง:** หลังบ้าน “สถิติการจอง” มีข้อมูลสมมติ 7 วัน และเหตุการณ์จาก “การทดลองครั้งนี้” แยกกัน ต้องยอมรับสถิติก่อนจึงนับเหตุการณ์ ไม่มีการส่งข้อมูลไป Google

หน้าสถิติเป็นตัวอย่างอธิบายการตั้งค่า GA4 ในข้อเสนอ ระบบจริงดูรายงานผ่าน Google Analytics ไม่ถือว่ารวมการพัฒนารายงานเชื่อม GA4 เพิ่มเติม

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
4. ชุดนี้ต้องมี `index.html`, `app.js`, `model.js`, `style.css`, **`features.js` และ `features.css`** พร้อม `assets` และ `README.md`
5. กด **Commit changes** แล้วรอ GitHub Pages เผยแพร่เสร็จ
6. เปิดลิงก์เดิมแล้วกด **Ctrl + Shift + R** ถ้ายังเป็นหน้าเดิมให้ลองหน้าต่างไม่ระบุตัวตน

URL ของ CSS/JavaScript ใช้รหัสรุ่นใหม่เพื่อให้โหลดไฟล์ตรงกัน กำหนดขนาดโลโก้ใน HTML ไว้ด้วย จึงไม่ขยายเต็มหน้าถ้า CSS ยังไม่พร้อม

ไฟล์นี้ใช้ผ่านเว็บเซิร์ฟเวอร์ เช่น GitHub Pages การดับเบิลคลิก `index.html` โดยตรงอาจถูกเบราว์เซอร์บล็อก JavaScript modules

### ขอบเขต Demo

ข้อมูลทุกอย่างอยู่ในหน้าที่เปิดเท่านั้น ไม่แชร์ระหว่างเครื่องและหายเมื่อรีเฟรช ข้อมูลห้อง ราคา รูป และรายงานเป็นข้อมูลสมมติ ไม่มีการรับจอง ส่งอีเมล รับชำระ หรือเชื่อม EASYFO/Google จริง การสลับบทบาท Front/ผู้ดูแลเป็นปุ่มสาธิต ไม่ใช่ระบบรักษาความปลอดภัย

ระบบรีวิว แพ็กเกจเสริม การชำระเงินออนไลน์ Rate shopper และการเชื่อม EASYFO อัตโนมัติยังไม่รวมใน Demo รุ่นนี้ ตามรายการตัวเลือกเพิ่มเติมในใบเสนอราคา

### การตรวจสอบ

ผ่านการตรวจไวยากรณ์ JavaScript การทดสอบตรรกะ 15 กรณี และการสร้าง HTML จำลองครบทุกหน้า รวมฟีเจอร์ใหม่ 4 รายการ ตรวจเส้นทางไฟล์สำหรับ GitHub Pages แล้ว ยังไม่ได้ตรวจภาพหน้าจอด้วยเบราว์เซอร์จริงในสภาพแวดล้อมนี้

Thai, responsive, static prototype for Suntara Grand with 168 sample rooms and four room types. It demonstrates a guest booking flow and a Front desk workspace. All sample room counts, room numbers, images, descriptions, prices, and guests are fictional.

## Presentation path

The supplied Suntara Grand logo is included unchanged. Floors 3–6 have a fictional distribution of 44, 44, 42 and 38 rooms. Room types are independent of floor. These values are presentation data, not a verified room list.


1. Guest: choose dates, inspect a room, and submit a sample request using the prefilled fictional details.
2. Open that booking in Front: enter a sample Easyfo reference, save it, then confirm the booking.
3. Front inventory: select dates, floor, type or room-number filter. Select one or many unreserved rooms, review the summary, provide a closure reason or acknowledge the Easyfo check, then apply the change.
4. Switch the demo role to Admin for rate, discount, description and photo editing. The role switch is a presentation control, not real authentication.
5. Open Room setup: edit unreserved room metadata, import an Excel-exported UTF-8 CSV after preview, or reorder room cards with drag/drop or arrow buttons and save. Reordering affects display order only.
6. Move a pending or confirmed booking to another same-type room that is available for the full stay. Existing Easyfo references require manual-update acknowledgement. Price and dates remain unchanged.
7. View the in-memory audit log. Refreshing resets all sample state.

Guest searches and Front inventory use the same in-memory state. The checkout date is exclusive. Pending and confirmed reservations both consume the same room for the full stay. Booked rooms cannot be overwritten by availability changes. Existing bookings retain their price snapshot. Cancellation releases the reservation and restores the underlying sale availability.

The prototype intentionally resets on refresh. There is no database, staff authentication, real payment, notification delivery, or Easyfo API. Easyfo records must be entered manually; other-channel bookings do not automatically update the website. Production reliability, concurrent transaction safety, authorization, audit trails, personal-data controls, monitoring, backups, and operating policies require the later backend project.

## Catalog import

The included CSV contains `room_number,floor,room_type`. Exactly 168 unique room numbers are required, floors are 3–6, and only the four configured types are accepted. Import preserves existing bookings and matching room sale availability. Active reservations protect their room number, floor and type. New room numbers start closed for sale. Missing or invalid rows reject the whole import.

## Validation

`npm run check`: JavaScript syntax plus domain tests for inventory reservation, date boundaries, last-room booking, cancellation, confirmation gating, price snapshots and input rejection, atomic bulk changes, room moves, metadata guards, display-only reordering and catalog imports. A minimal DOM substitute exercises all render sections and the main dialogs; it is not a browser visual test.

Static asset references checked locally. No compatible managed browser preview was available for this static project, so responsive layouts were implemented but not browser-visually verified. WebMCP uses feature detection and exposes navigation/search only; live WebMCP validation was unavailable for the same preview limitation. Normal UI use does not require it.

The guest-room picture is an original AI-generated illustrative asset. Sarabun regular/bold are bundled locally. No third-party runtime calls are needed for the prototype.
