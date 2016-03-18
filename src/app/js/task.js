/**
 * Created by wupeng on 2015/7/2.
 */
"use strict";

let path = require('path');
let fs = require('fs-extra');
let stream = require('stream');


var grunt = require('grunt');
let gruntfile = require('./Gruntfile_project');
let fail = grunt.fail;
let util = grunt.util;
let oldLogFn = grunt.verbose.write;

grunt.verbose.write = function (msg) {
    postMessage(msg);
    oldLogFn.call(this, msg);
};

gruntfile(grunt);

// Handle otherwise unhandleable (probably asynchronous) exceptions.
var uncaughtHandler = function (e) {
    fail.fatal(e, fail.code.TASK_FAILURE);
};
process.on('uncaughtException', uncaughtHandler);

onmessage = function (e) {
    let taskName = e.data.taskName;
    let dir = e.data.dir;
    let cwd = process.cwd();


    //todo
    process.chdir(dir);

    // Report, etc when all tasks have completed.
    grunt.task.options({
        error: function (e) {
            fail.warn(e, fail.code.TASK_FAILURE);
        },
        done: function (done) {
            // Stop handling uncaught exceptions so that we don't leave any
            // unwanted process-level side effects behind. There is no need to do
            // this in the error callback, because fail.warn() will either kill
            // the process, or with --force keep on going all the way here.
            process.chdir(cwd);
            process.removeListener('uncaughtException', uncaughtHandler);

            // Output a final fail / success report.
            fail.report();

            if (done) {
                // Execute "done" function when done (only if passed, of course).
                done();
            } else {
                // Otherwise, explicitly exit.
                postMessage('end');
                util.exit(0);
            }
        }
    });

    let tasks = grunt.task.parseArgs([taskName]);
    tasks.forEach(function (name) {
        grunt.task.run(name);
    });

};
