Rails.application.routes.draw do
    get 'lobby/new'

    get 'lobby/create'

    devise_for :users

    # Set devise login page as root.
    # Set logout page.
    devise_scope :user do
        root to: "users/sessions#new"
        get 'users/sessions/logout' => 'users/sessions#logout'
    end

end
