require 'faye/websocket'
require 'thread'
require 'redis'
require 'json'
require 'erb'

# Require tank class relative to app/middle
require_relative '../models/tank.rb'

class GameBackend 
    CREATE_CLIENT = 0;
    UPDATE_CLIENT = 1;
    DELETE_CLIENT = 2;

    KEEPALIVE_TIME = 15 # in seconds
    CHANNEL = "battledome"

    def initialize(app)
      @app     = app
      @clients = [] # Connected clients.
      @tanks = []   # Tanks of associated clients.
    end

    def call(env)
      p "Environment: #{env['PATH_INFO']}"
      # Only load the backend server when websocket attempts to connect to */chat
      if env['PATH_INFO'] == '/game' 
        if Faye::WebSocket.websocket?(env)
          ws = Faye::WebSocket.new(env, nil, {ping: KEEPALIVE_TIME })
          ws.on :open do |event|
            #p [:open, ws.object_id]
            p ["Openning Game Websocket"]
            @clients << ws
            # Add new client's tank to the tanks array.
            @tanks << Tank.new(ws.object_id) # client's websocket objet id is the tank id.
            #@tanks << Tank.new(@clients.length-1) # client's index is tank id.
            
            # Each existing client should only be updated with the newest client's
            # tank, as they already have representations of every other client's tank.
            # The newest client, however, will need to be sent every existing clients
            # tank, as it has just joined the game.
            #
            # Iterate through the clients, checking for the newest one (last client in the array)
            @clients.each_with_index do |client, client_number|
                # If an existing client (ie. not the newest client), add only the newest tank.
                if client != @clients[-1]
                    # The newest tank is the last one in the tanks array.
                    p ["Client: #{client_number} Adding tank: #{@tanks[-1].id}"]
                    client.send(@tanks[-1].jsonify(CREATE_CLIENT))
                else
                    # Add all of the tanks to the newest client.
                    @tanks.each do |tank|
                        p ["Client: #{client_number} Adding tank: #{tank.id}"]
                        client.send(tank.jsonify(CREATE_CLIENT))
                    end
                end
            end
            
            # Debug output.
            p ["Number of clients: #{@clients.length}"]
            p ["Number of tanks: #{@tanks.length}"]
         end

         ws.on :message do |event|
            # Parse message and broadcast it to each connected client.
            p [:message, event.data]

            # This is where we will parse the tank data sent from the client,
            # use it to update each tank in the tanks array, and then broadcast
            # the results back to each connected client.

            # Update the clients.
            @clients.each do |client|
                @tanks.each do |tank|
                    #p ["Tank ID: #{tank.id}"]
                    client.send(tank.jsonify(UPDATE_CLIENT))
                end
            end
         end

         ws.on :close do |event|
            p [:close, ws.object_id, event.code, event.reason]
            p ["Closing Game Websocket"]
            @clients.delete(ws)
            @tanks.delete(get_tank_by_id(ws.object_id))
            p ["Number of clients: #{@clients.length}"]
            p ["Number of tanks: #{@tanks.length}"]
            ws = nil
            # Broadcast client's removal.
            @clients.each do |client|
                @tanks.each do |tank|
                    #p ["Tank ID: #{tank.id}"]
                    client.send(tank.jsonify(DELETE_CLIENT))
                end
            end
         end

        # Return async Rack response
        ws.rack_response
      end
      else
        @app.call(env)
      end
    end

    # Returns the tank object with the corresponding id.
    def get_tank_by_id(id)
        @tanks.each do |tank|
            if tank.id = id
                return tank
            else
                continue
            end
        end
    end
end
