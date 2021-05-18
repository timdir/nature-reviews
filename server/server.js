const crypto = require('crypto');
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const express = require('express');
const app = express();
const url = require('url');
const path = require('path');
const PORT = process.env.PORT;
const direc = '/nature-reviews/API/v1';
const statsFile = "./files/stats.txt";
const filename_01 = "./files/GET_parks_parkid.txt";
const filename_02 = "./files/GET_comments_parkid.txt";
const filename_03 = "./files/POST_users_signup.txt";
const filename_04 = "./files/POST_users_login.txt";
const filename_05 = "./files/POST_users_admin.txt";
const filename_06 = "./files/DELETE_sessions.txt";
const filename_07 = "./files/POST_sessions.txt";
const filename_08 = "./files/POST_comments.txt";
const filename_09 = "./files/PUT_comments.txt";
const filename_10 = "./files/DELETE_comments.txt";
const allFiles = [filename_01, filename_02, filename_03, filename_04, filename_05, filename_06, filename_07, filename_08, filename_09, filename_10];
const fs = require('fs');
const salt = bcrypt.genSaltSync(10); // 10 salt rounds
let file;


const connection = mysql.createConnection({
    host: "localhost",
    user: "synoftqc_nature-reviews-admin",
    password: "e5TUa87xti7dHc7fhSihdv",
    database: "synoftqc_nature-reviews"
});


app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'https://synopede.pw/nature-reviews'); //change this to client origin of files
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
});



//read and update one of the 10 files
function updateFile (filename) {
    
    //read file
    let data;
    data = fs.readFileSync(filename, 'utf8');
    data = Number(data) + 1;
    
    //write the updated data to file
    fs.writeFile(filename, data, 'utf8', function(err, data) {
        if (err) {
            throw err;
        } else {
            console.log('WRITE OK: '+filename);
        }
    });
}



//get park by id
app.get(direc+"/parks/:id", (req, res) => {
    const q = url.parse(req.url, true);
    let s = q.pathname;
    let park_id = s.substring(s.lastIndexOf("/")+1, s.length);
    
    
    //update stat file for this 1 page
    try {
        updateFile( filename_01 );
    } catch (e) {
        res.status(500);
        res.send('General server error.');
        return;
    }
    
    
    connection.query(`SELECT * FROM parks WHERE park_id=${park_id}`,

    (err, result) => {
        if (err) {
            res.status(500);
            res.send('General server error.');
        }

        if (result.length === 0) { //park with that park_id does not exist
            res.status(404);
            res.send(`The park with id:${park_id} does not exist.`);
        }
        else { //park found
            result = result[0];
            res.status(200);
            res.send(result);
        }
    });
});



//get comments on a park page by park_id
app.get(direc+"/comments/:id", (req, res) => {
    const q = url.parse(req.url, true);
    let s = q.pathname;
    let park_id = s.substring(s.lastIndexOf("/")+1, s.length);
    
    //update stat file for this 1 page
    try {
        updateFile( filename_02 );
    } catch (e) {
        res.status(500);
        res.send('General server error.');
        return;
    }



    connection.query(`SELECT * FROM parks WHERE park_id=${park_id}`,

    (err, result) => {
        if (err) {
            res.status(500);
            res.send('General server error.');
        }

        if (result.length === 0) { //park with that park_id does not exist
            res.status(404);
            res.send(`The park with id:${park_id} does not exist.`);
        }
        else { //park_id exists
            
            connection.query( `SELECT u.username, c.c_date, c.c_comment
                                FROM user_park_comments c, users u
                                WHERE c.park_id='${park_id}' AND c.user_id=u.user_id
                                ORDER BY c.c_date;`,
        
            (err, result) => {
                if (err) {
                    res.status(500);
                    res.send('General server error.');
                }
                
                if (result.length === 0) { //no comments
                    res.status(404);
                    res.send(`No comments found for the park with id:${park_id}.`);
                }
                else { //park_id exists
                    res.status(200);
                    res.send(result);
                }
            });
        }
    });
});


