const OWNER='sapann1370-creator', REPO='click-releases';
export async function onRequestGet({params}) {
  const version=String(params.path||'').replace(/^\//,'');
  if(!version||version==='latest'){
    const r=await fetch(`https://raw.githubusercontent.com/${OWNER}/${REPO}/main/latest.json?t=${Date.now()}`);
    if(!r.ok)return new Response('هنوز نسخه‌ای منتشر نشده است.',{status:404});
    const m=await r.json();
    return Response.redirect(m.url,302);
  }
  if(!/^\d+(\.\d+){1,3}$/.test(version))return new Response('نسخه نامعتبر است.',{status:400});
  const r=await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/releases/tags/v${version}`,{headers:{Accept:'application/vnd.github+json'}});
  if(!r.ok)return new Response('نسخه پیدا نشد.',{status:404});
  const release=await r.json(),asset=release.assets.find(x=>x.name===`Click-Accounting-Setup-${version}.exe`);
  if(!asset)return new Response('فایل نصب پیدا نشد.',{status:404});
  return Response.redirect(asset.browser_download_url,302);
}
