namespace :vasco do
  
  desc "Examines current routes and models and emits updated data for Explorer"
  task :explore => :environment do
    Vasco.write_json_data
  end
  
  task :preview => :environment do
    puts Vasco.create_vasco_json_data
  end
  
  
end