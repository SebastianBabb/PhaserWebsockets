# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '1.0'
Rails.application.config.assets.precompile += %w( signin.css  )
Rails.application.config.assets.precompile += %w( signup.css  )
Rails.application.config.assets.precompile += %w( lobby.css  )
Rails.application.config.assets.precompile += %w( logout.css  )
Rails.application.config.assets.precompile += %w( game.css  )

Rails.application.config.assets.precompile += %w( lobby/chat_lobby.js  )

# Image assets referenced in these js scripts are located in public/twisted-metal
Rails.application.config.assets.precompile += %w( twisted-metal-src/Arenas.js )
Rails.application.config.assets.precompile += %w( twisted-metal-src/Boot.js )
Rails.application.config.assets.precompile += %w( twisted-metal-src/Preloader.js )
Rails.application.config.assets.precompile += %w( twisted-metal-src/MainMenu.js  )
Rails.application.config.assets.precompile += %w( twisted-metal-src/Game.js  )
Rails.application.config.assets.precompile += %w( twisted-metal-src/Tank.js  )
Rails.application.config.assets.precompile += %w( twisted-metal-src/EnemyTank.js  )

# Add additional assets to the asset load path
# Rails.application.config.assets.paths << Emoji.images_path

# Precompile additional assets.
# application.js, application.css, and all non-JS/CSS in app/assets folder are already added.
# Rails.application.config.assets.precompile += %w( search.js )