//create new user
app.post(direc+'/users/signup', function (req, res) {
    let session_key;         //create session key for user
    let hashedPassword;
    let body = '';
    
    //update stat file for this 1 page
    try {
        updateFile( filename_03 );
    } catch (e) {
        res.status(500);
        res.send('General server error.');
        return;
    }
    
    
    //handle errors
    req.on('error', (err) => {
        if(err) {
            res.status(500);
            res.send('Server error.  User not created.');
            return;
        }
    });
    
    // read POST data
    req.on('data', chunk => {
        body += chunk.toString();
        //make sure user does not send a lot of data
        if (body.length > 1e3) {
            res.status(400);
            res.send('You are sending too much data!');
            return;
        }
    });

    req.on('end', () => {
        
        let parsed = JSON.parse(body);        

        //check is username is already in use
        //if not, add it to DB
        //else send message to user
        connection.query(`SELECT username FROM users WHERE username='${parsed.username}'`,

        (err, result) => {
            if (err) {
                res.status(500);
                res.send('Server error.  User not created.');
                throw err;
            }
    
            if ( JSON.stringify(result[0]) ) { //username in already in use
                res.status(409);
                res.send(`The username '${parsed.username}' is already in use.`);
            } else { //username not in use
                const hashedPassword = bcrypt.hashSync(parsed.password, salt);
                connection.query(`INSERT INTO users( username,password )VALUES( '${parsed.username}','${hashedPassword}' );`,
                (err, result) => {
                    if (err) {
                        res.status(500);
                        res.send('Server error.  User not created.');
                        throw err;
                    }
                    else {

                        connection.query(`SELECT user_id FROM users WHERE username='${parsed.username}'`,

                        (err, result) => {
                            if (err) {
                                res.status(500);
                                res.send('Server error.  User not created.');
                                throw err;
                            } else {
                                
                                let user_id = result[0].user_id;
                                
                                //create session key
                                session_key = generatesessionKey();
        
                                connection.query(`INSERT INTO sessions( session_key,user_id )VALUES( '${session_key}','${user_id}' );`,
                                (err, result) => {
                                    if (err) {
                                        res.send('error');
                                        throw err;
                                    }
                                });  
                            
                                //send session key to user
                                res.status(201);
                                res.send(`{"session_key":"${session_key}"}`);
                                
                            }
                        });
                    }
                });    
            }
        });
    });
});


//login user
app.post(direc+'/users/login', function (req, res) {
    let hashedPassword;     //store hashed password in DB
    let session_key;         //create session key for user
    let username;
    let body = '';
    
    //update stat file for this 1 page
    try {
        updateFile( filename_04 );
    } catch (e) {
        res.status(500);
        res.send('General server error.');
        return;
    }
    
    //handle errors
    req.on('error', (err) => {
        if(err) {
            res.status(500);
            res.send('General server error.');
            return;
        }
    });
    
    // read POST data
    req.on('data', chunk => {
        body += chunk.toString();
        //make sure user does not send a lot of data
        if (body.length > 1e3) {
            res.send('You are sending too much data!');
            return;
        }
    });

    req.on('end', () => {
        
        let parsed = JSON.parse(body);        
        
        //login disallowed for 'admin'.  'admin' only logs into admin.html page
        if ( username === 'admin' ) {
            res.status(401);
            res.send('Unauthorized access.');
        }
        
        //get hashed password of username from DB
        connection.query(`SELECT password,user_id FROM users WHERE username='${parsed.username}'`,
        (err, result) => {
            if (err) {
                res.send('error');
                throw err;
            } else if (result.length === 0) {  //username not found
                res.status(404);
                res.send("Username not found.");
            } else {
                hashedPassword = result[0].password;
                user_id = result[0].user_id;
                
                
                
                
                //delete old session key
                connection.query(`DELETE FROM sessions WHERE user_id='${user_id}'`,
                (err, result) => {
                    if (err) {
                        res.status(500);
                        res.send('General server error.');
                    } else {


                        //compare hashed password of user in DB to user entered password
                        bcrypt.compare(parsed.password, hashedPassword, function(err, match) {
                            if (err) {
                                throw err
                            } else if (!match) {
                                res.status(400);
                                res.send("Incorrect password.");
                            } else { //Correct password was entered
                            
                                //create session key
                                session_key = generatesessionKey();
        
                                //store session key in `sessions` table in DB
                                connection.query(`INSERT INTO sessions( session_key,user_id )VALUES( '${session_key}','${user_id}' );`,
                                (err, result) => {
                                    if (err) {
                                        res.status(500);
                                        res.send('General server error.');
                                        throw err;
                                    }
                                });
                            
                                //send session key to user
                                res.status(200);
                                res.send(`{"session_key":"${session_key}"}`);
                            }
                        });
                    }
                });
            }
        });
    });
});


