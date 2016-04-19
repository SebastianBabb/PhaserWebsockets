Rails.application.routes.draw do
    get 'lobby', to: 'lobby#index'

    get 'lobby/index'

    get 'lobby/new'

    get 'lobby/create'

    get 'game/index'

    devise_for :users

    # Set devise login page as root.
    # Set logout page.
    devise_scope :user do
        root to: "users/sessions#new"
        get 'users/sessions/logout' => 'users/sessions#logout'
    end

end
