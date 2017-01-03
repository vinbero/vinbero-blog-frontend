let app = {}

app.Post = Backbone.Model.extend({
    idAttribute: "id",
    urlRoot: "http://localhost:8080/posts"
});

app.Posts = Backbone.Collection.extend({
    url: "http://localhost:8080/posts",
    model: app.Post
});

app.PostCreateView = Backbone.View.extend({
    tagName: "div",
    events: {
        "submit .post-create-form": "onPostCreate"
    },
    initialize: function() {
        this.template = _.template($(".post-create-template").html());
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
                Backbone.history.navigate("/index", {trigger: true});
            },
            error: function(model, response, options) {
                if(response.status == 403)
                    Backbone.history.navigate("/login", {trigger: true});
                else
                    alert(response.status)
            }
        });
    }
});

app.PostIndexItemView = Backbone.View.extend({
    tagName: "tr",
    events: {
        click: "onPost"
    },
    initialize: function() {
        this.template = _.template($(".post-index-item-template").html());
    },
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    onPost: function() {
        Backbone.history.navigate("post/" + this.model.id, {trigger: true});
    }
});

app.PostIndexView = Backbone.View.extend({
    tagName: "div",
    initialize: function() {
        this.template = _.template($(".post-index-template").html());
        this.listenTo(this.collection, "sync", this.render);
    },
    render: function() {
        let self = this;
        this.$el.html(this.template());
        this.collection.forEach(function(model) {
            self.$el.find(".post-index-view").append(new app.PostIndexItemView({model: model}).render().$el);
        });
        return this;
    }
});

app.PostView = Backbone.View.extend({
    tagName: "div",
    events: {
        "click .post-edit-button": "onPostEdit",
        "click .post-delete-button": "onPostDelete"
    },
    initialize: function() {
        this.template = _.template($(".post-template").html());
    },
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    onPostEdit: function() {
        Backbone.history.navigate("/edit/" + this.model.id, {trigger: true});
    },
    onPostDelete: function() {
        Backbone.history.navigate("/delete/" + this.model.id, {trigger: true});
    }
});

app.PostEditView = Backbone.View.extend({
    tagName: "div",
    events: {
        "submit .post-edit-form": "onPostEdit"
    },
    initialize: function() {
        this.template = _.template($(".post-edit-template").html());
        this.render();
    },
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    onPostEdit: function(event) {
        event.preventDefault();
        this.model.save({
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
                Backbone.history.navigate("/index", {trigger: true});
            },
            error: function(model, response, options) {
                if(response.status == 403)
                    Backbone.history.navigate("/login", {trigger: true});
                else
                    alert(response.status)
            }
        });
    }
});

app.PostDeleteView = Backbone.View.extend({
    tagName: "div",
    events: {
        "click .post-delete-button": "onPostDelete",
        "click .back-button": "onBack"
    },
    initialize: function() {
        this.template = _.template($(".post-delete-template").html());
        this.render();
    },
    render: function() {
        this.$el.html(this.template());
        return this;
    },
    onPostDelete: function(event) {
        event.preventDefault();
        this.model.destroy({
            headers: {
                Authorization: "Bearer " + sessionStorage.getItem("token")
            },
            wait: true,
            success: function(model, response) {
                app.posts.remove(model.id);
                Backbone.history.navigate("/index", {trigger: true});
            },
            error: function(model, response, options) {
                if(response.status == 403)
                    Backbone.history.navigate("/login", {trigger: true});
                else
                    alert(textStatus.state);
            }
        });
    },
    onBack: function() {
        window.history.back();
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
                Backbone.history.navigate("/index", {trigger: true});
            });
        }).fail(function(jqXHR, textStatus, errorThrown) {
            if(jqXHR.status == 403)
                alert("Wrong id or password");
            else
                alert("Server error");
        });
    }
});

app.Router = Backbone.Router.extend({
    routes: {
        "login": "onLogin",
        "create": "onCreate",
        "index": "onIndex",
        "post/:id": "onPost",
        "edit/:id": "onEdit",
        "delete/:id": "onDelete",
        "*home": "onHome"
    },
    onLogin: function() {
        $(".content").empty();
        $(".content").append(new app.LoginView().$el);
    },
    onCreate: function() {
        $(".content").empty();
        $(".content").append(new app.PostCreateView().$el);
    },
    onIndex: function() {
        $(".content").empty();
        $(".content").append(new app.PostIndexView({collection: app.posts}).render().$el);
    },
    onPost: function(id) {
        let post = app.posts.get(id);
        if(!_.isUndefined(post)) {
            let postView = new app.PostView({model: post});
            postView.render();
            $(".content").empty();
            $(".content").append(postView.$el);
        } else {
            alert("Wrong post id");
        }
    },
    onEdit: function(id) {
        let post = app.posts.get(id);
        if(!_.isUndefined(post)) {
            let postEditView = new app.PostEditView({model: post});
            postEditView.render();
            $(".content").empty();
            $(".content").append(postEditView.$el);
        } else {
            alert("Wrong post id");
        }
    },
    onDelete: function(id) {
        let post = app.posts.get(id);
        if(!_.isUndefined(post)) {
            let postDeleteView = new app.PostDeleteView({model: post});
            postDeleteView.render();
            $(".content").empty();
            $(".content").append(postDeleteView.$el);
        } else {
            alert("Wrong post id");
        }
    },
    onHome: function() {
        let post;
        if(app.posts.size() != 0) {
            post = app.posts.max(function(post) {
                return post.id;
            });
        }
        if(!_.isUndefined(post)) {
            let postView = new app.PostView({model: post});
            postView.render();
            $(".content").empty();
            $(".content").append(postView.$el);
        } else {
        }
    }
});

app.posts = new app.Posts();
if(!_.isUndefined(sessionStorage.getItem("token"))) {
    app.posts.fetch({
        headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token")
        },
        success: function() {
            app.router = new app.Router();
            Backbone.history.start();
        }
    });
} else
    app.posts.fetch({
        success: function() {
            app.router = new app.Router();
            Backbone.history.start();
        }
    });