let generatesessionKey = function() {
    return crypto.randomBytes(16).toString('base64');
};



//login admin user
app.post(direc+'/users/admin', function (req, res) {
    let body = '';
    
    //update stat file for this 1 page
    try {
        updateFile( filename_05 );
    } catch (e) {
        res.status(500);
        res.send('General server error.');
        return;
    }
    
    //handle errors
    req.on('error', (err) => {
        if(err) {
            throw err;
            res.status(500)
            res.send('General server error.');
            return;
        }
    });
    
    // read POST data
    req.on('data', chunk => {
        body += chunk.toString();
        //make sure user does not send a lot of data
        if (body.length > 1e3) {
            res.status(400);
            res.send('You are sending too much data!');
            return;
        }
    });

    req.on('end', () => {
        
        let parsed = JSON.parse(body);
        
        //make sure username is 'admin'
        if ( parsed.username !== 'admin' ) {
            res.status(401);
            res.send('Unauthorized access.');
        }
        else { // username === 'admin'
            //get hashed password of admin from DB
            connection.query(`SELECT password FROM users WHERE username='admin'`,
            (err, result) => {
                if (err) {
                    throw err;
                    res.status(500)
                    res.send('General server error.');
                } else if (result.length === 0){
                    res.status(500)
                    res.send('General server error.');
                } else {
                    
                    hashedPassword = result[0].password;

                    //compare hashed password of admin's password to user entered password
                    bcrypt.compare(parsed.password, hashedPassword, function(err, match) {
                        if (err) {
                            throw err;
                            res.status(500)
                            res.send('General server error.');
                        } else if (!match) {
                            res.status(400);
                            res.send("Incorrect password.");
                        } else { //Correct password was entered
                        
                            
                            try {
                                updateStatsFile();
                                data = fs.readFileSync( statsFile, 'utf8' );    //read updated file
                                res.status(200);
                                res.send(data);
                            } catch (e) {
                                res.status(500)
                                res.send('General server error.');
                            }
                            
                            
                        }
                    });
                }
            });
        }
    });
});



//allFiles is an array of all 10 files in order
function updateStatsFile() {
    let filename, data, tempStatsFile, tempStats;
    
    tempStatsFile = fs.readFileSync( statsFile, 'utf8' );   //read stats.txt file
    tempStats = JSON.parse( tempStatsFile );                //create temporary stats file
    
    //write stats from all 10 files into temporary file
    for (let i=0; i<allFiles.length; i++) {
        data = fs.readFileSync( allFiles[i], 'utf8' );  //read from each of the 10 files
        data = Number(data);
        tempStats[i].requests = data;
    }
    
    //write stats into stats.txt
    tempStats = JSON.stringify( tempStats );
    fs.writeFile(statsFile, tempStats, 'utf8', function(err, data) {
        if (err) {
            throw err;
        } else {
            //executed successfully
        }
    });
}





