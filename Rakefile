require 'rake'
require 'rake/testtask'
require 'rake/rdoctask'

desc 'Default: run unit tests.'
task :default => :test


desc 'Generate documentation for the vasco plugin.'
Rake::RDocTask.new(:rdoc) do |rdoc|
  rdoc.rdoc_dir = 'rdoc'
  rdoc.title    = 'Vasco'
  rdoc.options << '--line-numbers' << '--inline-source'
  rdoc.rdoc_files.include('README')
  rdoc.rdoc_files.include('lib/**/*.rb')
end

namespace :test do
  desc 'Test the vasco plugin.'
  Rake::TestTask.new(:ruby) do |t|
    t.libs << 'lib'
    t.pattern = 'test/**/*_test.rb'
    t.verbose = true
  end


  desc 'Test JavaScript'
  task :javascripts do
    IO.popen("open test/test_extensions.html") {|io| puts io.readlines}
  end
end