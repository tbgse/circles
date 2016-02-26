var socket=io();
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
        username = username.replace(/[^\w\s\d]/g,' ');
        socket.emit('channel join',username);
        $('.overlay').remove();
        $('.overlay-message').remove();
    })
    $('#chat').submit(function(event){
    event.preventDefault();
    var writing = $('#message').val();
    var message = $('<span />',{text:writing})
    var d = new Date();
    console.log(message)
    var timestamp = d.getHours() + ':' + d.getMinutes();
    socket.emit('text message',{username:username,message:writing});
    var element = $('<div class="message-bubble-container">').append($('<img class="user-image right" src="icons/'+username+'.svg">')).append($('<div class="message-bubble-right">').append($('<p class="username">Me:</p>')).append(message).append($('<p class="timestamp">'+timestamp+'</p>')))
    //$('#content').append('<div class="message-bubble-container"><img class="user-image right" src="icons/'+username+'.svg"><div class="message-bubble-right"><p class="username">Me:</p>'+message+'<p class="timestamp">'+timestamp+'</p></div></div>')  
    $("#content").append(element)
    $('#content').scrollTop(document.getElementById('content').scrollHeight)
    $('#message').val('').focus();
    return false;
    })
    
    socket.on('text message',function(msg){
        var d = new Date();
        var timestamp = d.getHours() + ':' + d.getMinutes();
        var message = $('<span />',{text:msg.message})
        console.log(message)
        var element = $('<div class="message-bubble-container">').append($('<img class="user-image left" src="icons/'+msg.username+'.svg">')).append($('<div class="message-bubble-left">').append($('<p class="username">'+msg.username+'</p>')).append(message).append($('<p class="timestamp">'+timestamp+'</p>')))
        //$('#content').append('<div class="message-bubble-container"><img class="user-image left" src="icons/'+msg.username+'.svg"><div class="message-bubble-left"><p class="username">'+msg.username+':</p>'+msg.message+'<p class="timestamp">'+timestamp+'</div></div>') 
        $('#content').append(element);
        $('#content').scrollTop(document.getElementById('content').scrollHeight)
    })
    socket.on('channel load',function(users){
        username = users[users.length-1];
            $('#content').append('<div class="info-message">'+users[users.length-1]+' joined the chat.</div>')
            $('#content').scrollTop(document.getElementById('content').scrollHeight)
            $('#users').empty();
        console.log(users)
         users.forEach(function(x){
             $('#users').append('<div class="user-container" id='+x+'><img class="user-image small" src="icons/'+x+'.svg"><span>'+x+'</span></div>')
         })  

    })
    socket.on('channel join',function(user){
            $('#content').append('<div class="info-message">'+user+' joined the chat.</div>')
            $('#users').append('<div class="user-container" id='+user+'><img class="user-image small" src="icons/'+user+'.svg"><span>'+user+'</span></div>')
    })
    socket.on('channel leave',function(username){
        $('#content').append('<div class="info-message">'+username+' left the chat.</div>')
        $('#content').scrollTop(document.getElementById('content').scrollHeight)
        $('#'+username).fadeOut(500,function(){
            $(this).remove();
        });
    })
})
