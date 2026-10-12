// In-memory data store for development fallback when MySQL is unreachable
export const memoryStore = {
  users: [
    {
      id: 1,
      full_name: 'System Administrator',
      email: 'admin@datacenter.io',
      phone: '+12025550199',
      password_hash: '$2a$10$ZBl1WBa.Ro7K/N83yK9m7eOJ4SkwK6Ne6/AIonD6Zm6debV98zRU2',
      role: 'admin',
      is_email_verified: 1,
      is_phone_verified: 1,
      created_at: new Date()
    },
    {
      id: 2,
      full_name: 'Operations Lead',
      email: 'user@datacenter.io',
      phone: '+12025550188',
      password_hash: '$2a$10$tLPUgbSzMx6p90dioZO2ouhPVPBCcTtDhFVMUauqXL3.iwmjNeMpi',
      role: 'user',
      is_email_verified: 1,
      is_phone_verified: 1,
      created_at: new Date()
    }
  ],
  otp_codes: [],
  racks: [
    { id: 1, name: 'Rack A-01 (Compute Alpha)', position_x: -3.0, position_y: 0.0, position_z: -2.5, created_at: new Date() },
    { id: 2, name: 'Rack A-02 (Storage Vault)', position_x: -3.0, position_y: 0.0, position_z: 2.5, created_at: new Date() },
    { id: 3, name: 'Rack B-01 (Network Core)', position_x: 3.0, position_y: 0.0, position_z: -2.5, created_at: new Date() },
    { id: 4, name: 'Rack B-02 (Database Edge)', position_x: 3.0, position_y: 0.0, position_z: 2.5, created_at: new Date() }
  ],
  sensors: [
    { id: 1, rack_id: 1, type: 'temperature', label: 'Rack A-01 Intake Temp', unit: '°C', warning_limit: 27.0, critical_limit: 32.0, created_at: new Date() },
    { id: 2, rack_id: 1, type: 'humidity', label: 'Rack A-01 Relative Humidity', unit: '%', warning_limit: 60.0, critical_limit: 75.0, created_at: new Date() },
    { id: 3, rack_id: 1, type: 'power', label: 'Rack A-01 PDU Power Draw', unit: 'kW', warning_limit: 4.5, critical_limit: 5.5, created_at: new Date() },
    { id: 4, rack_id: 2, type: 'temperature', label: 'Rack A-02 Exhaust Temp', unit: '°C', warning_limit: 29.0, critical_limit: 35.0, created_at: new Date() },
    { id: 5, rack_id: 3, type: 'temperature', label: 'Rack B-01 Core Switch Temp', unit: '°C', warning_limit: 27.0, critical_limit: 33.0, created_at: new Date() },
    { id: 6, rack_id: 4, type: 'temperature', label: 'Rack B-02 Intake Temp', unit: '°C', warning_limit: 27.0, critical_limit: 32.0, created_at: new Date() },
    { id: 7, rack_id: null, type: 'airflow', label: 'CRAC-01 Plenum Airflow', unit: 'm/s', warning_limit: 1.8, critical_limit: 1.2, created_at: new Date() },
    { id: 8, rack_id: null, type: 'water_leak', label: 'Under-floor Leak Ribbon', unit: 'status', warning_limit: 0.5, critical_limit: 0.9, created_at: new Date() },
    { id: 9, rack_id: null, type: 'smoke', label: 'Ceiling Optical Smoke Detector', unit: 'status', warning_limit: 0.5, critical_limit: 0.9, created_at: new Date() }
  ],
  sensor_readings: [
    { id: 1, sensor_id: 1, value: 24.5, recorded_at: new Date(Date.now() - 3600000) },
    { id: 2, sensor_id: 1, value: 25.1, recorded_at: new Date() },
    { id: 3, sensor_id: 2, value: 48.0, recorded_at: new Date() },
    { id: 4, sensor_id: 3, value: 3.5, recorded_at: new Date() },
    { id: 5, sensor_id: 4, value: 27.0, recorded_at: new Date() },
    { id: 6, sensor_id: 5, value: 24.2, recorded_at: new Date() },
    { id: 7, sensor_id: 6, value: 23.8, recorded_at: new Date() },
    { id: 8, sensor_id: 7, value: 3.2, recorded_at: new Date() },
    { id: 9, sensor_id: 8, value: 0.0, recorded_at: new Date() },
    { id: 10, sensor_id: 9, value: 0.0, recorded_at: new Date() }
  ],
  alerts: [
    {
      id: 1,
      sensor_id: 1,
      level: 'info',
      message: 'Environmental baseline calibration complete.',
      is_acknowledged: 1,
      acknowledged_by: 1,
      created_at: new Date(Date.now() - 7200000)
    }
  ]
};

