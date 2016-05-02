# This file is used by Rack-based servers to start the application.

require ::File.expand_path('../config/environment', __FILE__)

# Require chatbackend.
use ChatBackend 
use GameBackend 

run Rails.application
