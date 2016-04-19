var ready = function() {
    //var scheme   = "ws://"; // For local.
    var scheme   = "wss://"; // For heroku.
    var uri      = scheme + window.document.location.host + "/";
    var ws       = new WebSocket(uri);
    ws.onmessage = function(message) {
          var data = JSON.parse(message.data);
            $("#chat-window").append("<div class='lobby-chat-message'><span class='lobby-chat-timestamp'>"+data.time+"</span><span class='lobby-chat-username'> - "+data.handle+"</span>: "+data.text+"</div>");
            $("#chat-window").stop().animate({
                    scrollTop: $('#chat-window')[0].scrollHeight
            }, 800);

    };

    $("#chat-form").on("submit", function(event) {
        event.preventDefault();
        var time = $("#input-time")[0].value;
        var handle = $("#input-handle")[0].value;
        var text   = $("#input-text")[0].value;
        console.log("Time: " + time);
        console.log("Handle: " + handle);
        console.log("Text: " + text);
        ws.send(JSON.stringify({ time: time, handle: handle, text: text  }));
        $("#input-text")[0].value = "";

    });
}

$(document).ready(ready);
$(document).on('page:load', ready);
