export async function onRequestGet() {
  const r = await fetch('https://api.github.com/repos/sapann1370-creator/click-releases/releases?per_page=100',{headers:{Accept:'application/vnd.github+json'}});
  if(!r.ok) return Response.json({error:'دریافت فهرست نسخه‌ها ناموفق بود.'},{status:502});
  const rows=await r.json();
  const items=rows.filter(x=>!x.draft).map(x=>{
    const asset=x.assets.find(a=>a.name.toLowerCase().endsWith('.exe'));
    const version=String(x.tag_name||'').replace(/^v/i,'');
    return {version,date:x.published_at||x.created_at,url:asset?.browser_download_url||x.html_url,notes:(x.body||'').split(/\r?\n/).filter(Boolean)};
  }).filter(x=>x.version).sort((a,b)=>compare(b.version,a.version));
  return Response.json(items,{headers:{'Cache-Control':'no-store','Access-Control-Allow-Origin':'*'}});
}
function compare(a,b){const x=String(a||'').split('.').map(Number),y=String(b||'').split('.').map(Number);for(let i=0;i<4;i++){if((x[i]||0)!==(y[i]||0))return (x[i]||0)-(y[i]||0)}return 0}
