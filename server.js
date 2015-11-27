
import mongoose from 'mongoose';
import Character from './models/character';
import config from './config';

var swig = require('swig');
var React = require('react');
import Router from 'react-router';
var routes = require('./app/routes');

import async from 'async';
import request from 'request';

let express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
import favicon from 'serve-favicon';

import _ from 'underscore';
import xml2js from 'xml2js';

mongoose.connect(config.database);
mongoose.connection.on('error', function() {
    console.log('Error: Could not connect to MongoDB');
});

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
app.use(express.static(path.join(__dirname, 'public')));

/**
    Get /api/characters
    随机获取两个角色
*/
app.get('/api/characters', function(req, res, next) {
    let choices = ['Female', 'Male'];
    let randomGender = _.sample(choices);
    console.log('choices: ' + randomGender);
    Character.find({
        random: {
            $near: [Math.random(), 0]
        }
    }).where('voted', false)
        .where('gender', randomGender)
        .limit(2)
        .exec(function(err, characters) {
            if(err) {
                return next(err);
            }
            console.log('random:' + characters);
            if(characters.length === 2) {
                return res.send(characters);
            }

            let oppositeGender = _.first(_.without(choices, randomGender));

            Character.find({random: {
                $near: [Math.random(), 0]
            }}).where('voted', false)
                .where('gender', oppositeGender)
                .limit(2)
                .exec(function(err, characters) {
                    if(err) {
                        return next(err);
                    }

                    if(characters.length === 2) {
                        return res.send(characters);
                    }

                    Character.update({}, {
                        $set: {
                            voted: false
                        }
                    },{
                        multi: true
                    }, function(err) {
                        if(err) {
                            return next(err);
                        }
                        res.send([]);
                    });
                });
        });
});

/**
    PUT /api/characters
    更新获胜和失败角色的数量
*/
app.put('/api/characters', function(req, res, next) {
    let winner = req.body.winner;
    let loser = req.body.loser;
    console.log('put: ' + winner, loser);
    if(!winner || !loser) {
        return res.status(400).send({
            message: 'Voting requires two characters.'
        })
    }

    if(winner === loser) {
        return res.status(400).send({
            message: 'Cannot vote for and against the same character.'
        })
    }

    async.parallel([
            function(callback) {
                Character.findOne({
                    characterId: winner
                }, function(err, winner) {
                    callback(err, winner);
                });
            },
            function(callback) {
                Character.findOne({
                    characterId: loser
                }, function(err, loser) {
                    callback(err, loser);
                });
            }
        ],
        function(err, results) {
            if(err) {
                return next(err);
            }

            let winner = results[0];
            let loser = results[1];

            if (!winner || !loser) {
                return res.status(404).send({ message: 'One of the characters no longer exists.' });
            }

            if(winner.voted || loser.voted) {
                return res.status(200).end();
            }

            async.parallel([
                function(callback) {
                    winner.wins++;
                    winner.voted = true;
                    winner.random = [Math.random(), 0];
                    winner.save(function(err) {
                        callback(err);
                    });
                },
                function(callback) {
                    loser.losses++;
                    loser.voted = true;
                    loser.random = [Math.random(), 0];
                    loser.save(function(err) {
                        callback(err);
                    });
                }
                ],
                function(err) {
                    if(err) {
                        return next(err);
                    }
                    res.status(200).end();
                }
            );
        }
    );
});

/**
    GET /api/characters/count
    获取总的角色数量
*/
app.get('/api/characters/count', function(req, res, next) {
    Character.count({}, function(err, count) {
        if(err) {
            return next(err);
        }
        res.send({
            count: count
        });
    });
});

