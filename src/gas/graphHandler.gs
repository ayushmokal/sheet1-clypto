function createAccuracyGraphs(sheet, data) {
  // Create concentration scatter plot
  const concentrationChart = sheet.newChart()
    .setChartType(Charts.ChartType.SCATTER)
    .addRange(sheet.getRange('A48:B52'))
    .setPosition(5, 8, 0, 0)
    .setOption('title', 'SQA Accuracy: Sperm Concentration')
    .setOption('hAxis.title', 'Manual Sperm Conc., M/ml')
    .setOption('vAxis.title', 'SQA Sperm Conc., M/ml')
    .setOption('legend', 'none')
    .setOption('trendlines', [{
      type: 'linear',
      showR2: true,
      visibleInLegend: true
    }])
    .build();
  
  // Create motility scatter plot
  const motilityChart = sheet.newChart()
    .setChartType(Charts.ChartType.SCATTER)
    .addRange(sheet.getRange('C48:D52'))
    .setPosition(25, 8, 0, 0)
    .setOption('title', 'SQA Accuracy: Motility')
    .setOption('hAxis.title', 'Manual Motility, %')
    .setOption('vAxis.title', 'SQA Motility, %')
    .setOption('legend', 'none')
    .setOption('trendlines', [{
      type: 'linear',
      showR2: true,
      visibleInLegend: true
    }])
    .build();

  sheet.insertChart(concentrationChart);
  sheet.insertChart(motilityChart);
  
  console.log("Created accuracy graphs");
}