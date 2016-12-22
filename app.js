var app = {}
app.AppView = Backbone.View.extend({
    el: "#container",
    initialize: function() {
        this.render();
    },
    render: function() {
        this.$el.html("<h1>Hello World</h1>");
    }
});

app.appView = new app.AppView();
