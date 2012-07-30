// Setup models

L.vent = background.L.vent;
L.router = new L.make.Router();

// First copy models
_.each(background.L.make, function(v, k) {
    if(_.isObject(background.L.make[k])) {
        var here = L.make[k];
        var there = background.L.make[k];
        if (!here) {
            L.make[k] = there;
        } else if (there) {
            for (var key in there) {
                here[key] || (here[key] = there[key]);
            }
        }
    } else {
        L.make[k] || (L.make[k] = background.L.make[k]);
    }
});
// Then everything else
for (var key in background.L) {
    L[key] || (L[key] = background.L[key]);
}

// TODO: Report bug in chrome
// selectors sometimes not applied (neither query not css work).
// probably due to passing from background into sidebar.
$(document).ready(function() {
    // Delay till after all ready events.
    _.delay(function() {
        $("*").each(function() {
            this.id = this.id;
            this.className = this.className;
        });
    });
});
