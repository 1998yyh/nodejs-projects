const JSZip = require('jszip')
const fs = require('fs')
const instance = new JSZip();



instance.file('./a/file.txt','hello world')
instance.file('./file2.txt','hello world')
instance.file('./file3.txt','hello world')

instance.generateAsync({type:'uint8array'}).then((content)=>{
  fs.writeFileSync('zipped.zip',content)
})