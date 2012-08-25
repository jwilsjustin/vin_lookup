require 'rubygems'
require 'sinatra'

helpers do
  def partial(page, options={})
    haml page, options.merge!(:layout => false)
  end
end



get '/' do
  haml :index, :layout => :main_layout
end

