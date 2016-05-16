Rails.application.routes.draw do
  resources :high_scores
    get 'lobby', to: 'lobby#index'

    get 'lobby/index'

    get 'lobby/new'

    get 'lobby/create'

    get 'game', to: 'game#index'

    get 'game/index'


    # Set devise login page as root.
    # Set logout page.
    devise_scope :user do
        root to: "users/sessions#new"
        get 'users/sign_in' => 'users/sessions#new'
        get 'users/sign_up' => 'users/registrations#new'
        get 'users/password/new' => 'users/passwords#new'
        get 'users/sessions/logout' => 'users/sessions#new'
    end

    devise_for :users

end
