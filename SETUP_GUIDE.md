# คู่มือการติดตั้งและใช้งาน ZenithWheel (ฉบับอัปเดต Database)

โปรเจ็คนี้เป็นเว็บแอปพลิเคชันวงล้อสุ่มรางวัล (Lucky Wheel) ที่เชื่อมต่อกับฐานข้อมูล PostgreSQL เพื่อเก็บข้อมูลรางวัล

## สิ่งที่ต้องมี (Prerequisites)

1.  **Node.js**: (เวอร์ชัน 14 ขึ้นไป) [ดาวน์โหลดที่นี่](https://nodejs.org/)
2.  **PostgreSQL Database**:
    *   **แบบ Local**: ติดตั้ง PostgreSQL ลงในเครื่อง
    *   **แบบ Cloud**: ใช้บริการฟรีเช่น [Railway](https://railway.app/) (แนะนำ)
3.  **Git**: (สำหรับ Deploy)

---

## การติดตั้งและรันบนเครื่องตัวเอง (Local Development)

### 1. Clone หรือดาวน์โหลดโปรเจ็ค
```bash
git clone https://github.com/Tiger4846/ZenithWheel.git
cd ZenithWheel
```

### 2. ติดตั้ง Dependencies
```bash
npm install
```

### 3. ตั้งค่า Database
คุณต้องมี Connection String ของ PostgreSQL (URL)
*   **รูปแบบ**: `postgresql://user:password@host:port/database`

สร้างไฟล์ `.env` ที่ root folder (ระดับเดียวกับ `package.json`) และใส่ข้อมูลดังนี้:
```env
DATABASE_URL=ใส่_URL_Database_ของคุณที่นี่
PORT=3000
```

### 4. รันโปรเจ็ค
```bash
npm start
```
*   เมื่อรันครั้งแรก ระบบจะสร้างตาราง `prizes` ให้โดยอัตโนมัติ
*   เปิด Browser ไปที่: `http://localhost:3000`

---

## การ Deploy ไปที่ Railway (แนะนำ)

1.  สมัครสมาชิกและ Login ที่ [Railway.app](https://railway.app/)
2.  กด **New Project** > **Deploy from GitHub repo** > เลือก Repository ของคุณ
3.  **เพิ่ม Database**:
    *   ในหน้าโปรเจ็ค Railway คลิกขวาที่ว่าง > เลือก **Database** > **PostgreSQL**
    *   รอจนสร้างเสร็จ (สีเขียว)
4.  **เชื่อมต่อ Database กับ App**:
    *   คลิกที่กล่อง **PostgreSQL** > แท็บ **Variables** > Copy ค่า `DATABASE_URL`
    *   คลิกที่กล่อง **App ของคุณ** > แท็บ **Variables** > กด **New Variable**
    *   ชื่อ: `DATABASE_URL`
    *   ค่า: (วาง URL ที่ Copy มา)
    *   กด **Add**
5.  Railway จะทำการ Redeploy อัตโนมัติ รอสักครู่ก็ใช้งานได้เลย!

---

## การใช้งาน

1.  **หน้าแรก (วงล้อ)**:
    *   กดปุ่ม "หมุนวงล้อ" เพื่อสุ่มรางวัล
    *   จำนวนรางวัลจะลดลงทีละ 1 เมื่อมีคนได้รางวัลนั้น
    *   เมื่อรางวัลหมด จะไม่สามารถหมุนได้

2.  **หน้าจัดการ (ไอคอนฟันเฟือง)**:
    *   **เพิ่มรางวัล**: ใส่ชื่อ, จำนวน, สี (สุ่มให้อัตโนมัติถ้าไม่เลือก)
    *   **แก้ไขจำนวน**: กดปุ่ม + หรือ - เพื่อเพิ่มลดจำนวนรางวัล
    *   **ลบรางวัล**: กดปุ่มถังขยะเพื่อลบรางวัลนั้นออกจากวงล้อ

## โครงสร้างโปรเจ็ค

*   `server.js`: ไฟล์หลักของ Backend Server (Express)
*   `db.js`: ไฟล์เชื่อมต่อ Database (PostgreSQL)
*   `prizesModel.js`: ไฟล์จัดการข้อมูล (CRUD) กับ Database
*   `public/`: โฟลเดอร์เก็บไฟล์หน้าเว็บ (HTML, CSS, JS)
    *   `index.html`: หน้าเว็บหลัก
    *   `style.css`: ไฟล์ตกแต่งสวยงาม
    *   `script.js`: โค้ดควบคุมการทำงานหน้าเว็บ

---

## การแก้ไขปัญหาเบื้องต้น

*   **Error: The server does not support SSL connections**:
    *   ปกติโค้ดจะตั้งค่าให้รองรับทั้งแบบมีและไม่มี SSL ไว้แล้ว แต่ถ้ายังติด ให้เช็ค `db.js`
*   **Error: getaddrinfo ENOTFOUND**:
    *   เช็ค `DATABASE_URL` ในไฟล์ `.env` ว่าถูกต้องหรือไม่
*   **กดปุ่มเพิ่ม/ลบไม่ได้**:
    *   ลอง Refresh หน้าเว็บ 1 ครั้ง
    *   เช็ค Console (F12) ว่ามี Error สีแดงหรือไม่

---
**พัฒนาโดย**: ZenithOutsource Team
