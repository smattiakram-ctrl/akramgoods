
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DB_PREFIX = 'NabilInventory_';

// إعدادات Supabase الخاصة بك
const DEFAULT_URL = 'https://flshtvylpvljyhpylweh.supabase.co';
const DEFAULT_KEY = 'sb_publishable_vd4QKYTDpmORhUT0dHug9g_gOlhSQ8H';

export const getSupabaseConfig = () => {
  const storedUrl = localStorage.getItem(DB_PREFIX + 'SUPABASE_URL');
  const storedKey = localStorage.getItem(DB_PREFIX + 'SUPABASE_KEY');
  
  return {
    url: storedUrl || DEFAULT_URL,
    key: storedKey || DEFAULT_KEY
  };
};

export const saveSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem(DB_PREFIX + 'SUPABASE_URL', url);
  localStorage.setItem(DB_PREFIX + 'SUPABASE_KEY', key);
  window.location.reload();
};

const config = getSupabaseConfig();

// إنشاء العميل باستخدام الإعدادات المثبتة
export const supabase: SupabaseClient = createClient(config.url, config.key);

export const saveUser = (user: any): void => {
  localStorage.setItem(DB_PREFIX + 'CURRENT_USER', JSON.stringify(user));
};

export const getUser = (): any | null => {
  const user = localStorage.getItem(DB_PREFIX + 'CURRENT_USER');
  return user ? JSON.parse(user) : null;
};

export const clearAllLocalData = async (): Promise<void> => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(DB_PREFIX)) localStorage.removeItem(key);
  });
};

export const getAll = async <T>(tableName: string): Promise<T[]> => {
  const user = getUser();
  if (user && supabase) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('id', { ascending: false });
    
    if (!error && data) {
      localStorage.setItem(DB_PREFIX + tableName, JSON.stringify(data));
      return data as T[];
    }
  }
  
  const local = localStorage.getItem(DB_PREFIX + tableName);
  return local ? JSON.parse(local) : [];
};

export const saveItem = async <T extends { id: string }>(tableName: string, item: any): Promise<void> => {
  const user = getUser();
  if (user && supabase) {
    const { error } = await supabase
      .from(tableName)
      .upsert({ ...item, user_id: user.id });
    if (error) console.error(`Error saving to ${tableName}:`, error);
  }
  
  const current = await getAll<any>(tableName);
  const updated = [...current.filter(i => i.id !== item.id), item];
  localStorage.setItem(DB_PREFIX + tableName, JSON.stringify(updated));
};

export const deleteItem = async (tableName: string, id: string): Promise<void> => {
  const user = getUser();
  if (user && supabase) {
    await supabase.from(tableName).delete().eq('id', id);
  }
  
  const current = await getAll<any>(tableName);
  const updated = current.filter(i => i.id !== id);
  localStorage.setItem(DB_PREFIX + tableName, JSON.stringify(updated));
};

export const getEarnings = async (): Promise<number> => {
  const user = getUser();
  if (user && supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('total_earnings')
        .eq('id', user.id)
        .single();
      if (!error && data) return data.total_earnings;
    } catch (e) {
      console.warn("Profiles table might not exist yet");
    }
  }
  const val = localStorage.getItem(DB_PREFIX + 'TOTAL_EARNINGS');
  return val ? parseFloat(val) : 0;
};

export const saveEarnings = async (amount: number): Promise<void> => {
  const user = getUser();
  if (user && supabase) {
    await supabase.from('profiles').upsert({ id: user.id, total_earnings: amount });
  }
  localStorage.setItem(DB_PREFIX + 'TOTAL_EARNINGS', amount.toString());
};

export const signInWithGithub = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: window.location.origin
    }
  });
  if (error) throw error;
  return data;
};

export const logoutUser = async (): Promise<void> => {
  await supabase.auth.signOut();
  localStorage.clear();
};