/**
    Get /api/characters/top
    获取Top 100的角色
*/
app.get('/api/characters/top', function(req, res, next) {
    let params = req.query;
    let conditions = {};
    _.each(params, (value, key) => {
        conditions[key] = new RegExp('^' + value + '$', 'i');
    });

    Character.find(conditions).sort('-wins') //sort by descending order
        .limit(100)
        .exec((err, characters) => {
            console.log('/api/characters/top:' + err, characters);
            if(err) {
                return next(err);
            }

            //sort by winning percentage
            characters.sort((a, b) => {
                if(a.wins / (a.wins + a.losses) < b.wins / (b.wins + b.losses)) {
                    return 1;
                }
                if(a.wins / (a.wins + a.losses) > b.wins / (b.wins + b.losses)) {
                    return -1;
                }
                return 0;
            });
            res.send(characters);
        });
});

/**
    GET /api/character/:id
    根据ID查询角色
*/
app.get('/api/characters/:id', function(req, res, next) {
    let id = req.params.id;
    Character.findOne({
        characterId: id
    }, function(err, character) {
        if(err) {
            return next(err);
        }
        console.log('/api/character/:id=' + character);
        if(!character) {
            return res.status(404).send({
                message: 'Character not found.'
            });
        }
        res.send(character);
    });
});

/**
    GET /api/characters/shame
    获取100个失败最多的角色
*/
app.get('/api/characters/shame', function(req, res, next) {
    Character.find().sort('-losses')
        .limit(100).exec(function(err, characters) {
            if(err) {
                return next(err);
            }
            res.send(characters);
        });
});

/**
    POST /api/report
    举报角色，当举报次数超过3的时候，删除角色
*/
app.post('/api/report', function(req, res, next) {
    let characterId = req.body.characterId;

    Character.findOne({
        characterId: characterId
    }, function(err, character) {
        if(err) {
            return next(err);
        }
        if(!character) {
            return res.status(404).send({
                message: 'Character not found.'
            });
        }

        character.reports ++;

        if(character.reports > 3) {
            character.remove();
            return res.send({
                message: character.name + 'has been remove'
            });
        }

        character.sava(function(err) {
            if(err) {
                return next(err);
            }
            res.send({
                message: character.name + 'has been reported'
            });
        });
    });
});

/**
    GET /api/stats
    统计角色
*/
app.get('/api/stats', function(req, res, next) {
    async.parallel([
        function(callback) {
            Character.count({}, function(err, count) {
                callback(err, count);
            });
        },
        function(callback) {
            Character.count({
                race: 'Amarr'
            }, function(err, amarrCount) {
                callback(err, amarrCount);
            });
        },
        function(callback) {
            Character.count({
                race: 'Caldari'
            }, function(err, caldriCount) {
                callback(err, caldriCount);
            });
        },
        function(callback) {
            Character.count({
                race: 'Gallente'
            }, function(err, gallenteCount) {
                callback(err, gallenteCount);
            });
        },
        function(callback) {
            Character.count({
                race: 'Minmatar'
            }, function(err, minmaterCount) {
                callback(err, minmaterCount);
            });
        },
        function(callback) {
            Character.count({
                race: 'Male'
            }, function(err, maleCount) {
                callback(err, maleCount);
            });
        },
        function(callback) {
            Character.count({
                race: 'Female'
            }, function(err, femaleCount) {
                callback(err, femaleCount);
            });
        },
        function(callback) {
            Character.aggregate({
                $group: {
                    _id: null,
                    total: {
                        $sum: '$wins'
                    }
                }
            }, function(err, totalVotes) {
                let total = totalVotes.length ? totalVotes[0].total : 0;
                callback(err, total);
            })
        },
        function(callback) {
            Character.find()
                .sort('-wins')
                .limit(100)
                .select('race')
                .exec(function(err, characters) {
                    if(err) {
                        return next(err);
                    }
                    let raceCount = _.countBy(characters, function(character) {
                        return character.race;
                    });
                    let max = _.max(raceCount, function(race) {
                        return race;
                    });
                    let inverted = _.invert(raceCount);
                    let topRace = inverted[max];
                    let topCount = raceCount[topRace];

                    callback(err, {
                        race: topRace,
                        count: topCount
                    });
                });
        },
        function(callback) {
            Character.find()
                .sort('-wins')
                .limit(100)
                .select('bloodline')
                .exec(function(err, characters) {
                    if(err) {
                        return next(err);
                    }
                    let bloodlineCount = _.countBy(characters, function(character) {
                        return character.bloodline;
                    });
                    let max = _.max(bloodlineCount, function(bloodline) {
                        return bloodline;
                    });
                    let inverted = _.invert(bloodlineCount);
                    let topBloodline = inverted[max];
                    let topCount = bloodlineCount[topBloodline];

                    callback(err, {
                        bloodline: topBloodline,
                        count: topCount
                    });
                });
        }
    ],
    function(err, results) {
        if(err) {
            return next(err);
        }
        res.send({
            totalCount: results[0],
            amarrCount: results[1],
            caldariCount: results[2],
            gallenteCount: results[3],
            minmatarCount: results[4],
            maleCount: results[5],
            femaleCount: results[6],
            totalVotes: results[7],
            leadingRace: results[8],
            leadingBloodline: results[9]
        });
    });
});