//delete a user's session key from DB
app.delete(direc+'/sessions', function (req, res) {
    let body = '';
    
    //update stat file for this 1 page
    try {
        updateFile( filename_06 );
    } catch (e) {
        res.status(500);
        res.send('General server error.');
        return;
    }
    
    //handle errors
    req.on('error', (err) => {
        if(err) {
            res.status(500);
            res.send('General server error.');
            return;
        }
    });
    
    // read data
    req.on('data', chunk => {
        body += chunk.toString();
        //make sure user does not send a lot of data
        if (body.length > 1e3) {
            res.status(400);
            res.send('You are sending too much data!');
            return;
        }
    });

    req.on('end', () => {
        
        let parsed = JSON.parse(body);

        //delete tuple from sessions table
        connection.query(`DELETE FROM sessions WHERE session_key='${parsed.session_key}'`,
        (err, result) => {
            if (err) {
                res.status(500);
                res.send('General server error.');
            } else {
                res.status(204);
                res.send('Session terminated.');
            }
        });
    });
});



//verify identity of user via session key
//returns username
app.post(direc+'/sessions', function (req, res) {
    let username,user_id;
    let body = '';
    
    //update stat file for this 1 page
    try {
        updateFile( filename_07 );
    } catch (e) {
        res.status(500);
        res.send('General server error.');
        return;
    }
    
    //handle errors
    req.on('error', (err) => {
        if(err) {
            res.status(500);
            res.send('General server error.');
            return;
        }
    });
    
    // read data
    req.on('data', chunk => {
        body += chunk.toString();
        //make sure user does not send a lot of data
        if (body.length > 1e3) {
            res.status(400);
            res.send('You are sending too much data!');
            return;
        }
    });

    req.on('end', () => {
        
        let parsed = JSON.parse(body);

        //delete tuple from sessions table
        connection.query(`SELECT user_id FROM sessions WHERE session_key='${parsed.session_key}'`,
        (err, result) => {
            if (err) {
                res.status(500);
                res.send('General server error.');
            } else if ( result.length === 0 ) {
                res.status(400);
                res.send('Invalid session key.');
            } else {
                
                user_id = result[0].user_id;
                
                //get username from DB
                connection.query(`SELECT username FROM users WHERE user_id='${user_id}'`,
                (err, result) => {
                    if (err) {
                        res.status(500);
                        res.send('General server error.');
                    } else {
                        username = result[0].username;
                        res.status(200);
                        res.send( username ); //return username
                    }
                });
            }
        });
    });
});



//add a comment to the DB
app.post(direc+'/comments', function (req, res) {
    let body = '';
    
    //update stat file for this 1 page
    try {
        updateFile( filename_08 );
    } catch (e) {
        res.status(500);
        res.send('General server error.');
        return;
    }
    
    //handle errors
    req.on('error', (err) => {
        if(err) {
            res.status(500);
            res.send('General server error.');
            return;
        }
    });
    
    // read data
    req.on('data', chunk => {
        body += chunk.toString();
        if (body.length > 1e3) {
            res.status(400);
            res.send('You are sending too much data!');
            return;
        }
    });

    req.on('end', () => {
        
        let parsed = JSON.parse(body);

        let user_id;
        connection.query(`SELECT user_id FROM users WHERE username='${parsed.username}'`,
        (err, result) => {
            if (err) {
                res.status(500);
                res.send('General server error.');
            } else if (result.length === 0){
                res.status(404);
                res.send("Username not found.");
            } else {

                user_id = result[0].user_id;
                
                
                connection.query(`SELECT * FROM sessions WHERE user_id='${user_id}' AND session_key='${parsed.session_key}'`,
                (err, result) => {
                    if (err) {
                        res.status(500);
                        res.send('General server error.');
                    } else if (result.length === 0){
                        res.status(401);    //invalid session_key
                        res.send("The session key submitted is incompatible with the username.");
                    } else {

                        connection.query(`INSERT INTO user_park_comments( user_id, park_id, c_date, c_comment ) 
                                            VALUES('${user_id}', '${parsed.park_id}', '${parsed.c_date}', '${parsed.c_comment}');`,
                        (err, result) => {
                            if (err) {
                                res.status(500);
                                res.send('General server error.  Comment not added.');
                            }
                            else {
                                res.status(201);
                                res.send('Comment added.');
                            }
                        });  
                    }
                });  
            }
        });
    });
});



