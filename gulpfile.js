const gulp = require('gulp');
const del = require('del');
const eslint = require('gulp-eslint');
const wiredep = require('wiredep').stream;
const gulpInject = require('gulp-inject');
const rename = require("gulp-rename");
const electronConnect = require('electron-connect').server.create({path:'src'});
const electron = require('gulp-electron');

gulp.task('scripts', scripts);
gulp.task('inject', inject);
gulp.task('watch', watch);
gulp.task('clean', clean);
gulp.task('serve', gulp.series('inject', 'watch', electronServe));
gulp.task('package', gulp.series('inject', 'clean', packageApp));



function packageApp() {
    return gulp.src('./src/**/*')
        .pipe(electron({
            src: './src',
            packageJson: require('./src/package.json'),
            release: './release',
            cache: './cache',
            version: 'v1.2.6',
            platforms: ['win32-ia32']
        }))
        .pipe(gulp.dest('./release'));
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
        'src/electron/**/*.js'
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
    return del(['./release']);
}