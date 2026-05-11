import { createClient } from '@supabase/supabase-js';

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

// Default society (Sunrise Apartments demo)
const DEFAULT_SOCIETY_ID = import.meta.env.VITE_SOCIETY_ID;

// Current society — changes when a new society registers or admin logs in
export const getCurrentSocietyId = () =>
  localStorage.getItem('current_society_id') || DEFAULT_SOCIETY_ID;

export const setCurrentSocietyId = (id) =>
  localStorage.setItem('current_society_id', id);

export const clearCurrentSociety = () =>
  localStorage.removeItem('current_society_id');

// Registered societies stored locally for demo auth
// { id, adminEmail, adminPassword }
export const getRegisteredSocieties = () => {
  try {
    return JSON.parse(localStorage.getItem('registered_societies') || '[]');
  } catch { return []; }
};

export const saveRegisteredSociety = (society) => {
  const list = getRegisteredSocieties();
  const existing = list.findIndex(s => s.id === society.id);
  if (existing >= 0) list[existing] = society;
  else list.push(society);
  localStorage.setItem('registered_societies', JSON.stringify(list));
};

// Transform DB row → app object
export const toPayment = (p) => ({
  ...p,
  amount:    Number(p.amount),
  receiptNo: p.receipt_no ?? null,
});

export const toSociety = (s) => ({
  id:                s.id,
  name:              s.name,
  location:          s.location || '',
  fullName:          `${s.name}, ${s.location || ''}`.trim().replace(/,$/, ''),
  address:           s.address || '',
  totalFlats:        s.total_flats,
  maintenanceAmount: Number(s.maintenance_amount),
  upiId:             s.upi_id || '',
  secretary:         s.secretary_name || '',
  phone:             s.secretary_phone || '',
  currentMonth:      'May 2026',
});
