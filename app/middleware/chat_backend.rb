require 'faye/websocket'
require 'thread'
require 'redis'
require 'json'
require 'erb'

class ChatBackend 
    KEEPALIVE_TIME = 15 # in seconds
    CHANNEL = "lobby-chat"

    def initialize(app)
      @app     = app
      @clients = []
      #uri = URI.parse(ENV["REDISCLOUD_URL"])
      #@redis = Redis.new(host: uri.host, port: uri.port, password: uri.password)
      #Thread.new do
        #redis_sub = Redis.new(host: uri.host, port: uri.port, password: uri.password)
        #redis_sub.subscribe(CHANNEL) do |on|
          #on.message do |channel, msg|
            #@clients.each {|ws| ws.send(msg) }
          #end
        #end
      #end
    end

    def call(env)
      # Only load the backend chat server when websocket attempts to connect to */chat
      if env['PATH_INFO'] == '/chat' 
        p "PATH_INFO: #{env['PATH_INFO']}"
        if Faye::WebSocket.websocket?(env)
          ws = Faye::WebSocket.new(env, nil, {ping: KEEPALIVE_TIME })
          ws.on :open do |event|
            p [:open, ws.object_id]
            p ["Openning Chat Websocket"]
            @clients << ws
          end

          ws.on :message do |event|
            p [:message, event.data]
            #@redis.publish(CHANNEL, sanitize(event.data))
            @clients.each do |client|
                client.send(event.data)
            end
          end

          ws.on :close do |event|
            p [:close, ws.object_id, event.code, event.reason]
            p ["Closing Chat Websocket"]
            @clients.delete(ws)
            ws = nil
          end

          # Return async Rack response
          ws.rack_response
      end
      else
          @app.call(env)
      end
    end

    private
    def sanitize(message)
      json = JSON.parse(message)
      json.each {|key, value| json[key] = ERB::Util.html_escape(value) }
      JSON.generate(json)
    end
end
