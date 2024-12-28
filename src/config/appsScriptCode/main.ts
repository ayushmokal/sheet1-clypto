export const mainScript = `
function doGet(e) {
  const params = e.parameter;
  const callback = params.callback;
  const action = params.action;
  const data = params.data ? JSON.parse(decodeURIComponent(params.data)) : null;
  
  let result;
  
  try {
    switch (action) {
      case 'createCopy':
        result = createSpreadsheetCopy();
        break;
      case 'submit':
        if (!data || !data.spreadsheetId) {
          throw new Error('No data or spreadsheetId provided');
        }
        result = handleSubmit(data);
        break;
      case 'sendEmail':
        if (!data || !data.spreadsheetId || !data.emailTo) {
          throw new Error('Missing required data for sending email');
        }
        const ss = SpreadsheetApp.openById(data.spreadsheetId);
        const emailResult = sendEmailWithNewSpreadsheet(ss, 'Template', data.emailTo);
        result = {
          status: emailResult ? 'success' : 'error',
          message: emailResult ? 'Email sent successfully' : 'Failed to send email'
        };
        break;
      default:
        throw new Error('Invalid action');
    }
    
    return ContentService.createTextOutput(callback + '(' + JSON.stringify(result) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
      
  } catch (error) {
    console.error('Error in doGet:', error);
    const errorResponse = {
      status: 'error',
      message: error.message
    };
    
    return ContentService.createTextOutput(callback + '(' + JSON.stringify(errorResponse) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

const TEMPLATE_SPREADSHEET_ID = '1NN-_CgDUpIrzW_Rlsa5FHPnGqE9hIwC4jEjaBVG3tWU';

function createSpreadsheetCopy() {
  try {
    const templateFile = DriveApp.getFileById(TEMPLATE_SPREADSHEET_ID);
    const newFile = templateFile.makeCopy('SQA Data Collection Form (Copy)');
    const newSpreadsheet = SpreadsheetApp.openById(newFile.getId());
    
    // Make the spreadsheet accessible to anyone with the link
    newFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT);
    
    return {
      status: 'success',
      spreadsheetId: newFile.getId(),
      spreadsheetUrl: newSpreadsheet.getUrl()
    };
  } catch (error) {
    console.error('Error in createSpreadsheetCopy:', error);
    throw new Error('Failed to create spreadsheet copy: ' + error.message);
  }
}

function handleSubmit(data) {
  console.log("Starting handleSubmit with data:", data);
  
  if (!data) {
    throw new Error('No data provided');
  }

  const ss = SpreadsheetApp.openById(data.spreadsheetId);
  console.log("Opened spreadsheet");
  
  // Get template sheet
  const templateSheet = ss.getSheetByName(data.sheetName);
  if (!templateSheet) {
    throw new Error('Template sheet not found: ' + data.sheetName);
  }
  
  // Create new sheet from template
  const newSheetName = generateUniqueSheetName(ss, data);
  const newSheet = templateSheet.copyTo(ss);
  newSheet.setName(newSheetName);
  console.log("Created new sheet:", newSheetName);

  try {
    writeFacilityInfo(newSheet, data);
    writeLowerLimitDetection(newSheet, data);
    writePrecisionData(newSheet, data);
    writeAccuracyData(newSheet, data);
    writeMorphGradeFinal(newSheet, data);
    writeQCData(newSheet, data);

    return {
      status: 'success',
      message: 'Data submitted successfully',
      sheetName: newSheetName
    };
  } catch (error) {
    console.error("Error writing data:", error);
    try {
      ss.deleteSheet(newSheet);
    } catch (e) {
      console.error("Error deleting sheet after failure:", e);
    }
    throw error;
  }
}

function sendEmailWithNewSpreadsheet(ss, sheetName, recipientEmail) {
  try {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      throw new Error('Sheet not found: ' + sheetName);
    }
    
    // Generate PDF of the sheet
    const pdfBlob = ss.getAs('application/pdf').setName('SQA Data - ' + sheetName + '.pdf');
    
    // Create a copy of the spreadsheet as XLSX
    const spreadsheetBlob = ss.getAs('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    spreadsheetBlob.setName('SQA Data - ' + sheetName + '.xlsx');
    
    const emailSubject = 'New SQA Data Submission - ' + sheetName;
    const emailBody = 'A new SQA data submission has been recorded.\\n\\n' +
                     'Sheet Name: ' + sheetName + '\\n' +
                     'Date: ' + new Date().toLocaleDateString() + '\\n\\n' +
                     'You can access the spreadsheet here: ' + ss.getUrl() + '#gid=' + sheet.getSheetId() + '\\n\\n' +
                     'The spreadsheet and PDF version are attached to this email.\\n\\n' +
                     'This is an automated message.';
    
    GmailApp.sendEmail(
      recipientEmail,
      emailSubject,
      emailBody,
      {
        name: 'SQA Data System',
        attachments: [pdfBlob, spreadsheetBlob]
      }
    );
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

function generateUniqueSheetName(ss, data) {
  const date = new Date(data.date);
  const formattedDate = Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd");
  const sanitizedFacility = data.facility.replace(/[^a-zA-Z0-9]/g, '');
  const cleanSerialNumber = data.serialNumber.trim();
  
  const baseSheetName = formattedDate + '_' + cleanSerialNumber + '_' + sanitizedFacility;
  let sheetName = baseSheetName;
  let counter = 1;
  
  while (ss.getSheetByName(sheetName)) {
    sheetName = baseSheetName + '_' + counter;
    counter++;
  }
  
  return sheetName;
}

// Utility functions
function writeFacilityInfo(sheet, data) {
  sheet.getRange('B3:H3').setValue(data.facility);
  sheet.getRange('B4:H4').setValue(data.date);
  sheet.getRange('B5:H5').setValue(data.technician);
  sheet.getRange('B6:H6').setValue(data.serialNumber);
  console.log("Wrote facility info");
}

function writeLowerLimitDetection(sheet, data) {
  for (let i = 0; i < data.lowerLimitDetection.conc.length; i++) {
    sheet.getRange('B' + (12 + i)).setValue(data.lowerLimitDetection.conc[i]);
    sheet.getRange('C' + (12 + i)).setValue(data.lowerLimitDetection.msc[i]);
  }
  console.log("Wrote Lower Limit Detection data");
}

function writePrecisionData(sheet, data) {
  // Level 1
  for (let i = 0; i < data.precisionLevel1.conc.length; i++) {
    sheet.getRange('B' + (24 + i)).setValue(data.precisionLevel1.conc[i]);
    sheet.getRange('C' + (24 + i)).setValue(data.precisionLevel1.motility[i]);
    sheet.getRange('D' + (24 + i)).setValue(data.precisionLevel1.morph[i]);
  }
  console.log("Wrote Precision Level 1 data");

  // Level 2
  for (let i = 0; i < data.precisionLevel2.conc.length; i++) {
    sheet.getRange('B' + (36 + i)).setValue(data.precisionLevel2.conc[i]);
    sheet.getRange('C' + (36 + i)).setValue(data.precisionLevel2.motility[i]);
    sheet.getRange('D' + (36 + i)).setValue(data.precisionLevel2.morph[i]);
  }
  console.log("Wrote Precision Level 2 data");
}

function writeAccuracyData(sheet, data) {
  for (let i = 0; i < data.accuracy.sqa.length; i++) {
    sheet.getRange('A' + (48 + i)).setValue(data.accuracy.sqa[i]);
    sheet.getRange('B' + (48 + i)).setValue(data.accuracy.manual[i]);
    sheet.getRange('C' + (48 + i)).setValue(data.accuracy.sqaMotility[i]);
    sheet.getRange('D' + (48 + i)).setValue(data.accuracy.manualMotility[i]);
    sheet.getRange('E' + (48 + i)).setValue(data.accuracy.sqaMorph[i]);
    sheet.getRange('F' + (48 + i)).setValue(data.accuracy.manualMorph[i]);
  }
  console.log("Wrote Accuracy data");
}

function writeMorphGradeFinal(sheet, data) {
  const tp = parseFloat(data.accuracy.morphGradeFinal.tp) || 0;
  const tn = parseFloat(data.accuracy.morphGradeFinal.tn) || 0;
  const fp = parseFloat(data.accuracy.morphGradeFinal.fp) || 0;
  const fn = parseFloat(data.accuracy.morphGradeFinal.fn) || 0;

  sheet.getRange('L48').setValue(tp);
  sheet.getRange('L49').setValue(tn);
  sheet.getRange('L50').setValue(fp);
  sheet.getRange('L51').setValue(fn);

  const sensitivity = tp + fn !== 0 ? (tp / (tp + fn)) * 100 : 0;
  const specificity = fp + tn !== 0 ? (tn / (fp + tn)) * 100 : 0;

  sheet.getRange('L46').setValue(sensitivity);
  sheet.getRange('L47').setValue(specificity);
  console.log("Wrote Morph Grade Final data");
}

function writeQCData(sheet, data) {
  for (let i = 0; i < data.qc.level1.length; i++) {
    sheet.getRange('B' + (71 + i)).setValue(data.qc.level1[i]);
    sheet.getRange('C' + (71 + i)).setValue(data.qc.level2[i]);
  }
  console.log("Wrote QC data");
}
`;
