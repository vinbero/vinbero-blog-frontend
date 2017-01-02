let app = {}

app.Post = Backbone.Model.extend({
    idAttribute: "id",
    urlRoot: "http://localhost:8080/posts"
});

app.Posts = Backbone.Collection.extend({
    url: "http://localhost:8080/posts",
    model: app.Post
});

app.PostCreationView = Backbone.View.extend({
    tagName: "div",
    events: {
        "submit .post-creation-form": "onPostCreate"
    },
    initialize: function() {
        this.template = _.template($(".post-creation-template").html());
        this.render();
    },
    render: function() {
        this.$el.html(this.template());
        return this;
    },
    onPostCreate: function(event) {
        event.preventDefault();
        app.posts.create({
            title: this.$el.find("input[name=post-title]").val(),
            private: this.$el.find("input[name=post-private]").is(":checked"),
            text: CKEDITOR.instances["post-text"].getData()
        }, {
            headers: {
                "Authorization": "Bearer " + sessionStorage.getItem("token")
            },
            wait: true,
            success: function(model, response) {
                model.set(response);
                Backbone.history.navigate("/readPosts", {trigger: true});
            },
            error: function() {
                alert("error");
            }
        });
        //Backbone.history.navigate("/readPosts", {trigger: true});
    }
});

app.PostPreviewView = Backbone.View.extend({
    tagName: "tr",
    events: {
        click: "onReadPost"
    },
    initialize: function() {
        this.template = _.template($(".post-preview-template").html());
    },
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    onReadPost: function() {
        Backbone.history.navigate("readPost/" + this.model.id, {trigger: true});
    }
});

app.PostPreviewsView = Backbone.View.extend({
    tagName: "div",
    initialize: function() {
        this.template = _.template($(".post-previews-template").html());
        this.listenTo(this.collection, "sync", this.render);
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

app.PostReadView = Backbone.View.extend({
    tagName: "div",
    initialize: function() {
        this.template = _.template($(".post-read-template").html());
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
        "submit .login-form": "onLogin"
    },
    initialize: function() {
        this.template = _.template($(".login-template").html());
        this.render();
    },
    render: function() {
        this.$el.html(this.template());
        return this;
    },
    onLogin: function(event) {
        event.preventDefault();
        $.post({url: "http://localhost:8080/tokens", data: JSON.stringify({
            id: this.$el.find("input[name=login-id]").val(),
            password: this.$el.find("input[name=login-password]").val()
        }), dataType: "json"}).done(function(data, textStatus, jqXHR) {
            sessionStorage.setItem("token", data);
            app.posts.fetch({
                headers: {
                    Authorization: "Bearer " + sessionStorage.getItem("token")
                }
            }).done(function() {
                Backbone.history.navigate("/readPosts", {trigger: true});
            });
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
    login: function() {
        $(".content").empty();
        $(".content").append(new app.LoginView().$el);
    },

    createPost: function() {
        $(".content").empty();
        $(".content").append(new app.PostCreationView().$el);
    },

    readPosts: function() {
        $(".content").empty();
        $(".content").append(new app.PostPreviewsView({collection: app.posts}).render().$el);
    },

    readPost: function(id) {
        let post = app.posts.get(id);
        let postReadView = new app.PostReadView({model: post});
        postReadView.render();
        $(".content").empty();
        $(".content").append(postReadView.$el);
    },

    updatePost: function(id) {
    },

    deletePost: function(id) {
    }
});

app.posts = new app.Posts();
if(!_.isUndefined(sessionStorage.getItem("token"))) {
    app.posts.fetch({
        headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token")
        }
    }).done(function() {
        app.router = new app.Router();
        Backbone.history.start();
    });
} else
    app.posts.fetch().done(function() {
        app.router = new app.Router();
        Backbone.history.start();
    });
