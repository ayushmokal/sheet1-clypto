function setFormulas(sheet) {
  // Lower Limit Detection formulas
  sheet.getRange('B17').setFormula('=AVERAGE(B12:B16)');
  sheet.getRange('C17').setFormula('=AVERAGE(C12:C16)');
  sheet.getRange('B18').setFormula('=IF(B17>0,(STDEV(B12:B16)/B17*100),0)');
  sheet.getRange('C18').setFormula('=IF(C17>0,(STDEV(C12:C16)/C17*100),0)');
  
  // Skip B19:C21 as requested
  
  // Precision Level 1 formulas
  sheet.getRange('B29').setFormula('=AVERAGE(B24:B28)');
  sheet.getRange('C29').setFormula('=AVERAGE(C24:C28)');
  sheet.getRange('D29').setFormula('=AVERAGE(D24:D28)');
  sheet.getRange('B30').setFormula('=IF(B29>0,(STDEV(B24:B28)/B29*100),0)');
  sheet.getRange('C30').setFormula('=IF(C29>0,(STDEV(C24:C28)/C29*100),0)');
  sheet.getRange('D30').setFormula('=IF(D29>0,(STDEV(D24:D28)/D29*100),0)');
  
  // Skip B31:D33 as requested
  
  // Precision Level 2 formulas
  sheet.getRange('B41').setFormula('=AVERAGE(B36:B40)');
  sheet.getRange('C41').setFormula('=AVERAGE(C36:C40)');
  sheet.getRange('D41').setFormula('=AVERAGE(D36:D40)');
  sheet.getRange('B42').setFormula('=IF(B41>0,(STDEV(B36:B40)/B41*100),0)');
  sheet.getRange('C42').setFormula('=IF(C41>0,(STDEV(C36:C40)/C41*100),0)');
  sheet.getRange('D42').setFormula('=IF(D41>0,(STDEV(D36:D40)/D41*100),0)');
  
  // Skip B43:D44 as requested
  
  // Accuracy formulas
  sheet.getRange('L48').setFormula('=COUNTIF(G48:J52,"TP")');
  sheet.getRange('L49').setFormula('=COUNTIF(G48:J52,"TN")');
  sheet.getRange('L50').setFormula('=COUNTIF(G48:J52,"FP")');
  sheet.getRange('L51').setFormula('=COUNTIF(G48:J52,"FN")');
  sheet.getRange('K54').setFormula('=L48/(L48+L51)');
  sheet.getRange('K56').setFormula('=L49/(L49+L50)');
  
  // Set formatting for pass/fail boxes
  const passBoxes = ['F12:H16', 'F24:H28', 'F36:H40'];
  passBoxes.forEach(range => {
    const box = sheet.getRange(range);
    box.setBackground('#ADD8E6');  // Light blue background
    box.setBorder(true, true, true, true, true, true);
  });
  
  // Set header formatting
  const headers = ['A8', 'A20', 'A32', 'A44', 'A67'];
  headers.forEach(cell => {
    const header = sheet.getRange(cell);
    header.setFontWeight('bold');
    header.setBackground('#F0F0F0');  // Light gray background
  });
}