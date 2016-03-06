var socket=io();
var voice = false;
var emojiSelect;
var unreadMessages = 0;
var username;
var activeUsers = [];
$(document).ready(function(){


  //emoji autocomplete
  $("textarea").textcomplete([ {
        match: /\B:([\-+\w]*)$/,
        search: function (term, callback) {
            var results = [];
            var results2 = [];
            var results3 = [];
            $.each(emojiStrategy,function(shortname,data) {
                if(shortname.indexOf(term) > -1) { results.push(shortname); }
                else {
                    if((data.aliases !== null) && (data.aliases.indexOf(term) > -1)) {
                        results2.push(shortname);
                    }
                    else if((data.keywords !== null) && (data.keywords.indexOf(term) > -1)) {
                        results3.push(shortname);
                    }
                }
            });

            if(term.length >= 3) {
                results.sort(function(a,b) { return (a.length > b.length); });
                results2.sort(function(a,b) { return (a.length > b.length); });
                results3.sort();
            }
            var newResults = results.concat(results2).concat(results3);

            callback(newResults);
        },
        template: function (shortname) {
            return '<img class="emojione" src="//cdn.jsdelivr.net/emojione/assets/png/'+emojiStrategy[shortname].unicode+'.png"> :'+shortname+':';
        },
        replace: function (shortname) {
            return ':'+shortname+': ';
        },
        index: 1,
        maxCount: 6
    }
    ],{
        footer: '<a href="http://www.emoji.codes" target="_blank">Browse All<span class="arrow">»</span></a>'
    });

  //textarea enter key listener
  $('#message').keydown(function(event){
    if (event.which === 13 && !emojiSelect){
      if($("#message").val().trim().length !== 0){
        $('#chat').submit();
      }
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
      var message = $("<span>"+emojione.shortnameToImage(writing)+"</span>");
      socket.emit('text message',{username:username,message:writing});
      var element = $('<div class="message-bubble-container">').append($('<img class="user-image right" src="icons/'+encodeFilename(username)+'.svg">')).append($('<div class="message-bubble-right">').append($('<p class="username">Me:</p>')).append(message).append($('<p class="timestamp">'+timestamp+'</p>')))
      //$('#content').append('<div class="message-bubble-container"><img class="user-image right" src="icons/'+username+'.svg"><div class="message-bubble-right"><p class="username">Me:</p>'+message+'<p class="timestamp">'+timestamp+'</p></div></div>')
      $("#content").append(element)
      scrollToBottom();
      $('#message').val('').focus();
      return false;
    }
  })

  socket.on('text message',function(msg){
    var d = new Date();
    var timestamp = d.getHours() + ':' + d.getMinutes();
    var message = $("<span>"+emojione.shortnameToImage(msg.message)+"</span>");
    var element = $('<div class="message-bubble-container">').append($('<img class="user-image left" src="icons/'+encodeFilename(msg.username)+'.svg">')).append($('<div class="message-bubble-left">').append($('<p class="username">'+msg.username+':</p>')).append(message).append($('<p class="timestamp">'+timestamp+'</p>')))
    $('#content').append(element);
    if(voice){
        var msg = new SpeechSynthesisUtterance(msg.message);
        window.speechSynthesis.speak(msg);
    }
    scrollToBottom();
  })

  socket.on('channel load',function(users){
    $("textarea").focus();
    username = users[users.length-1];
    $('#content').append('<div class="info-message">Welcome to the main channel, '+username+'.<br>Enter /commands to see a list of all available commands.</div>')
    scrollToBottom();
    $('#users').empty();
    console.log('List of all users '+users)
    users.forEach(function(x){
      activeUsers.push(x);
      $('#users').append('<div class="user-container" id='+encodeFilename(x)+'><img class="user-image small" src="icons/'+encodeFilename(x)+'.svg"><span>'+x+'</span></div>')
    })
  })

  socket.on('channel join',function(user){
    console.log(user +" joined the channel")
    activeUsers.push(user);
    $('#content').append('<div class="info-message">'+user+' joined the chat.</div>')
    $('#users').append('<div class="user-container" id='+encodeFilename(user)+'><img class="user-image small" src="icons/'+encodeFilename(user)+'.svg"><span>'+user+'</span></div>')
    scrollToBottom();
  })

  socket.on('channel leave',function(username){
    if (username !== null){
      $('#content').append('<div class="info-message">'+username+' left the chat.</div>')
      activeUsers.splice(activeUsers.indexOf(username),1);
      scrollToBottom();
      $('#'+encodeFilename(username)).fadeOut(500,function(){
        $(this).remove();
      });
    }
  });
  
  socket.on('whisper message',function(msg){
        var d = new Date();
    var timestamp = d.getHours() + ':' + d.getMinutes();
    var message = $("<span>"+emojione.shortnameToImage(msg.message)+"</span>");
    var element = $('<div class="message-bubble-container">').append($('<img class="user-image left" src="icons/'+encodeFilename(msg.username)+'.svg">')).append($('<div class="message-bubble-left whisper">').append($('<p class="username">'+msg.username+' whispers to you:</p>')).append(message).append($('<p class="timestamp">'+timestamp+'</p>')))
    $('#content').append(element);
    if(voice){
        var msg = new SpeechSynthesisUtterance(msg.message);
        window.speechSynthesis.speak(msg);
    }
    scrollToBottom();
  })
});

