// Security configuration (PBKDF2)
const AUTH_SALT = '128431c8252060cd971adbdaf3ae4b6a';
const AUTH_HASH = '5cb6ea6355ff5a7bc32458db87ab92c9dffd3da456b4ed6d7c995c295fd39048';

export async function verifyPassword(password: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const saltBuffer = new Uint8Array(AUTH_SALT.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const passwordKey = await crypto.subtle.importKey(
      'raw', 
      encoder.encode(password), 
      { name: 'PBKDF2' }, 
      false, 
      ['deriveBits']
    );
    const hashBuffer = await crypto.subtle.deriveBits(
      { 
        name: 'PBKDF2', 
        salt: saltBuffer, 
        iterations: 100000, 
        hash: 'SHA-256' 
      },
      passwordKey, 
      256
    );
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex === AUTH_HASH;
  } catch (e) {
    return false;
  }
}

export function setAdminSession() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin_auth_session', 'true');
    // Also set a cookie for middleware
    document.cookie = "admin_auth_session=true; path=/; max-age=86400; SameSite=Strict";
  }
}

export function clearAdminSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_auth_session');
    document.cookie = "admin_auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}

export function getAdminSession(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('admin_auth_session') === 'true';
  }
  return false;
}
