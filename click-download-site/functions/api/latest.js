const URL = 'https://raw.githubusercontent.com/sapann1370-creator/click-releases/main/latest.json';
export async function onRequestGet() {
  const r = await fetch(`${URL}?t=${Date.now()}`, {headers:{'Cache-Control':'no-cache'}});
  if (!r.ok) return Response.json({error:'هنوز نسخه‌ای منتشر نشده است.'},{status:404,headers:{'Cache-Control':'no-store'}});
  return new Response(r.body,{headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, max-age=0','Access-Control-Allow-Origin':'*'}});
}
