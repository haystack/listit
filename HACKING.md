# HACKING

## Directory Structure

### Base Layout

Directory                       | Description
--------------------------------|------------
`build/<platform>/`             | Build cache
`debug/<platform>/`               | Debug build destination.
`platforms/<platform>/build.xml`  | Platform specific build file
`release/<platform>/`             | Release build destination
`src/`                          | Application source code (see [Source Layout](#source-layout))
`build.xml`                     | Global build file; builds all platforms
`common.xml`                    | Common build targets; included in platform build files
`global.properties`             | Global build properties
`resources.xml`                 | Global resource definitions; platforms use these when including javascript/css
`util.xml`                      | Common utility build macros


### Source Layout

Directory               | Description
------------------------|------------
`css/`                  | CSS assets
`css/<platform>/`          | Platform specific CSS assets
`js/`                   | JavaScript Assets (see [JavaScript Layout](#javascript-layout))
`js/<platform>/`           | Platform specific JavaScript assets
`img/`                  | Image assets
`templates/`            | Underscore HTML templates (see [Templates](#templates))

### JavaScript Layout

Directory               | Description
------------------------|------------
`collectors/`           | See [Collectors](#collectors)
`migrations/`           | See [Migrating](#migrating)
`libs/`                 | Libraries
`models/`               | Data models
`observers/`            | See [Logging](#logging)
`views/`                | Data Views
`actionqueue.js`        | Provides an in-order asynchronous executor for time consuming execution sequences; used for rendering
`constants.js`          | Global constants
`defines-debug.js`      | Debug settings; auto-generated
`lititStorage.js`       | Fallback model storage cache that uses local storage (see [Storage](#storage))
`main.js`               | Main setup file run before anything else; used to setup the environment
`router.js`             | The backbone router (see [Pages](#pages))
`setup.js`              | Triggers the setup signals (see [Setup](#setup))
`setup-models.js`       | Model setup file (see [Setup](#setup))
`setup-views.js`        | View setup file (see [Setup](#setup))
`templates.js`          | The compiled templates; auto-generated (see [Templates](#templates))
`migrate.js`            | The migration coordinator (see [Migrating](#migrating))
`util.js`               | Various utility functions that don't really belong anywhere else

## Templates

List.it uses [underscore.js](http://underscorejs.org) as it's underlying
templating engine. Templates are stored in `src/templates` as html files. Before
using a template, it must be compiled. Templates are automatically compiled when
compiling list.it but can be compiled separately by issuing `ant
compile-templates`.

To render a template stored in `src/templates/<path>.html`, with the context
`<ctx>`, call `ListIt.templates[<path>](<ctx>)`. For example, the main page
template, stored at `src/templates/pages/main.html` can be rendered by calling
`ListIt.templates['pages/main']()`.

## Collectors

Collectors, found in `src/js/collectors`, add metadata to new or recently
modified notes. Collectors should listen on the global event interface (see
[Event Interfaces](#event-interfaces)) for the following events:

Event                       | On
----------------------------|---------------------------------------------------------
note:request:parse:new      | Issued when a new note is created and should be parsed.
note:request:parse:change   | Issued when a note is changed and should be parsed.
note:request:parse          | Issued when alongside either of the two previous events.

Listeners are passed a JSONified version of the note to be parsed and the source
window if applicable.

TODO: This event name/entire system is kind of weird and should be changed.

## Logging

List.it logs user actions (if enabled by the user) for research purposes. There
are three parts to the logging system:

 1. The logging module.
 2. The observers.
 3. `user:<action>` events.

The logging module handles the actual storage of the logs but should contain no
event specific logic. That is, it shouldn't care about what is being logged at
all.

The observers handle the creation of log entries. They listen for events/changes
in list.it and submit the appropriate log entries. They are kept separate so
to keep logging and functionality separate.

Unfortunately, some code must be inserted into the functional code to facilitate
logging. In general, these code snippets should simply trigger `user:<action>`.
Observers should listen to for these events and act appropriately. __NOTE:__ A
`user:<action>` event should never include information specific to logging
functionality; they should only be used to indicate that the user has performed
some action.

## Event Interfaces

In addition to the model specific event handlers, each window (background,
sidebar, options, etc.) has it's own local event interface `ListIt.lvent` and the
entire extension as a whole has a global event interface `ListIt.gvent`. The
local event interface should be used for any events that are pertinent to the
local window only (setup etc.). The global interface, on the other hand, should
be used to broadcast information that is relevant to the entire extension.

## Setup

On startup (global and per page), list.it sets up the environment by issuing
setup events on the local event interface. The events are triggered in the
following order:

Event | Description
------|------------
setup:before \
    | Issued before setup.
setup:migrate:before \
setup:migrate \
setup:migrate:after \
    | This is where any migration code runs.
setup:models:before \
setup:models \
setup:models:after \
    | This is where models are setup (ListIt.notebook etc.).
setup:views:before \
setup:views \
setup:views:after \
    | This is where views are setup. This event is not triggered until the DOM has finished loading (jQuery.ready).
setup:after \
    | Issued after the setup has completed.

Each setup event listener is passed the ListIt instance and a barrier. If an
event listener needs to pause the setup process while it performs some
asynchronous operation, it should call `aquire()` on the barrier before
executing the asynchronous operation and then `release()` from the asynchronous
operation's callback.

## Migrating

TODO

## Pages

TODO

## Storage

TODO

## Build System

TODO
