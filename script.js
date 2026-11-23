(function(){
"use strict";
var D=window.DATA, S={sec:"chamonix",view:"list",tz:"cet",dens:"esencial"};
try{var _dn=localStorage.getItem("itin-dens");if(_dn==="esencial"||_dn==="completo")S.dens=_dn;}catch(_e){}
try{var _dq=new URLSearchParams(location.search).get("dens");if(_dq==="esencial"||_dq==="completo")S.dens=_dq;}catch(_e){}
var UA=navigator.userAgent||"",TP=navigator.maxTouchPoints||0;
var DEV=/iPhone|iPod/.test(UA)?"iphone":((/iPad/.test(UA)||(/Macintosh/.test(UA)&&TP>1))?"ipad":(/Android/.test(UA)?(/Mobile/.test(UA)?"iphone":"ipad"):"desktop"));
try{var _dv=new URLSearchParams(location.search).get("dev");if(_dv==="iphone"||_dv==="ipad"||_dv==="desktop")DEV=_dv;}catch(_e){}
document.documentElement.classList.add("dev-"+DEV);
var DEVL={iphone:"iPhone",ipad:"iPad",desktop:"Mac / PC"};
var BK={gratis:"Gratis / sin reserva",ok:"Reservado",pend:"Reserva pendiente"};
function bkChip(b){return b?'<span class="bkc bkc-'+b+'">'+(b==="gratis"?"🟢 ":b==="ok"?"🔵 ":"🟠 ")+BK[b]+'</span>':"";}
var EV={};
try{var _tz=localStorage.getItem("itin-tz");if(_tz==="mx"||_tz==="cet")S.tz=_tz;}catch(_e){}
var DOW=["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"],MON=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
function dnum(s){var p=s.split("-");return Math.round(Date.UTC(+p[0],+p[1]-1,+p[2])/864e5);}
function dstr(n){var d=new Date(n*864e5);return d.getUTCFullYear()+"-"+("0"+(d.getUTCMonth()+1)).slice(-2)+"-"+("0"+d.getUTCDate()).slice(-2);}
function dlabel(n){var d=new Date(n*864e5);return DOW[d.getUTCDay()]+" "+d.getUTCDate()+" "+MON[d.getUTCMonth()];}
function dshort(n){var d=new Date(n*864e5);return d.getUTCDate()+" "+MON[d.getUTCMonth()];}
function hm(m){m=((m%1440)+1440)%1440;var h=Math.floor(m/60),x=m%60;return (h<10?"0":"")+h+":"+(x<10?"0":"")+x;}
var OFF={cet:0,mx:-420};
/* absolute minutes on the CET wall clock; events with tz "mx" are stored in Mexico time (CET = MX + 7 h) */
function absOf(d,e){var add=e.tz==="mx"?420:0,s=dnum(d.date)*1440+mins(e.start)+add,en;
  if(e.end){en=dnum(e.end_date||d.date)*1440+mins(e.end)+add;if(e.end==="23:59"&&!e.end_date)en+=1;if(en<s)en+=1440;}else en=s;
  return {s:s,e:en};}
function disp(d,e){var a=absOf(d,e),o=OFF[S.tz];return {s:a.s+o,e:a.e+o};}
function tzLabel(){return S.tz==="cet"?'<b>🕐 Horas en: Hora local Europa (CET, UTC+1)</b><small>Es la misma hora en toda la ruta, de Chamonix a Praga. CDMX/Monterrey = CET −7 h.</small>':'<b>🕐 Horas en: Hora CDMX/Monterrey (UTC−6)</b><small>Todo recorrido −7 h respecto a la hora local de Europa (CET). Lo que pasa de madrugada en Europa cae aquí en el día anterior.</small>';}
var TYPE={vuelo:"Vuelo",coche:"Coche",visita:"Visita",cena:"Cena",foto:"Foto",hotel:"Hospedaje",libre:"Libre",traslado:"Traslado",cafe:"Café"};
var STAT={reservado:"Reservado",en_curso:"En curso",propuesta:"Propuesta",por_resolver:"Por resolver",info:"Info",por_confirmar_listo:"Por confirmar listo",conflicto:"Conflicto",listo:"Listo · sin pendientes",cerrado:"Cerrado"};
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}

function applePlaceUrl(name,lat,lon){return 'https://maps.apple.com/?q='+encodeURIComponent(name||'Lugar')+'&ll='+Number(lat).toFixed(6)+','+Number(lon).toFixed(6);}
function evidHtml(e,full){var v=e&&e.evidencia;if(!v)return '';
  if(D.meta&&D.meta.public_redacted){return '<div class="evid pub">📧 '+esc(v.public_text||'confirmado por correo')+'</div>';}
  var h='<div class="evid'+(full?' full':'')+'"><b>📧 Evidencia:</b> '+esc(v.sender||'')+(v.date?' · '+esc(v.date):'')+(v.subject?' · <i>'+esc(v.subject)+'</i>':'');
  var list=(v.imgs&&v.imgs.length)?v.imgs:(v.img?[{file:v.img,label:v.slug||'captura'}]:[]);
  if(list.length){
    h+='<div class="evthw">'+list.map(function(it,idx){
      return '<a class="evitem" href="'+esc(it.file)+'" target="_blank" rel="noopener" title="'+esc(it.label||'')+'"><img class="evth" src="'+esc(it.file)+'" alt="Captura del correo '+(idx+1)+'"><span>'+(list.length>1?('Captura '+(idx+1)+'/'+list.length):'Ver captura')+' ›</span></a>';
    }).join('')+'</div>';
  }else if(!v.no_img_ok){
    h+='<div class="evmiss">Captura pendiente en <code>evidencia/'+esc(v.slug||'')+'.png</code></div>';
  }
  return h+'</div>';}
function badge(s){return s?'<span class="badge '+s+'">'+STAT[s]+'</span>':"";}
function mins(t){var p=t.split(":");return (+p[0])*60+(+p[1]);}
function photo(id){for(var i=0;i<D.photos.length;i++)if(D.photos[i].id===id)return D.photos[i];return null;}
function deg(x){return x==null?"—":(Math.round(x*10)/10).toString().replace(".",",")+"°";}
function refFig(p,cls){var r=p.ref;if(!r)return '';return '<figure class="ref'+(cls?' '+cls:'')+'"><img src="'+esc(r.img)+'" alt="Foto de referencia: '+esc(p.subject)+'" loading="lazy"><figcaption><b>Referencia (no es tuya):</b> '+esc(r.season)+' Foto: '+esc(r.artist)+' · '+esc(r.date)+' · '+esc(r.lic)+' · <a href="'+esc(r.src)+'" target="_blank" rel="noopener">Wikimedia Commons ›</a></figcaption></figure>';}
function photoCard(p,full){
  var m=p.moon||{};
  var moon="Luna "+String(m.illum).replace(".",",")+" % iluminada"+(m.rise?(" · sale "+m.rise+(m.rise_az!=null?" (az "+deg(m.rise_az)+")":"")):" · sale después de medianoche")+(m.set?" · se pone "+m.set:"");
  if(p.moon_alt>0) moon+=" · a las "+p.time+": alt "+deg(p.moon_alt)+", az "+deg(p.moon_az);
  var s=p.sun_tbl;
  return '<div class="photo'+(full?' full':'')+'" id="'+(full?'m-':'')+'foto-'+p.id+'" data-pid="'+p.id+'"><h4>📷 '+esc(p.id)+' · '+esc(p.subject)+'</h4>'+
  (p.window?'<p class="pwin">⏱ Sesión <b>'+esc(p.window)+'</b> · 🌅 hora dorada <b>'+s.golden_pm+'</b> · 🔵 hora azul <b>'+s.blue_pm+'</b></p>':'')+
  (p.why?'<p class="pwhy"><b>Por qué es épica:</b> '+esc(p.why)+'</p>':'')+refFig(p,full?'':'sm')+
  '<dl class="kv"><dt>Lugar</dt><dd>'+esc(p.spot)+'</dd>'+
  '<dt>GPS</dt><dd><b>'+p.lat.toFixed(6)+', '+p.lon.toFixed(6)+'</b> ('+p.elev_m+' m)</dd>'+
  '<dt>Fecha / hora clave</dt><dd>'+esc(p.date)+' · '+esc(p.time)+' (hora local CET)</dd>'+
  '<dt>Sol</dt><dd>amanece '+s.sunrise+' · se pone '+s.sunset+' (az '+deg(s.sunset_az)+')</dd>'+
  '<dt>Hora dorada</dt><dd>mañana '+s.golden_am+' · tarde '+s.golden_pm+'</dd>'+
  '<dt>Hora azul</dt><dd>mañana '+s.blue_am+' · tarde '+s.blue_pm+'</dd>'+
  '<dt>Sol a las '+esc(p.time)+'</dt><dd>elevación '+deg(p.sun_alt)+' · azimut '+deg(p.sun_az)+'</dd>'+
  '<dt>Dirección</dt><dd>'+(p.bearing!=null?('apuntar a '+p.bearing+'° hacia '+esc(p.subject)+(p.dist_km?' ('+String(p.dist_km).replace(".",",")+' km)':'')):'en sitio')+'</dd>'+
  '<dt>Luna</dt><dd>'+moon+'</dd>'+demLine(p)+
  '<dt>Lente</dt><dd>'+esc(p.focal)+'</dd>'+(p.gear?'<dt>Equipo</dt><dd>'+esc(p.gear)+'</dd>':'')+'</dl>'+
  '<p class="nt" style="font-size:13px;margin:6px 0 0">'+esc(p.notes)+'</p>'+
  profTbl(p)+'<a href="'+esc(p.map)+'" target="_blank" rel="noopener">Abrir en Apple Maps ›</a></div>';
}
function demLine(p){var d=p.dem||{},x=[];
  if(d.sun_set_t) x.push('sol directo en este punto '+(d.sun_rise_t?d.sun_rise_t+'–':'hasta ')+d.sun_set_t+(d.sun_set_t_hz!=null?' (se oculta tras un horizonte de '+deg(d.sun_set_t_hz)+')':''));
  else if(d.direct_sun_min===0) x.push('sin sol directo en todo el día (sombra del macizo)');
  if(d.moon_rise_t) x.push('la luna libra el relieve a las '+d.moon_rise_t+' (az '+deg(d.moon_rise_t_az)+', alt '+deg(d.moon_rise_t_alt)+')');
  if(d.hz_at_bearing!=null) x.push('horizonte hacia '+p.bearing+'°: '+deg(d.hz_at_bearing));
  if(d.peak) x.push(d.peak);
  if(d.src) return '<dt>Relieve</dt><dd>'+x.join(' · ')+' <small>('+d.src+')</small></dd>';
  return x.length?'<dt>Relieve</dt><dd>'+x.join(' · ')+' <small>(modelo Copernicus 30 m, '+(d.mind_m>=1000?'colinas a más de 1 km':'desde '+d.mind_m+' m')+' hasta '+d.maxd_km+' km)</small></dd>':'';}
function profTbl(p){if(!p.profile)return '';return '<details><summary>Minuto a minuto (luna vs. arista)</summary><table class="tbl mini"><tr><th>Hora</th><th>Luna alt</th><th>az</th><th>Arista</th><th>Estado</th></tr>'+p.profile.map(function(r){return '<tr><td>'+r[0]+'</td><td>'+deg(r[1])+'</td><td>'+deg(r[2])+'</td><td>'+deg(r[3])+'</td><td>'+r[4]+'</td></tr>';}).join('')+'</table></details>';}
function appleBtn(url,label){if(!url)return '';
  return '<a class="abtn apple-go" href="'+esc(url)+'" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg><span>Abrir en Apple Maps'+(label?'<small>'+esc(label)+'</small>':'')+'</span></a>';}
function driveBox(r,title){if(!r)return '';var a=r.rec,b=r.alt06;
  var h='<div class="drivebox"><div class="full drivehead"><div><b style="display:inline;font-size:15px">🚗 '+esc(title||(r.frm+' → '+r.to))+'</b><div class="dkm">'+r.km+' km · tiempo previsto <b style="display:inline">'+esc(r.total)+'</b> (con márgenes)</div></div>'+appleBtn(r.map,r.frm+' → '+r.to)+'</div>'+
  '<div class="full comp"><span>Ruta<b>'+esc(r.raw)+'</b>'+r.km+' km</span><span>+20 %<b>'+esc(r.p20)+'</b>&nbsp;</span><span>Descansos<b>'+r.rest+' min</b>15 por c/2 h</span><span>Estacionar<b>'+r.park+' min</b>al llegar</span><span class="tot">Total<b>'+esc(r.total)+'</b>&nbsp;</span></div>'+
  '<div><small>Salida recomendada</small><b>'+a.dep+' → '+a.arr+'</b>'+(a.daylight_min>0&&a.daylight_min<600?'luz al llegar: '+esc(a.daylight):(a.daylight_min<=0?'llegas de noche':''))+'</div>'+
  (b?'<div><small>Si sales a las 06:00</small><b>06:00 → '+b.arr+'</b>'+(b.daylight_min>0?'luz al llegar: '+esc(b.daylight):'llegas de noche')+'</div>':'<div><small>06:00</small><b>—</b>no aplica este día</div>')+
  '<div class="full"><small>Sol en destino: se pone '+r.sunset+', crepúsculo civil hasta '+r.civil+(r.dinner?' · cena '+r.dinner+(r.free?' · libre real antes de cenar (ya restando 15–30 min de check-in/arreglarse): <b style="display:inline;font-size:13px">'+esc(r.free)+'</b>'+(r.free06?' (con 06:00: '+esc(r.free06)+')':''):''):'')+'</small>'+
  (r.note?'<br><small>'+esc(r.note)+'</small>':'')+(r.osrm?'<br><small class="src">OSRM (22 nov 2026, sin nieve ni tráfico): '+r.osrm.km+' km · '+esc(r.osrm.raw)+(r.osrm.note?' · '+esc(r.osrm.note):'')+'</small>':'')+'<br><small class="src">Fuente: '+esc(r.read)+'.</small></div></div>';return h;}
function actsHtml(d){if(!d.acts||!d.acts.length)return '';
  return '<h3>🎟 Actividades y visitas para reservar</h3><div class="acts">'+d.acts.map(function(a){
    return '<div class="act'+(a.k.indexOf("Recomendación")===0?' rec':'')+'"><div class="ak">'+esc(a.k)+' '+badge(a.status)+(a.pend?' <span class="pn">Pendientes #'+a.pend+'</span>':'')+'</div><div class="ati">'+esc(a.title)+'</div>'+
    '<div class="nt"><b>Cuándo:</b> '+esc(a.when)+' · <b>Dónde:</b> '+esc(a.where)+'</div>'+
    '<div class="nt"><b>Costo:</b> '+esc(a.price)+' · <b>Reservar antes de:</b> '+esc(a.book_by)+'</div>'+
    (a.book?'<div class="nt"><b>Reservar:</b> <a href="'+esc(a.book)+'" target="_blank" rel="noopener">'+esc(a.book.replace(/^https?:\/\//,''))+'</a></div>':'')+
    '<div class="nt"><b>Verificado:</b> '+esc(a.facts)+'</div>'+(a.unv?'<div class="nt unv"><b>Sin verificar:</b> '+esc(a.unv)+'</div>':'')+
    (a.map?'<a href="'+esc(a.map)+'" target="_blank" rel="noopener">Apple Maps ›</a>':'')+'</div>';}).join('')+'</div>';}
function dayStatus(d){return d.day_status?' '+badge(d.day_status):'';}
function dayCard(d){
  var top='<article class="day" id="d-'+d.date+'"><h2>'+esc(d.label)+' · '+esc(d.city)+dayStatus(d)+'</h2><p class="sub">'+esc(d.summary)+'</p>',h='';
  if(d.sun) h+='<div class="sun">☀️ '+(S.tz==="mx"?'(hora local CET) ':'')+esc(d.sun.city)+': amanece '+d.sun.sunrise+' · se pone '+d.sun.sunset+' · crepúsculo civil hasta '+d.sun.civil_end+(d.sun.golden_pm?'<br>🌅 Hora dorada '+d.sun.golden_pm+' · 🔵 hora azul '+d.sun.blue_pm+(d.sun.golden_am?' <small>(mañana: dorada '+d.sun.golden_am+', azul '+d.sun.blue_am+')</small>':''):'')+'</div>';
  if(d.conflict) h+='<div class="conflict">⚠️ '+esc(d.conflict)+'</div>';
  if(d.ambig) h+='<div class="ambig">⚠️ '+esc(d.ambig)+'</div>';
  if(d.drive) h+=driveBox(d.drive); if(d.drive2) h+=driveBox(d.drive2,'Tarde: '+d.drive2.frm+' → '+d.drive2.to); if(d.drive3) h+=driveBox(d.drive3,'Noche: '+d.drive3.frm+' → '+d.drive3.to);
  if(D.maps&&D.maps[d.date]) h+=mapBlock(d.date,d);
  if(d.lodging||d.dinner) h+='<p class="sub">🛏 '+(d.lod_status?badge(d.lod_status)+' ':'')+esc(d.lodging||"—")+(d.dinner?' · 🍽 '+esc(d.dinner):'')+'</p>';
  var side=h;h='';
  d.events.forEach(function(e,i){
    var id=d.date+'_'+i;EV[id]={d:d,e:e};
    var t=disp(d,e),dd=dnum(d.date),sd=Math.floor(t.s/1440),ed=Math.floor(t.e/1440);
    var tt=hm(t.s)+(sd!==dd?'<span class="tzd">'+dshort(sd)+'</span>':'')+(e.end?'<br><span style="font-weight:400;color:#889">'+hm(t.e)+'</span>'+(ed!==dd?'<span class="tzd">'+dshort(ed)+'</span>':''):'');
    h+='<div class="ev g-'+(e.bk||'gratis')+(e.optional?' opt':'')+'" data-ev="'+id+'" role="button" tabindex="0" aria-label="Ver detalles: '+esc(e.title)+'"><div class="t">'+tt+'</div><div><span class="ty">'+TYPE[e.type]+'</span>'+badge(e.status)+bkChip(e.bk)+'<div class="ti">'+esc(e.title)+(e.pid?' <span class="pchip">📷 ficha '+e.pid+'</span>':'')+(e.flag?' <span class="mailflag">'+esc(e.flag)+'</span>':'')+'</div>'+
      (e.place?'<div class="nt">'+esc(e.place)+'</div>':'')+(e.notes?'<div class="nt">'+esc(e.notes)+'</div>':'')+evidHtml(e,false)+
      (e.map?'<a href="'+esc(e.map)+'" target="_blank" rel="noopener">'+(e.type==="coche"?"Ruta en Apple Maps ›":"Apple Maps ›")+'</a>':'')+'<span class="more">Ver todo ›</span></div></div>';
  });
  h+=actsHtml(d);
  if(d.recs.length) h+='<h3>Qué te recomiendo</h3><ul class="recs">'+d.recs.map(function(x){return '<li>'+esc(x)+'</li>';}).join("")+'</ul>';
  if(d.family&&d.family.length) h+='<h3>👨‍👩‍👧 Para el grupo familiar</h3><ul class="recs">'+d.family.map(function(x){return '<li>'+esc(x)+'</li>';}).join("")+'</ul>';
  if(d.planb&&d.planb.length) h+='<h3>🌧 Plan B (frío o lluvia)</h3><ul class="recs">'+d.planb.map(function(x){return '<li>'+esc(x)+'</li>';}).join("")+'</ul>';
  if(d.warn.length) h+='<h3>Ojo</h3><ul class="warn">'+d.warn.map(function(x){return '<li>'+esc(x)+'</li>';}).join("")+'</ul>';
  if(d.photo_note) h+='<h3>Foto del día</h3><p class="pnote">📷 '+esc(d.photo_note)+'</p>';
  if(d.photos.length){h+='<h3>Fotos (para verificar en PhotoPills)</h3>';d.photos.forEach(function(id){var p=photo(id);if(p)h+=photoCard(p);});}
  return top+'<div class="dgrid"><div class="dside">'+side+'</div><div class="dmain">'+h+'</div></div></article>';
}
function days(){return D.days.filter(function(d){return d.section===S.sec;});}
function esencial(){
  var vn=D.v11||D.v10, ds=days(), T=D.travelers, h='';if(T){h+='<div class="card travelers" id="viajeros"><h2>Quién viaja</h2><p><b>Chamonix (21–25 dic):</b> '+esc(T.chamonix)+'</p><p><b>Desde el 25 dic (salida de Chamonix):</b> '+esc(T.tour)+'</p>'+(T.dinners?'<p class="sub">'+esc(T.dinners)+'</p>':'')+'</div>';}if(vn){h+='<details class="card v10" id="v11" open><summary><b>'+esc(vn.title||'Qué cambió en la v11.1')+'</b></summary><ul class="recs">'+vn.changes.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul>'+(vn.ambig?'<p class="sub">⚠️ '+esc(vn.ambig)+'</p>':'')+'</details>';}h+='<div class="card ess" id="esencial"><h2>Lo esencial día por día</h2>';
  ds.forEach(function(d){var r=d.drive;
    h+='<a class="er" href="#d-'+d.date+'"><div class="erh"><b>'+esc(d.label)+'</b> · '+esc(d.city)+dayStatus(d)+'</div>'+
     '<div class="eri">🛏 '+(d.lod_status?badge(d.lod_status)+' ':'')+esc((d.lodging||'—').replace(/ \((reservado|por resolver)\)/i,''))+'</div>'+
     (r?'<div class="eri">🚗 sale '+r.rec.dep+' → llega '+r.rec.arr+' · '+esc(r.total)+(r.rec.daylight_min>0&&r.rec.daylight_min<600?' · ☀️ '+esc(r.rec.daylight)+' de luz':'')+(d.drive2?' · tarde '+d.drive2.rec.dep+'→'+d.drive2.rec.arr:'')+'</div>':'')+
     (d.dinner?'<div class="eri">🍽 '+esc(d.dinner)+'</div>':'')+
     '<div class="ers">'+esc(d.summary)+(d.photos.length?' · 📷 '+d.photos.join(', '):'')+'</div></a>';});
  h+=routeMap()+'</div>';
  if(S.sec==="chamonix"||S.sec==="tour") h+=tripitCard();
  return h;}
function routeMap(){return mapBlock(S.sec==="tour"?"overview":"chamonix",null);}
var GSEL={};
function gframe(m){return '<iframe src="'+esc(m.gembed)+'" title="Google Maps: '+esc(m.title)+'" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe>';}
function mapBlock(key,d){var m=D.maps&&D.maps[key];if(!m)return "";
  var h='<div class="mapcard'+(GSEL[key]?' gmode':'')+'" data-mk="'+key+'"><div class="mhead"><b>🗺 '+esc(key==="overview"||key==="chamonix"?m.title:"Mapa del día")+'</b>';
  if(m.views&&m.views.length>1){h+='<div class="mviews" role="group" aria-label="Vista del mapa">'+m.views.map(function(v,i){return '<button type="button" data-mv="'+i+'" aria-pressed="'+(i===0)+'">'+esc(v.name)+'</button>';}).join("")+'</div>';}
  h+='</div>';
  if(m.gembed) h+='<div class="mprov" role="group" aria-label="Tipo de mapa"><button type="button" data-mp="apple" aria-pressed="'+(!GSEL[key])+'">🍎 Apple Maps (mapa + enlaces)</button><button type="button" data-mp="google" aria-pressed="'+(!!GSEL[key])+'">Google Maps</button></div>';
  h+='<div class="lmapw"><div class="lmap" data-map="'+key+'" aria-label="Mapa: '+esc(m.title)+'"></div><button type="button" class="mfs" aria-label="Ampliar mapa">⤢</button></div>';
  if(m.gembed) h+='<div class="gmapw"><div class="gmap" data-g="'+esc(m.gembed)+'">'+(GSEL[key]?gframe(m):'')+'</div></div>';
  h+='<ol class="mleg">'+m.markers.map(function(p){
    var firstNm=(p.lines&&p.lines[0]&&p.lines[0].x)||('Parada '+p.n);
    var au=applePlaceUrl(firstNm,p.lat,p.lon);
    return '<li><span class="apin'+(p.k==="start"?" apin-s":"")+'" style="background:'+(window.MCOL[p.k]||"#FF2D55")+'">'+p.n+'</span><span>'+p.lines.map(function(l){return (l.t?'<b>'+(d?hm(disp(d,{start:l.t}).s):l.t)+'</b> ':'')+esc(l.x);}).join(' · ')+' <a class="amini" href="'+esc(au)+'" target="_blank" rel="noopener">Apple Maps ›</a></span></li>';
  }).join("")+'</ol>';
  h+='<div class="applepanel">';
  if(m.apple&&m.apple.length){
    h+='<div class="apsec"><b>🚗 Rutas del día en Apple Maps</b><div class="mbtns">'+m.apple.map(function(a,i){
      return '<a class="abtn'+(i?' sec':'')+'" href="'+esc(a.url)+'" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg><span>'+esc(a.label)+'</span></a>';
    }).join("")+'</div></div>';
  }
  if(m.markers&&m.markers.length){
    h+='<div class="apsec"><b>📍 Lugares en Apple Maps</b><div class="apchips">'+m.markers.map(function(p){
      var nm=(p.lines&&p.lines[0]&&p.lines[0].x)||('Parada '+p.n);
      var au=applePlaceUrl(nm,p.lat,p.lon);
      return '<a class="apchip" href="'+esc(au)+'" target="_blank" rel="noopener"><span class="apn" style="background:'+(window.MCOL[p.k]||"#FF2D55")+'">'+p.n+'</span>'+esc(nm)+'</a>';
    }).join("")+'</div></div>';
  }
  h+='</div>';
  var gl=m.google||[];
  if(gl.length){
    h+='<div class="gbtns mbtns">'+gl.map(function(g){return '<div class="mrow"><div class="mlab">'+esc(g.label)+'</div><div class="mpair one"><a class="abtn gbtn" href="'+esc(g.url)+'" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#EA4335" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7z"/><circle cx="12" cy="9" r="2.6" fill="#fff"/></svg><span>Abrir en Google Maps</span></a></div></div>';}).join("")+'</div>';
  }
  if(m.gembed) h+='<p class="mcap gcap">'+esc(D.meta.gmap_note)+'</p>';
  h+='<p class="mcap">'+esc(D.meta.map_caption)+(key==="overview"?' '+esc(D.meta.map_caption_ov):'')+'</p></div>';
  return h;}
window.MCOL={hotel:"#5E5CE6",cena:"#FF9500",visita:"#FF2D55",cafe:"#A2845E",foto:"#0A9FD8",libre:"#30B455",traslado:"#636366",start:"#13233a"};

function drawSvgMap(el,spec,fmt){
  var ms=spec.markers||[];if(!ms.length)return;
  var routes=spec.routes||[];
  var minLat=90,maxLat=-90,minLon=180,maxLon=-180;
  function acc(lat,lon){if(lat<minLat)minLat=lat;if(lat>maxLat)maxLat=lat;if(lon<minLon)minLon=lon;if(lon>maxLon)maxLon=lon;}
  ms.forEach(function(p){acc(p.lat,p.lon);});
  routes.forEach(function(r){(r.geom_svg||r.geom||[]).forEach(function(c){acc(c[1],c[0]);});});
  var padLat=Math.max(0.01,(maxLat-minLat)*0.22),padLon=Math.max(0.01,(maxLon-minLon)*0.22);
  minLat-=padLat;maxLat+=padLat;minLon-=padLon;maxLon+=padLon;
  var W=640,H=320;
  function px(lon){return 30+((lon-minLon)/(maxLon-minLon||1))*(W-60);}
  function py(lat){return H-30-((lat-minLat)/(maxLat-minLat||1))*(H-60);}
  var svg='<svg viewBox="0 0 '+W+' '+H+'" class="svgmap" role="img" aria-label="Ruta por carretera">';
  svg+='<rect width="'+W+'" height="'+H+'" fill="#f2efe9"/>';
  routes.forEach(function(r){
    var g=r.geom_svg||r.geom||[]; if(g.length<2) return;
    var pts=g.map(function(c){return px(c[0]).toFixed(1)+','+py(c[1]).toFixed(1);}).join(' ');
    var flight=r.kind==="flight", sec=!!r.secondary;
    var col=flight?"#636366":(sec?"#7aa2d4":"#0A84FF");
    var dash=flight?' stroke-dasharray="7 6"':'';
    svg+='<polyline fill="none" stroke="'+col+'" stroke-width="'+(sec?2.6:3.6)+'" stroke-linecap="round" stroke-linejoin="round"'+dash+' points="'+pts+'"/>';
  });
  ms.forEach(function(p){
    var x=px(p.lon),y=py(p.lat),col=(window.MCOL[p.k]||"#FF2D55");
    svg+='<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="13" fill="'+col+'" stroke="#fff" stroke-width="2.5"/>';
    svg+='<text x="'+x.toFixed(1)+'" y="'+(y+4.5).toFixed(1)+'" text-anchor="middle" fill="#fff" font-size="12" font-weight="700" font-family="-apple-system,sans-serif">'+p.n+'</text>';
  });
  svg+='</svg><div class="svgnote">Vista esquemática (mapa en vivo cargando / sin WebGL). Toca cualquier enlace de Apple Maps abajo.</div>';
  el.innerHTML=svg;
}
window.TabMaps={create:function(el,spec,opts){
  opts=opts||{};var fmt=opts.fmt||function(t){return t;};
  var ms=spec.markers||[];
  function boundsFor(vi){
    var v=(spec.views&&spec.views[vi])||null;
    if(v&&v.b&&v.b.length===2) return [[v.b[0][1],v.b[0][0]],[v.b[1][1],v.b[1][0]]];
    if(!ms.length) return [[6,45],[16,50]];
    var a=90,b=-90,c=180,d=-180;
    function acc(lat,lon){if(lat<a)a=lat;if(lat>b)b=lat;if(lon<c)c=lon;if(lon>d)d=lon;}
    ms.forEach(function(p){acc(p.lat,p.lon);});
    (spec.routes||[]).forEach(function(r){(r.geom||r.geom_svg||[]).forEach(function(xy){acc(xy[1],xy[0]);});});
    return [[c-0.02,a-0.02],[d+0.02,b+0.02]];
  }
  if(!window.maplibregl){drawSvgMap(el,spec,fmt);return {map:{getContainer:function(){return el;},resize:function(){},remove:function(){el.innerHTML="";},cooperativeGestures:{disable:function(){},enable:function(){}}},view:function(){}};}
  try{
    var osmStyle={version:8,sources:{osm:{type:"raster",tiles:["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],tileSize:256,attribution:"© OpenStreetMap"}},layers:[{id:"osm",type:"raster",source:"osm"}]};
    var b0=boundsFor(opts.view||0);
    var map=new window.maplibregl.Map({container:el,style:osmStyle,bounds:b0,fitBoundsOptions:{padding:38,maxZoom:14},cooperativeGestures:true});
    map.addControl(new window.maplibregl.NavigationControl({showCompass:false}),"top-right");
    map.on("load",function(){
      var routes=spec.routes||[];
      var feats=routes.filter(function(r){return (r.geom||[]).length>1;}).map(function(r){
        return {type:"Feature",properties:{kind:r.kind||"drive",secondary:!!r.secondary},geometry:{type:"LineString",coordinates:r.geom}};
      });
      if(feats.length){
        map.addSource("legs",{type:"geojson",data:{type:"FeatureCollection",features:feats}});
        map.addLayer({id:"leg-drive",type:"line",source:"legs",filter:["!=",["get","kind"],"flight"],
          paint:{"line-color":["case",["==",["get","secondary"],true],"#7aa2d4","#0A84FF"],"line-width":["case",["==",["get","secondary"],true],3,4.5],"line-opacity":0.92}});
        map.addLayer({id:"leg-flight",type:"line",source:"legs",filter:["==",["get","kind"],"flight"],
          paint:{"line-color":"#636366","line-width":3,"line-opacity":0.8,"line-dasharray":[2,2]}});
      }
    });
    map.on("error",function(){if(!el.querySelector("canvas")){drawSvgMap(el,spec,fmt);}});
    ms.forEach(function(p){
      var pin=document.createElement("div");pin.className="apin"+(p.k==="start"?" apin-s":"");pin.style.background=(window.MCOL[p.k]||"#FF2D55");pin.textContent=String(p.n);
      var nm=(p.lines&&p.lines[0]&&p.lines[0].x)||("Parada "+p.n);
      var html='<div class="apop">'+p.lines.map(function(l){return '<div>'+(l.t?'<b>'+esc(fmt(l.t))+'</b> · ':'')+esc(l.x)+'</div>';}).join("")+'<a href="'+esc(applePlaceUrl(nm,p.lat,p.lon))+'" target="_blank" rel="noopener">Abrir en Apple Maps ›</a></div>';
      new window.maplibregl.Marker({element:pin}).setLngLat([p.lon,p.lat]).setPopup(new window.maplibregl.Popup({offset:14}).setHTML(html)).addTo(map);
    });
    return {map:map,view:function(vi){map.fitBounds(boundsFor(vi),{padding:38,maxZoom:14,duration:400});}};
  }catch(_e){drawSvgMap(el,spec,fmt);return {map:{getContainer:function(){return el;},resize:function(){},remove:function(){el.innerHTML="";},cooperativeGestures:{disable:function(){},enable:function(){}}},view:function(){}};}
}};
var LMAPS=[],LLOAD=0,LQ=[],IO=null,IO2=null;
function loadLeaflet(cb){if(window.maplibregl){LLOAD=2;return cb();}if(LLOAD===2)return cb();LQ.push(cb);if(LLOAD===1)return;LLOAD=1;
  var CDN=["https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/","https://unpkg.com/maplibre-gl@4.7.1/dist/"];
  var c=document.createElement("link");c.rel="stylesheet";c.href=CDN[0]+"maplibre-gl.css";c.onerror=function(){c.href=CDN[1]+"maplibre-gl.css";};document.head.appendChild(c);
  var sc=document.createElement("script");sc.src=CDN[0]+"maplibre-gl.js";
  var done=function(){LLOAD=2;var q=LQ;LQ=[];q.forEach(function(f){f();});};
  sc.onload=done;sc.onerror=function(){var sc2=document.createElement("script");sc2.src=CDN[1]+"maplibre-gl.js";sc2.onload=done;sc2.onerror=done;document.body.appendChild(sc2);};document.body.appendChild(sc);}
function dayOf(key){var r=null;D.days.forEach(function(x){if(x.date===key)r=x;});return r;}
function initMap(el){if(el._lm)return;var key=el.getAttribute("data-map"),spec=D.maps[key],d=dayOf(key);
  drawSvgMap(el,spec,function(t){return d?hm(disp(d,{start:t}).s):t;});
  loadLeaflet(function(){if(el._lm||!document.body.contains(el)||!window.maplibregl)return;el.innerHTML="";
    var card=el.closest(".mapcard"),pv=card&&card.querySelector('[data-mv][aria-pressed="true"]');
    el._lm=window.TabMaps.create(el,spec,{view:pv?+pv.getAttribute("data-mv"):0,fmt:function(t){return d?hm(disp(d,{start:t}).s):t;}});LMAPS.push(el._lm);});}
function initMaps(){LMAPS=LMAPS.filter(function(x){if(!document.body.contains(x.map.getContainer())){try{x.map.remove();}catch(_e){}return false;}return true;});
  var els=document.querySelectorAll(".lmap");if(!els.length)return;
  if(!("IntersectionObserver" in window)){Array.prototype.forEach.call(els,initMap);return;}
  if(!IO){IO=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting)initMap(e.target);});},{rootMargin:"300px 0px"});
    IO2=new IntersectionObserver(function(en){en.forEach(function(e){var el=e.target;if(!e.isIntersecting&&el._lm&&!el.closest(".mfull")){try{el._lm.map.remove();}catch(_e){}LMAPS=LMAPS.filter(function(x){return x!==el._lm;});el._lm=null;}});},{rootMargin:"1600px 0px"});}
  Array.prototype.forEach.call(els,function(el){IO.observe(el);IO2.observe(el);});}
document.addEventListener("click",function(e){
  var evb=e.target.closest&&e.target.closest("[data-evimg]");
  if(evb){e.stopPropagation();var fk=evb.getAttribute("data-evimg"),cap=evb.getAttribute("data-evcap")||"";
    var src=(D.evid_assets&&D.evid_assets[fk])||fk;
    var lb=document.getElementById("ev-lb");if(!lb){lb=document.createElement("div");lb.id="ev-lb";lb.className="evlb";lb.innerHTML='<div class="evlbi"><button type="button" class="evlbx" aria-label="Cerrar">✕</button><img alt="Captura completa"><div class="evlbc"></div></div>';document.body.appendChild(lb);lb.addEventListener("click",function(ev){if(ev.target===lb||ev.target.closest(".evlbx"))lb.classList.remove("open");});}
    lb.querySelector("img").src=src;lb.querySelector(".evlbc").textContent=cap;lb.classList.add("open");return;}
  var gp=e.target.closest&&e.target.closest("[data-mp]");
  if(gp){var gc=gp.closest(".mapcard"),gk=gc.getAttribute("data-mk"),on2=gp.getAttribute("data-mp")==="google";GSEL[gk]=on2;
    Array.prototype.forEach.call(gc.querySelectorAll("[data-mp]"),function(x){x.setAttribute("aria-pressed",String(x===gp));});
    gc.classList.toggle("gmode",on2);if(on2){var gm=gc.querySelector(".gmap");if(gm&&!gm.querySelector("iframe"))gm.innerHTML=gframe(D.maps[gk]);}
    else{var lm2=gc.querySelector(".lmap");if(lm2&&lm2._lm)lm2._lm.map.resize();else if(lm2)initMap(lm2);}return;}
  var b=e.target.closest&&e.target.closest("[data-mv]");
  if(b){var card=b.closest(".mapcard"),el=card.querySelector(".lmap"),i=+b.getAttribute("data-mv");
    Array.prototype.forEach.call(card.querySelectorAll("[data-mv]"),function(x){x.setAttribute("aria-pressed",String(x===b));});
    if(el._lm)el._lm.view(i);else{initMap(el);var t=setInterval(function(){if(el._lm){clearInterval(t);el._lm.view(i);}},100);setTimeout(function(){clearInterval(t);},8000);}return;}
  var f=e.target.closest&&e.target.closest(".mfs");
  if(f){var card2=f.closest(".mapcard"),el2=card2.querySelector(".lmap"),on=!card2.classList.contains("mfull");
    card2.classList.toggle("mfull",on);document.documentElement.classList.toggle("mlock",on);f.textContent=on?"✕":"⤢";f.setAttribute("aria-label",on?"Cerrar mapa":"Ampliar mapa");
    initMap(el2);var go=function(){if(!el2._lm)return setTimeout(go,100);var mp=el2._lm.map;mp.resize();if(on)mp.cooperativeGestures.disable();else mp.cooperativeGestures.enable();};go();}
});
function tripitCard(){var t=D.tripit,m=D.mail;
  var h='<div class="card"><h2>Reservas (TripIt + correo)</h2><p class="sub">TripIt leído en vivo '+esc(t.now)+'. Cruce del 22 nov (TripIt 15:00, correo 16:29 y tarjetas conciliadas). En La Cabane hay dos reservas activas (22 y 23); por ahora TripIt manda el 22.</p>';
  if(t.changes&&t.changes.length) h+='<ul class="recs">'+t.changes.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul>';
  if(t.missing) h+='<p class="sub"><b>No está en TripIt:</b> '+esc(t.missing)+'</p>';
  if(m){h+='<h2>Cruce con el correo</h2><p class="sub">'+esc(m.read)+'</p>';
    if(m.conflicts&&m.conflicts.length) h+='<ul class="warn">'+m.conflicts.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul>';
    if(m.changes&&m.changes.length) h+='<ul class="recs">'+m.changes.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul>';}
  return h+'</div>';}
function dayAlert(d){
  if(d.conflict) return d.conflict;
  if(d.ambig) return d.ambig;
  var ev=(d.events||[]).filter(function(e){return e.status==="conflicto"||e.status==="por_resolver"||(e.flag&&/duplicado|reconfirmar|sin respuesta|posiblemente activa/i.test(e.flag));});
  if(ev.length) return ev[0].flag||ev[0].title;
  return "";
}
function leanCard(d){
  var alert=dayAlert(d);
  var h='<article class="day lean" id="d-'+d.date+'"><h2>'+esc(d.label)+' · '+esc(d.city)+dayStatus(d)+'</h2>';
  if(alert) h+='<div class="lean-alert">⚠️ '+esc(alert)+'</div>';
  var hid=(d.photos&&d.photos[0])?photo(d.photos[0]):null;
  if(hid&&hid.ref&&hid.ref.img) h+='<img class="lean-hero" src="'+esc(hid.ref.img)+'" alt="'+esc(hid.subject||hid.spot||d.city)+'">';
  function row(t,title,note,map){
    return '<div class="lean-item"><div class="t">'+t+'</div><div><div class="ti">'+title+'</div>'+(note?'<div class="nt">'+note+'</div>':'')+(map?appleBtn(map):'')+'</div></div>';
  }
  var n=0;
  ["drive","drive2","drive3"].forEach(function(k){
    var r=d[k]; if(!r||!r.rec) return; n++;
    var label=(k==="drive2"?"Tarde: ":(k==="drive3"?"Noche: ":""))+esc(r.frm)+' → '+esc(r.to);
    h+=row(r.rec.dep,'🚗 '+label, r.km+' km · sale '+r.rec.dep+' · llega '+r.rec.arr+' · '+esc(r.total)+' con márgenes', r.map);
  });
  var evs=(d.events||[]).filter(function(e){return e.type==="hotel"&&/check-?in/i.test(e.title||"");});
  if(evs.length && d.lodging){
    var cin=null;
    ["drive","drive2","drive3"].forEach(function(k){if(d[k]&&d[k].checkin)cin=d[k].checkin;});
    var t=cin||evs[0].start||"";
    var place=(d.lodging||"").split("(")[0].trim();
    h+=row(t||'🛏','🛏 Check-in · '+esc(place), evs[0].notes?esc((evs[0].notes||"").split(".")[0]+"."):'', null);
    n++;
  }
  if(d.dinner){
    var t=(d.dinner.match(/\b(\d{1,2}:\d{2})\b/)||[])[1]||"";
    var ev=(d.events||[]).filter(function(e){return e.type==="cena";})[0];
    if(ev&&ev.start) t=ev.start;
    h+=row(t||'🍽','🍽 '+esc(d.dinner), ev&&ev.place?esc(ev.place):"", ev&&ev.map?ev.map:null);
    n++;
  }
  if(!n && (d.events||[]).length){
    (d.events||[]).slice(0,4).forEach(function(e){
      var tt=disp(d,e);
      h+=row(hm(tt.s), esc(e.title), e.place?esc(e.place):"", e.map||null);
    });
  }
  return h+'</article>';
}
function riskBadge(level){
  var L={alto:"Alto",medio:"Medio",bajo:"Bajo"};
  return '<span class="risk risk-'+(level||"medio")+'">'+(L[level]||esc(level))+'</span>';
}
function fmtAlt(n){var s=String(n);return (s.length>3?s.slice(0,-3)+" "+s.slice(-3):s)+" m";}
function hzLinks(links){
  if(!links||!links.length)return '';
  return '<div class="hz-links">'+links.map(function(l){
    return '<a href="'+esc(l.u)+'" target="_blank" rel="noopener">'+esc(l.t)+'</a>';
  }).join("")+'</div>';
}
function hzFacts(s){
  var h='<dl class="hz-dl">';
  if(s.segment) h+='<dt>Tramo</dt><dd>'+esc(s.segment)+'</dd>';
  if(s.alt_m!=null) h+='<dt>Altitud máx.</dt><dd>'+fmtAlt(s.alt_m)+(s.alt_note?' — '+esc(s.alt_note):'')+'</dd>';
  if(s.why) h+='<dt>Por qué es difícil</dt><dd>'+esc(s.why)+'</dd>';
  if(s.conditions) h+='<dt>Fin de diciembre / enero</dt><dd>'+esc(s.conditions)+'</dd>';
  if(s.legal) h+='<dt>Equipo de invierno</dt><dd>'+esc(s.legal)+'</dd>';
  if(s.tunnels) h+='<dt>Túneles, peajes, viñetas</dt><dd>'+esc(s.tunnels)+'</dd>';
  if(s.sunset) h+='<dt>Puesta de sol</dt><dd>'+esc(s.sunset)+(s.daylight?' · '+esc(s.daylight):'')+'</dd>';
  if(s.rec) h+='<dt>Qué hacer</dt><dd>'+esc(s.rec)+'</dd>';
  h+='</dl>'+hzLinks(s.links);
  return h;
}
function hazardsCompact(){
  var H=D.hazards; if(!H)return '';
  var top=(H.sectors||[]).filter(function(s){return s.top;}).sort(function(a,b){return a.rank-b.rank;});
  var h='<section class="card hz hz-ess" id="tramos-complicados"><h2>'+esc(H.title)+'</h2>';
  if(H.sixt) h+='<p class="hz-sixt">'+esc(H.sixt)+'</p>';
  h+='<ol class="hz-top">'+top.map(function(s){
    return '<li>'+riskBadge(s.risk)+' <span>'+esc(s.line)+'</span></li>';
  }).join("")+'</ol>';
  if(H.ess_note) h+='<p class="sub">'+esc(H.ess_note)+'</p>';
  return h+'</section>';
}
function hazardsFull(){
  var H=D.hazards; if(!H)return '';
  var secs=(H.sectors||[]).slice().sort(function(a,b){return a.rank-b.rank;});
  var h='<section class="card hz hz-full" id="tramos-complicados"><h2>'+esc(H.title)+'</h2>';
  if(H.intro) h+='<p class="sub">'+esc(H.intro)+'</p>';
  if(H.sixt) h+='<p class="hz-sixt">'+esc(H.sixt)+'</p>';
  secs.forEach(function(s){
    var head=riskBadge(s.risk)+' <b>'+esc(s.date_label+(s.km?(' · '+s.km+' km'):'')+' · '+s.title)+'</b>';
    if(s.risk==="bajo"){
      h+='<details class="hz-sec hz-'+s.risk+'"><summary>'+head+'</summary>'+hzFacts(s)+'</details>';
    } else {
      h+='<article class="hz-sec hz-'+s.risk+'"><h3>'+head+'</h3>'+hzFacts(s)+'</article>';
    }
  });
  return h+'</section>';
}
function hazardsSection(){
  if(!(S.sec==="chamonix"||S.sec==="tour")) return "";
  if(!D.hazards) return "";
  return S.dens==="esencial"?hazardsCompact():hazardsFull();
}
function esencialLean(){
  var T=D.travelers, h='';
  if(T){h+='<div class="card lean-who"><b>Quién viaja.</b> '+(S.sec==="chamonix"?esc(T.chamonix):esc(T.tour))+'</div>';}
  h+='<p class="ess-note">Vista esencial: hora, trayecto, hotel y cena. Cambia a Completo si quieres fotos, notas y alternativas.</p>';
  h+=hazardsSection();
  h+=routeMap()+days().map(leanCard).join("");
  return h;
}
function renderList(){document.getElementById("list").innerHTML=S.dens==="esencial"?esencialLean():(hazardsSection()+esencial()+days().map(dayCard).join(""));}
function renderChefs(){var c=D.chefs||[];
  var L={no:'No',sin:'Sin respuesta',rebote:'Rebotó',oferta:'Propuesta',pide:'Pide presupuesto',cerrado:'Cerrado'};
  var h='<div class="card"><h2>Nochebuena — 24 dic, raclette en el chalet</h2><p class="sub">'+esc(D.meta.chefs_note||'')+' Lectura de correo: '+esc(D.meta.chefs_read||'')+'.</p>'+
   '<table class="tbl chefs"><thead><tr><th>#</th><th>Chef / empresa</th><th>Contacto</th><th>Estado</th><th>Respondió</th><th>Nota</th></tr></thead><tbody>'+
   c.map(function(x){return '<tr class="st-'+x.status+'"><td data-l="#"><b>'+x.n+'</b></td><td data-l="Chef">'+esc(x.name)+'</td><td data-l="Contacto">'+esc(x.contact)+'</td><td data-l="Estado"><span class="cst '+x.status+'">'+(L[x.status]||esc(x.status))+'</span></td><td data-l="Respondió">'+esc(x.date)+'</td><td data-l="Nota">'+esc(x.note)+'</td></tr>';}).join('')+'</tbody></table></div>';
  document.getElementById("list").innerHTML=h;}
function pkey(n){return "itin112-pend-"+n;}
var GRP={ya:"🔴 Reservar / pagar YA",tour:"🟡 Tour / actividad por decidir",tramite:"🛣 Trámite de carretera",info:"ℹ️ Info"};
function grpChip(g){return g?'<span class="grp grp-'+g+'">'+GRP[g]+'</span>':"";}
function isDone(p){try{var v=localStorage.getItem(pkey(p.n));if(v==="1")return true;if(v==="0")return false;}catch(_e){}return !!p.done;}
function pItem(p){var dn=isDone(p);return '<li class="'+(dn?'done':'')+'" id="p-'+p.n+'"><label><input type="checkbox" data-n="'+p.n+'"'+(dn?' checked':'')+'><span class="num">'+p.n+'</span><span class="ptx">'+grpChip(p.grp)+'<br><b>'+esc(p.what)+'</b> '+badge(p.status)+'<br><small><b>Cuándo:</b> '+esc(p.when)+'</small><br><small><b>Por qué:</b> '+esc(p.why)+'</small>'+(p.detail?'<br><small>'+esc(p.detail)+'</small>':'')+'</span></label>'+
  (S.dens!=="esencial"&&p.alts&&p.alts.length?'<div class="alts"><div class="alth">Alternativas ('+p.alts.length+')</div>'+p.alts.map(function(a){return '<div class="alt" id="p-'+p.n+a.l+'"><div class="altt"><span class="altl">'+p.n+a.l+'</span> <b>'+esc(a.title)+'</b> '+badge(a.status)+'</div><small><b>Cuándo:</b> '+esc(a.when)+'</small><br><small>'+esc(a.why)+'</small>'+(a.detail?'<br><small>'+esc(a.detail)+'</small>':'')+'</div>';}).join('')+'</div>':'')+'</li>';}

function fmtNum(n){n=Number(n);var s=Math.abs(n).toFixed(2),p=s.split(".");p[0]=p[0].replace(/\B(?=(\d{3})+(?!\d))/g,".");return (n<0?"-":"")+p[0]+","+p[1];}
function fmtMXN(n){return n==null||n===""?"—":"MXN "+fmtNum(n);}
function fmtRange(lo,hi){if(lo==null||lo==="")return "—";if(hi==null||Number(hi)===Number(lo))return fmtMXN(lo);return "MXN "+fmtNum(lo)+" – "+fmtNum(hi);}
function budgeBadge(st){var L={pagado:"Pagado",pendiente:"Pendiente",por_consumo:"Por consumo",incluido:"Incluido",propuesta:"Propuesta"};return '<span class="badge bdg-'+st+'">'+(L[st]||esc(st))+'</span>';}
function itemOrig(it){
  if(it.orig_note) return esc(it.orig_note);
  if(it.pay_ccy==="MXN"&&it.paid!=null) return "MXN "+fmtNum(it.paid);
  if(it.pay_ccy==="USD"&&it.paid!=null) return "US$"+fmtNum(it.paid);
  return "—";
}
function itemMXN(it){
  if(it.status==="por_consumo") return "por consumo";
  if(it.status==="propuesta") return "sin precio (propuesta)";
  if(it.status==="incluido") return "incluido";
  return fmtRange(it.mxn_lo,it.mxn_hi);
}
function budgetTotalsCard(B){
  var T=B.totals||{};
  var h='<div class="card budg-tot"><h2>Presupuesto del viaje</h2><p class="sub">'+esc(B.intro||'')+'</p>';
  h+='<div class="btotals"><div class="btot pag"><small>Pagado</small><b>'+fmtMXN(T.paid_mxn)+'</b></div>';
  h+='<div class="btot pend"><small>Pendiente</small><b>'+fmtRange(T.pending_lo,T.pending_hi)+'</b></div>';
  h+='<div class="btot all"><small>Total</small><b>'+fmtRange(T.total_lo,T.total_hi)+'</b></div></div>';
  h+='<p class="sub">El rango sale de Basile (€560–€600) y de la habitación de Hiša Franko (€230–€250).</p></div>';
  return h;
}
function fmtRangeBare(lo,hi){if(lo==null||lo==="")return "—";if(hi==null||Number(hi)===Number(lo))return fmtNum(lo);return fmtNum(lo)+" – "+fmtNum(hi);}
function budgetTypeTable(B){
  var L=B.types||[];
  var h='<div class="card"><h2>Por tipo de gasto</h2><div class="scroll"><table class="tbl budg"><thead><tr><th>Tipo</th><th>Pagado (MXN)</th><th>Pendiente (MXN)</th><th>Total (MXN)</th></tr></thead><tbody>';
  L.forEach(function(t){h+='<tr><td>'+esc(t.type)+'</td><td>'+fmtNum(t.paid)+'</td><td>'+fmtRangeBare(t.pending_lo,t.pending_hi)+'</td><td><b>'+fmtRangeBare(t.total_lo,t.total_hi)+'</b></td></tr>';});
  var T=B.totals||{};
  h+='<tr class="sum"><td><b>Suma</b></td><td><b>'+fmtNum(T.paid_mxn)+'</b></td><td><b>'+fmtRangeBare(T.pending_lo,T.pending_hi)+'</b></td><td><b>'+fmtRangeBare(T.total_lo,T.total_hi)+'</b></td></tr>';
  return h+'</tbody></table></div></div>';
}
function budgetFx(B){
  var f=B.fx||{};
  return '<div class="card"><h2>Tipo de cambio</h2><p class="sub">'+esc(f.as_of||'')+'</p><div class="scroll"><table class="tbl"><thead><tr><th>Moneda</th><th>Tipo a MXN</th><th>Fuente</th></tr></thead><tbody>'+
    '<tr><td>1 USD</td><td><b>19,0228</b></td><td>'+esc(f.usd_source||'')+(f.usd_url?' · <a href="'+esc(f.usd_url)+'" target="_blank" rel="noopener">Banxico ›</a>':'')+'</td></tr>'+
    '<tr><td>1 EUR</td><td><b>20,9547</b></td><td>'+esc(f.eur_source||'')+(f.eur_url?' · <a href="'+esc(f.eur_url)+'" target="_blank" rel="noopener">Frankfurter / BCE ›</a>':'')+'</td></tr>'+
    '<tr><td>1 PLN</td><td><b>'+esc(f.pln_mxn_display||'')+'</b></td><td>'+esc(f.cross_note||'')+'</td></tr>'+
    '<tr><td>1 CZK</td><td><b>'+esc(f.czk_mxn_display||'')+'</b></td><td>Cruce BCE del 20 nov (EUR/CZK 24,469).</td></tr>'+
    '<tr><td>1 HUF</td><td><b>'+esc(f.huf_mxn_display||'')+'</b></td><td>Cruce BCE del 20 nov (EUR/HUF 373,55). El hotel de Budapest se convierte desde el euro, porque no tenemos el importe en forintos.</td></tr>'+
    '</tbody></table></div></div>';
}
function budgetDays(B){
  var items=B.items||[], days=B.days||[], by={};
  items.forEach(function(it){(by[it.date]||(by[it.date]=[])).push(it);});
  var h='';
  days.forEach(function(d){
    var rows=by[d.date]||[];
    h+='<div class="card budg-day"><h2>'+esc(d.label)+' · '+esc(d.city)+'</h2>';
    h+='<p class="sub">Pagado '+fmtMXN(d.paid)+' · pendiente '+fmtRange(d.pending_lo,d.pending_hi)+' · total <b style="display:inline">'+fmtRange(d.total_lo,d.total_hi)+'</b></p>';
    h+='<div class="scroll"><table class="tbl"><thead><tr><th>Tipo</th><th>Concepto</th><th>Estado</th><th>Original</th><th>En MXN</th></tr></thead><tbody>';
    rows.forEach(function(it){
      h+='<tr><td>'+esc(it.type)+'</td><td>'+esc(it.what)+(it.note?'<div class="nt">'+esc(it.note)+'</div>':'')+(it.when?'<div class="nt">'+esc(it.when)+'</div>':'')+'</td><td>'+budgeBadge(it.status)+'</td><td>'+itemOrig(it)+'</td><td><b>'+itemMXN(it)+'</b></td></tr>';
    });
    h+='</tbody></table></div></div>';
  });
  return h;
}
function budgetExtra(B){
  var h='';
  if(B.optional&&B.optional.length){
    h+='<div class="card"><h2>Opcional (no entra en los totales)</h2><div class="scroll"><table class="tbl"><thead><tr><th>Día</th><th>Concepto</th><th>Original</th><th>En MXN</th></tr></thead><tbody>';
    B.optional.forEach(function(it){h+='<tr><td>'+esc(it.label)+'</td><td>'+esc(it.what)+(it.note?'<div class="nt">'+esc(it.note)+'</div>':'')+'</td><td>'+esc(it.orig_note||'')+'</td><td>'+fmtRange(it.mxn_lo,it.mxn_hi)+'</td></tr>';});
    h+='</tbody></table></div></div>';
  }
  if(B.excluded&&B.excluded.length){
    h+='<div class="card"><h2>Fuera de este viaje</h2><ul class="recs">'+B.excluded.map(function(x){return '<li><b>'+esc(x.what)+'.</b> '+esc(x.note)+'</li>';}).join("")+'</ul></div>';
  }
  if(B.notes&&B.notes.length){
    h+='<div class="card"><h2>Notas</h2><ul class="recs">'+B.notes.map(function(x){return '<li>'+esc(x)+'</li>';}).join("")+'</ul></div>';
  }
  return h;
}
function renderBudget(){var B=D.presupuesto||{};
  var h=budgetTotalsCard(B)+budgetTypeTable(B);
  if(S.dens!=="esencial") h+=budgetFx(B)+budgetDays(B)+budgetExtra(B);
  else h+='<p class="sub ess-note">En Esencial ves los totales. Cambia a Completo para el desglose día por día, los tipos de cambio y las partidas por consumo.</p>';
  document.getElementById("list").innerHTML=h;}

function renderPend(){var P=D.pend;var h='<div class="card"><h2>Pendientes por reservar</h2><p class="sub">'+esc(P.intro)+'</p></div>';
  var all=[];P.generales.forEach(function(p){all.push({p:p,w:'General'});});P.dias.forEach(function(d){d.items.forEach(function(p){all.push({p:p,w:d.label});});});
  function quick(g,t){var L=all.filter(function(x){return x.p.grp===g;});return '<div class="qcol q-'+g+'"><h3>'+t+' ('+L.length+')</h3><ol class="qlist">'+L.map(function(x){return '<li><a href="#p-'+x.p.n+'"><b>#'+x.p.n+'</b> '+esc(x.w)+': '+esc(x.p.what)+'</a></li>';}).join('')+'</ol></div>';}
  h+='<div class="card split" id="pend-split"><h2>Separado: lo que va YA vs. tours por decidir</h2><div class="qgrid">'+quick('ya','🔴 Reservar / pagar YA')+quick('tour','🟡 Tours y actividades por decidir')+'</div><p class="sub" style="font-size:12px">Trámites de carretera (viñetas, Cracovia) van al final, con su fecha.</p></div>';
  h+='<div class="card" id="pend-gen"><h2>Generales</h2><p class="sub">'+esc(P.gen_note)+'</p><ol class="chk">'+P.generales.map(pItem).join('')+'</ol></div>';
  h+='<div class="card" id="pend-dias"><h2>Por día: qué falta reservar</h2><p class="sub">'+esc(P.days_note)+'</p>'+P.dias.map(function(d){var day=D.days.filter(function(x){return x.date===d.date;})[0];var ready=!d.items.length;var st=dayStatus(day||d);var msg=(day&&day.day_status==="listo")?(P.listo_note||"Listo · sin pendientes."):(P.ready_note||P.nothing);return '<div class="pday" id="pd-'+d.date+'"><h3>'+esc(d.label)+' · '+esc(d.city)+st+'</h3><p class="bk">✅ <b>Ya reservado:</b> '+esc(d.booked)+'</p>'+(ready?'<p class="sub nada">'+esc(msg)+'</p>':'<ol class="chk">'+d.items.map(pItem).join('')+'</ol>')+'</div>';}).join('')+'</div>';
  h+='<div class="card" id="tramites"><h2>Trámites de carretera</h2><p class="sub">Cada uno con la fecha en que hace falta y cuándo conviene hacerlo. '+esc(D.tramites_note)+'</p><ol class="chk tr">'+D.tramites.map(function(t){var dn=isDone({n:'t'+t.n});return '<li class="'+(dn?'done':'')+'"><label><input type="checkbox" data-n="t'+t.n+'"'+(dn?' checked':'')+'><span class="num">'+t.n+'</span><span class="ptx"><b class="w">'+esc(t.what)+'</b><br><small><b>Dónde:</b> '+esc(t.where)+'</small><br><small><b>Hace falta:</b> '+esc(t.need)+' · <b>Hacerlo:</b> '+esc(t.do)+'</small><br><small>'+esc(t.how)+'</small></span></label></li>';}).join('')+'</ol></div>';
  document.getElementById("list").innerHTML=h;
  Array.prototype.forEach.call(document.querySelectorAll('.chk input'),function(cb){cb.addEventListener('change',function(){try{localStorage.setItem(pkey(cb.getAttribute('data-n')),cb.checked?"1":"0");}catch(_e){}cb.closest('li').className=cb.checked?'done':'';});});}
var H1=24,PX=46;
function fitCols(){var wrap=document.getElementById("calwrap");if(!wrap)return;var av=wrap.clientWidth-44,cols=wrap.querySelectorAll(".col");if(!cols.length)return;
  var n=av>=1500?8:av>=1250?7:av>=1050?6:av>=880?5:av>=700?4:av>=520?3:(DEV==="iphone"||av<420?1:2);n=Math.min(n,cols.length);
  var w=Math.floor(av/n);wrap.style.setProperty("--colw",w+"px");wrap.setAttribute("data-ncols",n);
  var cn=document.getElementById("calcount");if(cn)cn.textContent=n+(n===1?" día":" días")+" a la vez en esta pantalla";}
window.addEventListener("resize",function(){if(S.view==="cal")fitCols();});
function renderCal(){
  var ds=days(),el=document.getElementById("cal"),byDate={};
  D.days.forEach(function(d){byDate[d.date]=d;});
  /* display segments, split at displayed midnight */
  var segs=[],colset={};
  ds.forEach(function(d){colset[dnum(d.date)]=1;d.events.forEach(function(e){
    var t=disp(d,e),s=t.s,en=Math.max(t.e,t.s);
    if(en===s){segs.push({e:e,d:d,day:Math.floor(s/1440),s:s%1440,en:s%1440,cont:false,t:t});return;}
    var first=true;while(s<en){var day=Math.floor(s/1440),cut=Math.min(en,(day+1)*1440);
      segs.push({e:e,d:d,day:day,s:s-day*1440,en:cut-day*1440,cont:!first,t:t});first=false;s=cut;}
  });});
  var H0=5;
  if(S.tz==="mx") segs.forEach(function(x){H0=Math.min(H0,Math.floor(x.s/60));});
  else segs=segs.filter(function(x){return x.en>H0*60||(x.en===x.s&&x.s>=H0*60);});
  colset={};segs.forEach(function(x){colset[x.day]=1;});
  var cols=Object.keys(colset).map(Number).sort(function(a,b){return a-b;});
  var nav='<div class="calnav" role="group" aria-label="Ir al día">'+cols.map(function(n,i){return '<button type="button" data-i="'+i+'" aria-pressed="'+(i===0)+'">'+esc(dlabel(n))+'</button>';}).join("")+'</div>';
  var key='<div class="calkey"><span><i class="k-g-gratis"></i>🟢 Gratis / sin reserva</span><span><i class="k-g-ok"></i>🔵 Reservado</span><span><i class="k-g-pend"></i>🟠 Reserva pendiente</span><span class="ktip">Toca un bloque para ver todo</span></div>';
  var hgt=(H1-H0)*PX, ax='<div class="axis"><div class="colh"></div><div class="grid" style="height:'+hgt+'px">';
  for(var h=H0;h<=H1;h++) ax+='<div class="hr" style="top:'+((h-H0)*PX)+'px"></div><div class="hl'+(h===H0?' first':'')+'" style="top:'+((h-H0)*PX)+'px">'+(h<10?"0":"")+h+':00</div>';
  ax+='</div></div>';
  var html=cols.map(function(n){
    var ds_=dstr(n),dd=byDate[ds_],inSec=dd&&dd.section===S.sec;
    var sub=inSec?dd.city:(dd?dd.city+' (otro tramo)':'en vuelo');
    var g='<div class="col" id="c-'+ds_+'"><div class="colh'+(inSec?'':' extra')+'">'+esc(dlabel(n))+'<small>'+esc(sub)+'</small></div><div class="grid" style="height:'+hgt+'px">';
    for(var h=H0;h<=H1;h++) g+='<div class="hr" style="top:'+((h-H0)*PX)+'px"></div>';
    if(dd&&dd.sun){var o=OFF[S.tz],a=mins(dd.sun.sunrise)+o,b=mins(dd.sun.sunset)+o;a=Math.max(a,H0*60);if(b>a)g+='<div class="sunband" style="top:'+((a-H0*60)*PX/60)+'px;height:'+((b-a)*PX/60)+'px" title="luz de día en '+esc(dd.sun.city)+'"></div>';}
    var evs=segs.filter(function(x){return x.day===n;}).map(function(x){var s0=Math.max(x.s,H0*60);return {x:x,e:x.e,s:s0,en:Math.min(Math.max(x.en,s0+20),H1*60)};}).sort(function(a,b){return a.s-b.s;});
    var lanesEnd=[];evs.forEach(function(x){var l=0;while(lanesEnd[l]!=null&&lanesEnd[l]>x.s)l++;lanesEnd[l]=x.en;x.l=l;});
    evs.forEach(function(x){var n2=1;evs.forEach(function(y){if(y.s<x.en&&x.s<y.en)n2=Math.max(n2,y.l+1);});x.n=n2;});
    evs.forEach(function(x){var e=x.e,sg=x.x,top=(x.s-H0*60)*PX/60, ht=Math.max((x.en-x.s)*PX/60-2,18);
      var w=100/x.n, st='top:'+top+'px;height:'+ht+'px;'+(x.n>1?'left:calc('+(w*x.l)+'% + 3px);right:auto;width:calc('+w+'% - 6px);':'');
      var lab=sg.cont?'<b>↳</b><span class="tzd">desde '+hm(sg.t.s)+' '+dshort(Math.floor(sg.t.s/1440))+'</span>':'<b>'+hm(sg.t.s)+'</b>';
      var both=absOf(sg.d,e),cet=hm(both.s)+'–'+hm(both.e)+' CET',mx=hm(both.s-420)+'–'+hm(both.e-420)+' CDMX';
      var eid=sg.d.date+'_'+sg.d.events.indexOf(e);EV[eid]={d:sg.d,e:e};
      g+='<div class="blk '+e.type+' g-'+(e.bk||'gratis')+(e.optional?' opt':'')+(ht<30?' short':'')+'" data-ev="'+eid+'" role="button" tabindex="0" style="'+st+'" title="'+esc(cet+' · '+mx+' · '+e.title)+'">'+lab+esc(e.title)+(e.status?' · '+STAT[e.status]:'')+(e.type==="coche"&&ht>40&&e.notes&&!sg.cont?'<br><span style="color:#27415f">'+esc(e.notes)+'</span>':'')+'</div>';
    });
    return g+'</div></div>';
  }).join("");
  el.innerHTML=nav+key+'<div class="calwrap" id="calwrap">'+ax+html+'</div><p class="sub" style="font-size:12px;margin-top:6px"><b id="calcount"></b>. Desliza de lado para cambiar de día. Franja amarilla = luz de día. '+(S.tz==="cet"?'Todas las horas en hora local de Europa (CET, UTC+1).'+(S.sec==="chamonix"?' El AM 37 sale dom 20 dic a las 17:00 hora CDMX = 00:00 CET del lun 21, por eso aparece en el 21.':''):'Todas las horas en hora CDMX/Monterrey (UTC−6) = CET −7 h.')+'</p>';
  var wrap=document.getElementById("calwrap");
  wrap.scrollTop=0;fitCols();
  Array.prototype.forEach.call(el.querySelectorAll(".calnav button"),function(b){b.addEventListener("click",function(){
    var c=wrap.querySelectorAll(".col")[+b.getAttribute("data-i")]; wrap.scrollTo({left:c.offsetLeft-44,behavior:"smooth"});
    Array.prototype.forEach.call(el.querySelectorAll(".calnav button"),function(x){x.setAttribute("aria-pressed",String(x===b));});
  });});
}
function drvRow(lbl,r){return '<tr><td>'+esc(lbl)+'</td><td>'+esc(r.frm)+' → '+esc(r.to)+'</td><td>'+esc(r.raw)+'<br><small>'+r.km+' km</small></td><td>'+esc(r.p20)+'</td><td>'+r.rest+'</td><td>'+r.park+'</td><td><b>'+esc(r.total)+'</b></td><td>'+r.rec.dep+' → '+r.rec.arr+(r.alt06?'<br><small>06:00 → '+r.alt06.arr+'</small>':'')+'</td><td>'+(r.rec.daylight_min>0&&r.rec.daylight_min<600?esc(r.rec.daylight):'—')+(r.alt06&&r.alt06.daylight_min>0?'<br><small>'+esc(r.alt06.daylight)+'</small>':'')+'</td></tr>';}
function renderExtra(){
  var h='';
  if(S.sec==="chefs"||S.sec==="pend"||S.sec==="presupuesto"){document.getElementById("extra").innerHTML='';return;}
  if(S.dens==="esencial"){document.getElementById("extra").innerHTML=(S.view==="cal"?hazardsSection():'');return;}
  if(S.view==="cal") h+=hazardsSection();
  var rows=days().filter(function(d){return d.drive;});
  h+='<div class="card"><h2>'+(S.sec==="tour"?'Trayectos en coche':'Trayectos en coche (Chamonix)')+' — tiempo previsto con márgenes</h2><div class="scroll"><table class="tbl"><thead><tr><th>Día</th><th>Tramo</th><th>Ruta</th><th>+20 %</th><th>Desc.</th><th>Estac.</th><th>Total</th><th>Salida → llegada</th><th>Luz al llegar</th></tr></thead><tbody>'+
   rows.map(function(d){var x=drvRow(d.label,d.drive);if(d.drive2)x+=drvRow('',d.drive2);if(d.drive3)x+=drvRow('',d.drive3);return x;}).join('')+
   '</tbody></table></div><p class="sub" style="font-size:12px">El tiempo previsto toma el mayor entre Apple Maps y OSRM (22 nov 2026), más márgenes: +20 % redondeado a 5 min, + 15 min de descanso por cada 2 h completas de manejo ajustado, + 15 min para estacionar. OSRM no incluye nieve, tráfico ni esperas en frontera o viñeta; por eso se usa el tiempo más conservador. Luz = minutos entre la llegada y la puesta del sol en destino. Abajo, lo que pasa si sales a las 06:00 (lo más temprano posible).</p></div>';
  if(S.sec==="tour") h+='<div class="card"><h2>Carretera en invierno</h2><p class="sub">Viñetas y registro de Cracovia con fechas: pestaña Pendientes → Trámites de carretera.</p><div class="scroll"><table class="tbl"><thead><tr><th>País</th><th>Fechas</th><th>Llantas de invierno</th></tr></thead><tbody>'+D.road.tyres.map(function(r){return '<tr><td>'+esc(r[0])+'</td><td>'+esc(r[1])+'</td><td>'+esc(r[2])+'</td></tr>';}).join('')+'</tbody></table></div><p class="sub" style="font-size:12px">Fuente: '+esc(D.road.tyres_src)+'</p><ul class="recs">'+D.road.notes.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul></div>';
  var ph=D.photos.filter(function(p){return p.section===S.sec;});
  h+='<div class="card"><h2>Resumen de fotos para PhotoPills</h2><p class="sub">Toca el número para ver la ficha completa con la foto de referencia.</p><div class="scroll"><table class="tbl"><thead><tr><th>#</th><th>Fecha · sesión (CET)</th><th>Lugar (GPS)</th><th>Sol alt / az</th><th>Luna alt / az</th><th>Apuntar</th></tr></thead><tbody>'+
   ph.map(function(p){return '<tr><td><a href="#foto-'+p.id+'">'+p.id+'</a></td><td>'+p.date.slice(8)+'/'+p.date.slice(5,7)+' · '+(p.window||p.time)+'<br><small>dorada '+p.sun_tbl.golden_pm+' · azul '+p.sun_tbl.blue_pm+'</small></td><td>'+esc(p.spot)+'<br>'+p.lat.toFixed(6)+', '+p.lon.toFixed(6)+' · '+p.elev_m+' m</td><td>'+deg(p.sun_alt)+' / '+deg(p.sun_az)+'</td><td>'+deg(p.moon_alt)+' / '+deg(p.moon_az)+'</td><td>'+(p.bearing!=null?p.bearing+'°':'—')+'</td></tr>';}).join('')+
   '</tbody></table></div><p class="sub" style="font-size:12px">Sol y luna: Skyfield + efemérides JPL DE421 (refracción incluida). Relieve: modelo de superficie Copernicus GLO-30 (30 m) muestreado cada 0,25–0,5° de azimut hasta 40 km (montaña) o 15 km (ciudad), con curvatura terrestre y refracción. Elevación del punto según el mismo modelo. Hora dorada = sol +6° a la puesta; hora azul = −4° a −6°. Agujas muy finas (Dru, Aiguille du Midi) quedan algo bajas en un modelo de 30 m: usé las alturas oficiales de las cumbres.</p></div>';
  document.getElementById("extra").innerHTML=h;
}

function drvFor(d,e){var c=[d.drive,d.drive2,d.drive3].filter(Boolean);for(var i=0;i<c.length;i++){if(c[i].rec&&c[i].rec.dep===e.start)return c[i];}return null;}
function actFor(d,e){var r=null;(d.acts||[]).forEach(function(a){var x=a.title.toLowerCase().slice(0,18),y=e.title.toLowerCase();if(!r&&(y.indexOf(x)>=0||x.indexOf(y.slice(0,18))>=0))r=a;});return r;}
function llOf(u){var m=/ll=([-\d.]+),([-\d.]+)/.exec(u||"");return m?[m[1],m[2]]:null;}
function durTxt(a){var m=a.e-a.s;if(m<=0)return '';var h=Math.floor(m/60),x=m%60;return (h?h+' h ':'')+(x?(x<10&&h?'0':'')+x+' min':'');}
function modalHtml(d,e){var a=absOf(d,e),dt=durTxt(a);
  var h='<p class="mday">'+esc(d.label)+' · '+esc(d.city)+'</p><h2 id="mtitle">'+esc(e.title)+'</h2><div class="mchips"><span class="ty">'+TYPE[e.type]+'</span> '+badge(e.status)+' '+bkChip(e.bk)+(e.optional?' <span class="bkc">Opcional</span>':'')+'</div>';
  h+='<dl class="kv"><dt>Hora local (CET)</dt><dd><b>'+hm(a.s)+(e.end?'–'+hm(a.e):'')+'</b>'+(dt?' · '+dt:'')+'</dd><dt>Hora CDMX</dt><dd>'+hm(a.s-420)+(e.end?'–'+hm(a.e-420):'')+'</dd>';
  if(e.place) h+='<dt>Lugar</dt><dd>'+esc(e.place)+'</dd>';
  var c=llOf(e.map);if(c) h+='<dt>GPS</dt><dd>'+c[0]+', '+c[1]+'</dd>';
  if(e.type==="cena"&&d.dinner) h+='<dt>Cena del día</dt><dd>'+esc(d.dinner)+'</dd>';
  if(e.type==="hotel"&&d.lodging) h+='<dt>Hospedaje</dt><dd>'+(d.lod_status?badge(d.lod_status)+' ':'')+esc(d.lodging)+'</dd>';
  h+='</dl>';
  if(e.flag) h+='<p class="mailflag big">'+esc(e.flag)+'</p>';
  if(e.notes) h+='<p class="mnotes">'+esc(e.notes)+'</p>';
  h+=evidHtml(e,true);
  var dr=e.type==="coche"?drvFor(d,e):null; if(dr) h+=driveBox(dr);
  var ac=actFor(d,e); if(ac) h+='<div class="acts">'+actsHtml({acts:[ac]}).replace(/^<h3>[^<]*<\/h3><div class="acts">/,'').replace(/<\/div>$/,'')+'</div>';
  if(e.pid){var p=photo(e.pid);if(p)h+=photoCard(p,true);}
  h+='<div class="mlinks">'+(e.map?'<a class="abtn" href="'+esc(e.map)+'" target="_blank" rel="noopener"><span>'+(e.type==="coche"?'Ruta en Apple Maps':'Abrir en Apple Maps')+'</span></a>':'')+
    (c?'<a class="abtn gbtn" href="https://www.google.com/maps/search/?api=1&query='+c[0]+','+c[1]+'" target="_blank" rel="noopener"><span>Abrir en Google Maps</span></a>':'')+'</div>';
  return h;}
function photoModalHtml(p){var d=null;D.days.forEach(function(x){if(x.date===p.date)d=x;});return '<p class="mday">'+(d?esc(d.label)+' · '+esc(d.city):esc(p.date))+'</p>'+photoCard(p,true);}
var MOD=null,LASTF=null;
function ensureModal(){if(MOD)return MOD;MOD=document.createElement("div");MOD.className="modal";MOD.hidden=true;MOD.innerHTML='<div class="mback" data-mclose="1"></div><div class="msheet" role="dialog" aria-modal="true" aria-labelledby="mtitle"><button type="button" class="mclose" data-mclose="1" aria-label="Cerrar">✕</button><div class="mbody"></div></div>';document.body.appendChild(MOD);return MOD;}
function openModal(html){var m=ensureModal();LASTF=document.activeElement;m.querySelector(".mbody").innerHTML=html;m.hidden=false;document.documentElement.classList.add("mlock");m.querySelector(".msheet").scrollTop=0;setTimeout(function(){m.querySelector(".mclose").focus();},30);}
function closeModal(){if(!MOD||MOD.hidden)return;MOD.hidden=true;document.documentElement.classList.remove("mlock");if(LASTF&&LASTF.focus)try{LASTF.focus();}catch(_e){}}
window.TabOpen=function(id){var x=EV[id];if(x)openModal(modalHtml(x.d,x.e));};
document.addEventListener("click",function(ev){var t=ev.target;
  if(t.closest&&t.closest("[data-mclose]")){closeModal();return;}
  if(t.closest&&t.closest("a,input,label,button,summary"))return;
  var b=t.closest&&t.closest("[data-ev]");if(b){var x=EV[b.getAttribute("data-ev")];if(x){openModal(modalHtml(x.d,x.e));return;}}
  var ph=t.closest&&t.closest(".photo[data-pid]:not(.full)");if(ph){var p=photo(ph.getAttribute("data-pid"));if(p)openModal(photoModalHtml(p));}
});
document.addEventListener("keydown",function(ev){if(ev.key==="Escape")closeModal();if((ev.key==="Enter"||ev.key===" ")&&ev.target&&ev.target.getAttribute&&ev.target.getAttribute("data-ev")){ev.preventDefault();window.TabOpen(ev.target.getAttribute("data-ev"));}});
function render(){
  document.body.classList.toggle("mode-esencial", S.dens==="esencial");
  document.body.classList.toggle("mode-completo", S.dens==="completo");
  sel("data-dens", S.dens);
  var isDay=(S.sec==="chamonix"||S.sec==="tour");
  document.getElementById("vseg").hidden=!isDay; document.getElementById("tzbar").hidden=!isDay; document.getElementById("legend").hidden=(S.sec==="chefs"||S.sec==="presupuesto"||S.dens==="esencial");
  document.getElementById("list").hidden=isDay&&S.view!=="list"; document.getElementById("cal").hidden=!(isDay&&S.view==="cal");
  document.getElementById("tzlabel").innerHTML=tzLabel();
  Array.prototype.forEach.call(document.querySelectorAll("[data-tz]"),function(b){b.setAttribute("aria-pressed",String(b.getAttribute("data-tz")===S.tz));});
  if(S.sec==="chefs") renderChefs(); else if(S.sec==="pend") renderPend(); else if(S.sec==="presupuesto") renderBudget(); else if(S.view==="list") renderList(); else renderCal();
  renderExtra();
  initMaps();
}
function sel(attr,val){Array.prototype.forEach.call(document.querySelectorAll("["+attr+"]"),function(b){b.setAttribute("aria-selected",String(b.getAttribute(attr)===val));});}
Array.prototype.forEach.call(document.querySelectorAll("[data-sec]"),function(b){b.addEventListener("click",function(){S.sec=b.getAttribute("data-sec");sel("data-sec",S.sec);try{history.replaceState(null,"","#"+(S.sec==="pend"?"pendientes":S.sec));}catch(_e){}render();window.scrollTo(0,0);});});
Array.prototype.forEach.call(document.querySelectorAll("[data-view]"),function(b){b.addEventListener("click",function(){S.view=b.getAttribute("data-view");sel("data-view",S.view);render();});});
Array.prototype.forEach.call(document.querySelectorAll("[data-tz]"),function(b){b.addEventListener("click",function(){S.tz=b.getAttribute("data-tz");try{localStorage.setItem("itin-tz",S.tz);}catch(_e){}var y=window.scrollY;render();window.scrollTo(0,y);});});
Array.prototype.forEach.call(document.querySelectorAll("[data-dens]"),function(b){b.addEventListener("click",function(){S.dens=b.getAttribute("data-dens");try{localStorage.setItem("itin-dens",S.dens);}catch(_e){}var y=window.scrollY;render();window.scrollTo(0,y);});});
document.getElementById("upd").textContent=(D.meta.version||"v11.1")+" · actualizado "+D.meta.updated+" · TripIt "+D.meta.tripit_read;
document.getElementById("foot").innerHTML='<p class="devl">Vista optimizada para: <b>'+DEVL[DEV]+'</b> (detectado automáticamente). '+esc((D.meta&&D.meta.share_note)||"Este es un archivo HTML para compartir con Mariane (AirDrop o WhatsApp).")+'</p><p><b>Fuentes</b></p><ul>'+D.sources.map(function(s){return '<li>'+esc(s.t)+(s.w?' — '+esc(s.w):'')+(s.u?' · <a href="'+esc(s.u)+'" target="_blank" rel="noopener">'+esc(s.u)+'</a>':'')+'</li>';}).join("")+'</ul><p>Solo lectura: nada se reservó ni se cambió para hacer esta página. Los mapas en vivo (MapLibre / Google) necesitan internet; el resto funciona sin conexión.</p>';
var hs=(location.hash||"").replace("#","");if(hs==="pendientes")hs="pend";if(hs==="tour"||hs==="chamonix"||hs==="chefs"||hs==="pend"||hs==="presupuesto"){S.sec=hs;sel("data-sec",S.sec);}
render();
})();