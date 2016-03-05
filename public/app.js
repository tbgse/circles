var socket=io();
var voice = false;
$(document).ready(function(){
  var username;
  $('#message').keydown(function(event){
    if (event.which === 13){
      $('#chat').submit();
      return false;
    }
  })

  $('#setUsername').submit(function(event){
    event.preventDefault();
    username = $('#username').val();
    username = encodeHTML(username);
    socket.emit('channel join',username);
    $('.overlay').remove();
    $('.overlay-message').remove();
  })

  $('#chat').submit(function(event){
    event.preventDefault();
    var d = new Date();
    var timestamp = d.getHours() + ':' + d.getMinutes();
    var writing = $('#message').val();
    if (writing[0] === '/'){
      executeCommand(writing)
    }
    else {
      var message = $('<span />',{text:writing})
      socket.emit('text message',{username:username,message:writing});
      var element = $('<div class="message-bubble-container">').append($('<img class="user-image right" src="icons/'+encodeFilename(username)+'.svg">')).append($('<div class="message-bubble-right">').append($('<p class="username">Me:</p>')).append(message).append($('<p class="timestamp">'+timestamp+'</p>')))
      //$('#content').append('<div class="message-bubble-container"><img class="user-image right" src="icons/'+username+'.svg"><div class="message-bubble-right"><p class="username">Me:</p>'+message+'<p class="timestamp">'+timestamp+'</p></div></div>')
      $("#content").append(element)
      $('#content').scrollTop(document.getElementById('content').scrollHeight)
      $('#message').val('').focus();
      return false;
    }
  })

  socket.on('text message',function(msg){
    var d = new Date();
    var timestamp = d.getHours() + ':' + d.getMinutes();
    var message = $('<span />',{text:msg.message})
    var element = $('<div class="message-bubble-container">').append($('<img class="user-image left" src="icons/'+encodeFilename(msg.username)+'.svg">')).append($('<div class="message-bubble-left">').append($('<p class="username">'+msg.username+'</p>')).append(message).append($('<p class="timestamp">'+timestamp+'</p>')))
    $('#content').append(element);
    if(voice){
        var msg = new SpeechSynthesisUtterance(msg.message);
        window.speechSynthesis.speak(msg);
    }
    $('#content').scrollTop(document.getElementById('content').scrollHeight)
  })

  socket.on('channel load',function(users){
    $("textarea").focus();
    username = users[users.length-1];
    $('#content').append('<div class="info-message">Welcome to the main channel, '+username+'.<br>Enter /commands to see a list of all available commands.</div>')
    $('#content').scrollTop(document.getElementById('content').scrollHeight)
    $('#users').empty();
    users.forEach(function(x){
      $('#users').append('<div class="user-container" id='+x+'><img class="user-image small" src="icons/'+encodeFilename(x)+'.svg"><span>'+x+'</span></div>')
    })
  })

  socket.on('channel join',function(user){
    $('#content').append('<div class="info-message">'+user+' joined the chat.</div>')
    $('#users').append('<div class="user-container" id='+user+'><img class="user-image small" src="icons/'+encodeFilename(user)+'.svg"><span>'+user+'</span></div>')
  })

  socket.on('channel leave',function(username){
    if (username !== null){
      $('#content').append('<div class="info-message">'+username+' left the chat.</div>')
      $('#content').scrollTop(document.getElementById('content').scrollHeight)
      $('#'+username).fadeOut(500,function(){
        $(this).remove();
      });
    }
  });
});

// Function handling the chat commands. When adding a new command, there are three steps you have to take:
// 1. add the command to the switch case, 2. Add a new function that handles your command, 3. Add the command to the list in showCommands()
// Please also add a comment with a short description of the commmand and if it is visible to "user-only", "all-users" or "specific users"
function executeCommand(str){
    console.log(str)

    var cmdMap = {
      'about': showAbout,
      'commands': showCommands,
      "voice": toggleVoice
    };

    // remove '/'; to lowercase; make into array
    var commandArray = str.slice(1)
                          .toLowerCase()
                          .split(' ');
    var cmd = commandArray[0];
    var args = commandArray.slice(1);

    // run the command w/ args OR error.
    (cmdMap[cmd] || showCommandError)(args);

 $('#content').scrollTop(document.getElementById('content').scrollHeight)
      $('#message').val('').focus();
}

// shows information about the app, user-only
function showAbout(){
    $('#content').append('<div class="info-message"> Cirlces v0.0.5. Released under MIT license.<br>Fork and Star the Repository on Github: <a href="https://github.com/tbgse/circles" target="_blank">https://github.com/tbgse/circles</a><br>A project by Tobias Guse <a href="https://github.com/tbgse" target="_blank">@tbgse</a><br>Contributors:<br>Akira Laine | <a href="https://github.com/AkiraLaine" target="_blank">GitHub</a><br>Thomas N | <a href="https://github.com/t3h2mas" target="_blank">GitHub</a></div>');
}

// shows a list of all available commands
function showCommands(){
    $('#content').append('<div class="info-message">/about - shows information about this application<br>/voice - activates text to speech<br>/commands - lists all available commands<br></div>');
}

function toggleVoice(){
    if(voice === false){
        voice = true;
        $('#content').append('<div class="info-message">Text to speech has been activated<br>/commands - lists all available commands<br></div>');
    } else {
        voice = false;
        $('#content').append('<div class="info-message">Text to speech has been deactivated<br>/commands - lists all available commands<br></div>');
    }
}

function showCommandError(command){
    $('#content').append('<div class="info-message">Command not found.</div>');
}

//string encoding functions
function encodeHTML(str) {
  return str.replace(/</gi,'&lt;').replace(/>/gi,'&gt;')
}

function encodeFilename(str){
  return encodeURIComponent(str).replace(/[%\.]/gi,'_');
}
