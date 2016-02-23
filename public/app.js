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
        socket.emit('channel join',username);
        $('.overlay').remove();
        $('.overlay-message').remove();
    })
    $('#chat').submit(function(event){
    event.preventDefault();
    var message = $('#message').val();
    var d = new Date();
    var timestamp = d.getHours() + ':' + d.getMinutes();
    socket.emit('text message',{username:username,message:message});
        $('#content').append('<div class="message-bubble-container"><div class="user-image right"></div><div class="message-bubble-right"><p class="username">Me:</p>'+$('#message').val()+'<p class="timestamp">'+timestamp+'</p></div></div>')  
    console.log(document.getElementById('content').scrollHeight);
    $('#content').scrollTop(document.getElementById('content').scrollHeight)
    $('#message').val('').focus();
    return false;
    })
    
    socket.on('text message',function(msg){
        var d = new Date();
        var timestamp = d.getHours() + ':' + d.getMinutes();
        $('#content').append('<div class="message-bubble-container"><div class="user-image left"></div><div class="message-bubble-left"><p class="username">'+msg.username+':</p>'+msg.message+'<p class="timestamp">'+timestamp+'</div></div>')   
    })
    socket.on('channel join',function(user){
        console.log(user)
         $('#content').append('<div class="info-message">'+user[user.length-1]+' joined the chat.</div>')
         $('#users').html(user)
    })
})
