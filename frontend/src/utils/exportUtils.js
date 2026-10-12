export const exportAuditReportCsv = (sensors = [], alerts = [], healthScore = 100) => {
  const timestamp = new Date().toISOString();
  let csv = `SENTINELCORE SERVER ROOM MONITORING - AUDIT REPORT\n`;
  csv += `Generated At,${timestamp}\n`;
  csv += `Overall Facility Health Score,${healthScore}%\n`;
  csv += `Total Sensors Monitored,${sensors.length}\n`;
  csv += `Active Alerts Count,${alerts.filter(a => !a.is_acknowledged).length}\n\n`;

  // Sensors section
  csv += `--- SENSOR TELEMETRY SNAPSHOT ---\n`;
  csv += `ID,Label,Type,Rack,Current Value,Unit,Warning Limit,Critical Limit,Status\n`;
  sensors.forEach((s) => {
    csv += `${s.id},"${s.label}",${s.type},"${s.rack_name || 'Ambient'}",${s.current_value || 0},${s.unit},${s.warning_limit},${s.critical_limit},${s.status}\n`;
  });

  csv += `\n--- INCIDENT ALERTS AUDIT LOG ---\n`;
  csv += `ID,Sensor ID,Level,Message,Status,Acknowledged By,Timestamp\n`;
  alerts.forEach((a) => {
    csv += `${a.id},${a.sensor_id || 'N/A'},${a.level},"${(a.message || '').replace(/"/g, '""')}",${a.is_acknowledged ? 'ACKNOWLEDGED' : 'ACTIVE'},${a.ack_by_name || 'Unassigned'},${a.created_at}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `SentinelCore_Audit_Report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportAuditReportJson = (sensors = [], alerts = [], healthScore = 100) => {
  const payload = {
    system: 'SentinelCore Mission Critical Monitoring',
    exportedAt: new Date().toISOString(),
    healthScore,
    sensors,
    alerts
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `SentinelCore_Audit_${Date.now()}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
