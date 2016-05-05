# Tank: A class representing a tank.
#
# Author: Sebastian Babb
#
#

require 'json'

class Tank
    # Accesors and mutators.
    attr_accessor :id, :speed, :turret_angle, :x_position, :y_position, :health

    # An id value of -1 indicated invalid tank.
    def initialize(id = -1, speed = 0, angle = 0, x = 0, y = 0, health = 3)
        @id = id
        @speed = speed
        @turret_angle = angle
        @x_position = x
        @y_position = y
        @health = health
    end

    # Returns the tank's members as a json object. Adds action param (CREATE, UPDATE< DELETE).
    def jsonify(action)
        # Build a hash from the memebers.
        tank = {:action => action, :id => @id, :speed => @speed, :turret_angle => @turret_angle,
                :x_position => @x_position, :y_position => @y_position,
                :health => @health
        }

       # Convert the hash to a json and return. 
       JSON.generate(tank) 
    end
end
