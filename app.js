let app = {}

app.PostPreview = Backbone.Model.extend({
    idAttribute: "id"
});

app.PostPreviews = Backbone.Collection.extend({
    url: "http://localhost:8080/posts"
});

app.PostPreviewView = Backbone.View.extend({
    tagName: "tr",
    initialize: function() {
        this.template = _.template($(".post-preview-template").html());
    },
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
});

app.PostPreviewsView = Backbone.View.extend({
    tagName: "div",
    initialize: function() {
        this.template = _.template($(".post-previews-template").html());
        this.listenTo(this.collection, "update", this.render);
    },
    render: function() {
        let self = this;
        this.$el.html(this.template());
        _.each(this.collection.toArray(), function(model) {
            self.$el.find(".post-preview-views").append(new app.PostPreviewView({model: model}).render().$el);
        });
        return this;
    }
});

app.Router = Backbone.Router.extend({
    routes: {
        "createPost": "createPost",
        "readPosts": "readPosts",
        "readPost/:id": "readPost",
        "updatePost/:id": "updatePost",
        "deletePost/:id": "deletePost"
    },
    createPost: function() {
    },
    readPosts: function() {
        this.postPreviewsView.collection.fetch();
        $(".container").append(this.postPreviewsView.$el);
    },
    readPost: function(id) {
    },
    updatePost: function(id) {
    },
    deletePost: function(id) {
    }
});

app.postPreviews = new app.PostPreviews();
app.postPreviewsView = new app.PostPreviewsView({collection: app.postPreviews});
app.router = new app.Router({postPreviewsView: app.postPreviewsView});
app.router.postPreviewsView = app.postPreviewsView;

Backbone.history.start();
