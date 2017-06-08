var express = require('express');
var router = express.Router();
var mongo = require('mongodb').MongoClient;
var assert = require('assert');

var url = 'mongodb://localhost:27017/Tasks';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
/*---------------register new user---------------*/
router.post('/reg', function(req, res, next) {
    var user = {
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        tasks: [],
        shared: []
    };
    mongo.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection('users').insertOne(user, function (err, result) {
            assert.equal(null, err);
            console.log('user added');
            db.close();
        });
    });
    res.redirect('/');
});
/*-----------------------Sign in------------------*/
router.post('/signin', function (req, res) {
    var email = req.body.email;
    var pas = req.body.pas;
    var er = [];
    mongo.connect(url, function (err, db) {
        assert.equal(null, err);
        var cursor = db.collection('users').find({email: email});
        cursor.forEach(function(doc, err) {
            assert.equal(null, err);
            er.push(doc);
        }, function() {
            if(er[0].password != pas) {
                var error = false;
               res.send(error);
            }
            else {
                //res.redirect('/MyTask');
                res.render('index');
            }
            db.close();
        });
    });
});
/*--------------------My Tasks---------------------*/
router.get('/MyTask', function (req, res) {
    var Tasks =[];
    var sharedTasks = [];
    var cookies = parseCookies(req);
    var email = cookies.email;
    mongo.connect(url, function (err, db) {
        db.collection('users').findOne({email: email}, function (err, result) {
            var length = result.tasks.length;
            var lengthST = result.shared.length;
            for(var i=0; i<length; i++) {
                Tasks.push(result.tasks[i]);
            }
            for(var j=0; j< lengthST; j++) {
                sharedTasks.push(result.shared[j]);
            }
            res.render('MyTask', {tasks: Tasks});
        });
        db.close();
    });
});
/*-----------------------------------Share TAsk------------------------*/
router.get('/sharedTask', function (req, res) {
    var arr = [];
    var tasks = [];
    var cookies = parseCookies(req);
    var email = cookies.email;
    mongo.connect(url, function (err, db) {
        assert.equal(null, err);
        db.collection('users').find().toArray(function (err, doc) {
            assert.equal(null, err);
            for (var l=0; l< doc.length; l++) {
                if(doc[l].email == email) {
                    arr = doc[l].shared;
                }
            }
            for(var i=0; i<arr.length; i++) {
                for(var j=0; j< doc.length; j++) {
                    if(doc[j].email == arr[i].email) {
                        for(var k=0; k < doc[j].tasks.length; k++) {
                            if(doc[j].tasks[k].name == arr[i].name.slice(0, -1)) {
                                var obj = {};
                                obj.user = doc[j].name;
                                obj.email = doc[j].email;
                                obj.task = doc[j].tasks[k];
                                tasks.push(obj);
                            }
                        }
                    }
                }
            }
            //console.log(tasks);
            res.render('SharedTask', {shared: tasks});
            db.close();
        })
    });
});
/*-------------------------show page for update share record-----------------*/
router.get('/share/update/:name/:email', function (req, res) {
    var name = req.params.name;
    var email = req.params.email;
    GetUpdate(email, name, 'ShareUpdate', res);
});
/*-------------------------------update share record----------------------------*/
router.post('/share/update/:name/:email', function (req, res) {
    var name = req.params.name;
    var email = req.params.email;
    var newTask = req.body;
   PostUpdate(email, name, '/SharedTask', newTask, res);
});
/*------------------------CREATE TASK----------------------------*/
router.get('/AddTask', function (req, res) {
    res.render('AddTask');
});
router.post('/AddTask', function (req, res) {
    var task = {
        name: req.body.name,
        dateStart: req.body.dateStart,
        dateEnd: req.body.dateEnd,
        status: req.body.status,
        priority: req.body.priority
    };
    var cookies = parseCookies(req);
    var email = cookies.email;
    mongo.connect(url, function (err, db) {
        assert.equal(null, err);
        var user = db.collection('users').updateOne({email: email}, {$push: {tasks: task}});
        db.close();
    });
    res.render('AddTask');
});
/*---------------------UPDATE TASK-----------------------*/
router.get('/update/:name', function (req, res) {
    var name = req.params.name;
    var cookies = parseCookies(req);
    var email = cookies.email;
   GetUpdate(email, name, 'Update', res);
});
router.post('/update/:name', function (req, res) {
    var name = req.params.name;
    var cookies = parseCookies(req);
    var email = cookies.email;
    var newTask = req.body;
   PostUpdate(email, name, '/MyTask', newTask, res);
});
/*--------------------------------delete item------------------------*/
router.post('/delete/:name', function (req, res) {
    var name = req.params.name;
    var cookies = parseCookies(req);
    var email = cookies.email;
    mongo.connect(url, function (err, db) {
       assert.equal(null, err);
       db.collection('users').updateOne({email: email}, {$pull : {tasks: {name: name.slice(1)}}}, { multi: true }, function(err, result) {
           assert.equal(null, err);
           db.close();
           res.redirect('/');
       });
    });
});
/*----------------------delete shared record------------------------*/
router.post('/share/delete/:name', function (req, res) {
    var name = req.params.name + ' ';
    var cookies = parseCookies(req);
    var email = cookies.email;
    mongo.connect(url, function (err, db) {
        assert.equal(null, err);
        db.collection('users').updateOne({email: email}, {$pull : {shared: {name: name.slice(1)}}}, {multi: true}, function (err, result) {
           assert.equal(null, err);
           db.close();
           res.redirect('/SharedTask');
        })
    });
});
/*------------------------SHARE TASK--------------------*/
router.get('/share', function (req, res) {
    var emails =[];
    mongo.connect(url, function (err, db) {
        assert.equal(null, err);
        var cursor = db.collection('users').find({});
        cursor.forEach(function (doc, err) {
            assert.equal(null, err);
            emails.push(doc.email);
        }, function () {
            db.close();
            res.send(emails);
        });
    });
});
router.post('/share', function (req, res) {
    console.log(req.body);

    var recipient = req.body.recipient;
    var share = {
        email: req.body.sender,
        name: req.body.name
    };
        console.log(share);
        mongo.connect(url, function(err, db) {
            assert.equal(null, err);
            db.collection('users').updateOne({email: recipient.slice(0, -1)}, {$push: {shared: share}}, function (err, doc) {
                assert.equal(null, err);
                console.log('added');

            });
            db.close();
            res.end();
        });

    //res.redirect('/MyTask');
});

function parseCookies (request) {
    var list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}
function GetUpdate(email, name, render, res) {
    mongo.connect(url, function (err, db) {
        assert.equal(null, err);
        var task;
        var user = db.collection('users').findOne({email: email, "tasks.name" : name});
        user.then(function(result) {
            for(var i=0; i< result.tasks.length; i++) {
                if(result.tasks[i].name == name) {
                    task = result.tasks[i];
                    task.email = email;
                }
            }
            res.render(render, {task: task});
        });
        db.close();
    });
}
function PostUpdate(email, name, redir, newTask, res) {
    mongo.connect(url, function (err, db) {
        assert.equal(null, err);
        db.collection('users').updateOne({email: email, "tasks.name": name},
            {$set : {"tasks.$.name" : newTask.name,
                "tasks.$.priority" : newTask.priority,
                "tasks.$.dateStart": newTask.dateStart,
                "tasks.$.dateEnd": newTask.dateEnd,
                "tasks.$.status": newTask.status} });
        db.close();
        res.redirect(redir);
    });
}

module.exports = router;
