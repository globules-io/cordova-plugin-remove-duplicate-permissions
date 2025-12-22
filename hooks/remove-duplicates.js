#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

module.exports = function (ctx) {
     const manifestPath = path.join(ctx.opts.projectRoot, 'platforms/android/app/src/main/AndroidManifest.xml');

     if (!fs.existsSync(manifestPath)) {
          console.warn('⚠ AndroidManifest.xml not found at', manifestPath);
          return;
     }

     let manifest = fs.readFileSync(manifestPath, 'utf8');
     let lines = manifest.split(/\r?\n/).filter((line) => line.includes('<uses-permission'));

     let perms = new Set();
     let toRemove = [];
     const reg = /(android\.permission\.[A-Za-z_]+(\.[A-Za-z_]+)?)/;

     for (let line of lines) {
          const match = reg.exec(line);
          if (match) {
               const perm = match[1];
               if (!perms.has(perm)) {
                    perms.add(perm);
               } else {
                    toRemove.push(line.trim());
               }
          }
     }

     if (toRemove.length) {
          toRemove.forEach((line) => {
               const safe = line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
               manifest = manifest.replace(new RegExp(safe, 'g'), '');
          });
          fs.writeFileSync(manifestPath, manifest, 'utf8');
          console.log(`✔ Removed ${toRemove.length} duplicate permissions`);
     } else {
          console.log('✔ No duplicate permissions found');
     }
};
