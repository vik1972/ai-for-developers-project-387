Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    if Rails.env.production?
      # In production, allow all origins but disable credentials for security
      origins "*"
      resource "*",
        headers: :any,
        methods: [ :get, :post, :put, :patch, :delete, :options, :head ],
        credentials: false,
        max_age: 86400
    else
      origins "http://localhost:3000", "http://localhost:5173"
      resource "*",
        headers: :any,
        methods: [ :get, :post, :put, :patch, :delete, :options, :head ],
        credentials: true,
        max_age: 86400
    end
  end
end
