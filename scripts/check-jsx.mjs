import fs from 'node:fs';
import vm from 'node:vm';
import { transform } from 'esbuild';
for (const name of fs.readdirSync('public').filter(n => n.endsWith('.jsx'))) {
  const result = await transform(fs.readFileSync('public/'+name,'utf8'), { loader: 'jsx', target: 'es2022', sourcefile: name });
  new vm.Script(result.code, { filename: name });
  console.log('JSX syntax OK: '+name);
}
