# Tank: A class representing a tank.
#
# Author: Sebastian Babb
#
#

require 'json'
#require '../controllers/HighScoreController'

class Tank
    # Accesors and mutators.
    attr_accessor :id, :x_pos, :y_pos, :angle, :turret_rotation, :speed, :health, :alive, :fire, :fire_x, :fire_y, :score

    # An id value of -1 indicated invalid tank.
    def initialize(id = -1, x = 0, y = 0, angle = 0, turret_rotation = 0, speed = 0, health = 3, alive = true, fire = false, fire_x = nil, fire_y = nil, score = 0)
        @id = id
        @x_pos = x
        @y_pos = y
        @angle = angle
        @turret_rotation = turret_rotation
        @speed = speed
        @health = health
        @alive = alive
        @fire = fire
        @fire_x = fire_x 
        @fire_y = fire_y
        @score = score
    end

    # Returns the tank's members as a json object. Adds action param (CREATE, UPDATE< DELETE).
    def jsonify(action)
        # Build a hash from the memebers.
        tank = {:action => action, :id => @id,:x_pos => @x_pos,
                :y_pos => @y_pos, :angle => @angle, :turret_rotation => @turret_rotation,
                :speed => @speed, :health => @health, :alive => @alive, :fire => @fire, :fire_x => @fire_x,
                :fire_y => @fire_y, :score => @score
        }

       # Convert the hash to a json and return. 
       JSON.generate(tank) 
    end

    #update high score
    #not working yet
    def update_highscore(newScore)
        new HighScoreController.CREATE()
    end
end
