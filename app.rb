require 'bundler'
Bundler.require

class VinLookup < Sinatra::Base
  set :root, File.dirname(__FILE__)
  register Sinatra::AssetPack

  assets {
    serve '/css', from: 'assets/css'
    # The second parameter defines where the compressed version will be served.
    # (Note: that parameter is optional, AssetPack will figure it out.)
    css :app, '/css/app.css', [
      '/css/style.css',
      '/css/base.css',
      '/css/layout.css',
      '/css/skeleton.css'
    ]

    js_compression  :yui, :munge => true
    css_compression :sass

    prebuild ENV['RACK_ENV'] == 'development'
  }

  helpers do
    def partial(page, options={})
      haml page, options.merge!(:layout => false)
    end
  end

  get '/?' do
    haml :index, :layout => :main_layout
  end

end
