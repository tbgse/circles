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
    $('#content').append('<div class="message-bubble-container"><img class="user-image right" src="icons/'+username+'.svg"><div class="message-bubble-right"><p class="username">Me:</p>'+$('#message').val()+'<p class="timestamp">'+timestamp+'</p></div></div>')  
    $('#content').scrollTop(document.getElementById('content').scrollHeight)
    $('#message').val('').focus();
    return false;
    })
    
    socket.on('text message',function(msg){
        var d = new Date();
        var timestamp = d.getHours() + ':' + d.getMinutes();
        $('#content').append('<div class="message-bubble-container"><img class="user-image left" src="icons/'+msg.username+'.svg"><div class="message-bubble-left"><p class="username">'+msg.username+':</p>'+msg.message+'<p class="timestamp">'+timestamp+'</div></div>') 
        $('#content').scrollTop(document.getElementById('content').scrollHeight)
    })
    socket.on('channel load',function(users){
            $('#content').append('<div class="info-message">'+users[users.length-1]+' joined the chat.</div>')
            $('#content').scrollTop(document.getElementById('content').scrollHeight)
            $('#users').empty();
        console.log(users)
         users.forEach(function(x){
             $('#users').append('<div class="user-container" id='+x+'><img class="user-image small" src="icons/'+x+'.svg"><span>'+x+'</span></div>')
         })  

    })
    socket.on('channel join',function(user){
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
