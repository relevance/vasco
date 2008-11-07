class Vasco
  class << self
    def get_routes
      routes = ActionController::Routing::Routes.routes.collect do |route|
        name = ActionController::Routing::Routes.named_routes.routes.index(route).to_s
        verb = route.conditions[:method].to_s.upcase
        segs = route.segments.inject("") { |str,s| str << s.to_s }
        segs.chop! if segs.length > 1
        reqs = route.requirements.empty? ? "" : route.requirements.inspect
        controller = route.requirements.empty? ? "" : route.requirements[:controller]
        {:name => name, :verb => verb, :segs => segs, :reqs => reqs, :controller => controller}
      end
      routes.sort {|a,b| a[:controller] <=> b[:controller]}
    end

    def get_controllers
      get_routes.collect {|r| r[:controller]}.sort.uniq
    end

    def get_models_and_attributes
      results = {}
      get_controllers.each do |c|
        begin
          mod = c.singularize.camelize.constantize
          attrs = {}
          mod.columns.each do |col|
            attrs[col.name] = col.sql_type
          end      
          results[c] = {:model_name => mod.name, :attributes => attrs}
        rescue
        end
      end
      results
    end

    def get_model_ids
      results = {}
      ActiveRecord::Base.connection.tables.each do |t|
        name = t.singularize.classify
        begin
          ids = name.constantize.find_by_sql("select id from #{t}").collect {|r| r.id}
          results[t] = ids
        rescue
          # puts "Failed for #{t}"
        end
      end
      results
    end

    def get_model_properties
      results = {}
      ActiveRecord::Base.connection.tables.each do |t|
        name = t.singularize.classify
        begin
          cols = name.constantize.columns.collect {|col| col.name}
          results[t] = cols
        rescue
          # puts "Failed for #{t}"
        end
      end
      results
    end

    def get_model_names
      results = {}
      ActiveRecord::Base.connection.tables.each do |t|
        name = t.singularize.classify
        begin
          name.constantize
          results[t] = t.singularize
        rescue
          # puts "Failed for #{t}"
        end
      end
      results
    end

    def create_vasco_json_data
      routes = get_routes.to_json
      controllers = get_controllers.to_json
      mods = get_models_and_attributes.to_json
      model_ids = get_model_ids.to_json
      model_columns = get_model_properties.to_json
      model_names = get_model_names.to_json
      data_file = %{var vascoRoutes = #{routes.inspect}.evalJSON();\nvar vascoControllers = #{controllers.inspect}.evalJSON();\nvar vascoModelsAndAttributes = #{mods.inspect}.evalJSON();\nvar vascoIds = #{model_ids.inspect}.evalJSON();\nvar vascoModelProperties = #{model_columns.inspect}.evalJSON();\nvar vascoModelNames = #{model_names.inspect}.evalJSON();}
    end
    
    def write_json_data
      fp = File.join(RAILS_ROOT, 'public', 'vasco', 'js', 'data.js')
      File.delete(fp) if File.exists?(fp)
      File.open(fp, 'w+') do |file|
        file << create_vasco_json_data
      end
    end
  end
end