/**
    POST /api/characters
    添加角色到数据库中
*/
app.post('/api/characters', function(req, res, next) {
    let gender = req.body.gender;
    let characterName = req.body.name;
    let characterIdLookupUrl = 'https://api.eveonline.com/eve/CharacterID.xml.aspx?names=' + characterName;
    console.log('post: ' + characterName, req.body);
    let parser = new xml2js.Parser();

    async.waterfall([
        function(callback) {
            request.get(characterIdLookupUrl, function(err, request, xml) {
                if(err) {
                    return next(err);
                }
                parser.parseString(xml, function(err, parsedXml) {
                    if(err) {
                        return next(err);
                    }
                    try {
                        let characterId = parsedXml.eveapi.result[0].rowset[0].row[0].$.characterID;
                        Character.findOne({
                            characterId: characterId
                        }, function(err, character) {
                            if(err) {
                                return next(err);
                            }
                            console.log(characterId, character);
                            if(character) {
                                return res.status(409).send({
                                    message: character.name + ' is already in the database.'
                                });
                            }
                            callback(err, characterId);
                        });
                    } catch (e) {
                        return res.status(400).send({
                            message: 'XML Parse Error'
                        })
                    }
                });
            });
        },
        function(characterId) {
            let characterInfoUrl = 'https://api.eveonline.com/eve/CharacterInfo.xml.aspx?characterID=' + characterId;

            request.get({
                url: characterInfoUrl
            }, function(err, request, xml) {
                if(err) {
                    return next(err);
                }
                parser.parseString(xml, function(err, parsedXml) {
                    if(err) {
                        return res.send(err);
                    }

                    try {
                        let name = parsedXml.eveapi.result[0].characterName[0];
                        let race = parsedXml.eveapi.result[0].race[0];
                        let bloodline = parsedXml.eveapi.result[0].bloodline[0];

                        let character = new Character({
                            characterId: characterId,
                            name: name,
                            race: race,
                            bloodline: bloodline,
                            gender: gender,
                            random: [Math.random(), 0]
                        });

                        character.save(function(err) {
                            if(err) {
                                return next(err);
                            }
                            res.send({
                                message: characterName + ' has been added successfully!'
                            });
                        })
                    } catch (e) {
                        res.status(404).send({ message: characterName + ' is not a registered citizen of New Eden.' });
                    }
                });
            });
        }
    ]);
});

/**
    服务端渲染React组件
*/
app.use(function(req, res) {
    //console.log(req);
    Router.run(routes, req.path, function(Handler) {
        var html = React.renderToString(React.createElement(Handler));
        debugger
        var page = swig.renderFile('views/index.html', {html: html});
        res.send(page);
    })
})

let server = require('http').createServer(app);
let io = require('socket.io')(server);
let onlineUsers = 0;

io.sockets.on('connection', function(socket) {
    onlineUsers ++;

    io.sockets.emit('onlineUsers', {
        onlineUsers: onlineUsers
    });

    socket.on('disconnect', () => {
        onlineUsers --;
        io.sockets.emit('onlineUsers', {
            onlineUsers: onlineUsers
        });
    });
});

server.listen(app.get('port'), function() {
    console.log('Express server running on port ' + app.get('port'));
});
