# Tank: A class representing a tank.
#
# Author: Sebastian Babb
#
#

require 'json'

class Tank
    # Accesors and mutators.
    attr_accessor :id, :x_pos, :y_pos, :angle, :turret_rotation, :speed, :health, :fire, :fire_x, :fire_y

    # An id value of -1 indicated invalid tank.
    def initialize(id = -1, x = 0, y = 0, angle = 0, turret_rotation = 0, speed = 0, health = 3, fire = false, fire_x = nil, fire_y = nil)
        @id = id
        @x_pos = x
        @y_pos = y
        @angle = angle
        @turret_rotation = turret_rotation
        @speed = speed
        @health = health
        @fire = fire
        @fire_x = fire_x 
        @fire_y = fire_y
    end

    # Returns the tank's members as a json object. Adds action param (CREATE, UPDATE< DELETE).
    def jsonify(action)
        # Build a hash from the memebers.
        tank = {:action => action, :id => @id,:x_pos => @x_pos,
                :y_pos => @y_pos, :angle => @angle, :turret_rotation => @turret_rotation,
                :speed => @speed, :health => @health, :fire => @fire, :fire_x => @fire_x,
                :fire_y => @fire_y
        }

       # Convert the hash to a json and return. 
       JSON.generate(tank) 
    end
end
