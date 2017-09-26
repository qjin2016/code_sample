$(document).ready(function() {
    //---------------------------------------------------------------------------
    //jQuery section
    //---------------------------------------------------------------------------

    var convertWidth = function(windowWidth) {
        return windowWidth -1;
    }

    var convertHeight = function(windowHeight) {
        var space = $('#navigation').height() + $('#place-holder').height() + $('#footer').height() + 3;
        return windowHeight - space - 1;
    };

    // set width and height
    var width = convertWidth($(window).width());
    var height = convertHeight($(window).height());

    // resize svg to fit the actual window size
    var resizeContainer = function() {
        var container = $('#vis-container')
        container.attr("width", convertWidth($(window).width()));
        container.attr("height", convertHeight($(window).height()));
    };

    $(window).resize(resizeContainer);

    resizeContainer();

    // define operations once a user clicks on a top bar with class name "li"
    $("li").click(function() {
        var fw = $(this).css("font-weight");
        var diz = $(this).text();

        if (fw == 'bold') {
            // do nothing if the click hits the bar that is currently been focused
        } else {
            $(".nav-li").css({
                // reset font and background color for all bars
                "font-weight": "normal",
                "background-color": "#6497b1"
            });
            $(this).css({
                // set font and background color for the clicked bar
                "font-weight": "bold",
                "background-color": "#005b96"
            });

            // update data source and visualization
            updateData(diz);

        }
    });

    //---------------------------------------------------------------------------
    //D3 section
    //---------------------------------------------------------------------------

    // creates a visualization from a data object.
    var createVisualization = function(data, container) {
        var graph = data;
        var svg = container;

        // get color map
        var color = d3.scale.category20();

        // define d3 force-directed grah parameters
        var force = d3.layout.force()
            .gravity(0.05)
            .charge(-1000)
            .gravity(0.04)
            .charge(-1200)
            .linkDistance(100)
            .size([width, height]);

        force
            .nodes(graph.nodes)
            .links(graph.links)
            .start();

        var link = svg.selectAll("line")
            .data(graph.links)
            .enter().append("line")
            .attr("class", "link")
            .style("stroke-width", function(d) {
                return Math.sqrt(d.value);
            });

        var node = svg.selectAll("circle")
            .data(graph.nodes)
            .enter().append("g")
            .attr("class", "node")
            .classed("topic", function(d) {
                return d.group == 1;
            })
            .call(force.drag);

        node.append("circle")
            .attr("r", function(d) {
                return d.size;
            })
            .attr("x", -8)
            .attr("y", -8)
            .style("fill", function(d) {
                return color(d.group);
            })
            .on("mouseover", function(d) {
                // Find texts where oneText.__data__.name == this.name 
                for (var j = 0; j < text[0].length; j++) {
                    var oneText = text[0][j];
                    var data = oneText.__data__;
                    if (data.name == d.name || data.name == d.name || data.group == 1) {
                    } else {
                        oneText.classList.add("node--text--hidden");
                    }
                }
                // find links where link.source == this.group
                // or link.target == this.group
                for (var i = 0; i < link[0].length; i++) {
                    var oneLink = link[0][i];
                    var data = oneLink.__data__;
                    if (data.source === d || data.target === d) {
                        oneLink.classList.add("link--highlighted");
                    } else {
                    	oneLink.classList.remove("link");
                    }
                }
                this.parentElement.classList.add("highlighted");
                d3.select(this).attr("r", d.size * 1.1);
            })
            .on("mouseout", function(d) {

                for (var j = 0; j < text[0].length; j++) {
                    var oneText = text[0][j];
                        oneText.classList.remove("node--text--hidden");
                        oneText.classList.add(".node.highlighted");
                }

                for (var i = 0; i < link[0].length; i++) {
                    var oneLink = link[0][i];
                    var data = oneLink.__data__;
                    if (data.source === d || data.target === d) {
                        oneLink.classList.remove("link--highlighted");
                    } else {
                    	oneLink.classList.add("link")
                    }
                }
                this.parentElement.classList.remove("highlighted");
                d3.select(this).attr("r", d.size);
            });

        var text = node.append("text")
            .attr("text-anchor", "middle")
			.attr('y', function(d) { return d.size + 12; } )
            .text(function(d) {
                return d.name
            });

        force.on("tick", function() {
            link.attr("x1", function(d) {
                    return d.source.x;
                })
                .attr("y1", function(d) {
                    return d.source.y;
                })
                .attr("x2", function(d) {
                    return d.target.x;
                })
                .attr("y2", function(d) {
                    return d.target.y;
                });

            node.attr("transform", function(d) {

                return "translate(" + d.x + "," + d.y + ")";
            });
        });
    };

    // main function for controlling data uploading and visualization rendering
    var updateData = function(data_source) {
        d3.json("./Data/" + data_source + ".json", function(error, graph) {
            if (error) throw error;
            var container = d3.select('#main');
            container.text([]);
            createVisualization(graph, container);
        });
    };

    // Load initial data
    updateData('Discussion 1,Value of Visualization');

});
