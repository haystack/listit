# HACKING

## Directory Structure

### Base Layout

Directory                       | Description
--------------------------------|------------
build/ *platform* /               | Build cache
debug/ *platform* /               | Debug build destination.
platforms/ *platform* /build.xml  | Platform specific build file
release/ *platform* /             | Release build destination
src/                            | Application source code (see [Source Layout](#source-layout))
build.xml                       | Global build file; builds all platforms
common.xml                      | Common build targets; included in platform build files
global.properties               | Global build properties
resources.xml                   | Global resource definitions; platforms use these when including javascript/css
util.xml                        | Common utility build macros


### Source Layout

Directory               | Description
------------------------|------------
css/                    | CSS assets
css/ *platform*          | Platform specific CSS assets
js/                     | JavaScript Assets (see [JavaScript Layout](#javascript-layout))
js/ *platform*           | Platform specific JavaScript assets
img/                    | Image assets
templates/              | Underscore HTML templates (see [Templates](#templates))

### JavaScript Layout

Directory               | Description
------------------------|------------
collectors/             | See [Collectors](#collectors)
migrations/             | See [Migrating](#migrating)
libs/                   | Libraries
models/                 | Data models
observers/              | See [Logging](#logging)
views/                  | Data Views
actionqueue.js          | Provides an in-order asynchronous executor for time consuming execution sequences; used for rendering
constants.js            | Global constants
defines-debug.js        | Debug settings; auto-generated
lititStorage.js         | Fallback model storage cache that uses local storage (see [Storage](#storage))
main.js                 | Main setup file run before anything else; used to setup the environment
router.js               | The backbone router (see [Pages](#pages))
setup.js                | Triggers the setup signals (see [Setup](#setup))
setup-models.js         | Model setup file (see [Setup](#setup))
setup-views.js          | View setup file (see [Setup](#setup))
templates.js            | The compiled templates; auto-generated (see [Templates](#templates))
migrate.js              | The migration coordinator (see [Migrating](#migrating))
util.js                 | Various utility functions that don't really belong anywhere else

## Templates

TODO

## Collectors

TODO

## Logging

TODO

## Setup

TODO

## Migrating

TODO

## Pages

TODO

## Storage

TODO

## Build System

TODO
