import json,re,urllib.request,pathlib,collections
ROOT=pathlib.Path(__file__).parent
DATA=ROOT/'data';DATA.mkdir(exist_ok=True)
SOURCES={
 'common3500.txt':'https://gist.githubusercontent.com/jjgod/1432945/raw/common3500.txt',
 'makemeahanzi.txt':'https://raw.githubusercontent.com/skishore/makemeahanzi/master/dictionary.txt',
 'cedict_ts.u8':'https://raw.githubusercontent.com/liamsaliba/cc-cedict-stardict/main/data/cedict_ts.u8',
}
def get(name,url):
 path=DATA/name
 if not path.exists():
  print('Downloading',name)
  req=urllib.request.Request(url,headers={'User-Agent':'HanziFinderBuilder/1.3'})
  with urllib.request.urlopen(req,timeout=90) as response:path.write_bytes(response.read())
 return path.read_text(encoding='utf-8-sig')
raw={name:get(name,url) for name,url in SOURCES.items()}
chars=list(dict.fromkeys(c for c in raw['common3500.txt'] if '\u3400'<=c<='\u9fff'))
if len(chars)!=3500:raise RuntimeError(f'Expected 3500 unique characters, got {len(chars)}. Check source list.')
mm={}
for line in raw['makemeahanzi.txt'].splitlines():
 try:
  d=json.loads(line);mm[d['character']]=d
 except (ValueError,KeyError):pass
ced=collections.defaultdict(list)
pattern=re.compile(r'^(.+?) (.+?) \[([^]]+)\] /(.+)/$')
for line in raw['cedict_ts.u8'].splitlines():
 m=pattern.match(line)
 if not m:continue
 trad,simp,pinyin,meaning=m.groups()
 if len(simp)==1:
  entry={'pinyin':pinyin,'definition':meaning.replace('/','; ')}
  if entry not in ced[simp]:ced[simp].append(entry)
# Recursive component indexing: distinguish graphical decomposition from semantic radical families.
ids_ops=set('⿰⿱⿲⿳⿴⿵⿶⿷⿸⿹⿺⿻')
def parts(ch,seen=None):
 seen=seen or set()
 if ch in seen:return set()
 d=mm.get(ch,{})
 decomp=d.get('decomposition','')
 if not decomp or decomp.startswith('？'):return set()
 result=set(); seen=seen|{ch}
 for p in decomp:
  if p in ids_ops or p in {'？','?',' '} or p==ch:continue
  result.add(p)
  if p in mm:result.update(parts(p,seen))
 return result
records=[]
for rank,ch in enumerate(chars):
 d=mm.get(ch,{})
 readings=[]
 for e in ced[ch]:
  if e['pinyin'] not in [x['pinyin'] for x in readings]:readings.append(e)
 if not readings and d.get('pinyin'):
  for p in d['pinyin'].split(','):
   readings.append({'pinyin':p.strip(),'definition':d.get('definition') or ''})
 if not readings:readings=[{'pinyin':'','definition':d.get('definition') or ''}]
 comp=sorted(parts(ch))
 records.append({'char':ch,'rank':rank+1,'readings':readings[:12], 'components':comp,'decomposition':d.get('decomposition','')})
(DATA/'characters.json').write_text(json.dumps(records,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
missing_read=[r['char'] for r in records if not any(e['pinyin'] for e in r['readings'])]
missing_def=[r['char'] for r in records if not any(e['definition'] for e in r['readings'])]
missing_comp=[r['char'] for r in records if not r['components']]
report={'characters':len(records),'with_pinyin':3500-len(missing_read),'with_definition':3500-len(missing_def),'with_components':3500-len(missing_comp),'missing_pinyin':missing_read,'missing_definitions':missing_def,'missing_components':missing_comp}
(DATA/'validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print('Finished:',{k:v for k,v in report.items() if isinstance(v,int)})
print('Open index.html using a local web server: python -m http.server 8000')
