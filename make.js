// Project:     WallColle
// Repo:        https://github.com/neruthes/wallcolle
// File:        make.js
// Author:      Neruthes <i@neruthes.xyz> (2020 Oct 01)
// License:     GNU GPLv2

// --------------------------------------
// Dependencies
const fs = require('fs');

// --------------------------------------
// Arguments initialization
const PACKNAME = process.argv[2];

// --------------------------------------
// Begin function def

const padright = function (str, len) {
    if (str.length >= len) {
        return str;
    };
    return str + (new Array(len-str.length)).fill(' ').join('');
};

const getUserManifest = function (username) {
    let userdata = JSON.parse(fs.readFileSync(`./contributors/${username}/me.json`).toString());
    userdata.wallpapers.map(function (x, i) {
        ['uname','name','uri'].map(function (keyname) {
            userdata.wallpapers[i][keyname] = userdata[keyname];
        });
    });
    return userdata;
};

const buildDatabase = function () {
    let db = {};
    let users = fs.readdirSync('./contributors').filter(function (x) { return x[0] !== '.' });
    users.forEach(function (username) {
        db[username] = getUserManifest(username);
    });
    console.log('Building database...');
    // console.log(db);
    fs.writeFileSync('./db.json', JSON.stringify(db, '\t', 4));
    return db;
};

const renderPackManifest = function (obj) {
    const renderLines = function (entries) {
        return entries.map(function (entry) {
            return [
                padright(entry.t, 36),
                padright(entry.name, 20),
                padright(entry.l, 2)
            ].join('');
        }).join('');
    };
    return `
PackName   :   ${PACKNAME}
DateTime   :   ${obj.date.slice(0, 19).replace('T', ' ')}
Quantity   :   ${obj.entries.length}

Comments   :
${obj.comments.join('\n').replace(/# /g, '#     ')}

Title                               Contributor         License
===============================================================================
` + renderLines(obj.entries) + '\n';
};

const parsePackDef = function (deffile) {
    let rawdata = deffile.trim().split('\n');
    let catalog = [];
    let manifestObj = {
        title: PACKNAME,
        date: (new Date()).toISOString(),
        comments: [],
        entries: []
    };
    rawdata.forEach(function (line, i) {
        if (line.length > 2 && line.indexOf('# ') === -1) {
            // Not comment
            let mymatch = line.match(/^([0-9A-Za-z_\-]+)\:(\d+)$/);
            if (mymatch) {
                // Yes, good declaration line.
                catalog.push({
                    uname: mymatch[1],
                    index: mymatch[2]
                });
                manifestObj.entries.push(
                    db[mymatch[1]].wallpapers[mymatch[2]]
                );
            } else {
                console.error(`Error: Bad declaration in line ${i}. Please fix before proceeding.`);
                console.error(`Statement: "${line}"`);
                process.exit(1);
            };
        } else if (line.indexOf('# ') === 0) {
            // Comment
            manifestObj.comments.push(line);
        };
    });
    return {
        catalog: catalog,
        manifestObj: manifestObj,
        manifestStr: renderPackManifest(manifestObj)
    };
};

// --------------------------------------
// Begin controller logic

if (!fs.existsSync('./dist')) {
    console.log(`Initializing "dist" directory...`);
    fs.mkdirSync('./dist');
} else {
    fs.readdir('./dist', function (err, stdin, stderr) {
        if (!err) {
            console.log(`Cleaning existing "dist" directory...`);
            stdin.forEach(function (filename) {
                fs.unlinkSync(`./dist/${filename}`);
            });
        };
    });
};

let db = buildDatabase();

console.log(`Trying to create pack for "${PACKNAME}"...\n`);

fs.readFile(`./packs/${PACKNAME}`, function (err, stdin, stderr) {
    if (err) {
        console.error(`Error: Cannot make "packs/${PACKNAME}".`);
        process.exit(1);
    };
    let packdata = parsePackDef(stdin.toString());
    fs.writeFileSync(`./dist/manifest.txt`, packdata.manifestStr);

    packdata.manifestObj.entries.forEach(function (entryObj) {
        let srcpath = `./contributors/${entryObj.uname}/${entryObj.i}.${entryObj.f}`;
        let destpath = `./dist/${entryObj.t.replace(/ /g, '_')}.${entryObj.f}`;
        console.log(`copying: ${srcpath} -> ${destpath}`);
        fs.copyFile(srcpath, destpath, function (err) {
            if (err) {
                throw err;
                console.error(`Error: Cannot copy the desinated file "${entryObj.uname}/${entryObj.i}.${entryObj.f}". Does it exist?`);
            };
        });
    });

    console.log(packdata.manifestStr);
    console.log(`\n\nSuccessfully built the pack "${PACKNAME}" with ${packdata.manifestObj.entries.length} wallpapers.\n`);
});
