let app = {}

app.PostPreview = Backbone.Model.extend({
    idAttribute: "id"
});

app.PostPreviews = Backbone.Collection.extend({
    url: "http://localhost:8080/posts"
});

app.Post = Backbone.Model.extend({
    idAttribute: "id",
    urlRoot: "http://localhost:8080/posts"
});

app.PostPreviewView = Backbone.View.extend({
    tagName: "tr",
    events: {
        "click": "readPost"
    },
    initialize: function() {
        this.template = _.template($(".post-preview-template").html());
    },
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    readPost: function() {
        Backbone.history.navigate("readPost/" + this.model.id, {trigger: true});
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

app.PostView = Backbone.View.extend({
    tagName: "div",
    initialize: function() {
        this.template = _.template($(".post-template").html());
        this.listenTo(this.model, "sync", this.render);
    },
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
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
    initialize: function(options) {
        for(let key in options) {
            this[key] = options[key];
        }
    },
    createPost: function() {
    },
    readPosts: function() {
        this.postPreviews.fetch();
        $(".container").empty();
        $(".container").append(this.postPreviewsView.$el);
    },
    readPost: function(id) {
        let post = new app.Post();
        let postView = new app.PostView({model: post});
        post.set({id: id});
        post.fetch();
        $(".container").empty();
        $(".container").append(postView.$el);
    },
    updatePost: function(id) {
    },
    deletePost: function(id) {
    }
});

app.postPreviews = new app.PostPreviews();
app.postPreviewsView = new app.PostPreviewsView({collection: app.postPreviews});
app.router = new app.Router({postPreviews: app.postPreviews, postPreviewsView: app.postPreviewsView});
app.router.postPreviewsView = app.postPreviewsView;

Backbone.history.start();
