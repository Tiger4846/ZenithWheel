// Google Apps Script สำหรับจัดการ ZenithWheel Prize Data
// คัดลอกโค้ดนี้ไปวางใน Google Apps Script

// ชื่อ Sheet ที่จะใช้เก็บข้อมูล
const PRIZES_SHEET_NAME = 'Prizes';
const HISTORY_SHEET_NAME = 'WinHistory';

// Google Apps Script Web App รองรับ CORS อัตโนมัติเมื่อ Deploy แบบ "Anyone"
// ไม่ต้องตั้งค่า CORS headers เพิ่มเติม

// ฟังก์ชันหลักสำหรับรับ HTTP Requests
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    let output;
    if (action === 'read') {
      output = readPrizes();
    } else {
      output = ContentService.createTextOutput(
        JSON.stringify({
          status: 'error',
          message: 'Invalid action for GET request'
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    return output;
    
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        status: 'error',
        message: error.toString()
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    let output;
    switch (action) {
      case 'create':
        output = createPrize(data.prize);
        break;
      case 'update':
        output = updatePrize(data.prizeId, data.updatedData);
        break;
      case 'delete':
        output = deletePrize(data.prizeId);
        break;
      case 'syncAll':
        output = syncAllPrizes(data.prizes);
        break;
      case 'logWinner':
        output = logWinner(data.winner);
        break;
      default:
        output = ContentService.createTextOutput(
          JSON.stringify({
            status: 'error',
            message: 'Invalid action'
          })
        ).setMimeType(ContentService.MimeType.JSON);
    }
    
    return output;
    
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        status: 'error',
        message: error.toString()
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// ดึงข้อมูลรางวัลทั้งหมด (READ)
function readPrizes() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(PRIZES_SHEET_NAME);
  
  // สร้าง Sheet ถ้ายังไม่มี
  if (!sheet) {
    sheet = createPrizesSheet(ss);
  }
  
  const data = sheet.getDataRange().getValues();
  
  // ถ้าไม่มีข้อมูล หรือมีแค่ header
  if (data.length <= 1) {
    return ContentService.createTextOutput(
      JSON.stringify({
        status: 'success',
        prizes: []
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  // แปลงข้อมูลเป็น Array of Objects
  const prizes = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) { // ถ้ามี ID
      prizes.push({
        id: data[i][0],
        name: data[i][1],
        color: data[i][2],
        quantity: data[i][3],
        originalQuantity: data[i][4]
      });
    }
  }
  
  return ContentService.createTextOutput(
    JSON.stringify({
      status: 'success',
      prizes: prizes
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

// เพิ่มรางวัลใหม่ (CREATE)
function createPrize(prize) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(PRIZES_SHEET_NAME);
  
  if (!sheet) {
    sheet = createPrizesSheet(ss);
  }
  
  // เพิ่มข้อมูลลงท้ายสุด
  sheet.appendRow([
    prize.id,
    prize.name,
    prize.color,
    prize.quantity,
    prize.originalQuantity,
    new Date()
  ]);
  
  return ContentService.createTextOutput(
    JSON.stringify({
      status: 'success',
      message: 'Prize created successfully'
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

// อัพเดทข้อมูลรางวัล (UPDATE)
function updatePrize(prizeId, updatedData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(PRIZES_SHEET_NAME);
  
  if (!sheet) {
    return ContentService.createTextOutput(
      JSON.stringify({
        status: 'error',
        message: 'Sheet not found'
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  const data = sheet.getDataRange().getValues();
  
  // ค้นหาแถวที่ต้องการอัพเดท
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == prizeId) {
      // อัพเดทข้อมูล
      if (updatedData.name !== undefined) {
        sheet.getRange(i + 1, 2).setValue(updatedData.name);
      }
      if (updatedData.color !== undefined) {
        sheet.getRange(i + 1, 3).setValue(updatedData.color);
      }
      if (updatedData.quantity !== undefined) {
        sheet.getRange(i + 1, 4).setValue(updatedData.quantity);
      }
      if (updatedData.originalQuantity !== undefined) {
        sheet.getRange(i + 1, 5).setValue(updatedData.originalQuantity);
      }
      
      // อัพเดทเวลา
      sheet.getRange(i + 1, 6).setValue(new Date());
      
      return ContentService.createTextOutput(
        JSON.stringify({
          status: 'success',
          message: 'Prize updated successfully'
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(
    JSON.stringify({
      status: 'error',
      message: 'Prize not found'
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

// ลบรางวัล (DELETE)
function deletePrize(prizeId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(PRIZES_SHEET_NAME);
  
  if (!sheet) {
    return ContentService.createTextOutput(
      JSON.stringify({
        status: 'error',
        message: 'Sheet not found'
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  const data = sheet.getDataRange().getValues();
  
  // ค้นหาและลบแถว
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == prizeId) {
      sheet.deleteRow(i + 1);
      
      return ContentService.createTextOutput(
        JSON.stringify({
          status: 'success',
          message: 'Prize deleted successfully'
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(
    JSON.stringify({
      status: 'error',
      message: 'Prize not found'
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

// Sync ข้อมูลทั้งหมด
function syncAllPrizes(prizes) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(PRIZES_SHEET_NAME);
  
  if (!sheet) {
    sheet = createPrizesSheet(ss);
  }
  
  // ลบข้อมูลเก่าทั้งหมด (เว้น header)
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  
  // เพิ่มข้อมูลใหม่ทั้งหมด
  if (prizes && prizes.length > 0) {
    const rows = prizes.map(prize => [
      prize.id,
      prize.name,
      prize.color,
      prize.quantity,
      prize.originalQuantity,
      new Date()
    ]);
    
    sheet.getRange(2, 1, rows.length, 6).setValues(rows);
  }
  
  return ContentService.createTextOutput(
    JSON.stringify({
      status: 'success',
      message: 'All prizes synced successfully'
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

// บันทึกประวัติการหมุน
function logWinner(winner) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(HISTORY_SHEET_NAME);
  
  if (!sheet) {
    sheet = createHistorySheet(ss);
  }
  
  sheet.appendRow([
    new Date(),
    winner.prizeId,
    winner.prizeName,
    winner.prizeColor,
    winner.remainingQuantity
  ]);
  
  return ContentService.createTextOutput(
    JSON.stringify({
      status: 'success',
      message: 'Winner logged successfully'
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

// สร้าง Prizes Sheet
function createPrizesSheet(ss) {
  const sheet = ss.insertSheet(PRIZES_SHEET_NAME);
  
  // สร้าง Header
  const headers = ['ID', 'Name', 'Color', 'Quantity', 'Original Quantity', 'Last Updated'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // จัดรูปแบบ Header
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#4285f4')
    .setFontColor('#ffffff');
  
  // กำหนดความกว้างคอลัมน์
  sheet.setColumnWidth(1, 120); // ID
  sheet.setColumnWidth(2, 200); // Name
  sheet.setColumnWidth(3, 100); // Color
  sheet.setColumnWidth(4, 100); // Quantity
  sheet.setColumnWidth(5, 150); // Original Quantity
  sheet.setColumnWidth(6, 180); // Last Updated
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  return sheet;
}

// สร้าง History Sheet
function createHistorySheet(ss) {
  const sheet = ss.insertSheet(HISTORY_SHEET_NAME);
  
  // สร้าง Header
  const headers = ['Timestamp', 'Prize ID', 'Prize Name', 'Prize Color', 'Remaining Quantity'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // จัดรูปแบบ Header
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#34a853')
    .setFontColor('#ffffff');
  
  // กำหนดความกว้างคอลัมน์
  sheet.setColumnWidth(1, 180); // Timestamp
  sheet.setColumnWidth(2, 120); // Prize ID
  sheet.setColumnWidth(3, 200); // Prize Name
  sheet.setColumnWidth(4, 100); // Prize Color
  sheet.setColumnWidth(5, 150); // Remaining Quantity
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  return sheet;
}

// ฟังก์ชันสำหรับทดสอบ
function testRead() {
  const result = readPrizes();
  Logger.log(result.getContent());
}

function testCreate() {
  const testPrize = {
    id: Date.now(),
    name: 'Test Prize',
    color: '#ff0000',
    quantity: 5,
    originalQuantity: 5
  };
  const result = createPrize(testPrize);
  Logger.log(result.getContent());
}
