let app = {}

app.Post = Backbone.Model.extend({
    idAttribute: "id",
    urlRoot: "http://localhost:8080/posts"
});

app.Posts = Backbone.Collection.extend({
    url: "http://localhost:8080/posts",
    model: app.Post
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

app.LoginView = Backbone.View.extend({
    tagName: "div",
    events: {
        "click .login-button": "login"
    },
    initialize: function() {
        this.template = _.template($(".login-template").html());
        this.render();
    },
    render: function() {
        this.$el.html(this.template());
        return this;
    },
    login: function() {
        $.post({url: "http://localhost:8080/tokens", data: JSON.stringify({
            id: this.$el.find(".login-id").val(),
            password: this.$el.find(".login-password").val()
        }), dataType: "json"}).done(function(data, textStatus, jqXHR) {
            sessionStorage.setItem("token", data);
            alert(data);
            alert(textStatus);
            alert(jqXHR);
        }).fail(function(jqXHR, textStatus, errorThrown) {
            alert(jqXHR);
            alert(textStatus);
            alert(errorThrown);
        });
    }
});

app.Router = Backbone.Router.extend({
    routes: {
        "login": "login",
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

    login: function() {
        $(".container").empty();
        $(".container").append(this.loginView.$el);
    },

    createPost: function() {
    },

    readPosts: function() {
        this.posts.fetch({
            headers: {
                "Authorization": "Bearer " + sessionStorage.getItem("token")
            }
/*
            ,data: {
                "page": 1
            }
*/
        });

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

app.posts = new app.Posts();
app.postPreviewsView = new app.PostPreviewsView({collection: app.posts});
app.loginView = new app.LoginView();
app.router = new app.Router({posts: app.posts, postPreviewsView: app.postPreviewsView, loginView: app.loginView});
app.router.postPreviewsView = app.postPreviewsView;

Backbone.history.start();
