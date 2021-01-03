// Project:     WallColle
// Repo:        https://github.com/neruthes/wallcolle
// File:        make.js
// Author:      Neruthes <i@neruthes.xyz> (2020 Oct 01)
// License:     GNU GPLv2

// --------------------------------------
// Dependencies
const fs = require('fs');
const exec = require('child_process').execSync;

// --------------------------------------
// Arguments initialization
const UUID = 'ea9510656e3a43d8b037dd34490ad52f';
const PACKNAME = process.argv[2];
const DESTDIR = process.argv[3];
const VARIANT = process.argv[4]; // Destination variant, can be NORMAL or RETRO

if (process.argv.length < 5) {
    console.error('Insufficient arguments.');
    console.error('Usage:    node make.js PACKNAME DESTDIR VARIANT');
    process.exit(1);
};

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
        ['uname','name','email','uri'].map(function (keyname) {
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
                padright(entry.t.slice(0, 32), 33), '   ',
                padright(entry.name, 17), '   ',
                entry.l
            ].join('');
        }).join('\n');
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
        if (line.length > 2 && line.indexOf('# ') !== 0) {
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
                            1680x1050.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                            1920x1080.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                            1920x1200.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                            2048x1536.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                            2048x2048.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                            2160x1440.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                            2520x1080.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                            3360x1440.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                            2560x2048.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
                            2560x1600.png -> /usr/share/backgrounds/image-title.myname/image-title.myname.png
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
    exec(`
        ?/usr
        ?/usr/share
        ?/usr/share/backgrounds
        ?/usr/share/backgrounds/xfce
        ?/usr/share/background-properties
        ?/usr/share/gnome-background-properties
        ?/usr/share/mate-background-properties
        ?/usr/share/wallpapers
    `.replace(/\s{8}\?/g, `mkdir -p ${DESTDIR}`) );
    console.log(`------------------------------\n\n`);
    // console.log(manifestObj);
    manifestObj.entries.forEach(function (img) {
        // console.log(img);
        let stdname = `${PACKNAME}.${img.t.toLowerCase().replace(/[\s\.\-]/g, '_').replace(/_+/g, '_')}.${img.uname}`;
        let srcimgpath = `./contributors/${img.uname}/${img.i}.${img.f}`;
        // console.log(stdname);
        // console.log(srcimgpath);
        let abspathImg = `/usr/share/backgrounds/${stdname}/${stdname}.${img.f}`;
        let mockpathImg = `${DESTDIR}/${abspathImg}`;
        let abspathXml = `/usr/share/background-properties/${stdname}.xml`;
        let mockpathXml = `${DESTDIR}/usr/share/background-properties/${stdname}.xml`;
        let mockpathMds = `${DESTDIR}/usr/share/wallpapers/${stdname}/metadata.desktop`;

        // For RETRO
        if (VARIANT.toUpperCase() === 'RETRO') {
            let allResolutions = [
                '800x600', '1280x960', '1600x1200', '1920x1200'
            ];
            try {
                exec(`mkdir -p /tmp/WallColle_${UUID}`);
            } catch (e) {
            } finally {
            };

            // Create directories
            exec(`mkdir -p ${DESTDIR}/usr/share/backgrounds/${stdname} ${DESTDIR}/usr/share/wallpapers/${stdname} ${DESTDIR}/usr/share/wallpapers/${stdname}/contents ${DESTDIR}/usr/share/wallpapers/${stdname}/contents/images`);

            // Put files
            console.log(`Copying image: ${srcimgpath}`);
            // fs.copyFileSync(srcimgpath, mockpathImg);

            // Write config
            console.log(`Writing XML: ${mockpathXml}`);
            fs.writeFileSync(mockpathXml, `<?xml version='1.0' encoding='UTF-8'?>
            <!DOCTYPE wallpapers SYSTEM "gnome-wp-list.dtd">
            <wallpapers>
                <wallpaper delete="false">
                    <name>Campanula</name>
                    <filename>${abspathXml}</filename>
                    <artist>${img.name}</artist>
                    <options>zoom</options>
                </wallpaper>
            </wallpapers>`);
            console.log(`Writing metadata.desktop: ${mockpathMds}`);
            fs.writeFileSync(mockpathMds, `
                [Desktop Entry]
                Name=${img.t}

                X-KDE-PluginInfo-Name=${img.t}
                X-KDE-PluginInfo-Author=${img.name}
                X-KDE-PluginInfo-License=${img.l}
                ${
                    img.email ? 'X-KDE-PluginInfo-Email=' + img.email : ''
                }
            `.trim().replace(/\n\s+/g, '\n'));

            // Symlinks
            console.log(`Creating symlinks for image "${stdname}"`);
            [ '1-1', '16-10', '16-9', '21-9', '3-2', '4-3', '5-4' ].map(function (x) {
                fs.symlinkSync(abspathImg, `${DESTDIR}/usr/share/backgrounds/xfce/${stdname}-${x}.${img.f}`);
            });
            fs.symlinkSync(abspathXml, `${DESTDIR}/usr/share/gnome-background-properties/${stdname}.xml`);
            fs.symlinkSync(abspathXml, `${DESTDIR}/usr/share/mate-background-properties/${stdname}.xml`);

            allResolutions.forEach(function (scrsize) {
                let imgSpecificPath = `${DESTDIR}/usr/share/wallpapers/${stdname}/contents/images/${scrsize}.png`;
                console.log(`Generating ${stdname} for ${scrsize}`);
                exec(`convert ${srcimgpath} -resize ${scrsize} -gravity center -quality 80 ${imgSpecificPath}`);
                exec(`mv ${imgSpecificPath} ${imgSpecificPath}.p`);
                exec(`pngquant 256 ${imgSpecificPath}.p -o ${imgSpecificPath}`);
                exec(`rm ${imgSpecificPath}.p`);
                if (scrsize === '1280x960') {
                    fs.symlinkSync(imgSpecificPath.replace(DESTDIR, ''), `${DESTDIR}/usr/share/wallpapers/${stdname}/screenshot.png`);
                };
            });
            console.log(`OK.\n`);
        } else { // For NORMAL
            let allResolutions = [
                '1024x768', '1152x768', '1280x1024', '1280x800', '1280x854', '1280x960', '1366x768',
                '1440x900', '1440x960', '1600x1200', '1600x900', '1680x1050', '1920x1080', '1920x1200',
                '2048x1536', '2048x2048', '2160x1440', '2520x1080', '3360x1440', '2560x2048', '2560x1600',
                '2880x1800', '3000x2000', '3840x2160', '4096x4096', '4500x3000', '5120x4096', '800x600'
            ];

            // Create directories
            exec(`mkdir -p ${DESTDIR}/usr/share/backgrounds/${stdname} ${DESTDIR}/usr/share/wallpapers/${stdname} ${DESTDIR}/usr/share/wallpapers/${stdname}/contents ${DESTDIR}/usr/share/wallpapers/${stdname}/contents/images`);

            // Put files
            console.log(`Copying image: ${srcimgpath}`);
            fs.copyFileSync(srcimgpath, mockpathImg);

            // Write config
            console.log(`Writing XML: ${mockpathXml}`);
            fs.writeFileSync(mockpathXml, `<?xml version='1.0' encoding='UTF-8'?>
            <!DOCTYPE wallpapers SYSTEM "gnome-wp-list.dtd">
            <wallpapers>
                <wallpaper delete="false">
                    <name>Campanula</name>
                    <filename>${abspathXml}</filename>
                    <artist>${img.name}${
                        img.email === '' ? '' : ' <' + img.email + '>'
                    }</artist>
                    <options>zoom</options>
                </wallpaper>
            </wallpapers>`);
            console.log(`Writing metadata.desktop: ${mockpathMds}`);
            fs.writeFileSync(mockpathMds, `
                [Desktop Entry]
                Name=${img.t}

                X-KDE-PluginInfo-Name=${img.t}
                X-KDE-PluginInfo-Author=${img.name}
                X-KDE-PluginInfo-License=${img.l}
                ${
                    img.email === '' ? '' : 'X-KDE-PluginInfo-Email=' + img.email
                }
            `.trim().replace(/\n\s+/g, '\n'));

            // Symlinks
            console.log(`Creating symlinks for image "${stdname}"`);
            fs.symlinkSync(abspathImg, `${DESTDIR}/usr/share/wallpapers/${stdname}/screenshot.${img.f}`);
            [ '1-1', '16-10', '16-9', '21-9', '3-2', '4-3', '5-4' ].map(function (x) {
                fs.symlinkSync(abspathImg, `${DESTDIR}/usr/share/backgrounds/xfce/${stdname}-${x}.${img.f}`);
            });
            fs.symlinkSync(abspathXml, `${DESTDIR}/usr/share/gnome-background-properties/${stdname}.xml`);
            fs.symlinkSync(abspathXml, `${DESTDIR}/usr/share/mate-background-properties/${stdname}.xml`);

            allResolutions.forEach(function (scrsize) {
                fs.symlinkSync(abspathImg, `${DESTDIR}/usr/share/wallpapers/${stdname}/contents/images/${scrsize}.${img.f}`);
            });
            console.log(`OK.\n`);
        };


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
