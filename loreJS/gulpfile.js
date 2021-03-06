﻿/// <binding AfterBuild='afterBuild' Clean='clean' ProjectOpened='default' />
/*
This file in the main entry point for defining Gulp tasks and using Gulp plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkId=518007
*/

var gulp = require('gulp');
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var rimraf = require("rimraf");

gulp.task('default', function () {
    
});

gulp.task("clean:wwwroot", function (cb) {
    rimraf("./wwwroot/js/", cb);
});
gulp.task("clean:js", function (cb) {
    rimraf("./../dist/**/*.js", cb);
    rimraf("./../dist/**/*.ts", cb);
});
gulp.task("clean", ["clean:js", "clean:wwwroot"]);

gulp.task("copy:js", function () {
    gulp.src("./TypeScript/*.js")
        .pipe(gulp.dest("./../dist/js/"));

    gulp.src("./TypeScript/*.*")
        .pipe(gulp.dest("./wwwroot/js/loreJS/"));

    gulp.src("./TypeScript/app/*.*")
        .pipe(gulp.dest("./wwwroot/js/"));
});

gulp.task("copy:typeDefs", function () {
    gulp.src("./TypeScript/*.d.ts")
        .pipe(gulp.dest("./../dist/js/"));
});

gulp.task("min:js", function () {
    gulp.src("./TypeScript/*.js")
        .pipe(uglify())
        .pipe(rename({
            extname: ".min.js"
        }))
        .pipe(gulp.dest("./wwwroot/js/loreJS/"))
        .pipe(gulp.dest("./../dist/js/"));
});

gulp.task("afterBuild", ["copy:typeDefs", "min:js", "copy:js"]);