

# Content components

* read all links at same call, depth aware
* responsive layout
* link-layout
    * list
    * gallery
    * slider
    * other
* header image
* node type symbol at narrow column view only
* editable
* update with edit, debounce function to prevent to many updates, possibly send editing flag with user if shared
* update parent with move


| Feature | Viewer | Editor  | Subdiv |
| --------|--------| -----   |-----   |
| depth   | x      | x       | o      |
| con     | o      |   x     | o      |
| auth    | 0      |   x     | o      |
| style   | x      |   x     | opt    |



coming from github or from couchdb server :: window.location.href



Figure out how to remove livereload from the production build, in the rollup-script probably....
!production && livereload('public'),