const OWNER = 'sapann1370-creator';
const REPO = 'click-releases';
const MAX_BYTES = 90 * 1024 * 1024;
const API = `https://api.github.com/repos/${OWNER}/${REPO}`;
const headers = token => ({ Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' });
const reply = (data, status=200) => Response.json(data, {status, headers:{'Cache-Control':'no-store'}});
async function gh(url, token, options={}) {
  const r = await fetch(url, { ...options, headers: {...headers(token), ...(options.headers||{})} });
  const body = await r.json().catch(()=>({}));
  if (!r.ok) throw new Error(body.message || `GitHub API error (${r.status})`);
  return body;
}
export async function onRequestPost({request, env}) {
  const auth = request.headers.get('Authorization') || '';
  const supplied = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!env.ADMIN_PASSWORD || supplied !== env.ADMIN_PASSWORD) return reply({error:'دسترسی غیرمجاز است.'},401);
  if (!env.GITHUB_TOKEN) return reply({error:'توکن GitHub در تنظیمات Cloudflare ثبت نشده است.'},500);
  try {
    const form = await request.formData();
    const version = String(form.get('version')||'').trim().replace(/^v/i,'');
    if (!/^\d+(\.\d+){1,3}$/.test(version)) return reply({error:'شماره نسخه معتبر نیست.'},400);
    const file = form.get('file');
    if (!file || typeof file.arrayBuffer !== 'function' || !file.name) return reply({error:'فایل نصب انتخاب نشده است.'},400);
    if (!file.name.toLowerCase().endsWith('.exe')) return reply({error:'فقط فایل exe پذیرفته می‌شود.'},400);
    if (!file.size || file.size > MAX_BYTES) return reply({error:'حجم فایل باید حداکثر ۹۰ مگابایت باشد.'},400);
    const current = await fetch(`https://raw.githubusercontent.com/${OWNER}/${REPO}/main/latest.json?cache=${Date.now()}`);
    if (current.ok) {
      const old = await current.json();
      if (compare(version, old.version) <= 0) return reply({error:`شماره نسخه باید از نسخه فعلی (${old.version}) بالاتر باشد.`},409);
    }
    const bytes = await file.arrayBuffer();
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    const sha256 = [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
    const tag = `v${version}`;
    const release = await gh(`${API}/releases`, env.GITHUB_TOKEN, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({tag_name:tag,name:`Click Accounting ${tag}`,body:String(form.get('notes')||'').slice(0,5000),draft:false,prerelease:false})
    });
    const uploadUrl = release.upload_url.replace(/\{.*\}$/,'') + `?name=${encodeURIComponent(`Click-Accounting-Setup-${version}.exe`)}`;
    const up = await fetch(uploadUrl, {method:'POST',headers:{...headers(env.GITHUB_TOKEN),'Content-Type':'application/vnd.microsoft.portable-executable'},body:bytes});
    if (!up.ok) { const e=await up.json().catch(()=>({})); throw new Error(e.message||`آپلود فایل در GitHub ناموفق بود (${up.status}).`); }
    const asset = await up.json();
    const notes = String(form.get('notes')||'').split(/\r?\n/).map(x=>clean(x,200)).filter(Boolean).slice(0,15);
    const manifest = {version,date:clean(form.get('date'),30),url:asset.browser_download_url,notes,sha256};
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(manifest,null,2)+'\n')));
    const oldFile = await fetch(`${API}/contents/latest.json`,{headers:headers(env.GITHUB_TOKEN)});
    let sha;
    if(oldFile.ok) sha=(await oldFile.json()).sha;
    await gh(`${API}/contents/latest.json`,env.GITHUB_TOKEN,{
      method:'PUT',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({message:`Publish Click ${tag} manifest`,content:encoded,...(sha?{sha}:{})})
    });
    return reply({ok:true,version,sha256,manifestUrl:`${new URL(request.url).origin}/api/latest`});
  } catch(e) { return reply({error:e.message||'خطا در انتشار نسخه.'},500); }
}
function clean(v,n){return String(v||'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,n)}
function compare(a,b){const x=String(a||'').split('.').map(Number),y=String(b||'').split('.').map(Number);for(let i=0;i<4;i++){if((x[i]||0)!==(y[i]||0))return (x[i]||0)-(y[i]||0)}return 0}
