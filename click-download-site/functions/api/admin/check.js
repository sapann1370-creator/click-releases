export async function onRequestGet({request,env}) {
 const a=request.headers.get('Authorization')||'', supplied=a.startsWith('Bearer ')?a.slice(7):'';
 if(!env.ADMIN_PASSWORD||supplied!==env.ADMIN_PASSWORD)return Response.json({error:'Unauthorized'},{status:401});
 if(!env.GITHUB_TOKEN)return Response.json({error:'توکن GitHub ثبت نشده است.'},{status:500});
 return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});
}
