# List.it

List.it is a cross platform note-taking application. It uses
[Backbone.js](http://backbonejs.org) to manage it's views, models, and
collections; [jQuery](http://jquery.com) for DOM manipulation;
[Underscore.js](http://underscorejs.org) for utility functions; a
[fork](https://github.com/Stebalien/wysihtml5) of
[wysihtml5](http://xing.github.io/wysihtml5/) for rich-text input; and Apache Ant as
it's build system.

At it's core, List.it is a platform independent webapp however, platform
specific functionality can be added by overriding built-in functions/classes
and acting on events. However, platform specific code should *NEVER* be injected
into the core application, instead it should be placed in the correct platform
folder and be hooked in by the build system.

For more information, see: [welist.it](https://welist.it/)

## Library modifications

### Backbone Modifications

For a less ad-hoc description of the changes, please see the actual code.

In addition to the standard backbone features, list.it adds the following
features to all models:
 1. A `complete` callback option to `Backbone.Model#fetch()` and `Backbone.Model()`. This method is called
    when the model has been completely initialized.
 2. A `fetch` option to `Backbone.Model()` that causes the model to immediately
    fetch itself from List.it's storage mechanism.
 3. A `Backbone.Model#initialized()` method to compliment the built-in
    `Backbone.Model#initialize()` method. `initialized()` is called after the
    model has been completely initialized just like the `complete` callback.

List.it's version of backbone also has very basic `BackboneRelational` support.
While it would have been nice to use `BackboneRelational` as is, it's extremely
slow. Therefore, List.it implements it's own stripped down/less powerful
version.

This relational model is exposed through `Backbone.RelModel` and has the
following additional features:

1. A `relations` property that stores a mapping of (`<relation_name>: {/*desc*/}`) pairs where
   `<relation_name>` is the name of the related object and `{/*desc*/}` is in
   the form:

    ```
    {
      type: Related Model/Collection,
      includeInJSON: A list of keys, or single key, to include in the jsonified
      object (saved to storage).
    }
    ```

2. A `fetchRelated(options)` method that fetches related models and calls
   `options.complete` when done.
3. The `fetch(options)` method calls `fetchRelated()` if `options.fetchRelated`
   is true.
4. The model constructor accepts an additional `fetchRelated` option that causes
   related models to be fetched after fetching the primary model. The
   `options.complete` callback will not be called until all related models have
   been fetched.

### Underscore Modifications

In addition to the standard underscore functions, list.it adds the following:

1. `_.pop(object, key, default)` - Removes and returns `key` (or `default`) from
   `object`. This mimics python's `dict#pop` method.
2. `_.kmap(object, Function(value, key, object), context)` - Map but with object keys
   instead of array indices. Returns an object with the same keys but the new
   values.
3. `_.mask(function, arg_indicies)` - Rewires the function arguments by
   `arg_indicies`. For example,
   `_.mask(function() {return arguments;}, 2, 1)('a', 'b', 'c', 'd')` will
   return `['c', 'b']`.


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
setup events on the local event interface (`ListIt.gvent`). The events are
triggered in the following order:

Event | Description
------|------------
setup:before | Issued before setup.
setup:migrate:before <br/> setup:migrate <br/> setup:migrate:after | This is where any migration code runs.
setup:models:before <br/> setup:models <br/> setup:models:after <br/> | This is where models are setup (ListIt.notebook etc.).
setup:views:before <br/> setup:views <br/> setup:views:after <br/> | This is where views are setup. This event is not triggered until the DOM has finished loading (jQuery.ready).
setup:after | Issued after the setup has completed.

Each setup event listener is passed the ListIt instance and a barrier. If an
event listener needs to pause the setup process while it performs some
asynchronous operation, it should call `acquire()` on the barrier before
executing the asynchronous operation and then `release()` from the asynchronous
operation's callback.

## Migrating

If the way in which list.it stores data is changed, the version (`ListIt.VERSION`)
should be changed so that a migration can take place. List.it has three
migration types: upgrade, downgrade, and initialize. If the version is raised,
upgrade migrations are triggered, if it is lowered, downgrade migrations are
triggered, and if the stored version is zero, initialization migrations are
triggered.

On upgrade/downgrade, List.it will trigger the following events:

<table>
    <thead>
        <tr>
            <th>Event</th><th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td> <code>upgrade/downgrade:prepare</code> </td>
            <td>
            Indicates that an upgrade/downgrade is about to take place.
            <br/>
            Arguments: <code>ListIt</code>, <code>{to: &lt;dest_version&gt;, from: &lt;old_version&gt;}</code>, <code>barrier</code>
            </td>
        </tr>
        <tr>
            <td><code>upgrade/downgrade:version</code><br><code>upgrade/downgrade:version:&lt;n&gt;</code></td>
            <td>
            Indicates that list.it is upgrading/downgrading to version <code>&lt;n&gt;</code>. On
            upgrade, these events are triggered for every version greater than the
            current version and less than or equal to the target version (in
            increasing order). On downgrade, these events are triggered for
            every version less than or equal to the current version and greater
            than the target version (in decreasing order).
            <br>
            Arguments: <code>ListIt</code>, <code>{to: &lt;dest_version&gt;, from: &lt;old_version&gt;, now: &lt;n&gt;}</code>, <code>barrier</code>
            </br>
            </td>
        </tr>
        <tr>
            <td><code>upgrade/downgrade:complete</code></td>
            <td>
            Indicates that an upgrade/downgrade has completed.
            <br/>
            Arguments: <code>ListIt</code>, <code>{to: &lt;dest_version&gt;, from: &lt;old_version&gt;}</code>, <code>barrier</code>
            </td>
        </tr>
    </tbody>
</table>

On initialization, List.it will trigger the following events in order:

1. `initialize:prepare`
2. `initialize`
3. `initialize:complete`

As usual, if the barrier is acquired, the upgrade process does not move on until
it has been released.

## Pages

Most list.it windows (for lack of a better term), use a page system to allow
multiple pages in the same window. To add a page to a window, call
`ListIt.addPage(my_page_view)` where `my_page_view` is the page's Backbone View.

*TODO: More*

## Storage

*TODO*

## Build System

It's a mess but that describes pretty much every build system.

### Requirements

To build list.it, you need both [Apache Ant](https://ant.apache.org/) and
[Ant Contrib](http://ant-contrib.sourceforge.net/). Everything
else is included.

### Building

To build a platform, first change to the platform's directory
(`platforms/<platform>`).

To build a release build, run:

    ant release

To build a debug build, run:

    ant debug

Debug builds generally appear under `debug/<platform>` and generally allow one
to edit code without rebuilding. However,the following exceptions apply:

  * Chrome debug builds appear under the `src/` directory. This is unavoidable
    for the moment as chrome does not allow symlinks in extensions
    ([bug](https://code.google.com/p/chromium/issues/detail?id=27185)).
  * Templates must always be recompiled.
  * Firefox's background module must be manually recompiled. This could
    theoretically be fixed.

Release builds appear under `release/<platform>`.

*Note: to build all platforms, issue `ant debug/release` in the root directory.*

### Other Tasks

The following additional targets are available:

Task                    | Description
------------------------|-------------------------------------------------------------
`ant compile-templates` | Recompile the templates without recompiling everything else.
`ant jshint`            | Run the jshint static code checker.
`ant clean`             | Remove temporary build files.

