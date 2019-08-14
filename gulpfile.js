var gulp = require("gulp");
var sass = require("gulp-sass"), // переводит SASS в CSS
    cssnano = require("gulp-cssnano"), // Минимизация CSS
    autoprefixer = require('gulp-autoprefixer'), // Проставлет вендорные префиксы в CSS для поддержки старых браузеров
    imagemin = require('gulp-imagemin'), // Сжатие изображений
    concat = require("gulp-concat"), // Объединение файлов - конкатенация
    uglify = require("gulp-uglify"), // Минимизация javascript
    rename = require("gulp-rename"), // Переименование файлов
    jade = require('gulp-jade'),
    browserSync = require('browser-sync').create(),
    inject = require('gulp-inject'),
    wiredep = require('wiredep').stream,
    del = require('del'),
    mainBowerFiles = require('main-bower-files'),
    filter = require('gulp-filter');



////  Tasks ////
gulp.task('clean', function (cb) {
    del(['dist'], cb);
});

gulp.task('vendors', function () {
    return gulp.src(mainBowerFiles())
        .pipe(filter('*.css'))
        .pipe(concat('vendors.css'))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('browser-sync', function () {
    browserSync.init({
        server: {
            baseDir: 'app'
        },
        notify: false
    });
});

gulp.task('jade', function () {
    return gulp.src('app/templates/**/*.jade')
        .pipe(jade())
        .pipe(gulp.dest('dist/'));
});
// Копирование файлов HTML в папку dist
// gulp.task("html", function() {
//     return gulp.src("app/*.html")
//     .pipe(gulp.dest("dist"));
// });
gulp.task('html', ['sass'], function () {
    let injectFiles = gulp.src(['dist/css/*.css']);
    let injectOptions = {
        addRootSlash: false,
        ignorePath: ['app', 'dist']
    };
    return gulp.src('app/*.html')
        .pipe(inject(injectFiles, injectOptions))
        .pipe(gulp.dest('dist'));
})

// Объединение, компиляция Sass в CSS, простановка венд. префиксов и дальнейшая минимизация кода
gulp.task("sass", function () {
    let injectAppFiles = gulp.src('app/styles/sass/**/*.+(scss|sass)', {
        read: false
    });
    let injectGlobalFiles = gulp.src('app/global/*.scss', {
        read: false
    });

    function transformFilepath(filepath) {
        return '@import "' + filepath + '";';
    }

    let injectAppOptions = {
        transform: transformFilepath,
        starttag: '// inject:app',
        endtag: '// endinject',
        addRootSlash: false
    };
    let injectGlobalOptions = {
        transform: transformFilepath,
        starttag: '// inject:global',
        endtag: '// endinject',
        addRootSlash: false
    };
    return gulp.src("app/styles/sass/**/*.+(scss|sass)")
        .pipe(concat('styles.scss'))
        .pipe(wiredep())
        .pipe(inject(injectGlobalFiles, injectGlobalOptions))
        .pipe(inject(injectAppFiles, injectAppOptions))
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(cssnano())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest("dist/css"));
});

// Объединение и сжатие JS-файлов
gulp.task("scripts", function () {
    return gulp.src("app/js/**/*.js") // директория откуда брать исходники
        .pipe(concat('scripts.js')) // объеденим все js-файлы в один 
        .pipe(uglify()) // вызов плагина uglify - сжатие кода
        .pipe(rename({
            suffix: '.min'
        })) // вызов плагина rename - переименование файла с приставкой .min
        .pipe(gulp.dest("dist/js")); // директория продакшена, т.е. куда сложить готовый файл
});

// Сжимаем картинки
gulp.task('imgs', function () {
    return gulp.src("app/img/*.+(jpg|jpeg|png|gif)")
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }],
            interlaced: true
        }))
        .pipe(gulp.dest("dist/img"))
});

// Задача слежения за измененными файлами
gulp.task("watch", function () {
    gulp.watch("app/*.html", ["html"]);
    gulp.watch("app/js/**/*.js", ["scripts"]);
    gulp.watch("app/styles/sass/**/*.+(scss|sass)", ["sass"]);
    gulp.watch("app/img/*.+(jpg|jpeg|png|gif)", ["imgs"]);
});


// Запуск тасков по умолчанию
gulp.task("default", ["clean", "html", "sass","vendors", "scripts", "imgs", "watch"]);
