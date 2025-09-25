const fs=require('fs');
const paths=process.argv.slice(2);
if(paths.length===0){ console.error('Usage: node tools/font-totals.js file1.json file2.json ...'); process.exit(2); }
const totals = paths.map(p=>{
  const j=JSON.parse(fs.readFileSync(p));
  const items = (j.audits && j.audits['network-requests'] && j.audits['network-requests'].details && j.audits['network-requests'].details.items) || [];
  const fonts = items.filter(i=>i.resourceType==='Font' || (i.url && i.url.match(/\\.(woff2?|ttf|otf|eot|svg)(\\?|$)/i)));
  const sum = fonts.reduce((s,i)=>s+(i.transferSize||0),0);
  return {path:p, totalBytes:sum, fontsCount:fonts.length};
});
console.log(JSON.stringify(totals, null, 2));
const nums=totals.map(t=>t.totalBytes).sort((a,b)=>a-b);
const median = nums.length%2 ? nums[(nums.length-1)/2] : Math.round((nums[nums.length/2-1]+nums[nums.length/2])/2);
console.log('median totalBytes:', median);