//put edited comment into DB
app.put(direc+'/comments', function (req, res) {
    let body = '';
    
    //update stat file for this 1 page
    try {
        updateFile( filename_09 );
    } catch (e) {
        res.status(500);
        res.send('General server error.');
        return;
    }
    
    //handle errors
    req.on('error', (err) => {
        if(err) {
            res.status(500);
            res.send('General server error.  Comment not updated.');
            return;
        }
    });
    
    // read data
    req.on('data', chunk => {
        body += chunk.toString();
        //make sure user does not send a lot of data
        if (body.length > 1e3) {
            res.status(400);
            res.send('You are sending too much data!');
            return;
        }
    });

    req.on('end', () => {
        
        let parsed = JSON.parse(body);

        connection.query(`SELECT user_id FROM users WHERE username='${parsed.username}'`,
    
        (err, result) => {
            if (err) {
                res.status(500);
                res.send('General server error.  Comment not updated.');
                return;
            }
    
            if (result.length === 0) { //username does not exist
                res.status(404);
                res.send(`The user with id:${user_id} does not exist.`);
            }
            else { //username exists
            
                let user_id,c_date;
                user_id = result[0].user_id;
                
                connection.query(`SELECT * FROM sessions WHERE user_id='${user_id}' AND session_key='${parsed.session_key}'`,
                (err, result) => {
                    if (err) {
                        res.status(500);
                        res.send('General server error.');
                    } else if (result.length === 0){
                        res.status(401);    //invalid session_key
                        res.send("The session key submitted is incompatible with the username.");
                    } else {

                        connection.query(`UPDATE user_park_comments SET c_comment = '${parsed.c_comment}'
                                            WHERE user_id = '${user_id}' AND park_id = '${parsed.park_id}' AND c_date = '${parsed.c_date}';`,
        
                        (err, result) => {
                            if (err) {
                                res.status(500);
                                res.send('General server error.  Comment not updated.');
                            } else {
                                res.status(200);
                                res.send('Comment updated successfully!');
                            }
                        });
                    }
                });
            }
        });
    });
});






//delete a comment
app.delete(direc+'/comments', function (req, res) {
    let body = '';
    
    //update stat file for this 1 page
    try {
        updateFile( filename_10 );
    } catch (e) {
        res.status(500);
        res.send('General server error.');
        return;
    }
    
    //handle errors
    req.on('error', (err) => {
        if(err) {
            res.status(500);
            res.send('General server error.');
            return;
        }
    });
    
    // read data
    req.on('data', chunk => {
        body += chunk.toString();
        //make sure user does not send a lot of data
        if (body.length > 1e3) {
            res.status(400);
            res.send('You are sending too much data!');
            return;
        }
    });

    req.on('end', () => {
        
        let parsed = JSON.parse(body);

        connection.query(`SELECT user_id FROM users WHERE username='${parsed.username}'`,
    
        (err, result) => {
            if (err) {
                res.status(500);
                res.send('General server error.');
                return;
            }
    
            if (result.length === 0) { //username does not exist
                res.status(404);
                res.send(`The user with id:${user_id} does not exist.`);
            }
            else { //username exists
            
                let user_id;
                user_id = result[0].user_id;
                
                
                connection.query(`SELECT * FROM sessions WHERE user_id='${user_id}' AND session_key='${parsed.session_key}'`,
                (err, result) => {
                    if (err) {
                        res.status(500);
                        res.send('General server error.');
                    } else if (result.length === 0){
                        res.status(401);    //invalid session_key
                        res.send("The session key submitted is incompatible with the username.");
                    } else {
                        
                        connection.query(`DELETE FROM user_park_comments 
                            WHERE user_id = '${user_id}' AND park_id = '${parsed.park_id}' AND c_date = '${parsed.c_date}';`,
        
                        (err, result) => {
                            if (err) {
                                res.status(500);
                                res.send('General server error.  Comment not deleted.');
                            } else {
                                res.status(204);
                                res.send('Comment deleted.');
                            }
                        });
                    }
                });
            }
        });
    });
});


app.listen(PORT, () => console.log('server started'));