// Function handling the chat commands. When adding a new command, there are three steps you have to take:
// 1. add the command to the switch case, 2. Add a new function that handles your command, 3. Add the command to the list in showCommands()
// Please also add a comment with a short description of the commmand and if it is visible to "user-only", "all-users" or "specific users"
function executeCommand(str){
    console.log(str)

    var cmdMap = {
      'about': showAbout,
      'commands': showCommands,
      "voice": toggleVoice,
      "whisper": doWhisper,
      "w":doWhisper,
    };

    // remove '/'; to lowercase; make into array
    var commandArray = str.slice(1)
                          .split(' ');
    var cmd = commandArray[0].toLowerCase();
    var args = commandArray.slice(1);

    // run the command w/ args OR error.
    (cmdMap[cmd] || showCommandError)(args);

 $('#content').scrollTop(document.getElementById('content').scrollHeight)
      $('#message').val('').focus();
}

// shows information about the app, user-only
function showAbout(){
    $('#content').append('<div class="info-message"> Cirlces v0.0.5. Released under MIT license.<br>Fork and Star the Repository on Github: <a href="https://github.com/tbgse/circles" target="_blank">https://github.com/tbgse/circles</a><br>A project by Tobias Guse <a href="https://github.com/tbgse" target="_blank">GitHub</a><br>Contributors:<br>Akira Laine | <a href="https://github.com/AkiraLaine" target="_blank">GitHub</a><br>Thomas N | <a href="https://github.com/t3h2mas" target="_blank">GitHub</a></div>');
}

// shows a list of all available commands
function showCommands(){
    $('#content').append('<div class="info-message">/about - shows information about this application<br>/voice - activates text to speech<br>/commands - lists all available commands<br>/w [user] - sends a private message to another user<br></div>');
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

function doWhisper(args) {
  if (activeUsers.indexOf(args[0]) >= 0 && args[1].trim().length > 0){
  socket.emit('whisper message',{username: username, input:args});
  var recipient = args[0];
  args.splice(0,1);
  var message = args.join(" ");
  var d = new Date();
  var timestamp = d.getHours() + ':' + d.getMinutes();
  message = $("<span>"+emojione.shortnameToImage(message)+"</span>");
  var element = $('<div class="message-bubble-container">').append($('<img class="user-image right" src="icons/'+encodeFilename(username)+'.svg">')).append($('<div class="message-bubble-right whisper">').append($('<p class="username">private to '+recipient+' : </p>')).append(message).append($('<p class="timestamp">'+timestamp+'</p>')))
    $('#content').append(element);
    if(voice){
        var msg = new SpeechSynthesisUtterance(msg.message);
        window.speechSynthesis.speak(msg);
    }
    scrollToBottom();
  }
  else if (activeUsers.indexOf(args[0]) < 0){
   $('#content').append('<div class="info-message">Can\'t find user '+args[0]+'.</div>'); 
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
function scrollToBottom(){
  console.log($('#content').height())
  console.log(document.getElementById('content').scrollHeight - $("#content").scrollTop())
  if ((document.getElementById('content').scrollHeight - $("#content").scrollTop()) < $('#content').height()*1.4){
    $('#content').scrollTop(document.getElementById('content').scrollHeight)
    unreadMessages = 0;
  }
}
