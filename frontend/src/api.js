export async function apiFetch(url, options = {}) {
  const authData = localStorage.getItem('auth');
  const token = authData ? JSON.parse(authData).token : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) headers['Authorization'] = `Bearer ${token}`;

  // Remove leading slash from url to avoid double slashes
  const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
  const res = await fetch(`http://localhost:3003/${cleanUrl}`, {
    ...options,
    headers,
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
