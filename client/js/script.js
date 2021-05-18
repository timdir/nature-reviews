const xhttp = new XMLHttpRequest();
const endPointRoot = "https://synopede.pw/nature-reviews/API/v1";

function openHomePage() {
    window.location = "home.html";
}

function openLoginPage() {
    window.location = "login.html";
}

function openSignUpPage() {
    window.location = "signup.html";
}


function editComment(comment) {
    //only logged in users can edit a comment
    let username = document.getElementById("greeting-name").innerHTML;
    
    if ( username === "Guest" ) {
        return;  //user not logged in
    } else { //user is logged in
    
        let commentID,commentBody;
        commentID = comment.id;
        commentID = commentID.substring(12, commentID.length);
        
        document.getElementById("edit-button_"+commentID).style = 'visibility: hidden;'; //hide Edit button
        document.getElementById("done-edit-button_"+commentID).style = 'visibility: visible;'; //unhide Done Editing button
        hideEditTextArea(false,commentID);   //unhide textarea
        
        //set text in textarea to text that was already there
        commentBody = document.getElementById("comment-body_"+commentID).innerHTML;
        document.getElementById("comment-edit-ta_"+commentID).value = commentBody;
        
        hideCommentBody(true,commentID);     //hide comment body
    }
}


function putComment(comment) {
    //only logged in users can edit a comment
    let username = document.getElementById("greeting-name").innerHTML;
    
    if ( username === "Guest" ) {
        return;  //user not logged in
    } else { //user is logged in
    
        let commentID,commentBody;
        commentID = comment.id;
        commentID = commentID.substring(17, commentID.length);
        
        document.getElementById("done-edit-button_"+commentID).style = 'visibility: hidden;'; //hide Done Editing button
        commentBody = document.getElementById("comment-edit-ta_"+commentID).value;
        
        let resource;
        let params;
        let data;
        let session_key,park_id,c_date,username;
        
        session_key = localStorage.getItem("session_key");
        park_id = document.getElementsByTagName("body")[0].id;
        park_id = park_id.substring(8, park_id.length);
        c_date = document.getElementById("comment-time_"+commentID).innerHTML;
        username = document.getElementById("comment-user_"+commentID).innerHTML;
    
        params = { "session_key":session_key, "username":username, "park_id":park_id, "c_date":c_date, "c_comment":commentBody };
        data = JSON.stringify(params);
        resource = "/comments";
        xhttp.open('PUT', endPointRoot+resource, true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send(data);
        xhttp.onreadystatechange = function () {
            if ( this.readyState == 4 ) {
                if ( this.status == 200 ) {
                    //comment updated
                } else {
                    alert(this.responseText);
                }
            }
        }
        
        hideEditTextArea(true,commentID);   //hide textarea
        hideCommentBody(false,commentID);   //unhide comment body

        //set text in textarea to text that was already there
        commentBody = document.getElementById("comment-edit-ta_"+commentID).value;
        document.getElementById("comment-body_"+commentID).innerHTML = commentBody;
        
        document.getElementById("edit-button_"+commentID).style = 'visibility: visible;'; //unhide Edit button
    
    }
}


//post comment to server, then display on park page
function postComment() {
    let resource;
    let params;
    let data;
    let session_key,username,park_id,c_comment,c_date;
    
    username = document.getElementById("greeting-name").innerHTML;
    
    if ( username === "Guest" ) {
        return;  //user not logged in
    } else { //user is logged in
    
        c_comment = document.getElementById("comment-ta").value;
        if ( !c_comment ) {
            alert("Please enter some text.");
            return; //no text entered for comment
        }
        
        session_key = localStorage.getItem("session_key");
        park_id = document.getElementsByTagName("body")[0].id;
        park_id = park_id.substring(8, park_id.length);
        c_date = getDateWithUTCFormatting( new Date() );
    
        params = { "session_key":session_key, "username":username, "park_id":park_id, "c_date":c_date, "c_comment":c_comment };
        data = JSON.stringify(params);
        resource = "/comments";
        xhttp.open('POST', endPointRoot+resource, true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send(data);
        xhttp.onreadystatechange = function () {
            if ( this.readyState == 4 ) {
                if ( this.status == 201 ) { 
    
                    //n is current comment number
                    let n = document.getElementsByClassName("user-says");
                    n = n.length + 1;
    
                    //new comment div for new comment
                    duplicateCommentDiv(n);
                    document.getElementById("comment-user_"+n).innerHTML = username;
                    document.getElementById("comment-time_"+n).innerHTML = c_date;
                    document.getElementById("comment-body_"+n).innerHTML = c_comment;
                    moveCommentBoxToBottomOfPage();
                    document.getElementById("comment-ta").value = "";
                    
                    hideUsersEditAndDoneEditButtons(false);
                } else {
                    alert( this.responseText );
                }
            }
        }
    }
}


function deleteComment(comment) {
    
    // only logged in users can edit a comment
    let username = document.getElementById("greeting-name").innerHTML;
    
    if ( username === "Guest" ) {
        return;  //user not logged in
    } else { //user is logged in
        

        let resource;
        let params;
        let data;
        let username,park_id,c_date,session_key;
        
        let commentID;
        commentID = comment.id;
        commentID = commentID.substring(14, commentID.length);

        session_key = localStorage.getItem("session_key");
        park_id = document.getElementsByTagName("body")[0].id;
        park_id = park_id.substring(8, park_id.length);
        username = document.getElementById("comment-user_"+commentID).innerHTML;
        c_date = document.getElementById("comment-time_"+commentID).innerHTML;

        params = { "session_key":session_key, "username":username, "park_id":park_id, "c_date":c_date };
        data = JSON.stringify(params);
        resource = "/comments";
        xhttp.open('DELETE', endPointRoot+resource, true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send(data);
        xhttp.onreadystatechange = function () {
            if ( this.readyState == 4 ) {
                if ( this.status == 204 ) {
                    let elem;
                    elem = document.getElementById('comment_'+commentID);
                    elem.remove();  //delete comment on client side
                } else {
                    alert( this.responseText );
                }
            }
        }
    }
}


function getDateWithUTCFormatting(date) {
    let Y,M,D,h,m,s;
    Y = date.getUTCFullYear().toString();
    M = date.getUTCMonth() + 1;
    M = M.toString();
    D = date.getUTCDate().toString();
    h = date.getUTCHours().toString();
    m = date.getUTCMinutes().toString();
    s = date.getUTCSeconds().toString();
    let a = [Y,M,D,h,m,s];
    for (let i=0; i<a.length; i++) {
        if ( a[i].length === 1 ) {
            a[i] = "0" + a[i]; //eg. turn '3' into '03'
        }
    }
    let UTCDate = `${a[0]}-${a[1]}-${a[2]} ${a[3]}:${a[4]}:${a[5]} UTC`;
    return UTCDate;
}


function loadPage() {
    verifyIdentityOfUser();
}


//This function enables the comment box for users to post,
//enables the edit, done editing and delete buttons
//and changes the greeting to the user's username
function verifyIdentityOfUser() {
    let resource;
    let params;
    let data;
    let session_key;
    session_key = localStorage.getItem("session_key");
    
    if ( !session_key ) {  //no session key exists in local storage
        hideLoginAndSignupButtons(false);
        return;
    }

    params = { "session_key":session_key };
    data = JSON.stringify(params);
    resource = "/sessions";
    xhttp.open('POST', endPointRoot+resource, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(data);
    xhttp.onreadystatechange = function () {
        if ( this.readyState == 4 ) {
            if ( this.status == 200 ) {
                grantUserAccess( this.responseText );
            } else {
                alert( this.responseText );
            }
        }
    }
}


//the user is logged in
//we could be at Homepage or a park page
function grantUserAccess(username) {
    
    document.getElementById("greeting-name").innerHTML = username;  //rewrite greeting to 'Hello, <username>!'
    document.getElementById("greeting").style = 'visibility: visible';
    
    enableCommentBox();         //for posting comments
    hideEnterButton(false);     //for posting comments
    hideLogoutButton(false);
    hideLoginAndSignupButtons(true);
    hideUsersEditAndDoneEditButtons(false);

}

function enableCommentBox() {
    //enable use of comment box if exists
    let elem, elems;
    elem = document.getElementById("comment-ta");
    if ( elem ) { //element exists
        elem.placeholder = "Post your thoughts...";
        elem.style = 'pointer-events: auto;';
    }
}

function hideEnterButton(param) {
    //show Enter button for posting a comment if it exists
    elem = document.getElementById("enterButton");
    if ( elem ) { //element exists
        if ( param ) {
            elem.style = 'visibility: hidden;';
        } else {
            elem.style = 'visibility: visible; float: left;';
        }
    }
}

function hideLogoutButton(param) {
    elem = document.getElementById("logoutButton");
    if ( elem ) { //element exists
        if ( param ) {
            elem.style = 'visibility: hidden;';
        } else {
            elem.style = 'visibility: visible; float: left;';
        }
    }
}

function hideLoginAndSignupButtons(param) {
    loginBtns = document.getElementsByClassName("loginButton");
    signupBtns = document.getElementsByClassName("signupButton");
    let i;
    if ( loginBtns ) { //element exists
        if ( param ) {
            for (i=0; i<loginBtns.length; i++) {
                loginBtns[i].style = 'visibility: hidden;';
                signupBtns[i].style = 'visibility: hidden;';
            }
        } else {
            for (i=0; i<loginBtns.length; i++) {
                loginBtns[i].style = 'visibility: visible;';
                signupBtns[i].style = 'visibility: visible;';
            }
        }
    }
}

//TRUE to hide it
//FALSE to unhide it
function hideEditTextArea(param,commentID) {
    let elem;
    if ( param ) {
        //hide the element
        elem = document.getElementById("comment-edit-ta_"+commentID);
        elem.style = 'visibility: hidden; margin-bottom: -80px';
    } else {
        //unhide the element
        elem = document.getElementById("comment-edit-ta_"+commentID);
        elem.style = 'visibility: visible; margin-bottom: 0px';
    }
}

function hideCommentBody(param,commentID) {
    let elem;
    if ( param ) {
        //hide the element
        elem = document.getElementById("comment-body_"+commentID);
        elem.style = 'visibility: hidden; margin-bottom: -20px';  //maybe need to adjust this value from -14
    } else {
        //unhide the element
        elem = document.getElementById("comment-body_"+commentID);
        elem.style = 'visibility: visible; margin-bottom: 0px';
    }
}

//hide Edit buttons that belong to comments the user did not make
function hideUsersEditAndDoneEditButtons(param) {
    let username = document.getElementById("greeting-name").innerHTML;
    let editBtns = document.getElementsByClassName("edit-button");
    let doneEditBtns = document.getElementsByClassName("done-edit-button");
    let deleteBtns = document.getElementsByClassName("delete-button");
    let elems,elem, s, i;
    if ( param ) {
        // hide buttons
        for (i=1; i<=editBtns.length; i++) {
            editBtns[i-1].style = "visibility: hidden;"
            doneEditBtns[i-1].style = "visibility: hidden;"
            deleteBtns[i-1].style = "visibility: hidden;"
        }
    } else {
        //unhide buttons
        elems = document.getElementsByClassName("comment-user");

        for (i=1; i<=editBtns.length; i++) {
            elems = document.getElementsByClassName("comment-user");
            elem = elems[i-1].innerHTML;
            // elem = document.getElementById("comment-user_"+i).innerHTML; // instead of the 2 lines above, this is my original code

            if ( elem === username ) {
                editBtns[i-1].style = "visibility: visible;"
                doneEditBtns[i-1].style = "visibility: hidden;"
                deleteBtns[i-1].style = "visibility: visible;"
            }
        }
    }
}



function getParkData(park_id) {
    let params = "";
    let resource = "";
    let id;
        
    id="/"+park_id;
    resource = "/parks";
    xhttp.open('GET', endPointRoot + resource+id, true);
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if ( this.readyState == 4 ) {
            switch ( this.status ) {
                case 404:   //park not found
                case 500: { //server error
                    document.write( this.responseText );
                    break;
                }
                case 200: { //park found
                    fillParkPageWithData( this.responseText );
                }
            }
        }
    };
}

function fillParkPageWithData(data) {
    data = JSON.parse(data);
    document.title = data.name;
    document.getElementById("park-title").innerHTML = data.name;
    document.getElementById("park-description").innerHTML = data.description;
    getCommentsOnParkPage(data.park_id) 
}

function getCommentsOnParkPage(park_id) {
    let params = "";
    let resource = "";
    let id;
        
    id="/"+park_id;
    resource = "/comments";
    xhttp.open('GET', endPointRoot + resource+id, true);
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if ( this.readyState == 4 ) {
            
            switch ( this.status ) {
                case 404:   //no comments found or parkid does not exist
                case 500: { //server error
                    document.write( this.responseText );
                    break;
                }
                case 200: { //comments found
                    fillCommentSection( this.responseText );
                    break;
                }
            }
        }
    };
}


function fillCommentSection(data) {
    let username;
    data = JSON.parse(data);  //number of total comments is data.length
    
    let i;
    for (i=2; i<=data.length; i++) {
        duplicateCommentDiv(i);
    }
    moveCommentBoxToBottomOfPage();

    
    //fill the comment section
    for (i=0; i<data.length; i++) {
        document.getElementById( "comment-user_"+ (i+1) ).innerHTML = data[i].username;
        document.getElementById( "comment-time_"+ (i+1) ).innerHTML = data[i].c_date;
        document.getElementById( "comment-body_"+ (i+1) ).innerHTML = data[i].c_comment;
    }
    
    //if logged in change greeting and enable comment box
    verifyIdentityOfUser();  

}

// @param i is the comment #
// i=2 is for comment_2, for example
function duplicateCommentDiv(i) {
    let orig, clone;    //used for cloneNode()
    let div;            //new comment div
    let hr;             //horizontal line
    let span;           //span
    let el;             //element
    
    //shorthand to create <br>
    function br() {
        div.appendChild( document.createElement("br") ); 
    }
    
    //new comment div
    div = document.createElement("div");
    div.id = "comment_"+i;
    div.class = "comment";

    //create horizontal line
    hr = document.createElement("hr");
    div.appendChild(hr);
    
    //clone comment-user
    orig = document.getElementById("comment-user_1");
    clone = orig.cloneNode(true);
    clone.id = "comment-user_" + i;
    div.appendChild(clone);

    //clone the text " says..."
    orig = document.getElementsByClassName("user-says")[0];
    clone = orig.cloneNode(true);
    div.appendChild(clone);
    
    //clone Edit button
    orig = document.getElementById("edit-button_1");
    clone = orig.cloneNode(true);
    clone.id = "edit-button_" + i;
    div.appendChild(clone);
    
    //clone Done Editing button
    orig = document.getElementById("done-edit-button_1");
    clone = orig.cloneNode(true);
    clone.id = "done-edit-button_" + i;
    div.appendChild(clone);
    
    //clone Delete button
    orig = document.getElementById("delete-button_1");
    clone = orig.cloneNode(true);
    clone.id = "delete-button_" + i;
    div.appendChild(clone);
    br(); // </br>
    
    //clone comment-time
    orig = document.getElementById("comment-time_1");
    clone = orig.cloneNode(true);
    clone.id = "comment-time_" + i;
    div.appendChild(clone);
    br(); br(); // </br></br>

    //clone comment-body
    orig = document.getElementById("comment-body_1");
    clone = orig.cloneNode(true);
    clone.id = "comment-body_" + i;
    div.appendChild(clone);
    br(); // </br>
    
    //clone comment-edit-ta
    orig = document.getElementById("comment-edit-ta_1");
    clone = orig.cloneNode(true);
    clone.id = "comment-edit-ta_" + i;
    div.appendChild(clone);
    br(); br(); // </br></br>

    //add new comment div to body to bottom of page
    document.body.appendChild(div);
    
}


function moveCommentBoxToBottomOfPage() {
    let orig, clone;
    orig = document.getElementById( "comment-box" );
    clone = orig.cloneNode(true);
    document.body.appendChild(clone);
    orig.parentNode.removeChild(orig);
}


function addUser() {
    let username, password;
    let resource;
    let params;
    let data;
    
    username = document.getElementById("username").value;
    password = document.getElementById("password").value;
    
    if ( validateInput( username,password ) ) {
        return; //input is invalid
    }

    params = { "username":username, "password":password };
    data = JSON.stringify(params);
    resource = "/users/signup";
    xhttp.open('POST', endPointRoot+resource, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(data);
    xhttp.onreadystatechange = function () {
        
        if ( this.readyState == 4 ) {
            if ( this.status == 201 ) { //user created successfully
            
                //store session key in local storage
                data = this.responseText;
                data = JSON.parse(data).session_key;
                localStorage.setItem( "session_key",data );
    
                //display 'login success' message.  return to home page
                setTimeout(function() { clearInputFields(); openHomePage(); }, 750);
                document.getElementById("server-response").innerHTML = "User created successfully!";
                
            } else if ( this.status == 409 ) {   //username already exists
                document.getElementById("server-response").innerHTML = this.responseText;
                
            } else if ( this.status == 500 ) {   //server failed to add user
                document.getElementById("server-response").innerHTML = this.responseText;
            }
        }
    };
}


function validateInput(username,password) {
    if (username.length == 0 || password.length == 0) {
        alert("Please enter both a username and a password");
        return true;
    } else if (username.length > 19) {
        alert("Username must be less than 20 characters.");
        return true;
    } else if (username === 'admin') {
        alert("Username unavailable.");
        return true;
    } else {
        return false;
    }
}

function validateAdminInput(username,password) {
    if (username.length == 0 || password.length == 0) {
        alert("Please enter both a username and a password");
        return true;
    } else if (username.length > 19) {
        alert("Username must be less than 20 characters.");
        return true;
    } else if (username !== 'admin') {
        alert("Unauthorized access.");
        return true;    
    } else {
        return false;
    }
}


function clearInputFields() {
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
}


function loginUser() {
    let username, password;
    let resource;
    let params;
    let data;
    
    username = document.getElementById("username").value;
    password = document.getElementById("password").value;
    
    if ( validateInput( username,password ) ) {
        return; //input is invalid
    }

    params = { "username":username, "password":password };
    data = JSON.stringify(params);
    resource = "/users/login";
    xhttp.open('POST', endPointRoot+resource, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(data);
    xhttp.onreadystatechange = function () {
        if ( this.readyState == 4 ) {
            
            switch( this.status ) {
                
                case 400: //wrong password
                case 401: //unauthorized access to 'admin' account
                case 404: //username not found
                case 500: { //general server error
                    document.getElementById("server-response").innerHTML = this.responseText;
                    break;
                }
                case 200: {//Correct password entered
              
                    //store session key in local storage
                    data = this.responseText;
                    data = JSON.parse(data).session_key;
                    localStorage.setItem( "session_key",data );
                
                    //display 'login success' message.  return to home page
                    setTimeout(function() { clearInputFields(); openHomePage(); }, 750);
                    document.getElementById("server-response").innerHTML = "Login successful!";
                }
            }
        }
    };
}


function loginAdminUser() {
    let username, password;
    let resource;
    let params;
    let data;
    
    username = document.getElementById("username").value;
    password = document.getElementById("password").value;

    if ( validateAdminInput( username,password ) ) {
        document.getElementById("server-response").innerHTML = "Incorrect username or password";
        return; //input is invalid
    }
    
    params = { "username":username, "password":password };
    data = JSON.stringify(params);
    resource = "/users/admin";
    xhttp.open('POST', endPointRoot+resource, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(data);
    xhttp.onreadystatechange = function () {
        if ( this.readyState == 4 ) {
            if ( this.status == 200 ) {
                    
                data = this.responseText;
                data = JSON.parse(data);

                //display stats in HTML format
                document.getElementById("server-response").innerHTML = formatStats( data );
                    
            } else {
                document.getElementById("server-response").innerHTML = this.responseText;
            }
        }
    };
}

function formatStats(data) {

    let a = '';
    a += "<table>";
    a += "<b><tr><td class=method-head>Method </td><td class=endpoint-head>Endpoint </td><td class=requests-head>Requests </td></tr></b></br>";
    for (let i=0; i<data.length; i++) {
        a += `<tr id=stat_${i+1}>`;
        a += "<td class=method>";
        switch ( data[i].method ) {
            
        }
        a += data[i].method;
        a += " </td><td class=endpoint>"
        a += data[i].endpoint;
        a += " </td><td class=requests>"
        a += data[i].requests;
        a += " </td></tr>";
    }
    a += "</table>";
    return a
}


function logoutUser() {
    let resource;
    let params;
    let data;
    let session_key;
    
    session_key = localStorage.getItem("session_key");
    
    if ( !session_key ) {  //no session key exists in local storage
        return;
    }

    params = { "session_key":session_key };
    data = JSON.stringify(params);
    resource = "/sessions";
    xhttp.open('DELETE', endPointRoot+resource, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(data);
    xhttp.onreadystatechange = function () {
        if ( this.readyState == 4 ) {
            if ( this.status == 204 ) {
                document.getElementById("server-response").innerHTML = this.responseText;
            } else {
                alert( this.responseText );
            }
        }
    };

    localStorage.removeItem("session_key");   //remove session key from local storage
    window.location.reload(true); //refresh the page
}