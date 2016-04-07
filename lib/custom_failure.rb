# Redirects  to login page if someone tries to access
# pages that require user login.
class CustomFailure < Devise::FailureApp
  # Redirect to root, which is devise login.
  def redirect_url
    '/'
  end

  def respond
    if http_auth?
      http_auth
    else
      redirect
    end
  end
end
