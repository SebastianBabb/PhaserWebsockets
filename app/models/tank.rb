# Tank: A class representing a tank.
#
# Author: Sebastian Babb
#
#

require 'json'

class Tank
    # Accesors and mutators.
    attr_accessor :id, :x_pos, :y_pos, :angle, :speed, :health

    # An id value of -1 indicated invalid tank.
    def initialize(id = -1, x = 0, y = 0, angle = 0, speed = 0, health = 3)
        @id = id
        @x_pos = x
        @y_pos = y
        @angle = angle
        @speed = speed
        @health = health
    end

    # Returns the tank's members as a json object. Adds action param (CREATE, UPDATE< DELETE).
    def jsonify(action)
        # Build a hash from the memebers.
        tank = {:action => action, :id => @id,:x_pos => @x_pos,
                :y_pos => @y_pos, :angle => @angle,
                :speed => @speed, :health => @health
        }

       # Convert the hash to a json and return. 
       JSON.generate(tank) 
    end
end
