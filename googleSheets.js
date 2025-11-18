// Google Sheets Configuration
// คุณต้องสร้าง Google Apps Script Web App และใส่ URL ที่นี่
const GOOGLE_SHEETS_CONFIG = {
  webAppUrl: 'https://script.google.com/macros/s/AKfycbwp_QAWY5bpj_-LwUX03SuXMoXlidMSTW_YrF4U6_2-cNvGbi_QNX2AalsNSzo8_BsxOA/exec',
  sheetName: 'Prizes', // ชื่อ Sheet ที่จะเก็บข้อมูลรางวัล
  
  // ตั้งค่านี้เป็น false เมื่อใช้ Live Server (localhost)
  // ตั้งเป็น true เมื่อ Deploy แล้ว (GitHub Pages, Netlify, etc.)
  enabled: true// เปลี่ยนเป็น true เมื่อ Deploy
};

// Google Sheets API Functions
const GoogleSheetsAPI = {
  // ดึงข้อมูลรางวัลทั้งหมดจาก Google Sheets
  async loadPrizesFromSheet() {
    try {
      const response = await fetch(`${GOOGLE_SHEETS_CONFIG.webAppUrl}?action=read`);
      const data = await response.json();
      
      if (data.status === 'success') {
        return data.prizes;
      } else {
        console.error('Error loading prizes from Google Sheets:', data.message);
        return null;
      }
    } catch (error) {
      console.error('Error connecting to Google Sheets:', error);
      return null;
    }
  },

  // บันทึกรางวัลใหม่ไป Google Sheets (CREATE)
  async createPrize(prize) {
    try {
      const response = await fetch(GOOGLE_SHEETS_CONFIG.webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          prize: prize
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        console.log('Prize created successfully in Google Sheets');
        return true;
      } else {
        console.error('Error creating prize:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Error creating prize in Google Sheets:', error);
      return false;
    }
  },

  // อัพเดทข้อมูลรางวัลใน Google Sheets (UPDATE)
  async updatePrize(prizeId, updatedData) {
    try {
      const response = await fetch(GOOGLE_SHEETS_CONFIG.webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          prizeId: prizeId,
          updatedData: updatedData
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        console.log('Prize updated successfully in Google Sheets');
        return true;
      } else {
        console.error('Error updating prize:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Error updating prize in Google Sheets:', error);
      return false;
    }
  },

  // ลบรางวัลจาก Google Sheets (DELETE)
  async deletePrize(prizeId) {
    try {
      const response = await fetch(GOOGLE_SHEETS_CONFIG.webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          prizeId: prizeId
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        console.log('Prize deleted successfully from Google Sheets');
        return true;
      } else {
        console.error('Error deleting prize:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Error deleting prize from Google Sheets:', error);
      return false;
    }
  },

  // บันทึกข้อมูลทั้งหมดไป Google Sheets (Sync All)
  async syncAllPrizes(prizes) {
    try {
      const response = await fetch(GOOGLE_SHEETS_CONFIG.webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'syncAll',
          prizes: prizes
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        console.log('All prizes synced successfully to Google Sheets');
        return true;
      } else {
        console.error('Error syncing prizes:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Error syncing prizes to Google Sheets:', error);
      return false;
    }
  },

  // บันทึกผลการหมุน (เมื่อได้รางวัล)
  async logWinner(winner) {
    try {
      const response = await fetch(GOOGLE_SHEETS_CONFIG.webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'logWinner',
          winner: {
            prizeId: winner.id,
            prizeName: winner.name,
            prizeColor: winner.color,
            timestamp: new Date().toISOString(),
            remainingQuantity: winner.quantity
          }
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        console.log('Winner logged successfully to Google Sheets');
        return true;
      } else {
        console.error('Error logging winner:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Error logging winner to Google Sheets:', error);
      return false;
    }
  }
};

// ฟังก์ชันช่วยในการตรวจสอบว่า Google Sheets ถูกตั้งค่าแล้วหรือยัง
function isGoogleSheetsConfigured() {
  return GOOGLE_SHEETS_CONFIG.enabled && 
         GOOGLE_SHEETS_CONFIG.webAppUrl !== 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';
}
