import os
path=os.path.join('secrets','vercel.json')
with open(path,'rb') as f:
    print(f.read())
