var gulp        = require('gulp');
var browserSync = require('browser-sync');
var sass        = require('gulp-sass')(require('sass'));
var prefix      = require('gulp-autoprefixer');
var cp          = require('child_process');
var cssnano     = require('gulp-cssnano');

var jekyll   = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';
var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn( jekyll , ['build'], {stdio: 'inherit'})
        .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', gulp.series('jekyll-build', function (cb) {
    browserSync.reload();
    cb();
}));

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function () {
    return gulp.src('assets/scss/style.scss')
        .pipe(sass({
            includePaths: ['scss'],
            onError: browserSync.notify
        }))
        .pipe(prefix(['last 3 versions'], { cascade: true }))
				.pipe(cssnano())
        .pipe(gulp.dest('_site/assets/css'))
        .pipe(browserSync.reload({stream:true}))
        .pipe(gulp.dest('assets/css'));
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', gulp.series('sass', 'jekyll-build', function(cb) {
    browserSync({
        server: {
            baseDir: '_site'
        }
    });
    cb();
}));

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function (cb) {
    gulp.watch(['assets/scss/*.scss', 'assets/scss/*/*.scss'], gulp.series('sass'));
    gulp.watch(['*.html', '_includes/*.html', '_layouts/*.html', '_posts/*'], gulp.series('jekyll-rebuild'));
    cb();
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', gulp.series('browser-sync', 'watch'));
