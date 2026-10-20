import os
import re
import json

bases = ['knowledge', 'knowledge/knowledge']
langs = ['chinese', 'english', 'german', 'japanese']
lvlmap = {}
for i in range(6,16):
    num = '%02d'%i
    if i <= 10:
        lvlmap[num]='a2'
    else:
        lvlmap[num]='b1'

total = 0
files_with = []
for base in bases:
    for lang in langs:
        for i in range(6,16):
            num = '%02d'%i
            lvl = lvlmap[num]
            up = os.path.join(base,'languages',lang,lvl,'unit-'+num)
            if os.path.isdir(up):
                for dp,_,fns in os.walk(up):
                    for fn in fns:
                        if fn.endswith('.md'):
                            p = os.path.join(dp,fn)
                            with open(p,encoding='utf-8') as f:
                                t = f.read()
                            if re.search(r'не проверено|не заполнено',t):
                                m = len(re.findall(r'не проверено|не заполнено',t))
                                if m>0:
                                    total += m
                                    files_with.append((m,p))
            elif os.path.isfile(up+'.md'):
                p = up+'.md'
                with open(p,encoding='utf-8') as f:
                    t = f.read()
                if re.search(r'не проверено|не заполнено',t):
                    m = len(re.findall(r'не проверено|не заполнено',t))
                    if m>0:
                        total += m
                        files_with.append((m,p))
print(json.dumps({'total':total,'files':files_with}, ensure_ascii=False))
