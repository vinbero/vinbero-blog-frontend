let app = {}

app.PostPreview = Backbone.Model.extend({
});

app.PostPreviews = Backbone.Collection.extend({
    url: "http://localhost:8080/posts"
});

app.PostPreviewView = Backbone.View.extend({
    tagName: "div",
    initialize: function() {
        this.template = _.template($(".post-preview-template").html());
    },
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
});

app.PostPreviewsView = Backbone.View.extend({
    el: ".container",
    initialize: function() {
        this.listenTo(this.collection, "update", this.render);
        this.collection.fetch();
    },
    render: function() {
        alert("render!!");
        let self = this;
        _.each(this.collection.toArray(), function(model) {
            self.$el.append(new app.PostPreviewView({model: model}).render().$el);
        });
        return this;
    }
});


app.postPreviews = new app.PostPreviews();
app.postPreviewsView = new app.PostPreviewsView({collection: app.postPreviews});
