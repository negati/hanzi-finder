 'use strict';
const GROUPS={
1:'一丨丶丿乙亅',
2:'二亠人亻儿入八冂冖冫几凵刀刂力勹匕匚匸十卜卩厂厶又讠阝',
3:'口囗土士夂夕大女子宀寸小尢尸屮山巛川工己巾干幺广廴廾弋弓彐彡彳氵扌忄艹纟饣马门飞',
4:'心戈户手支攴攵文斗斤方无日曰月木欠止歹殳毋比毛氏气水火灬爪爫父爻爿片牙牛牜犬犭王礻见贝车长韦风',
5:'玄玉瓜瓦甘生用田疋疒癶白皮皿目矛矢石示禾穴立罒钅鸟龙业',
6:'竹米糸糹缶网羊羽老而耒耳聿肉臣自至臼舌舛舟艮色虍虫血行衣襾西页齐',
7:'見角言谷豆豕豸貝赤走足身車辛辰辵辶邑酉釆里麦',
8:'金長門阜隶隹雨青非魚齿',
9:'面革韭音頁風飛食首香',
10:'馬骨高髟鬥鬯鬲鬼',
11:'魚鳥鹵鹿麥麻',
12:'黃黍黑黹',
13:'黽鼎鼓鼠',
14:'鼻齊',
15:'齒',
16:'龍龜',
17:'龠'
};
const FAMILY={刀:['刀','刂'],刂:['刀','刂'],人:['人','亻'],亻:['人','亻'],水:['水','氵'],氵:['水','氵'],手:['手','扌'],扌:['手','扌'],心:['心','忄'],忄:['心','忄'],火:['火','灬'],灬:['火','灬'],言:['言','讠'],讠:['言','讠'],糸:['糸','纟','糹'],纟:['糸','纟','糹'],金:['金','钅'],钅:['金','钅'],犬:['犬','犭'],犭:['犬','犭'],衣:['衣','衤'],衤:['衣','衤'],示:['示','礻'],礻:['示','礻'],食:['食','饣'],饣:['食','饣'],艸:['艸','艹'],艹:['艸','艹'],阜:['阜','阝'],邑:['邑','阝']};
const E=id=>document.getElementById(id);
const els={groups:E('groups'),selected:E('selected'),selectedCount:E('selectedCount'),componentCount:E('componentCount'),characters:E('characters'),resultCount:E('resultCount'),detail:E('detail'),more:E('more'),search:E('search'),status:E('status')};
let entries=[], selected=new Set(), chosen=null,limit=120;
const FAMILY_GROUPS=[['刀','刂'],['人','亻'],['水','氵'],['手','扌'],['心','忄'],['火','灬'],['言','讠'],['糸','纟','糹'],['金','钅'],['犬','犭'],['衣','衤'],['示','礻'],['食','饣'],['艸','艹'],['辵','辶']];
function aliases(c){const out=new Set([c]);for(const g of FAMILY_GROUPS)if(g.includes(c))g.forEach(x=>out.add(x));return out}
function hasPart(e,c){for(const x of aliases(c))if(e.parts.has(x)||e.c===x)return true;return false}
function pinyin(s){let word=(s||'').toLowerCase().replace(/u:/g,'ü').replace(/v/g,'ü');const m=word.match(/^([a-zü]+)([1-5])$/);if(!m)return word;word=m[1];const tone=+m[2];if(tone===5)return word;const marks={a:'āáǎà',e:'ēéěè',i:'īíǐì',o:'ōóǒò',u:'ūúǔù',ü:'ǖǘǚǜ'};let pos=word.indexOf('a');if(pos<0)pos=word.indexOf('e');if(pos<0)pos=word.indexOf('ou')>=0?word.indexOf('o'):-1;if(pos<0)pos=word.indexOf('iu')>=0?word.indexOf('iu')+1:word.indexOf('ui')>=0?word.indexOf('ui')+1:word.search(/[ioüu]/);if(pos<0)return word;return word.slice(0,pos)+marks[word[pos]][tone-1]+word.slice(pos+1)}
const toneMarks={'ā':'a1','á':'a2','ǎ':'a3','à':'a4','ē':'e1','é':'e2','ě':'e3','è':'e4','ī':'i1','í':'i2','ǐ':'i3','ì':'i4','ō':'o1','ó':'o2','ǒ':'o3','ò':'o4','ū':'u1','ú':'u2','ǔ':'u3','ù':'u4','ǖ':'v1','ǘ':'v2','ǚ':'v3','ǜ':'v4'};
function canonical(s){let tone='';let result='';for(const ch of s.toLowerCase().replace(/u:/g,'v')){if(toneMarks[ch]){result+=toneMarks[ch][0];tone=toneMarks[ch][1]}else result+=ch==='ü'?'v':ch}return result.replace(/[^a-z0-9]/g,'').replace(/([1-5])$/,'')+ (/[1-5]$/.test(s)?s.slice(-1):tone)}
function matchesSearch(e,q){if(!q)return true;if(e.c.includes(q))return true;if(e.m.toLowerCase().includes(q.toLowerCase()))return true;const wanted=canonical(q), hasTone=/[1-5]$/.test(wanted);return e.readings.some(r=>{const rnum=canonical(r.pinyin);return hasTone?rnum===wanted:rnum.replace(/[1-5]$/,'').startsWith(wanted)})}
function toggle(c){selected.has(c)?selected.delete(c):selected.add(c);chosen=null;limit=120;render()}
function render(){const base=entries.filter(e=>[...selected].every(c=>hasPart(e,c)));const possible=new Set();for(const e of base)for(const c of e.parts)for(const a of aliases(c))possible.add(a);
els.selectedCount.textContent=selected.size+' selected';els.selected.replaceChildren();if(!selected.size){const h=document.createElement('span');h.className='hint';h.textContent='Tap a component below to begin';els.selected.append(h)}for(const c of selected){const b=document.createElement('button');b.className='chip';b.textContent=c+' ×';b.onclick=()=>toggle(c);els.selected.append(b)}
els.groups.replaceChildren();let enabled=0;for(const [n,chars] of Object.entries(GROUPS)){const section=document.createElement('div');section.className='group';const title=document.createElement('div');title.className='group-title';title.textContent=n+' '+(+n===1?'stroke':'strokes');section.append(title);const tiles=document.createElement('div');tiles.className='tiles';for(const c of new Set(chars)){const b=document.createElement('button');b.className='tile'+(selected.has(c)?' active':'');b.textContent=c;b.title='Component '+c;b.setAttribute('aria-pressed',selected.has(c));b.disabled=!selected.has(c)&&!possible.has(c)&&!base.some(e=>e.c===c);if(!b.disabled)enabled++;b.onclick=()=>toggle(c);tiles.append(b)}section.append(tiles);els.groups.append(section)}els.componentCount.textContent=enabled+' available';
const q=els.search.value.trim();const matches=base.filter(e=>matchesSearch(e,q));els.resultCount.textContent=matches.length.toLocaleString()+' matching characters';els.characters.replaceChildren();for(const e of matches.slice(0,limit)){const b=document.createElement('button');b.className='character'+(chosen===e.c?' active':'');b.title=e.c+' — '+e.m;const glyph=document.createElement('span');glyph.className='glyph';glyph.textContent=e.c;const reading=document.createElement('span');reading.className='reading';reading.textContent=e.readings.length?pinyin(e.readings[0].pinyin):'—';b.append(glyph,reading);b.onclick=()=>{chosen=e.c;render()};els.characters.append(b)}if(!matches.length){const msg=document.createElement('div');msg.className='empty';msg.textContent='No matching characters. Try removing a component or changing the search.';els.characters.append(msg)}els.more.hidden=matches.length<=limit;const active=matches.find(e=>e.c===chosen);els.detail.hidden=!active;if(active)showDetail(active)}
function showDetail(e){els.detail.replaceChildren();const wrap=document.createElement('div');wrap.className='detail-head';const glyph=document.createElement('div');glyph.className='detail-glyph';glyph.textContent=e.c;const info=document.createElement('div');for(const r of e.readings){const line=document.createElement('p');const strong=document.createElement('strong');strong.textContent=pinyin(r.pinyin)+' ';line.append(strong,document.createTextNode('— '+(r.definition||'Definition unavailable')));info.append(line)}const note=document.createElement('small');note.textContent='Rank '+e.rank+' · Simplified Chinese';info.append(note);wrap.append(glyph,info);els.detail.append(wrap)}
E('reset').onclick=()=>{selected.clear();chosen=null;limit=120;els.search.value='';render()};els.more.onclick=()=>{limit+=120;render()};els.search.addEventListener('input',()=>{chosen=null;limit=120;render()});
fetch('data/characters.json').then(r=>{if(!r.ok)throw Error('Database missing');return r.json()}).then(data=>{entries=data.map(r=>({c:r.char,rank:r.rank,readings:r.readings||[],parts:new Set(r.components||[]),m:(r.readings||[]).map(x=>x.definition||'').join('; ')})).sort((a,b)=>a.rank-b.rank);els.status.textContent=entries.length.toLocaleString()+' simplified Chinese characters · offline Pinyin and definitions · component matches are approximate';render()}).catch(err=>{els.status.textContent='Database not found. Run python build.py, then python -m http.server 8000. '+err.message;render()});
