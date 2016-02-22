var socket=io();
$(document).ready(function(){
    $('#message').keydown(function(event){
        if (event.which === 13){
            $('#chat').submit();
            return false;

        }
    })
    console.log(document.getElementById('chat'))
    $('#chat').submit(function(event){
    event.preventDefault();
    var username = $('#username').val();
    var message = $('#message').val();
    socket.emit('text message',{username:username,message:message});
        $('#content').append('<div class="message-bubble-container"><div class="user-image right"></div><div class="message-bubble-right">'+$('#message').val()+'</div></div>')  
 

    $('#message').val('').focus();
    return false;
    })
    
    socket.on('text message',function(msg){
    $('#content').append('</div><div class="message-bubble-container"><div class="user-image left"></div><div class="message-bubble-left">'+msg.message+'</div></div>')   
    })
})
