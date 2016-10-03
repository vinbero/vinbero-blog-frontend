/*            $.getJSON("http://localhost:8080/posts", function(data) {
                var template = `
                    <div class="row">
                        <div class="col-sm-4"></div>
                        <ul class="list-group col-sm-4">
                            {{#.}}
                                <li class="list-group-item">
                                    <h4 class="list-group-item-heading"><a href="read.html?id={{id}}">{{id}} | {{title}}</a></h4>
                                    <p class="list-group-item-text">
                                        {{#private}} private {{/private}} {{^private}} public {{/private}} | {{cdate}} | {{mdate}}
                                    </p>
                                </li>
                            {{/.}}
                        </ul>
                    </div>`;
                var html = Mustache.to_html(template, data);
                $("body").append(html);
            });
*/
require("./module1.js");
