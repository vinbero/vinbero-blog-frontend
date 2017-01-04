let app = {}
app.url = "http://localhost:8080";

app.Post = Backbone.Model.extend({
    idAttribute: "id",
    urlRoot: app.url + "/posts"
});

app.Posts = Backbone.Collection.extend({
    url: app.url + "/posts",
    model: app.Post,
    comparator: function(post) {
        return -post.id
    }
});

app.PostCreateView = Backbone.View.extend({
    tagName: "div",
    events: {
        "submit .post-create-form": "onPostCreate",
        "click .cancel-button": "onCancel"
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
                "Authorization": sessionStorage.getItem("cublog.tokenString")
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
                    alert("Failed to create new post, response code: " + response.status)
            }
        });
    },
    onCancel: function(event) {
        event.preventDefault();
        window.history.back();
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
        "submit .post-edit-form": "onPostEdit",
        "click .cancel-button": "onCancel"
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
                "Authorization": sessionStorage.getItem("cublog.tokenString")
            },
            wait: true,
            success: function(model, response, options) {
                model.set(response);
                Backbone.history.navigate("/index", {trigger: true});
            },
            error: function(model, response, options) {
                if(response.status == 403)
                    Backbone.history.navigate("/login", {trigger: true});
                else
                    alert("Failed to edit the post, response code: " + response.status)
            }
        });
    },
    onCancel: function(event) {
        event.preventDefault();
        window.history.back();
    }
});

app.PostDeleteView = Backbone.View.extend({
    tagName: "div",
    events: {
        "click .post-delete-button": "onPostDelete",
        "click .cancel-button": "onCancel"
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
                Authorization: sessionStorage.getItem("cublog.tokenString")
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
                    alert("Failed to delete the post, response code: " + response.status);
            }
        });
    },
    onCancel: function(event) {
        window.history.back();
    }
});

app.LoginView = Backbone.View.extend({
    tagName: "div",
    events: {
        "submit .login-form": "onLogin",
        "click .cancel-button": "onCancel"
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
        $.post({url: app.url + "/tokens", data: JSON.stringify({
            id: this.$el.find("input[name=login-id]").val(),
            password: this.$el.find("input[name=login-password]").val()
        }), dataType: "json"}).done(function(data, textStatus, jqXHR) {
            sessionStorage.setItem("cublog.tokenString", "Bearer " + data);
            app.posts.fetch({
                headers: {
                    Authorization: sessionStorage.getItem("cublog.tokenString")
                },
                success: function() {
                    window.history.back();
                },
                error: function(model, response, options) {
                    if(response.status == 403)
                        alert("Wrong id or password");
                    else
                        alert("Server error");
                }
            });
        });
    },
    onCancel: function(event) {
        event.preventDefault();
        window.history.back();
    }
});

app.NavBarView = Backbone.View.extend({
    initialize: function() {
        this.template = _.template($(".nav-bar-template").html());
        this.render();
    },
    render: function() {
        this.$el.html(this.template({loggedIn: app.isLoggedIn()}));
        return this;
    }
});

app.EmptyView = Backbone.View.extend({
    initialize: function() {
        this.template = _.template($(".empty-template").html());
        this.render();
    },
    render: function() {
        this.$el.html(this.template());
        return this;
    }
});

app.Router = Backbone.Router.extend({
    routes: {
        "login": "onLogin",
        "logout": "onLogout",
        "create": "onCreate",
        "index": "onIndex",
        "post/:id": "onPost",
        "edit/:id": "onEdit",
        "delete/:id": "onDelete",
        "*home": "onHome"
    },
    onLogin: function() {
        $(".nav-bar").empty();
        $(".nav-bar").append(new app.NavBarView().render().$el);

        $(".content").empty();
        $(".content").append(new app.LoginView().$el);
    },
    onLogout: function() {
        app.logout();
        window.history.back();
    },
    onCreate: function() {
        $(".nav-bar").empty();
        $(".nav-bar").append(new app.NavBarView().render().$el);

        if(app.isLoggedIn())
            Backbone.history.navigate("/login", {trigger: true});
        else {
            $(".content").empty();
            $(".content").append(new app.PostCreateView().$el);
        }
    },
    onIndex: function() {
        $(".nav-bar").empty();
        $(".nav-bar").append(new app.NavBarView().render().$el);

        $(".content").empty();
        if(app.posts.size() > 0)
            $(".content").append(new app.PostIndexView({collection: app.posts}).render().$el);
        else
            $(".content").append(new app.EmptyView().render().$el);
    },
    onPost: function(id) {
        $(".nav-bar").empty();
        $(".nav-bar").append(new app.NavBarView().render().$el);

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
        $(".nav-bar").empty();
        $(".nav-bar").append(new app.NavBarView().render().$el);

        if(app.isLoggedIn())
            Backbone.history.navigate("/login", {trigger: true});
        else {
            let post = app.posts.get(id);
            if(!_.isUndefined(post)) {
                let postEditView = new app.PostEditView({model: post});
                postEditView.render();
                $(".content").empty();
                $(".content").append(postEditView.$el);
            } else {
                alert("Wrong post id");
            }
        }
    },
    onDelete: function(id) {
        $(".nav-bar").empty();
        $(".nav-bar").append(new app.NavBarView().render().$el);

        if(app.isLoggedIn())
            Backbone.history.navigate("/login", {trigger: true});
        else {
            let post = app.posts.get(id);
            if(!_.isUndefined(post)) {
                let postDeleteView = new app.PostDeleteView({model: post});
                postDeleteView.render();
                $(".content").empty();
                $(".content").append(postDeleteView.$el);
            } else {
                alert("Wrong post id");
            }
        }
    },
    onHome: function() {
        $(".nav-bar").empty();
        $(".nav-bar").append(new app.NavBarView().render().$el);

        let post;
        if(app.posts.size() != 0) {
            post = app.posts.max(function(post) {
                return post.id;
            });
        }
        if(!_.isUndefined(post)) {
            $(".content").empty();
            $(".content").append(new app.PostView({model: post}).render().$el);
        } else {
            $(".content").empty();
            $(".content").append(new app.EmptyView().render().$el);
        }
    }
});

app.logout = function() {
    sessionStorage.removeItem("cublog.tokenString");
};
app.isLoggedIn = function() {
    return _.isNull(sessionStorage.getItem("cublog.tokenString"));
}

app.posts = new app.Posts();
app.posts.fetch({
    headers: {
        Authorization: sessionStorage.getItem("cublog.tokenString")
    },
    success: function() {
        app.router = new app.Router();
        Backbone.history.start();
    },
    error: function(collection, response, options) {
        alert("Loading failed, response code: " + response.status);
    }
});