export const executeMockQuery = (sql, params) => {
  const norm = sql.trim().toLowerCase();

  if (norm.includes('from users') && norm.includes('where email =')) {
    const user = memoryStore.users.find(u => u.email === params[0]);
    return user ? [user] : [];
  }
  if (norm.includes('from users') && norm.includes('where phone =')) {
    const user = memoryStore.users.find(u => u.phone === params[0]);
    return user ? [user] : [];
  }
  if (norm.includes('from users') && norm.includes('where id =')) {
    const user = memoryStore.users.find(u => u.id === Number(params[0]));
    return user ? [user] : [];
  }
  if (norm.includes('from users') && !norm.includes('where')) {
    return memoryStore.users.map(({ password_hash, ...rest }) => rest);
  }
  if (norm.startsWith('insert into users')) {
    const newId = memoryStore.users.length ? Math.max(...memoryStore.users.map(u => u.id)) + 1 : 1;
    const [full_name, email, phone, password_hash, role, is_email_verified, is_phone_verified] = params;
    const user = { id: newId, full_name, email, phone, password_hash, role: role || 'user', is_email_verified: is_email_verified || 0, is_phone_verified: is_phone_verified || 0, created_at: new Date() };
    memoryStore.users.push(user);
    return { insertId: newId, affectedRows: 1 };
  }
  if (norm.startsWith('update users') && norm.includes('set')) {
    const user = memoryStore.users.find(u => u.id === Number(params[params.length - 1]));
    if (user) {
      if (norm.includes('is_email_verified = 1')) user.is_email_verified = 1;
      if (norm.includes('is_phone_verified = 1')) user.is_phone_verified = 1;
      if (norm.includes('role =')) user.role = params[0];
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }
  if (norm.startsWith('delete from users')) {
    memoryStore.users = memoryStore.users.filter(u => u.id !== Number(params[0]));
    return { affectedRows: 1 };
  }
  if (norm.includes('from otp_codes') && norm.includes('where user_id =') && norm.includes('channel =')) {
    const matching = memoryStore.otp_codes.filter(o => o.user_id === Number(params[0]) && o.channel === params[1]);
    return matching.sort((a, b) => b.id - a.id);
  }
  if (norm.startsWith('insert into otp_codes')) {
    const newId = memoryStore.otp_codes.length ? Math.max(...memoryStore.otp_codes.map(o => o.id)) + 1 : 1;
    const [user_id, channel, otp_hash, expires_at] = params;
    memoryStore.otp_codes.push({ id: newId, user_id: Number(user_id), channel, otp_hash, expires_at, attempts: 0, created_at: new Date() });
    return { insertId: newId, affectedRows: 1 };
  }
  if (norm.startsWith('update otp_codes set attempts = attempts + 1')) {
    const record = memoryStore.otp_codes.find(o => o.id === Number(params[0]));
    if (record) record.attempts += 1;
    return { affectedRows: 1 };
  }
  if (norm.startsWith('delete from otp_codes')) {
    memoryStore.otp_codes = memoryStore.otp_codes.filter(o => o.user_id !== Number(params[0]));
    return { affectedRows: 1 };
  }
  if (norm.includes('from racks') && !norm.includes('where')) return memoryStore.racks;
  if (norm.startsWith('insert into racks')) {
    const newId = memoryStore.racks.length ? Math.max(...memoryStore.racks.map(r => r.id)) + 1 : 1;
    memoryStore.racks.push({ id: newId, name: params[0], position_x: Number(params[1]), position_y: Number(params[2]), position_z: Number(params[3]), created_at: new Date() });
    return { insertId: newId, affectedRows: 1 };
  }
  if (norm.startsWith('delete from racks')) {
    memoryStore.racks = memoryStore.racks.filter(r => r.id !== Number(params[0]));
    return { affectedRows: 1 };
  }
  if (norm.includes('from sensors')) {
    return memoryStore.sensors.map(s => {
      const rack = memoryStore.racks.find(r => r.id === s.rack_id);
      const readings = memoryStore.sensor_readings.filter(r => r.sensor_id === s.id);
      const last = readings.length ? readings[readings.length - 1] : null;
      return { ...s, rack_name: rack ? rack.name : 'Facility Ambient', current_value: last ? last.value : null, last_updated: last ? last.recorded_at : null };
    });
  }
  if (norm.startsWith('insert into sensors')) {
    const newId = memoryStore.sensors.length ? Math.max(...memoryStore.sensors.map(s => s.id)) + 1 : 1;
    memoryStore.sensors.push({ id: newId, rack_id: params[0] ? Number(params[0]) : null, type: params[1], label: params[2], unit: params[3], warning_limit: Number(params[4]), critical_limit: Number(params[5]), created_at: new Date() });
    return { insertId: newId, affectedRows: 1 };
  }
  if (norm.startsWith('update sensors set')) {
    const sensor = memoryStore.sensors.find(s => s.id === Number(params[params.length - 1]));
    if (sensor) { sensor.warning_limit = Number(params[0]); sensor.critical_limit = Number(params[1]); return { affectedRows: 1 }; }
    return { affectedRows: 0 };
  }
  if (norm.startsWith('delete from sensors')) {
    memoryStore.sensors = memoryStore.sensors.filter(s => s.id !== Number(params[0]));
    return { affectedRows: 1 };
  }
  if (norm.startsWith('insert into sensor_readings')) {
    memoryStore.sensor_readings.push({ id: memoryStore.sensor_readings.length + 1, sensor_id: Number(params[0]), value: Number(params[1]), recorded_at: new Date() });
    return { insertId: memoryStore.sensor_readings.length, affectedRows: 1 };
  }
  if (norm.includes('from sensor_readings') && norm.includes('where sensor_id =')) {
    return memoryStore.sensor_readings.filter(r => r.sensor_id === Number(params[0])).slice(-30);
  }
  if (norm.includes('from alerts') && norm.includes('where is_acknowledged = 0')) {
    return memoryStore.alerts.filter(a => a.is_acknowledged === 0).map(a => ({ ...a, sensor_label: memoryStore.sensors.find(s => s.id === a.sensor_id)?.label || 'System' })).reverse();
  }
  if (norm.includes('from alerts') && !norm.includes('where is_acknowledged = 0')) {
    return memoryStore.alerts.map(a => ({ ...a, sensor_label: memoryStore.sensors.find(s => s.id === a.sensor_id)?.label || 'System' })).reverse().slice(0, 50);
  }
  if (norm.startsWith('insert into alerts')) {
    const newId = memoryStore.alerts.length ? Math.max(...memoryStore.alerts.map(a => a.id)) + 1 : 1;
    memoryStore.alerts.push({ id: newId, sensor_id: params[0] ? Number(params[0]) : null, level: params[1], message: params[2], is_acknowledged: 0, acknowledged_by: null, created_at: new Date() });
    return { insertId: newId, affectedRows: 1 };
  }
  if (norm.startsWith('update alerts set is_acknowledged = 1')) {
    const alert = memoryStore.alerts.find(a => a.id === Number(params[1]));
    if (alert) { alert.is_acknowledged = 1; alert.acknowledged_by = Number(params[0]); return { affectedRows: 1 }; }
    return { affectedRows: 0 };
  }
  return [];
};
