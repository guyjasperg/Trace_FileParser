const adm = require('adm-zip')

const zip = new adm('C:\\Diags\\Morrisons\\6.1.2\\WMM0155POS138-220218-102338.zip');
const files = zip.getEntries()

console.log('FileCount: %d', files.length)
files.forEach(function (file) {
  console.log(file.entryName);
  zip.extractEntryTo(file, 'C:\\Diags\\Morrisons\\6.1.2')
})

