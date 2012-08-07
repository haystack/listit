/*
* Handles location information.
*/

(function(L) {
    'use strict';
    L.make.models.LocationMonitor = Backbone.Model.extend({
        initialize: function() {
            this.beginWatching();

            // Meta generator
            L.vent.on('note:request:parse:new', function(note) {
                if (this.get('location_watcher')) {
                    note.meta.location = this.get('last_location');
                }
            });

            // Feature Recognizer
            L.vent.on('note:request:features', function(note) {
                var noteLocation = note.get('meta').location;
                var lastLocation = this.get('last_location');
                if (noteLocation && lastLocation) {
                    this.isNear(lastLocation, noteLocation);
                }
            });
        },
        radius: 6371,
        toRadians : function(x) {
            return x*Math.PI/180;
        },
        getDistance : function(p1, p2) {
            var halfSinDelLat = Math.sin(this.toRadians(p1.latitude - p2.latitude)/2),
                halfSinDelLon = Math.sin(this.toRadians(p1.longitude - p2.longitude)/2),
                cosLat1 = Math.cos(this.toRadians(p1.latitude)),
                cosLat2 = Math.cos(this.toRadians(p2.latitude)),
                a = halfSinDelLat*halfSinDelLat + halfSinDelLon*halfSinDelLon*cosLat1*cosLat2;

            return 2*this.radius*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        },
        isNear : function(p1, p2) {
            return -0.5 < this.getDistance(p1, p2) < 0.5;
        },
        beginWatching : function() {
            this.set('location_watcher', navigator.geolocation.watchPosition(function(position) {
                this.set('last_location', position.coords);
            }));
        },
        stopWatching : function() {
            var locationWatcher = this.get('location_watcher');
            if (locationWatcher) {
                navigator.geolocation.clearWatch(locationWatcher);
                this.unset('location_watcher');
            }
        }
    });


    $(document).ready(function() {
        if (typeof(navigator.geolocation) !== 'undefined') {
            L.models.locationMonitor = new L.make.models.LocationMonitor();
        }
    });

})(ListIt);
