import os
path=os.path.join('secrets','vercel.json')
with open(path,'rb') as f:
    text=f.read().decode('utf-16')
text=text.replace('\\','\\')
with open(path,'w',encoding='utf-8') as f:
    f.write(text)
print('rewrote content:', repr(text))
with open(path,'r',encoding='utf-8') as f:
    print('final:',f.read())
