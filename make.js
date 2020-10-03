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

const finisherScript = function (manifestObj) {
    /* Tree structure:
    usr
        share
            background-properties
                image-title.myname.xml
            backgrounds
                image-title.myname
                    image-title.myname.png
                xfce
                    image-title.myname-1-1.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                    image-title.myname-16-10.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                    image-title.myname-16-9.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                    image-title.myname-21-9.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                    image-title.myname-3-2.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                    image-title.myname-4-3.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                    image-title.myname-5-4.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
            gnome-background-properties
                image-title.myname.xml -> /usr/share/background-properties/image-title.myname.xml
            mate-background-properties
                image-title.myname.xml -> /usr/share/background-properties/image-title.myname.xml
            wallpapers
                image-title.myname
                    contents
                        images
                            1024x768.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                            1152x768.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                            1280x1024.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                            1280x800.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                            1280x854.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                            1280x960.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                            1366x768.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                            1440x900.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                            1440x960.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                            1600x1200.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                            1600x900.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                            1680×1050.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                            1920x1080.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                            1920×1200.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                            2048x1536.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                            2048x2048.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                            2160x1440.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                            2520x1080.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                            3360x1440.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                            2560x2048.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                            2560×1600.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                            2880x1800.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                            3000x2000.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                            3840x2160.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                            4096x4096.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                            4500x3000.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                            5120x4096.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                            800x600.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                        screenshot.png
                    metadata.desktop
    */
    try {
        require('child_process').execSync('rm -r $PWD/usr');
        fs.mkdirSync('usr');
        fs.mkdirSync('usr/share');
        fs.mkdirSync('usr/share/backgrounds');
        fs.mkdirSync('usr/share/backgrounds/xfce');
        fs.mkdirSync('usr/share/background-properties');
        fs.mkdirSync('usr/share/gnome-background-properties');
        fs.mkdirSync('usr/share/mate-background-properties');
        fs.mkdirSync('usr/share/wallpapers');
    } catch (e) {
    } finally {
    };
    console.log(`===============================\n\n`);
    // console.log(manifestObj);
    manifestObj.entries.forEach(function (img) {
        // console.log(img);
        let stdname = `${img.t.toLowerCase().replace(/ /g, '_')}.${img.uname}`;
        let srcimgpath = `./contributors/${img.uname}/${img.i}.${img.f}`;
        // console.log(stdname);
        // console.log(srcimgpath);
        let abspathImg = `/usr/share/backgrounds/${stdname}/${stdname}.${img.f}`;
        let abspathXml = `/usr/share/background-properties/${stdname}.xml`;
        let relpathMds = `./usr/share/wallpapers/${stdname}/metadata.desktop`;

        // Create directories
        try {
            fs.mkdirSync(`./usr/share/backgrounds/${stdname}`);
            fs.mkdirSync(`./usr/share/wallpapers/${stdname}`);
            fs.mkdirSync(`./usr/share/wallpapers/${stdname}/contents`);
            fs.mkdirSync(`./usr/share/wallpapers/${stdname}/contents/images`);
        } catch (e) {
        } finally {
        };

        // Put files
        console.log(`Copying image: ${srcimgpath}`);
        fs.copyFileSync(srcimgpath, `./usr/share/backgrounds/${stdname}/${stdname}.${img.f}`)
        fs.copyFileSync(srcimgpath, `./usr/share/wallpapers/${stdname}/screenshot.${img.f}`)

        // Write config
        console.log(`Writing XML: .${abspathXml}`);
        fs.writeFileSync('.' + abspathXml, `<?xml version='1.0' encoding='UTF-8'?>
        <!DOCTYPE wallpapers SYSTEM "gnome-wp-list.dtd">
        <wallpapers>
            <wallpaper delete="false">
                <name>Campanula</name>
                <filename>${abspathXml}</filename>
                <artist>${img.name} &lt;${img.email}&gt;</artist>
                <options>zoom</options>
            </wallpaper>
        </wallpapers>`);
        console.log(`Writing metadata.desktop: ${relpathMds}`);
        fs.writeFileSync(relpathMds, `
            [Desktop Entry]
            Name=${img.t}

            X-KDE-PluginInfo-Name=${img.t}
            X-KDE-PluginInfo-Author=${img.name}
            X-KDE-PluginInfo-Email=${img.email}
            X-KDE-PluginInfo-License=${img.l}
        `.trim().replace(/\n\s+/g, '\n'));

        // Symlinks
        console.log(`Creating symlinks for image "${stdname}"`);
        [ '1-1', '16-10', '16-9', '21-9', '3-2', '4-3', '5-4' ].forEach(function (x) {
            fs.symlinkSync(abspathImg, `./usr/share/backgrounds/xfce/${stdname}-${x}.${img.f}`);
        });
        fs.symlinkSync(abspathXml, `./usr/share/gnome-background-properties/${stdname}.xml`);
        fs.symlinkSync(abspathXml, `./usr/share/mate-background-properties/${stdname}.xml`);
        [ '1024x768.png', '1152x768.png', '1280x1024.png', '1280x800.png', '1280x854.png', '1280x960.png', '1366x768.png', '1440x900.png', '1440x960.png', '1600x1200.png', '1600x900.png', '1680×1050.png', '1920x1080.png', '1920×1200.png', '2048x1536.png', '2048x2048.png', '2160x1440.png', '2520x1080.png', '3360x1440.png', '2560x2048.png', '2560×1600.png', '2880x1800.png', '3000x2000.png', '3840x2160.png', '4096x4096.png', '4500x3000.png', '5120x4096.png', '800x600.png' ].forEach(function (x) {
            fs.symlinkSync(abspathXml, `./usr/share/wallpapers/${stdname}/contents/images/${x}.${img.f}`);
        });
        console.log(`OK.\n`);
    });
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
    console.log(`Now running finisher script...`);
    finisherScript(packdata.manifestObj);
});
