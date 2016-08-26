const gulp = require('gulp');
const es = require('event-stream');
const fs = require('fs');
const del = require('del');
const eslint = require('gulp-eslint');
const wiredep = require('wiredep').stream;
const gulpInject = require('gulp-inject');
const rename = require("gulp-rename");
const merge = require('merge-stream');
const inno = require('gulp-inno');
try {
    var debinstaller = require('electron-installer-debian');
} catch (er) {
    debinstaller = null;
}
const electronConnect = require('electron-connect').server.create({path: 'src'});
const symdest = require('gulp-symdest');
const electron = require('gulp-atom-electron');
const rcedit = require('rcedit');

const packageJson = JSON.parse(fs.readFileSync('./src/package.json'));

gulp.task('scripts', scripts);
gulp.task('inject', inject);
gulp.task('watch', watch);
gulp.task('clean', clean);
gulp.task('serve', gulp.series('inject', 'watch', electronServe));
gulp.task('build', gulp.series('inject', 'clean', cleanDep, build, makeIcon));
gulp.task('package:win32', gulp.series('build', installer));
gulp.task('package:deb', gulp.series('build', deb));


function installer() {
    return gulp.src('./lunasound-innoscript.iss')
        .pipe(inno({
            args: [`/Dversion=${packageJson.version}`]
        }));
}

function deb(cb) {
    var options = {
        src: 'release/build/linux-x64',
        dest: 'release/installer',
        arch: 'amd64',
        productName: 'LunaSound',
        genericName: 'Music Streaming',
        description: packageJson.description,
        version: packageJson.version,
        section: 'sound',
        maintainer: 'vidhu (vidhu@bu.edu)',
        homepage: 'http://lunasound.io',
        icon: 'src/assets/img/icon.png',
        categories: ["Audio"],
        depends: ["python"]
    };

    console.log('Creating package (this may take a while)');

    debinstaller(options, function (err) {
        if (err) {
            console.error(err, err.stack);
            cb(err);
        }
        console.log('Successfully created package at ' + options.dest);
        cb();
    })
}

function cleanDep(cb) {
    return del([
        './src/node_modules/**/*.mp3',
        './src/node_modules/**/*.exe',
        './src/node_modules/**/*test*',
        './src/bower_components/**/*test*'
    ]);
}

function build(cb) {

    win32 = gulp.src(['src/**', '!src/lib/{mac,mac/**,linux,linux/**}'])
        .pipe(electron({
            version: '1.2.6',
            platform: 'win32',
            arch: 'ia32',
            winIcon: './src/assets/img/icon.ico',
            companyName: 'Vidhu'
        }))
        .pipe(gulp.dest('./release/build/win32-ia32'));


    var linux = gulp.src(['src/**', '!src/lib/{mac,mac/**,win32,win32/**}'])
        .pipe(electron({
            version: '1.2.6',
            platform: 'linux',
            arch: 'x64',
            linuxExecutableName: 'lunasound'
        }))
        .pipe(gulp.dest('./release/build/linux-x64'));

    var builds = [win32, linux];

    if (process.platform === 'darwin') {
        var darwin = gulp.src(['src/**', '!src/lib/{linux,linux/**,win32,win32/**}'])
            .pipe(electron({
                version: '1.2.6',
                platform: 'darwin',
                arch: 'x64'
            }))
            .pipe(gulp.dest('./release/build/darwin-x64'));
        builds.push(darwin);
    }


    return merge.apply(this, builds);
}

function makeIcon(cb) {
    rcedit('./release/build/win32-ia32/lunasound.exe', {
        "version-string": packageJson.version,
        "file-version": packageJson.version,
        "product-version": packageJson.version,
        "icon": './src/assets/img/icon.ico'
    }, function (er) {
        if (er) console.log(er);
        else console.log("modified exe");
        cb();

    });
}

function scripts() {
    return gulp.src('src/**/*.js')
        .pipe(eslint())
        .pipe(eslint.format());
}

// Inject CSS and bower files (css,js,fonts)
function inject() {

    const injectStyles = gulp.src([
        'src/assets/css/normalize.css',
        'src/assets/css/topcoat/topcoat-desktop-light.css',
        'src/assets/**/*.css'
    ], {read: false});

    const injectOptions = {
        ignorePath: ['src/'],
        addRootSlash: false,
        relative: true
    };

    return gulp.src('src/app/index.html')
        .pipe(gulpInject(injectStyles, injectOptions))
        .pipe(wiredep({
            cwd: 'src/'
        }))
        .pipe(rename('index.compiled.html'))
        .pipe(gulp.dest('src/app/'));
}

//Watch for changes and reload
function watch(cb) {
    gulp.watch([
        'src/lib/**',
        'src/main.electron.js',
        'src/core/**/*.js'
    ], gulp.series(electronRestart));

    gulp.watch('src/app/index.html', gulp.series('inject', electronReload));
    gulp.watch('src/app/**/*.html', electronReload);
    gulp.watch('src/bower.json', gulp.series('inject', electronReload));
    gulp.watch('src/assets/**/*.css', gulp.series('inject', electronReload));
    gulp.watch('src/app/**/*.js', gulp.series('inject', electronReload));

    cb();
}


function electronServe(done) {
    process.env.NODE_ENV = 'development';
    electronConnect.start();
    done();
}

function electronRestart(done) {
    electronConnect.restart();
    done();
}

function electronReload(done) {
    electronConnect.reload();
    done();
}

function clean() {
    return del(['./release/build']);
}
